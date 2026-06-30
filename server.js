const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const port = process.env.PORT || 3000;
const publicRoot = __dirname;

function clean(value, maxLength = 1200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        reject(new Error("Payload is too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleLead(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return sendJson(res, 500, { ok: false, error: "Telegram is not configured" });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { ok: false, error: "Invalid JSON" });
  }

  if (clean(body.company)) {
    return sendJson(res, 200, { ok: true });
  }

  const name = clean(body.name, 160);
  const contact = clean(body.contact, 240);
  const project = clean(body.project, 1800);
  const page = clean(body.page, 500);
  const lang = clean(body.lang, 20);

  if (!name || !contact || !project) {
    return sendJson(res, 400, { ok: false, error: "Required fields are missing" });
  }

  const text = [
    "Новая заявка с сайта",
    "",
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    `Проект: ${project}`,
    page ? `Страница: ${page}` : "",
    lang ? `Язык: ${lang}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error("Telegram API error:", errorText);
      return sendJson(res, 502, { ok: false, error: "Telegram API error" });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Lead notification error:", error);
    return sendJson(res, 500, { ok: false, error: "Notification failed" });
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  }[ext] || "application/octet-stream";
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, "http://localhost");
  const safePath = path
    .normalize(decodeURIComponent(requestUrl.pathname))
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicRoot, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    return res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, "http://localhost");

  if (requestUrl.pathname === "/api/lead") {
    return handleLead(req, res);
  }

  if (requestUrl.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  return serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
