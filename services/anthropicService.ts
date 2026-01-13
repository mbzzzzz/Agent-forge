


/**
 * Cleans AI-generated patterns and markdown from text
 */
function cleanGeneratedText(text: string): string {
    if (!text) return text;

    let cleaned = text;

    // Remove markdown headers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    // Remove markdown bold/italic (* ** ***)
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

    // Remove markdown lists (- * +)
    cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

    // Remove markdown code blocks (``` ```)
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Remove markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // Remove common AI-generated phrases
    const aiPhrases = [
        /^As an AI[,\s]/gi,
        /^I'm an AI[,\s]/gi,
        /^I am an AI[,\s]/gi,
        /^Here's\s+(a|the|some)/gi,
        /^Here is\s+(a|the|some)/gi,
        /^Let me\s+/gi,
        /^I'll\s+/gi,
        /^I will\s+/gi,
        /^I can\s+/gi,
        /^I would\s+/gi,
        /^I should\s+/gi,
        /^I think\s+/gi,
        /^I believe\s+/gi,
        /^I hope\s+/gi,
        /^I'm here\s+/gi,
        /^I'm designed\s+/gi,
        /^I'm programmed\s+/gi,
        /^I'm trained\s+/gi,
        /^I'm a language model/gi,
        /^I'm an AI assistant/gi,
        /^I'm ChatGPT/gi,
        /^I'm Claude/gi,
        /^I'm Gemini/gi,
        /^I'm an AI language model/gi,
        /^I'm an artificial intelligence/gi,
        /^As a language model/gi,
        /^As an AI language model/gi,
        /^As an artificial intelligence/gi,
        /^Note:\s*/gi,
        /^Important:\s*/gi,
        /^Please note:\s*/gi,
        /^Keep in mind:\s*/gi,
        /^Remember:\s*/gi,
        /^It's important to note/gi,
        /^It's worth noting/gi,
        /^It should be noted/gi,
    ];

    aiPhrases.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    // Remove excessive whitespace and newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.trim();

    return cleaned;
}

/**
 * Generates text using Anthropic's API (Claude 3.5 Haiku)
 */
export async function generateText(
    prompt: string,
    model: string = 'claude-3-haiku-20240307',
    maxTokens: number = 2000,
    systemPrompt: string = 'You are a world-class brand strategist and creative director.'
): Promise<string> {
    // API key is handled by the server-side proxy
    console.log('Anthropic text generation request:', { model, promptLength: prompt.length });

    try {
        const response = await fetch('/api/anthropic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                model,
                max_tokens: maxTokens,
                system: systemPrompt
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.content[0]?.text || "";
        console.log('Anthropic text generation response received');
        return cleanGeneratedText(generatedText);
    } catch (error: any) {
        console.error('Anthropic text generation error:', error);
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            // Fallback for local dev without proxy mostly, but could be useful info
            throw new Error('Network error: Unable to connect to backend API /api/anthropic. Ensure the server is running.');
        }
        throw error;
    }
}

/**
 * Uses Claude to improve a simple image prompt for high-quality Flux generation.
 */
export async function improveImagePrompt(
    basePrompt: string,
    useCase: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general' | 'remix' = 'general'
): Promise<string> {
    const systemPrompt = `You are a world-class AI Image Prompt Engineer specializing in high-end advertising photography and digital art. 
    Your expertise is in Flux and Midjourney-style prompting.
    You create prompts that result in award-winning, hyper-realistic, and commercially viable imagery.`;

    const prompt = `TASK: Transform this base description into a masterfully crafted, highly detailed image generation prompt.
    
    BASE DESCRIPTION: "${basePrompt}"
    CATEGORY: ${useCase}
    
    SYSTEMATIC ENHANCEMENT FRAMEWORK:
    1. **Subject Detail**: Enhance the main subject with specific textures, materials, and intricate details. No generic terms.
    2. **Environment/Atmosphere**: Describe a premium, well-composed setting with atmospheric perspective.
    3. **Lighting & Color**: Use professional terminology (vignetting, rim lighting, volumetric rays, high dynamic range, specific color palettes like "tertiary colors" or "muted pastels").
    4. **Technical Specs**: Include camera settings (f/1.8, 85mm lens, macro), renderer details (Octane Render, Unreal Engine 5 style), and quality markers (8k, raw photo, highly detailed).
    5. **Style-Specifics**:
       - FOR LOGOS: Focus on "vector aesthetic", "perfect symmetry", "minimalist geometric", "negative space mastery", "monumental brand presence", "against a clean solid background".
       - FOR MOCKUPS: Focus on "premium product photography", "studio lighting perfection", "tactile textures", "shallow depth of field", "uncluttered composition".
       - FOR SOCIAL/CAMPAIGNS: Focus on "lifestyle excellence", "vibrant energy", "high engagement composition", "authentic but polished", "Instagram aesthetic".
    
    CRITICAL CONSTRAINTS:
    - Output ONLY the final prompt.
    - No introductions, no "Here is your prompt", no explanations.
    - Maximize descriptive power and visual clarity.
    - Ensure the tone is premium, professional, and sophisticated.
    
    IMPROVED PROMPT:`;

    try {
        const improved = await generateText(prompt, 'claude-3-haiku-20240307', 1000, systemPrompt);
        return improved;
    } catch (error) {
        console.error('Failed to improve prompt with Claude, using base prompt:', error);
        return basePrompt;
    }
}
