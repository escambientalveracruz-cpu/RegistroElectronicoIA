import type { Handler, HandlerEvent } from "@netlify/functions";

// This is required for Netlify functions to work with web streams.
// 'require' is available in the Netlify Functions runtime.
declare const require: (module: string) => any;
if (typeof ReadableStream === 'undefined') {
    (globalThis as any).ReadableStream = require('web-streams-polyfill/ponyfill/ReadableStream');
}

// Dynamically import @google/genai. This is a common pattern for ESM modules in CJS environments.
// We are doing this *outside* the handler to leverage function instance reuse (caching).
// This is the key performance optimization.
const genAIModule = await import('@google/genai');
const { GoogleGenAI } = genAIModule;

// Initialize the client outside the handler.
// This ensures that the client is created only once per function instance (on cold start).
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { action, params } = JSON.parse(event.body || '{}');

        if (!action || !params) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing action or params' }),
            };
        }

        switch (action) {
            case 'generateContent': {
                const response = await ai.models.generateContent(params);
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response),
                };
            }
            case 'generateContentStream': {
                 const stream = await ai.models.generateContentStream(params);

                // For streaming responses with Netlify Functions, we need to return a ReadableStream.
                const readable = new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder();
                        for await (const chunk of stream) {
                            // Each chunk is a GenerateContentResponse. We'll send it as a JSON string followed by a newline.
                            controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
                        }
                        controller.close();
                    }
                });

                return {
                    statusCode: 200,
                    headers: { 
                        'Content-Type': 'application/octet-stream',
                    },
                    // The body needs to be a stream
                    body: readable as any,
                };
            }
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Unknown action: ${action}` }),
                };
        }
    } catch (error: any) {
        console.error('Error processing Gemini request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};

export { handler };
