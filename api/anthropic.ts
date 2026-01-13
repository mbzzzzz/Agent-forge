import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, model, max_tokens, system, messages } = request.body;

        // Support both naming conventions for the key
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: model || 'claude-3-haiku-20240307',
                max_tokens: max_tokens || 1024,
                system: system,
                messages: messages || [{ role: 'user', content: prompt }]
            })
        });

        const data = await anthropicResponse.json();

        if (!anthropicResponse.ok) {
            console.error('Anthropic API Error:', data);
            return response.status(anthropicResponse.status).json(data);
        }

        return response.status(200).json(data);
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return response.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
