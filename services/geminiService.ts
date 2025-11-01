
import { GoogleGenAI, Modality, Type } from "@google/genai";
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
  const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (envKey) return envKey;
  
  throw new Error('API key not found. Please select an API key or set GEMINI_API_KEY environment variable.');
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

// Brand Kit Studio
export const generateBrandIdentity = async (businessInfo: string): Promise<BrandIdentity> => {
  console.log('Generating brand identity for:', businessInfo);
  const ai = getAI();
  const prompt = `You are a Brand Strategist agent. Analyze the following business information to create a comprehensive brand identity.
  Business: "${businessInfo}"
  
  Generate a brand name, personality profile, voice and tone, brand values, mission statement, and positioning statement.
  Return the output as a JSON object with keys: "name", "personality", "voice", "values", "mission", "positioning".`;

  try {
    const response = await ai.models.generateContent({
      // FIX: Use recommended model for complex text tasks. 'gemini-2.5-pro' is deprecated, fallback to gemini-1.5-flash
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
      }
    });

    const text = response.text.trim();
    console.log('Brand identity response received');
    return JSON.parse(text) as BrandIdentity;
  } catch (error: any) {
    console.error('Error generating brand identity:', error);
    // Try fallback model
    try {
      console.log('Trying fallback model: gemini-1.5-flash');
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
      });
      const text = response.text.trim();
      return JSON.parse(text) as BrandIdentity;
    } catch (fallbackError) {
      console.error('Fallback model also failed:', fallbackError);
      throw new Error(`Failed to generate brand identity: ${error?.message || 'Unknown error'}`);
    }
  }
};

export const generateLogo = async (brandName: string, industry: string, style: string): Promise<string> => {
    console.log('Generating logo for:', brandName, industry, style);
    const ai = getAI();
    const prompt = `Professional logo design for ${brandName}, a ${industry} company. Style: ${style}. Clean, scalable vector-style design on a transparent background. No text unless it is part of a wordmark. High quality, commercial use.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (!response?.generatedImages?.[0]?.image?.imageBytes) {
            throw new Error('Logo generation returned no image data');
        }

        console.log('Logo generated successfully');
        return response.generatedImages[0].image.imageBytes;
    } catch (error: any) {
        console.error('Error generating logo:', error);
        throw new Error(`Failed to generate logo: ${error?.message || 'Unknown error'}`);
    }
};

export const generateColorPalette = async (brandInfo: string): Promise<ColorPalette> => {
    console.log('Generating color palette for:', brandInfo);
    const ai = getAI();
    const prompt = `As a Brand Strategist, create a color palette for a brand described as: "${brandInfo}". 
    Provide 2 primary colors, 3 secondary, 2 accent, and 2 neutral colors.
    Return a JSON object with keys: "primary", "secondary", "accent", "neutral". Each key should be an array of HEX color codes.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        primary: { type: Type.ARRAY, items: { type: Type.STRING }},
                        secondary: { type: Type.ARRAY, items: { type: Type.STRING }},
                        accent: { type: Type.ARRAY, items: { type: Type.STRING }},
                        neutral: { type: Type.ARRAY, items: { type: Type.STRING }},
                    }
                }
            }
        });

        const parsed = JSON.parse(response.text.trim()) as ColorPalette;
        console.log('Color palette generated');
        return parsed;
    } catch (error: any) {
        console.error('Error generating color palette:', error);
        // Try fallback
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });
            return JSON.parse(response.text.trim()) as ColorPalette;
        } catch (fallbackError) {
            throw new Error(`Failed to generate color palette: ${error?.message || 'Unknown error'}`);
        }
    }
};

