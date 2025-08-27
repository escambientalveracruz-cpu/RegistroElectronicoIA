import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';

const API_ENDPOINT = '/.netlify/functions/gemini';

export async function generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse> {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generateContent',
            params,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error from Gemini API proxy:', errorData);
        throw new Error(errorData.error || 'An unknown error occurred.');
    }

    return response.json();
}


export async function generateContentStream(params: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse>> {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generateContentStream',
            params,
        }),
    });

    if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error from Gemini API proxy stream:', errorData);
        throw new Error(errorData.error || 'An unknown error occurred during streaming.');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Return an async generator
    return (async function* () {
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (buffer.trim()) {
                    yield JSON.parse(buffer);
                }
                break;
            }
            buffer += decoder.decode(value, { stream: true });
            
            // Process newline-delimited JSON
            const parts = buffer.split('\n');
            buffer = parts.pop() || ''; // Keep the last, possibly incomplete, part
            
            for (const part of parts) {
                if (part.trim()) {
                    yield JSON.parse(part);
                }
            }
        }
    })();
}
