export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = await request.json();

      const name = data.name || "Без имени";
      const phone = data.phone || "Без телефона";
      const message = data.message || "Без сообщения";

      const text =
`Новая заявка с сайта:

Имя: ${name}
Телефон: ${phone}
Сообщение: ${message}`;

      const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text,
        }),
      });

      if (!telegramResponse.ok) {
        return new Response(JSON.stringify({ ok: false }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
