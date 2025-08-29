import type { Handler, HandlerEvent } from "@netlify/functions";

// Polyfill para ReadableStream
let PolyfillReadableStream: any;
try {
  const mod = require("web-streams-polyfill/ponyfill");
  PolyfillReadableStream = mod.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    (globalThis as any).ReadableStream = PolyfillReadableStream;
  }
} catch (err) {
  console.error("No se pudo cargar polyfill de streams:", err);
}

// Requerir dinámicamente GoogleGenAI en el handler
let ai: any;

const handler: Handler = async (event: HandlerEvent) => {
  if (!ai) {
    const { GoogleGenAI } = await import("@google/genai");
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { action, params } = JSON.parse(event.body || "{}");

    switch (action) {
      case "generateContent": {
        const response = await ai.models.generateContent(params);
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        };
      }

      case "generateContentStream": {
        const stream = await ai.models.generateContentStream(params);
        const readable = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of stream) {
              controller.enqueue(
                encoder.encode(JSON.stringify(chunk) + "\n")
              );
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
    console.error("Error en Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };
