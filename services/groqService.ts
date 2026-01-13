import Groq from "groq-sdk";

const getGroqApiKey = (): string => {
    // Use VITE_ prefix for client-side accessibility if needed, otherwise standard env
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_GROQ_API_KEY || (typeof process !== 'undefined' ? process.env.GROQ_API_KEY : '');
    if (apiKey) return apiKey;

    throw new Error('Groq API key not found. Please set the GROQ_API_KEY or VITE_GROQ_API_KEY environment variable.');
};

let groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
    if (!groqClient) {
        groqClient = new Groq({
            apiKey: getGroqApiKey(),
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
    }
    return groqClient;
};

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
 * Generates text using Groq's API (Llama 3 70B)
 */
export async function generateText(
    prompt: string,
    model: string = 'llama3-70b-8192',
    maxTokens: number = 2000
): Promise<string> {
    const client = getGroqClient();

    console.log('Groq text generation request:', { model, promptLength: prompt.length });

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            max_tokens: maxTokens,
            temperature: 0.7,
            top_p: 1,
            stream: false,
        });

        const generatedText = chatCompletion.choices[0]?.message?.content || "";
        console.log('Groq text generation response received');
        return cleanGeneratedText(generatedText);
    } catch (error: any) {
        console.error('Groq text generation error:', error);
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            throw new Error('Network error: Unable to connect to Groq API. Please check your internet connection and try again.');
        }
        throw error;
    }
}

/**
 * Uses Groq to improve a simple image prompt for high-quality Flux generation.
 */
export async function improveImagePrompt(
    basePrompt: string,
    useCase: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general' | 'remix' = 'general'
): Promise<string> {
    const prompt = `You are an expert AI Prompt Engineer specializing in Flux and Stable Diffusion. 
    Your task is to take a simple user description and expand it into a high-quality, detailed prompt for image generation.

    USER INPUT: "${basePrompt}"
    USE CASE: ${useCase}

    REQUIREMENTS:
    - Expand the input into a detailed, descriptive prompt (75-150 words).
    - Include details about: composition, lighting (e.g., cinematic, studio, soft), texture, colors, and camera angle.
    - Tailor the prompt specifically for the "${useCase}" use case.
    - ALWAYS Include quality buzzwords like "hyper realistic", "8k graphics", "ultra detailed", and "masterpiece" to ensure the highest fidelity.
    - DO NOT include any introductory text or explanations.
    - Return ONLY the improved prompt text.
    - For logos: focus on vector style, clean lines, and negative space.
    - For mockups: focus on depth of field, product texture, and professional studio setup.
    - For posters: focus on layout, typography placement, and strong visual hierarchy.

    IMPROVED PROMPT:`;

    try {
        const improved = await generateText(prompt, 'llama3-70b-8192', 500);
        return improved;
    } catch (error) {
        console.error('Failed to improve prompt with Groq, using base prompt:', error);
        return basePrompt;
    }
}

