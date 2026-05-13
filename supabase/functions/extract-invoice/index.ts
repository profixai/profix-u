import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const EXTRACTION_PROMPT = `You are an invoice OCR engine. Extract the following fields from the attached invoice image and return ONLY valid JSON matching this schema:
{
  "vendor": { "value": string, "confidence": number 0-100 },
  "invoiceNumber": { "value": string, "confidence": number },
  "amount": { "value": number, "confidence": number },
  "invoiceDate": { "value": "YYYY-MM-DD", "confidence": number },
  "dueDate": { "value": "YYYY-MM-DD", "confidence": number },
  "glCode": { "value": string, "confidence": number },
  "splits": [{ "id": string, "percent": number, "category": {"value": string, "confidence": number}, "subcategory": {"value": string, "confidence": number} }]
}
USALI categories include: Rooms, Food & Beverage, Housekeeping, Administrative & General, Sales & Marketing, Property Operation & Maintenance, Utilities, Other Operating Departments. If a field is unreadable, set confidence to 0 and value to "".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id required");

    const { data: inv, error: invErr } = await supabase
      .from("invoices").select("*").eq("id", invoice_id).single();
    if (invErr || !inv) throw new Error("invoice not found");

    const { data: signed, error: sErr } = await supabase
      .storage.from("invoices").createSignedUrl(inv.file_path, 600);
    if (sErr || !signed) throw new Error("signed url failed");

    // Fetch the file and convert to base64 data URL for Gemini
    const fileRes = await fetch(signed.signedUrl);
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = btoa(binary);
    const mime = fileRes.headers.get("content-type") || "image/png";
    const dataUrl = `data:${mime};base64,${b64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        }],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${t}`);
    }
    const aiJson = await aiRes.json();
    const text: string = aiJson.choices?.[0]?.message?.content ?? "";

    // Strip markdown fences if any
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); }
    catch {
      await supabase.from("invoices").update({
        status: "extraction_failed",
        error: "Could not parse AI response as JSON",
        raw_extraction: { text },
      }).eq("id", invoice_id);
      throw new Error("AI returned non-JSON");
    }

    await supabase.from("invoices").update({
      status: "pending_approval",
      vendor: parsed.vendor ?? null,
      invoice_number: parsed.invoiceNumber ?? null,
      amount: parsed.amount ?? null,
      invoice_date: parsed.invoiceDate ?? null,
      due_date: parsed.dueDate ?? null,
      gl_code: parsed.glCode ?? null,
      splits: parsed.splits ?? [],
      raw_extraction: parsed,
      error: null,
    }).eq("id", invoice_id);

    return new Response(JSON.stringify({ ok: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-invoice error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
