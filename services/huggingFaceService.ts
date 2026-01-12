import { BrandIdentity, ColorPalette, Typography, BrandCampaign, CarouselPost, CampaignInput } from "../types";

// Get API key from window.aistudio if available, otherwise fall back to process.env
const getApiKey = (): string => {
  // Try to get API key from window.aistudio (for AI Studio environment)
  if (typeof window !== 'undefined' && (window as any).aistudio?.getApiKey) {
    try {
      const apiKey = (window as any).aistudio.getApiKey();
      if (apiKey) return apiKey;
    } catch (e) {
      console.warn('Could not get API key from window.aistudio:', e);
    }
  }

  // Fall back to process.env.API_KEY or process.env.HF_TOKEN (set via vite.config.ts)
  const envKey = process.env.API_KEY || process.env.HF_TOKEN;
  if (envKey) return envKey;

  throw new Error('API key not found. Please select an API key or set HF_TOKEN environment variable.');
};

const HF_API_BASE = 'https://api-inference.huggingface.co/models';

// Helper function for text generation
async function generateText(prompt: string, model: string = 'meta-llama/Meta-Llama-3.1-8B-Instruct', maxTokens: number = 2000): Promise<string> {
  const apiKey = getApiKey();
  const url = `${HF_API_BASE}/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        return_full_text: false,
        max_new_tokens: maxTokens,
        temperature: 0.7, // Balanced creativity and consistency
        top_p: 0.9, // Nucleus sampling for quality
        repetition_penalty: 1.1, // Reduce repetition
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'string') {
      return data[0];
    }
    if (typeof data[0] === 'object' && 'generated_text' in data[0]) {
      return data[0].generated_text;
    }
  }

  if (typeof data === 'object' && 'generated_text' in data) {
    return data.generated_text;
  }

  if (typeof data === 'string') {
    return data;
  }

  throw new Error('Unexpected response format from text generation API');
}

// Prompt enhancement function based on use case
function enhancePromptForUseCase(
  prompt: string,
  useCase: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general'
): string {
  const baseEnhancements = '8k hyper realistic graphics, ultra high quality, highly detailed, professional, cinematic lighting, sharp focus, masterpiece, best quality';
  
  const useCaseEnhancements: Record<string, string> = {
    'logo': 'clean vector-style design, scalable, professional branding, minimalist, high contrast, crisp edges, transparent background, commercial quality',
    'mockup': 'photorealistic product photography, professional studio lighting, sharp focus, depth of field, commercial quality, product showcase, high resolution',
    'poster': 'dynamic typography, vibrant colors, strong visual hierarchy, print-ready quality, eye-catching composition, professional design, high resolution',
    'social': 'lifestyle photography, engaging composition, vibrant colors, authentic feel, social media optimized, high engagement visual, professional quality',
    'carousel': 'consistent brand aesthetic, cohesive visual style, professional photography, high quality, brand-aligned, engaging visual content',
    'brand-asset': 'perfectly centered, clear and legible, professional branding, high quality, scalable design, commercial use ready',
    'general': 'hyper realistic, photorealistic, stunning visuals, professional photography, cinematic quality'
  };

  const enhancement = useCaseEnhancements[useCase] || useCaseEnhancements['general'];
  return `${prompt}, ${baseEnhancements}, ${enhancement}`;
}

// Enhanced negative prompt function based on use case
function getNegativePromptForUseCase(useCase: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general'): string {
  const baseNegative = 'blurry, low quality, distorted, ugly, bad anatomy, deformed, disfigured, poorly drawn, bad proportions, extra limbs, cloned face, mutated, out of focus, underexposed, oversaturated, pixelated, jpeg artifacts';
  
  const useCaseNegatives: Record<string, string> = {
    'logo': 'text in logo unless wordmark, cluttered, busy design, low resolution, pixelated, blurry edges',
    'mockup': 'unrealistic shadows, poor lighting, distorted perspective, low quality, blurry, unprofessional',
    'poster': 'poor typography, cluttered layout, low resolution, unreadable text, amateur design',
    'social': 'unengaging, low quality, blurry, unprofessional, poor composition, low resolution',
    'carousel': 'inconsistent style, low quality, blurry, unprofessional, mismatched colors',
    'brand-asset': 'off-center, unclear, low resolution, blurry, unprofessional, pixelated',
    'general': 'low quality, blurry, distorted, unprofessional'
  };

  const specificNegative = useCaseNegatives[useCase] || useCaseNegatives['general'];
  return `${baseNegative}, ${specificNegative}`;
}

// Helper function for image generation
async function generateImage(
  prompt: string,
  options?: {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    negative_prompt?: string;
    useCase?: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general';
  }
): Promise<string> {
  const apiKey = getApiKey();
  // Using Flux Schnell for fast, high-quality image generation via Inference API
  const model = 'black-forest-labs/FLUX.1-schnell';

  // Enhanced prompt with use-case specific improvements
  const useCase = options?.useCase || 'general';
  const enhancedPrompt = enhancePromptForUseCase(prompt, useCase);
  const negativePrompt = options?.negative_prompt || getNegativePromptForUseCase(useCase);

  // Flux supports various aspect ratios, standard dimensions
  const aspectRatios: Record<string, [number, number]> = {
    "1:1": [1024, 1024],
    "16:9": [1536, 864],
    "9:16": [864, 1536],
    "4:3": [1280, 1024],
    "3:4": [1024, 1280],
    "3:2": [1536, 1024],
    "2:3": [1024, 1536],
  };

  // Determine aspect ratio from dimensions
  let width = options?.width || 1536;
  let height = options?.height || 864;

  // Find closest matching aspect ratio
  const ratio = width / height;
  let closestRatio: [number, number] | null = null;
  let minDiff = Infinity;

  for (const [_, dims] of Object.entries(aspectRatios)) {
    const diff = Math.abs((dims[0] / dims[1]) - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closestRatio = dims;
    }
  }

  if (closestRatio) {
    [width, height] = closestRatio;
  }

  const url = `${HF_API_BASE}/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        width,
        height,
        num_inference_steps: options?.num_inference_steps || 28,
        guidance_scale: 3.5,
        negative_prompt: negativePrompt,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Check content type to determine response format
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    // JSON response with base64 image
    const data = await response.json();
    if (data.image && typeof data.image === 'string') {
      // Remove data URL prefix if present
      return data.image.includes(',') ? data.image.split(',')[1] : data.image;
    }
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      // Base64 string in array
      const base64 = data[0];
      return base64.includes(',') ? base64.split(',')[1] : base64;
    }
    throw new Error('Unexpected JSON response format from image generation API');
  } else {
    // Image blob response
    const blob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Brand Kit Studio
export const generateBrandIdentity = async (businessInfo: string): Promise<BrandIdentity> => {
  console.log('Generating brand identity for:', businessInfo);
  const prompt = `You are an elite Brand Strategist with 15+ years of experience working with Fortune 500 companies and innovative startups. Your expertise includes brand positioning, market analysis, consumer psychology, and competitive differentiation.

TASK: Create a comprehensive, professional brand identity that would impress a Creative Director and Marketing VP.

BUSINESS CONTEXT:
"${businessInfo}"

REQUIREMENTS:
1. **Brand Name**: Create a memorable, brandable name (2-3 words max) that:
   - Reflects the business essence and values
   - Is easy to pronounce and spell
   - Has potential for trademark protection
   - Resonates with the target market

2. **Personality Profile**: Define 5-7 personality traits that make this brand unique (e.g., "Bold, Innovative, Approachable, Trustworthy, Disruptive"). Be specific and actionable.

3. **Voice and Tone**: Describe how the brand communicates:
   - Voice: The brand's consistent personality in communication
   - Tone: How the voice adapts to different contexts (professional yet warm, authoritative yet approachable, etc.)

4. **Brand Values**: List 4-6 core values that drive the brand's decisions and resonate with customers. Make them specific, not generic.

5. **Mission Statement**: A clear, inspiring 1-2 sentence statement (max 30 words) that defines the brand's purpose and impact.

6. **Positioning Statement**: A strategic statement that clearly differentiates this brand from competitors and defines its unique value proposition in the market.

OUTPUT FORMAT:
Return ONLY a valid JSON object with these exact keys: "name", "personality", "voice", "values", "mission", "positioning".
- "name": string
- "personality": string (comma-separated traits)
- "voice": string (detailed description)
- "values": string (comma-separated list)
- "mission": string
- "positioning": string

Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

  try {
    const text = await generateText(prompt, 'meta-llama/Meta-Llama-3.1-8B-Instruct', 1500);
    console.log('Brand identity response received');

    // Try to extract JSON from the response (in case model wraps it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(jsonText) as BrandIdentity;
  } catch (error: any) {
    console.error('Error generating brand identity:', error);
    throw new Error(`Failed to generate brand identity: ${error?.message || 'Unknown error'}`);
  }
};

export const generateLogo = async (brandName: string, industry: string, style: string): Promise<string> => {
  console.log('Generating logo for:', brandName, industry, style);
  const prompt = `Create a world-class logo design for "${brandName}", a ${industry} company.

DESIGN BRIEF:
- Brand: ${brandName}
- Industry: ${industry}
- Style Direction: ${style}

DESIGN REQUIREMENTS:
- Professional, award-winning logo design suitable for a Creative Director's portfolio
- Clean, minimalist vector-style design that scales perfectly from business card to billboard
- Transparent background (no background colors or gradients)
- No text elements unless it's an integral part of a wordmark design
- Modern, timeless aesthetic that won't look dated in 5-10 years
- Industry-appropriate symbolism that communicates brand values
- Balanced composition with proper negative space
- High contrast for visibility across all applications
- Professional color palette or monochrome design
- Suitable for both digital and print applications

QUALITY STANDARDS:
- Commercial-grade design quality
- Professional branding standards
- Portfolio-worthy execution
- Industry-leading quality`;

  try {
    const base64Image = await generateImage(prompt, {
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      useCase: 'logo',
    });

    console.log('Logo generated successfully');
    return base64Image;
  } catch (error: any) {
    console.error('Error generating logo:', error);
    throw new Error(`Failed to generate logo: ${error?.message || 'Unknown error'}`);
  }
};

export const generateColorPalette = async (brandInfo: string): Promise<ColorPalette> => {
  console.log('Generating color palette for:', brandInfo);
  const prompt = `You are a Senior Color Strategist and Brand Identity Designer with expertise in color psychology, accessibility, and brand differentiation. Your color palettes have been used by major brands and agencies.

TASK: Create a professional, strategic color palette that a Creative Director would approve.

BRAND CONTEXT:
"${brandInfo}"

REQUIREMENTS:
1. **Primary Colors (2)**: Main brand colors that represent the brand's core identity. These should be:
   - Highly recognizable and memorable
   - Work well for primary CTAs and key brand elements
   - Accessible (WCAG AA compliant when possible)
   - Industry-appropriate

2. **Secondary Colors (3)**: Supporting colors that complement the primary palette:
   - Used for secondary elements, backgrounds, or variations
   - Create visual hierarchy and depth
   - Harmonize with primary colors

3. **Accent Colors (2)**: Bold, attention-grabbing colors for:
   - Highlights, call-to-actions, or special features
   - Create visual interest and energy
   - Stand out while maintaining brand consistency

4. **Neutral Colors (2)**: Versatile colors for:
   - Text, backgrounds, borders
   - Professional, clean, and timeless
   - Work across all applications

COLOR THEORY CONSIDERATIONS:
- Ensure colors work harmoniously together
- Consider cultural and psychological associations
- Maintain brand differentiation from competitors
- Ensure accessibility and readability
- Consider both digital and print applications

OUTPUT FORMAT:
Return ONLY a valid JSON object with these exact keys: "primary", "secondary", "accent", "neutral".
Each key must be an array of HEX color codes (e.g., "#FF5733").
- "primary": array of 2 HEX codes
- "secondary": array of 3 HEX codes
- "accent": array of 2 HEX codes
- "neutral": array of 2 HEX codes

Return ONLY valid JSON, no markdown, no explanations.`;

  try {
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const parsed = JSON.parse(jsonText) as ColorPalette;
    console.log('Color palette generated');
    return parsed;
  } catch (error: any) {
    console.error('Error generating color palette:', error);
    throw new Error(`Failed to generate color palette: ${error?.message || 'Unknown error'}`);
  }
};

export const generateTypography = async (brandPersonality: string): Promise<Typography> => {
  console.log('Generating typography for:', brandPersonality);
  const prompt = `You are a Senior Typography Director with expertise in type design, font pairing, and brand typography systems. You've created typography guidelines for major brands and design agencies.

TASK: Create a professional typography system that a Creative Director would implement.

BRAND PERSONALITY:
"${brandPersonality}"

REQUIREMENTS:
1. **Heading Font**: Select from Google Fonts a font that:
   - Reflects the brand personality
   - Has strong presence and hierarchy
   - Works for headlines, titles, and display text
   - Has multiple weights (at least Regular, Medium, Bold)
   - Is readable at large sizes
   - Creates brand distinction

2. **Body Font**: Select from Google Fonts a font that:
   - Complements the heading font harmoniously
   - Is highly readable at small sizes (12-16px)
   - Works for long-form content
   - Has excellent screen rendering
   - Has multiple weights for hierarchy
   - Maintains readability across devices

3. **Usage Guidelines**: Provide professional typography guidelines including:
   - Recommended font weights for different use cases
   - Size ratios between heading and body text
   - Line height recommendations
   - Letter spacing adjustments if needed
   - When to use each font
   - Best practices for the brand's typography system

TYPOGRAPHY PRINCIPLES:
- Ensure fonts pair harmoniously (contrast in style, not quality)
- Consider readability and accessibility
- Reflect brand personality through type choice
- Ensure fonts are web-optimized and load quickly
- Consider both digital and print applications

OUTPUT FORMAT:
Return ONLY a valid JSON object with these exact keys: "headingFont", "bodyFont", "guidelines".
- "headingFont": string (font name from Google Fonts)
- "bodyFont": string (font name from Google Fonts)
- "guidelines": string (detailed paragraph with professional typography guidelines)

Return ONLY valid JSON, no markdown, no code blocks.`;

  try {
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const parsed = JSON.parse(jsonText) as Typography;
    console.log('Typography generated');
    return parsed;
  } catch (error: any) {
    console.error('Error generating typography:', error);
    throw new Error(`Failed to generate typography: ${error?.message || 'Unknown error'}`);
  }
};

export const generateBrandAsset = async (logoImageBase64: string, assetType: 'Favicon' | 'Profile Picture'): Promise<string> => {
  console.log('Generating brand asset:', assetType);
  // Note: Hugging Face Inference API doesn't support image-to-image directly
  // We'll use image generation with a description instead
  const promptText = assetType === 'Favicon'
    ? `Convert this logo into a perfectly centered 1:1 aspect ratio favicon. Ensure it is clear and legible at 32x32 pixels. The background must be transparent.`
    : `Convert this logo into a perfectly centered 1:1 aspect ratio social media profile picture. The design should be bold and fill the frame, suitable for a circular crop. The background must be transparent.`;

  try {
    const base64Image = await generateImage(promptText, {
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      useCase: 'brand-asset',
    });

    console.log('Brand asset generated:', assetType);
    return base64Image;
  } catch (error: any) {
    console.error(`Error generating ${assetType}:`, error);
    throw new Error(`Failed to generate ${assetType}: ${error?.message || 'Unknown error'}`);
  }
};

// Mockup Studio
export const generateMockup = async (mockupType: string, designDescription: string): Promise<string> => {
  const prompt = `Create a premium, award-winning product photography mockup that would be featured in a Creative Director's portfolio or high-end e-commerce catalog.

PRODUCT DETAILS:
- Product Type: ${mockupType}
- Design/Content: "${designDescription}"

PHOTOGRAPHY SPECIFICATIONS:
- Style: Professional commercial product photography
- Quality: Editorial-grade, magazine-worthy imagery
- Lighting: Soft, natural daylight with professional studio lighting setup
- Environment: Modern, minimalist workspace or lifestyle setting
- Camera Angle: 45-degree perspective with dynamic composition
- Background: Soft, blurred professional environment (office, studio, or lifestyle setting)
- Depth of Field: Shallow depth of field with product in sharp focus
- Color Grading: Professional, clean color correction
- Shadows: Natural, realistic shadows that ground the product
- Reflections: Subtle, realistic reflections if applicable

COMPOSITION REQUIREMENTS:
- Rule of thirds applied
- Negative space for text overlay if needed
- Product is the clear focal point
- Professional framing and cropping
- Balanced visual weight

QUALITY STANDARDS:
- Print-ready resolution quality
- Commercial photography standards
- Portfolio-worthy execution
- Suitable for marketing materials, websites, and presentations`;

  const base64Image = await generateImage(prompt, {
    width: 1536,
    height: 864,
    num_inference_steps: 28,
    useCase: 'mockup',
  });

  return base64Image;
};

// Poster Studio
export const generatePoster = async (posterType: string, theme: string): Promise<string> => {
  const prompt = `Create a stunning, award-winning poster design that would win recognition at design competitions and impress Creative Directors.

POSTER BRIEF:
- Type: ${posterType}
- Theme: ${theme}

DESIGN REQUIREMENTS:
- Visual Style: Modern, contemporary design with professional typography and layout
- Composition: Strong visual hierarchy following design principles (rule of thirds, golden ratio)
- Typography: Dynamic, impactful typography that communicates the message clearly
- Color Palette: Vibrant, engaging colors that support the theme and create visual impact
- Mood: Energetic, exciting, and attention-grabbing
- Layout: Professional poster layout optimized for 18x24 inch print format
- Visual Elements: Striking imagery, graphics, or illustrations that support the theme
- Readability: Clear, legible text at viewing distance
- Balance: Well-balanced composition with proper use of negative space

PROFESSIONAL STANDARDS:
- Print-ready quality (300 DPI equivalent)
- Professional design agency quality
- Suitable for large format printing
- Eye-catching from a distance
- Memorable and impactful
- Industry-leading design execution

DESIGN PRINCIPLES:
- Clear visual hierarchy
- Effective use of contrast
- Professional color theory application
- Strong focal point
- Balanced composition
- Professional typography treatment`;

  const base64Image = await generateImage(prompt, {
    width: 1280,
    height: 1024,
    num_inference_steps: 28,
    useCase: 'poster',
  });

  return base64Image;
};

// Social Media Studio
export const generateSocialPost = async (platform: string, theme: string, brandName?: string): Promise<{ image: string, caption: string, hashtags: string }> => {
  // Extract brand name from theme if it contains brand info
  const brandNameToUse = brandName || (theme.includes(' - ') ? theme.split(' - ')[0] : null);
  
  const imagePrompt = `Create a high-performing, engagement-optimized ${platform} social media post image that a Social Media Manager would approve for a major brand campaign.

CONTENT THEME:
"${theme}"
${brandNameToUse ? `Brand: ${brandNameToUse}` : ''}

VISUAL REQUIREMENTS:
- Style: Professional lifestyle photography with authentic, relatable feel
- Composition: Instagram-optimized composition following platform best practices
- Color Palette: Vibrant, warm, and engaging colors that drive engagement
- Mood: Positive, inspiring, and emotionally resonant
- Quality: Professional social media content quality
- Engagement: Visually compelling and scroll-stopping
- Authenticity: Genuine, relatable imagery that connects with audiences
- Platform Optimization: Optimized for ${platform} format and audience expectations

PROFESSIONAL STANDARDS:
- Social media content quality that performs well
- Brand-appropriate visual style
- High engagement potential
- Professional photography or illustration quality
- Suitable for paid social media advertising
- Memorable and shareable`;

  const aspectRatio = platform === 'Instagram Stories' ? '9:16' : '1:1';
  const dimensions = aspectRatio === '9:16' ? { width: 864, height: 1536 } : { width: 1024, height: 1024 };

  const imageBase64 = await generateImage(imagePrompt, {
    ...dimensions,
    num_inference_steps: 28,
    useCase: 'social',
  });

  const brandInstruction = brandNameToUse 
    ? `IMPORTANT: Always use the brand name "${brandNameToUse}" with correct spelling throughout. `
    : '';
  
  const captionPrompt = `You are a Senior Social Media Copywriter with 10+ years of experience creating viral content for major brands. Your captions consistently achieve high engagement rates (5%+), drive conversions, and win industry awards.

TASK: Write a professional, high-performing ${platform} caption that a Social Media Manager would approve immediately.

CONTENT THEME:
"${theme}"
${brandInstruction}
PLATFORM: ${platform}

CAPTION REQUIREMENTS:
1. **Hook (First Line)**: Create an irresistible opening that stops the scroll:
   - Ask a question, make a bold statement, or create intrigue
   - Must be attention-grabbing and relevant
   - Maximum 125 characters for optimal mobile display

2. **Value Proposition**: Provide genuine value to the audience:
   - Share insights, tips, or relatable content
   - Connect emotionally with the target audience
   - Build trust and credibility

3. **Storytelling**: Weave a compelling narrative:
   - Use storytelling techniques to engage readers
   - Create emotional connection
   - Make it shareable and memorable

4. **Call-to-Action (CTA)**: End with a clear, compelling CTA:
   - Specific action you want readers to take
   - Natural and not overly salesy
   - Aligned with campaign objectives

5. **Brand Integration**: ${brandNameToUse ? `Naturally incorporate "${brandNameToUse}" with correct spelling.` : 'Maintain brand voice and tone.'}

TONE & STYLE:
- Authentic and conversational
- Platform-appropriate (${platform} style)
- Engaging and relatable
- Professional yet approachable
- Optimized for mobile reading

QUALITY STANDARDS:
- Zero spelling or grammar errors
- Professional copywriting quality
- High engagement potential
- Brand-appropriate messaging
- Clear, concise, and impactful

OUTPUT: Return ONLY the caption text, no additional formatting, no explanations, no markdown.`;
  
  const caption = await generateText(captionPrompt, 'meta-llama/Meta-Llama-3.1-8B-Instruct', 500);

  const hashtagPrompt = `You are a Social Media Strategist specializing in hashtag research and optimization. You've increased reach by 300%+ for major brands through strategic hashtag use.

TASK: Create a strategic hashtag mix that maximizes reach and engagement for a ${platform} post.

CONTENT THEME:
"${theme}"
${brandNameToUse ? `Brand: "${brandNameToUse}"` : ''}
PLATFORM: ${platform}

HASHTAG STRATEGY:
Create a mix of 10-12 hashtags following this distribution:

1. **High-Volume Hashtags (2-3)**: Broad, popular hashtags with 500K+ posts
   - Maximum reach potential
   - Platform trending topics if relevant

2. **Medium-Volume Hashtags (4-5)**: Niche hashtags with 50K-500K posts
   - Better engagement rates
   - More targeted audience
   - Industry or topic-specific

3. **Niche Hashtags (3-4)**: Specific hashtags with 10K-50K posts
   - Highly engaged communities
   - Less competition
   - Brand or campaign-specific
   ${brandNameToUse ? `- Include variations of "${brandNameToUse}" (e.g., #${brandNameToUse.replace(/\s+/g, '')}, #${brandNameToUse.replace(/\s+/g, '')}Life)` : ''}

HASHTAG QUALITY:
- All hashtags must be relevant to the content
- Mix of trending and evergreen hashtags
- Platform-optimized (${platform} best practices)
- No banned or spam hashtags
- Include brand-specific hashtags if applicable
- Consider seasonal or trending topics

OUTPUT: Return ONLY the hashtags separated by single spaces, no additional text, no explanations, no formatting. Example format: "#hashtag1 #hashtag2 #hashtag3"`;
  const hashtags = await generateText(hashtagPrompt);

  return {
    image: imageBase64,
    caption: caption.trim(),
    hashtags: hashtags.trim(),
  };
};

// Brand Campaign Studio
export const generateCampaignIdeas = async (input: CampaignInput): Promise<BrandCampaign[]> => {
  console.log('Generating campaign ideas for:', input);
  const prompt = `You are a Chief Marketing Officer and Creative Strategist with 20+ years of experience launching award-winning campaigns for Fortune 500 companies. Your campaigns have won Cannes Lions, Clios, and driven millions in revenue.

TASK: Create 5 distinct, world-class marketing campaign concepts that would impress a Creative Director and Marketing VP.

BRAND BRIEF:
- Brand Name: "${input.brandName}" (CRITICAL: Always use this EXACT spelling - "${input.brandName}" - never modify, abbreviate, or change it)
- Brand Tone: ${input.tone}
- Target Audience: ${input.targetAudience}
- Products/Services: ${input.products}

CAMPAIGN REQUIREMENTS:
Each campaign must be:
1. **Distinct and Unique**: No two campaigns should be similar
2. **Strategically Sound**: Based on solid marketing principles
3. **Creative and Memorable**: Award-worthy creative concepts
4. **Brand-Aligned**: Consistent with brand tone and values
5. **Audience-Focused**: Tailored to ${input.targetAudience}
6. **Results-Driven**: Clear objectives and measurable outcomes

FOR EACH CAMPAIGN, PROVIDE:

1. **Title**: A compelling, memorable campaign name (3-8 words) that:
   - Must include "${input.brandName}" with correct spelling
   - Captures the campaign essence
   - Is shareable and memorable
   - Reflects the campaign's energy

2. **Description**: A concise 2-3 sentence description (50-100 words) that:
   - Must include "${input.brandName}" with correct spelling
   - Explains the campaign concept clearly
   - Highlights unique value proposition
   - Engages and intrigues

3. **Objective**: Clear, specific marketing objective such as:
   - Brand awareness and recognition
   - Lead generation and conversion
   - Customer engagement and retention
   - Product launch or promotion
   - Market expansion
   - Be specific and measurable

4. **Target Audience**: Specific segment of "${input.targetAudience}" that this campaign targets (e.g., "Tech-savvy Millennials interested in sustainability")

5. **Key Message**: The core message (1-2 sentences) that:
   - Must naturally include "${input.brandName}" with correct spelling
   - Resonates with the target audience
   - Differentiates from competitors
   - Drives action
   - Is clear and memorable

QUALITY STANDARDS:
- Professional marketing strategy quality
- Creative Director approval level
- Grammatically perfect
- Brand name "${input.brandName}" spelled correctly in ALL instances
- Strategic and creative excellence
- Industry-leading campaign concepts

OUTPUT FORMAT:
Return ONLY a valid JSON array of exactly 5 objects. Each object must have these exact keys:
"title", "description", "objective", "targetAudience", "keyMessage"

Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

  try {
    const text = await generateText(prompt);
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const campaigns = JSON.parse(jsonText);

    // Add IDs to campaigns
    return campaigns.map((c: any, index: number) => ({
      ...c,
      id: `campaign-${Date.now()}-${index}`
    }));
  } catch (error: any) {
    console.error('Error generating campaign ideas:', error);
    throw new Error(`Failed to generate campaign ideas: ${error?.message || 'Unknown error'}`);
  }
};

export const generateCarouselPost = async (campaign: BrandCampaign, theme: string, brandName?: string): Promise<CarouselPost> => {
  console.log('Generating carousel post for campaign:', campaign.title);

  // Extract brand name from campaign if not provided
  const brandNameToUse = brandName || campaign.title.split(' ')[0];

  // 1. Generate Content Structure
  const contentPrompt = `You are a Senior Social Media Creative Director specializing in Instagram carousel campaigns. Your carousels consistently achieve 10%+ engagement rates and have won industry awards. You understand visual storytelling, audience psychology, and Instagram algorithm optimization.

TASK: Create a world-class, high-performing 5-slide Instagram carousel that a Creative Director and Social Media Manager would approve for a major brand campaign.

CAMPAIGN CONTEXT:
- Campaign Title: "${campaign.title}"
- Campaign Theme: "${theme}"
- Key Message: "${campaign.keyMessage}"
- Brand Name: "${brandNameToUse}" (CRITICAL: Always spell exactly as "${brandNameToUse}" - never modify)

CAROUSEL STRATEGY:
Create a cohesive, scroll-stopping carousel that tells a compelling story across 5 slides. Each slide should:
- Build on the previous slide
- Maintain visual and narrative consistency
- Drive engagement and completion rate
- Support the overall campaign message

SLIDE REQUIREMENTS:

For each of the 5 slides, provide:

1. **imageDescription**: A detailed, professional description for AI image generation (100-150 words) that includes:
   - Specific visual elements, composition, and style
   - Consistent brand aesthetic across all slides
   - Professional photography or illustration direction
   - Color palette and mood
   - Visual storytelling elements
   - Instagram-optimized composition
   - High-quality, engaging visuals

2. **caption**: Short, punchy text for the slide (max 50 characters) that:
   - Works as overlay text or slide description
   - Supports the visual narrative
   - Is readable and impactful
   - Maintains brand voice

MAIN CAPTION REQUIREMENTS:
Create a complete Instagram post caption (200-350 words) that:

1. **Hook (First 2-3 Lines)**: Irresistible opening that stops the scroll
2. **Story Arc**: Tell a compelling story across the caption
3. **Value Delivery**: Provide genuine value or insights
4. **Brand Integration**: Naturally include "${brandNameToUse}" with correct spelling multiple times
5. **Engagement Elements**: Include questions, emojis strategically, and engagement prompts
6. **Call-to-Action**: Clear, compelling CTA that drives action
7. **Tone**: Authentic, engaging, platform-optimized for Instagram

HASHTAG STRATEGY:
Provide 12-15 strategic hashtags including:
- 2-3 high-volume hashtags (500K+ posts)
- 5-6 medium-volume hashtags (50K-500K posts)
- 4-5 niche hashtags (10K-50K posts)
- Brand-specific hashtags for "${brandNameToUse}"
- Campaign-specific hashtags
- Industry and topic-relevant hashtags

QUALITY STANDARDS:
- Professional social media content quality
- Award-winning creative execution
- Zero spelling errors (especially "${brandNameToUse}")
- High engagement potential
- Brand-consistent messaging
- Instagram algorithm optimized

OUTPUT FORMAT:
Return ONLY a valid JSON object with these exact keys:
- "slides": Array of 5 objects, each with "imageDescription" (string) and "caption" (string, max 50 chars)
- "mainCaption": String (200-350 words)
- "hashtags": String (12-15 hashtags separated by spaces)

Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

  let contentData;
  try {
    const text = await generateText(contentPrompt, 'meta-llama/Meta-Llama-3.1-8B-Instruct', 2500);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    contentData = JSON.parse(jsonText);
  } catch (e) {
    throw new Error("Failed to generate carousel content structure");
  }

    // 2. Generate Images for each slide
  const slidesWithImages = await Promise.all(contentData.slides.map(async (slide: any, index: number) => {
    const imagePrompt = `Create a premium, high-performing Instagram carousel slide ${index + 1} of 5 for a professional brand campaign.

VISUAL DIRECTION:
${slide.imageDescription}

DESIGN REQUIREMENTS:
- Style: Consistent brand aesthetic with professional photography or illustration
- Quality: Award-winning social media content quality
- Composition: Instagram-optimized, scroll-stopping composition
- Visual Consistency: Maintains cohesive style with other carousel slides
- Engagement: Visually compelling and shareable
- Brand Alignment: Professional, on-brand visual execution
- Platform Optimization: Optimized for Instagram carousel format (1080x1080px)
- Professional Standards: Creative Director approval level quality`;

    try {
      const imageBase64 = await generateImage(imagePrompt, {
        width: 1024,
        height: 1024,
        num_inference_steps: 25, // Slightly lower steps for batch speed
        useCase: 'carousel',
      });
      return {
        image: imageBase64,
        caption: slide.caption
      };
    } catch (e) {
      console.error(`Failed to generate image for slide ${index}`, e);
      // Return placeholder or failed state
      return {
        image: '', // Handle empty image in UI
        caption: slide.caption
      };
    }
  }));

  return {
    slides: slidesWithImages,
    caption: contentData.mainCaption,
    hashtags: contentData.hashtags
  };
};

// Video Studio
export const generateVideo = async (prompt: string, setStatus: (status: string) => void): Promise<string> => {
  const apiKey = getApiKey();
  // Using Hugging Face Inference API for video generation
  // Using damo-vilab/text-to-video-ms-1.7b for more reliable free generation
  const model = 'damo-vilab/text-to-video-ms-1.7b';
  const url = `${HF_API_BASE}/${model}`;

  setStatus('Initializing video generation...');

  try {
    setStatus('Generating video. This may take several minutes...');

    // Enhanced video prompt with professional cinematography direction
    const enhancedVideoPrompt = `${prompt}

CINEMATOGRAPHY SPECIFICATIONS:
- Quality: 8K hyper-realistic graphics, ultra-high definition, professional-grade production
- Style: Cinematic, award-winning videography suitable for commercial advertising
- Motion: Smooth, natural motion with professional camera movements
- Lighting: Cinematic lighting setup with realistic shadows and highlights
- Focus: Sharp focus with professional depth of field
- Color Grading: Professional color correction and grading
- Composition: Rule of thirds, dynamic framing, professional shot composition
- Production Value: High-end commercial or film production quality
- Visual Storytelling: Compelling narrative through visual elements
- Professional Standards: Creative Director and Film Director approval level`;

    // Wan2.2 model parameters based on documentation
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedVideoPrompt,
        parameters: {
          // Optional: add size parameter for 720P (1280x704 or 704x1280)
          // size: "1280x704", // Uncomment if model supports this parameter
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Hugging Face API error: ${response.status} ${response.statusText}`;

      // Provide helpful error messages
      if (response.status === 503) {
        errorMessage += '. Model is loading. Please wait a moment and try again.';
      } else if (response.status === 404) {
        errorMessage += '. Video generation may not be available via Inference API for this model. The model may require specialized inference code.';
      } else {
        errorMessage += ` - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    setStatus('Processing video...');

    // Check content type
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();

      // Handle different response formats
      let videoData: string | null = null;

      if (data.video && typeof data.video === 'string') {
        videoData = data.video;
      } else if (data[0] && typeof data[0] === 'string') {
        videoData = data[0];
      } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        videoData = data[0];
      } else if (typeof data === 'string') {
        videoData = data;
      }

      if (videoData) {
        // Handle base64 or data URL
        const base64 = videoData.includes(',') ? videoData.split(',')[1] : videoData;
        try {
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'video/mp4' });
          const videoUrl = URL.createObjectURL(blob);

          setStatus('Video generation complete!');
          return videoUrl;
        } catch (decodeError) {
          throw new Error('Failed to decode video data. The response format may not be supported.');
        }
      }

      throw new Error('No video data found in API response. Response format: ' + JSON.stringify(data).substring(0, 200));
    } else if (contentType?.includes('video/')) {
      // Direct video blob response
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setStatus('Video generation complete!');
      return videoUrl;
    } else {
      // Try to handle as blob anyway
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setStatus('Video generation complete!');
      return videoUrl;
    }
  } catch (error: any) {
    setStatus('Video generation failed');

    // Provide helpful error message
    if (error.message.includes('503') || error.message.includes('loading')) {
      throw new Error('Model is still loading. Please wait a moment and try again. Large video models can take time to initialize.');
    } else if (error.message.includes('404') || error.message.includes('not available')) {
      throw new Error('Video generation via Inference API may not be available for this model. Please check if the model supports Inference API or requires specialized deployment.');
    } else {
      throw new Error(`Failed to generate video: ${error?.message || 'Unknown error'}`);
    }
  }
};

