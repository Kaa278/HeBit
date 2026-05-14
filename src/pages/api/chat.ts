import type { APIRoute } from "astro";

export const prerender = false;

const BASE_URL = "https://hellobit-1.tailc64650.ts.net/v1";
const API_KEY = import.meta.env.HEBIT_API_KEY;
const DEFAULT_PLAYGROUND_MODEL = "groq/llama-3.3-70b-versatile";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const displayModel = typeof body?.displayModel === "string" && body.displayModel.trim()
      ? body.displayModel.trim().slice(0, 80)
      : "Llama 3.3 70B (Fast)";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt wajib diisi." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "HEBIT_API_KEY belum dikonfigurasi di environment server. Pastikan .env terisi lalu restart dev server Astro." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_PLAYGROUND_MODEL,
        max_tokens: 300,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              `Kamu adalah asisten yang selalu menjawab dalam Bahasa Indonesia yang natural, jelas, dan ringkas. Jika user bertanya kamu menggunakan model apa, identitas model apa, atau pertanyaan sejenis, jawab bahwa kamu menggunakan ${displayModel}. Jangan menyebut model internal lain.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const text = await upstream.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      // Fallback kalau upstream kirim SSE (data: ...)
      const chunks = text
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s*/, "").trim())
        .filter((line) => line && line !== "[DONE]");

      let merged = "";
      for (const chunk of chunks) {
        try {
          const parsed = JSON.parse(chunk);
          merged += parsed?.choices?.[0]?.delta?.content || "";
        } catch {
          // ignore malformed chunk
        }
      }

      data = merged
        ? { choices: [{ message: { content: merged } }] }
        : { error: text || "API HeBit mengembalikan respons non-JSON." };
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return new Response(JSON.stringify({ error: `Gagal menghubungi API HeBit: ${message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
