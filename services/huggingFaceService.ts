import { BrandIdentity, ColorPalette, Typography } from "../types";

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
  
  // Fall back to process.env.API_KEY (set via vite.config.ts)
  const envKey = process.env.API_KEY || process.env.HF_TOKEN;
  if (envKey) return envKey;
  
  throw new Error('API key not found. Please select an API key or set HF_TOKEN environment variable.');
};

const HF_API_BASE = 'https://api-inference.huggingface.co/models';

// Helper function for text generation
async function generateText(prompt: string, model: string = 'meta-llama/Meta-Llama-3.1-8B-Instruct'): Promise<string> {
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
        max_new_tokens: 1000,
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

// Helper function for image generation
async function generateImage(
  prompt: string,
  options?: {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    negative_prompt?: string;
  }
): Promise<string> {
  const apiKey = getApiKey();
  const model = 'Qwen/Qwen-Image';
  
  // Add positive magic prompt enhancement
  const enhancedPrompt = prompt + ', Ultra HD, 4K, cinematic composition.';
  const negativePrompt = options?.negative_prompt || '';

  const aspectRatios: Record<string, [number, number]> = {
    "1:1": [1328, 1328],
    "16:9": [1664, 928],
    "9:16": [928, 1664],
    "4:3": [1472, 1140],
    "3:4": [1140, 1472],
    "3:2": [1584, 1056],
    "2:3": [1056, 1584],
  };

  // Determine aspect ratio from dimensions
  let width = options?.width || 1664;
  let height = options?.height || 928;
  
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
        num_inference_steps: options?.num_inference_steps || 50,
        true_cfg_scale: 4.0,
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
  const prompt = `You are a Brand Strategist agent. Analyze the following business information to create a comprehensive brand identity.
  Business: "${businessInfo}"
  
  Generate a brand name, personality profile, voice and tone, brand values, mission statement, and positioning statement.
  Return the output as a JSON object with keys: "name", "personality", "voice", "values", "mission", "positioning".
  Return ONLY valid JSON, no markdown formatting.`;

  try {
    const text = await generateText(prompt);
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
    const prompt = `Professional logo design for ${brandName}, a ${industry} company. Style: ${style}. Clean, scalable vector-style design on a transparent background. No text unless it is part of a wordmark. High quality, commercial use.`;

    try {
        const base64Image = await generateImage(prompt, {
            width: 1328,
            height: 1328,
            num_inference_steps: 50,
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
    const prompt = `As a Brand Strategist, create a color palette for a brand described as: "${brandInfo}". 
    Provide 2 primary colors, 3 secondary, 2 accent, and 2 neutral colors.
    Return a JSON object with keys: "primary", "secondary", "accent", "neutral". Each key should be an array of HEX color codes.
    Return ONLY valid JSON, no markdown formatting.`;
    
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
    const prompt = `You are a Typography Specialist. Based on a brand's personality, described as "${brandPersonality}", recommend a font pairing from Google Fonts.
    Provide:
    1. A "headingFont" (e.g., "Poppins").
    2. A "bodyFont" (e.g., "Lato").
    3. A short paragraph of "guidelines" for their usage (e.g., font weights, sizing ratios).
    Return ONLY a valid JSON object with the keys "headingFont", "bodyFont", and "guidelines".
    Return ONLY valid JSON, no markdown formatting.`;
    
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
            width: 1328,
            height: 1328,
            num_inference_steps: 50,
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
    const prompt = `Photorealistic product mockup: a ${mockupType} displaying "${designDescription}". Environment: modern minimalist desk setup. Lighting: soft natural daylight. Angle: 45-degree angle view. Style: professional product photography, sharp focus, high resolution, commercial quality. Background: blurred office interior.`;

    const base64Image = await generateImage(prompt, {
        width: 1664,
        height: 928,
        num_inference_steps: 50,
    });

    return base64Image;
};

// Poster Studio
export const generatePoster = async (posterType: string, theme: string): Promise<string> => {
    const prompt = `Professional poster design for a ${posterType}. Theme: ${theme}. Visual style: Modern and vibrant with dynamic typography. Composition: Strong visual hierarchy, eye-catching. Mood: Energetic and exciting. High quality print-ready design, 18x24 inches aspect ratio.`;
    
    const base64Image = await generateImage(prompt, {
        width: 1472,
        height: 1140,
        num_inference_steps: 50,
    });

    return base64Image;
};

// Social Media Studio
export const generateSocialPost = async (platform: string, theme: string): Promise<{ image: string, caption: string, hashtags: string }> => {
    const imagePrompt = `${platform} social media post. Theme: ${theme}. Style: Lifestyle photography, engaging and authentic. Color palette: vibrant and warm. Mood: positive and inspiring. Professional, high-quality image.`;
    
    const aspectRatio = platform === 'Instagram Stories' ? '9:16' : '1:1';
    const dimensions = aspectRatio === '9:16' ? { width: 928, height: 1664 } : { width: 1328, height: 1328 };
    
    const imageBase64 = await generateImage(imagePrompt, {
        ...dimensions,
        num_inference_steps: 50,
    });

    const captionPrompt = `You are a Social Media Copywriter. Write an engaging ${platform} caption for a post about "${theme}". Include a strong hook, provide value, and end with a call-to-action. Return only the caption text, no additional formatting.`;
    const caption = await generateText(captionPrompt);

    const hashtagPrompt = `You are a Hashtag Specialist. Generate a mix of 10 relevant hashtags for a ${platform} post about "${theme}". Mix high-volume, medium-volume, and niche hashtags. Return only the hashtags separated by spaces, no additional text.`;
    const hashtags = await generateText(hashtagPrompt);

    return {
        image: imageBase64,
        caption: caption.trim(),
        hashtags: hashtags.trim(),
    };
};

// Video Studio
export const generateVideo = async (prompt: string, setStatus: (status: string) => void): Promise<string> => {
    setStatus('Initializing video generation...');
    
    // Note: Hugging Face doesn't have a direct video generation model like Veo
    // We'll use an image-to-video model or provide a message
    // Using stable-video-diffusion or similar if available
    setStatus('Video generation is not directly supported via Hugging Face Inference API for this model. Generating a high-quality image sequence instead...');
    
    try {
        // For now, generate a single high-quality image
        // In a real implementation, you'd want to use a video generation model
        const base64Image = await generateImage(prompt, {
            width: 1664,
            height: 928,
            num_inference_steps: 50,
        });

        // Convert base64 to blob URL for compatibility
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const videoUrl = URL.createObjectURL(blob);
        
        setStatus('Note: Video generation returned an image. For full video support, consider using a video generation model.');
        return videoUrl;
    } catch (error: any) {
        setStatus('Video generation failed');
        throw new Error(`Failed to generate video: ${error?.message || 'Unknown error'}`);
    }
};

