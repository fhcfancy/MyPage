/**
 * Vercel serverless proxy for DeepSeek chat completions.
 * Keeps DEEPSEEK_API_KEY on the server — never expose it in the browser.
 */

const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

function parseAllowedOrigins() {
  var raw = process.env.ALLOWED_ORIGINS || "*";
  return raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}

function resolveCorsOrigin(req) {
  var allowed = parseAllowedOrigins();
  var origin = req.headers.origin || "";
  if (allowed.indexOf("*") >= 0) return "*";
  if (origin && allowed.indexOf(origin) >= 0) return origin;
  return allowed[0] || "";
}

function setCorsHeaders(res, origin) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

module.exports = async function handler(req, res) {
  var origin = resolveCorsOrigin(req);
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "DEEPSEEK_API_KEY is not configured on the server." });
  }

  var body = req.body || {};
  var messages = body.messages;
  var context = body.context || "";
  var personality = body.personality || "";
  var lang = body.lang === "en" ? "en" : "zh";
  var stream = body.stream !== false;

  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "messages array is required" });
  }

  if (messages.length > 20) {
    return res.status(400).json({ error: "Too many messages in conversation" });
  }

  var replyLang = lang === "en" ? "English" : "Chinese";
  var systemContent = [
    personality,
    context ? "\n\n--- Portfolio page content (ground truth) ---\n" + context : "",
    "\n\nAnswer rules:",
    "- Only use facts from the page content and extra knowledge above.",
    "- If the answer is not in the context, say so kindly and suggest what the visitor could ask instead.",
    "- Reply in " + replyLang + " unless the user explicitly asks for another language.",
    "- Keep answers concise and warm (about 2-6 sentences unless the user asks for detail).",
    "- Do not invent certificates, awards, contact details, or project facts."
  ].join("\n");

  var payload = {
    model: MODEL,
    messages: [{ role: "system", content: systemContent }].concat(messages),
    temperature: 0.7,
    max_tokens: 900,
    stream: stream
  };

  try {
    var dsRes = await fetch(DEEPSEEK_API_BASE + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!dsRes.ok) {
      var errText = await dsRes.text();
      return res.status(dsRes.status).json({ error: "DeepSeek request failed", detail: errText.slice(0, 500) });
    }

    if (!stream) {
      var data = await dsRes.json();
      var content = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "";
      return res.status(200).json({ content: content || "" });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    if (!dsRes.body) {
      return res.status(500).json({ error: "Streaming body unavailable" });
    }

    var reader = dsRes.body.getReader();
    var decoder = new TextDecoder();

    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      res.write(decoder.decode(chunk.value, { stream: true }));
    }

    res.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected server error" });
  }
};
