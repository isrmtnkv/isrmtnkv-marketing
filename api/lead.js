function clean(value, maxLength = 1200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Telegram is not configured" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  if (clean(body.company)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 160);
  const contact = clean(body.contact, 240);
  const project = clean(body.project, 1800);
  const page = clean(body.page, 500);
  const lang = clean(body.lang, 20);

  if (!name || !contact || !project) {
    return res.status(400).json({ ok: false, error: "Required fields are missing" });
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
      return res.status(502).json({ ok: false, error: "Telegram API error" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Lead notification error:", error);
    return res.status(500).json({ ok: false, error: "Notification failed" });
  }
};
