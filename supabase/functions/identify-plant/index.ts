import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();
    if (typeof imageBase64 !== "string" || imageBase64.length < 100 || imageBase64.length > 8_000_000) {
      return new Response(JSON.stringify({ error: "Please send a valid plant photo under 6 MB." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return new Response(JSON.stringify({ error: "Only JPG, PNG and WEBP photos are supported." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("The AI service is not configured yet.");

    const ai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: "You are an urban gardening assistant. Identify the plant as carefully as possible from the image. Return a concise, useful report with: likely common name, scientific name if reasonably certain, confidence (high/medium/low), visual clues, light needs, watering guidance, soil and pot advice, and common problems to check. If the image is unclear or the plant cannot be identified reliably, say so and ask for a clearer photo. Do not claim certainty when uncertain. Mention that diagnosis from a photo is not definitive.",
        input: [{ role: "user", content: [
          { type: "input_text", text: "Please identify this plant and give practical care advice for a home, balcony or terrace garden in Kolkata's climate." },
          { type: "input_image", image_url: `data:${mimeType};base64,${imageBase64}` }
        ] }]
      })
    });
    const result = await ai.json();
    if (!ai.ok) throw new Error(result.error?.message || "AI identification service failed.");
    const answer = result.output_text || (result.output || []).flatMap((item: any) => item.content || []).map((part: any) => part.text || "").join("\n");
    return new Response(JSON.stringify({ result: answer || "No identification details were returned." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected server error." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
