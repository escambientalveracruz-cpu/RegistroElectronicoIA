import type { Handler, HandlerEvent } from "@netlify/functions";

// Polyfill de ReadableStream si no existe en el entorno
if (typeof ReadableStream === "undefined") {
  const { ReadableStream: PolyfillReadableStream } = await import("web-streams-polyfill/ponyfill");
  (globalThis as any).ReadableStream = PolyfillReadableStream;
}

let ai: any | null = null;

// Inicializa el cliente de Google Gemini solo una vez
async function getClient() {
  if (!ai) {
    const genAIModule = await import("@google/genai");
    const { GoogleGenAI } = genAIModule;
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { action, params } = JSON.parse(event.body || "{}");

    if (!action || !params) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing action or params" }),
      };
    }

    const client = await getClient();

    switch (action) {
      case "generateContent": {
        const response = await client.models.generateContent(params);
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        };
      }

      case "generateContentStream": {
        const stream = await client.models.generateContentStream(params);

        const readable = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
            }
            controller.close();
          },
        });

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/octet-stream" },
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
    console.error("Error processing Gemini request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "An internal server error occurred.",
      }),
    };
  }
};

export { handler };