export const generateTypography = async (brandPersonality: string): Promise<Typography> => {
    console.log('Generating typography for:', brandPersonality);
    const ai = getAI();
    const prompt = `You are a Typography Specialist. Based on a brand's personality, described as "${brandPersonality}", recommend a font pairing from Google Fonts.
    Provide:
    1. A "headingFont" (e.g., "Poppins").
    2. A "bodyFont" (e.g., "Lato").
    3. A short paragraph of "guidelines" for their usage (e.g., font weights, sizing ratios).
    Return ONLY a valid JSON object with the keys "headingFont", "bodyFont", and "guidelines".`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headingFont: { type: Type.STRING },
                        bodyFont: { type: Type.STRING },
                        guidelines: { type: Type.STRING },
                    },
                },
            },
        });

        const parsed = JSON.parse(response.text.trim()) as Typography;
        console.log('Typography generated');
        return parsed;
    } catch (error: any) {
        console.error('Error generating typography:', error);
        throw new Error(`Failed to generate typography: ${error?.message || 'Unknown error'}`);
    }
};

export const generateBrandAsset = async (logoImageBase64: string, assetType: 'Favicon' | 'Profile Picture'): Promise<string> => {
    console.log('Generating brand asset:', assetType);
    const ai = getAI();
    const promptText = assetType === 'Favicon'
      ? 'Convert this logo into a perfectly centered 1:1 aspect ratio favicon. Ensure it is clear and legible at 32x32 pixels. The background must be transparent.'
      : 'Convert this logo into a perfectly centered 1:1 aspect ratio social media profile picture. The design should be bold and fill the frame, suitable for a circular crop. The background must be transparent.';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: logoImageBase64, mimeType: 'image/png' } },
                    { text: promptText },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error('No response parts from API');
        }

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                console.log('Brand asset generated:', assetType);
                return part.inlineData.data;
            }
        }
        throw new Error(`Could not generate ${assetType} - no image data in response`);
    } catch (error: any) {
        console.error(`Error generating ${assetType}:`, error);
        throw new Error(`Failed to generate ${assetType}: ${error?.message || 'Unknown error'}`);
    }
};

// Mockup Studio
export const generateMockup = async (mockupType: string, designDescription: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Photorealistic product mockup: a ${mockupType} displaying "${designDescription}". Environment: modern minimalist desk setup. Lighting: soft natural daylight. Angle: 45-degree angle view. Style: professional product photography, sharp focus, high resolution, commercial quality. Background: blurred office interior.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    return response.generatedImages[0].image.imageBytes;
};


// Poster Studio
export const generatePoster = async (posterType: string, theme: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Professional poster design for a ${posterType}. Theme: ${theme}. Visual style: Modern and vibrant with dynamic typography. Composition: Strong visual hierarchy, eye-catching. Mood: Energetic and exciting. High quality print-ready design, 18x24 inches aspect ratio.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    });

    return response.generatedImages[0].image.imageBytes;
};

// Social Media Studio
export const generateSocialPost = async (platform: string, theme: string): Promise<{ image: string, caption: string, hashtags: string }> => {
    const ai = getAI();
    const imagePrompt = `${platform} social media post. Theme: ${theme}. Style: Lifestyle photography, engaging and authentic. Color palette: vibrant and warm. Mood: positive and inspiring. Professional, high-quality image.`;
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: platform === 'Instagram Stories' ? '9:16' : '1:1',
        },
    });

    const captionPrompt = `You are a Social Media Copywriter. Write an engaging ${platform} caption for a post about "${theme}". Include a strong hook, provide value, and end with a call-to-action.`;
    const captionResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: captionPrompt });

    const hashtagPrompt = `You are a Hashtag Specialist. Generate a mix of 10 relevant hashtags for a ${platform} post about "${theme}". Mix high-volume, medium-volume, and niche hashtags.`;
    const hashtagResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: hashtagPrompt });

    return {
        image: imageResponse.generatedImages[0].image.imageBytes,
        caption: captionResponse.text,
        hashtags: hashtagResponse.text,
    };
};


// Video Studio
export const generateVideo = async (prompt: string, setStatus: (status: string) => void): Promise<string> => {
    // A new instance is created here to ensure the latest API key is used
    const ai = getAI(); 
    setStatus('Initializing video generation...');
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
    
    setStatus('Video is being generated. This can take a few minutes...');

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      setStatus('Checking video status...');
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    setStatus('Fetching video URL...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video URI not found in response.");

    // Get API key for the fetch call (same method used for AI instance)
    const apiKey = getApiKey();
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(blob);
    
    setStatus('Video generation complete!');
    return videoUrl;
};
