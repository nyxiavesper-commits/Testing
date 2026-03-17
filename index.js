const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const FormData = require("form-data");

// ============================================================
//  CONFIG — edit values below
// ============================================================
const BOT_TOKEN   = "8293625592:AAFocvaW9d5PgVYQ0LO34nYt-12yK7Hejsg";
const ADMIN_ID    = 7624612389;
const GEMINI_KEY  = "AIzaSyDIvO4nnxNTahCtUkvn7Lx4jnB5q0jUUOc"; // ganti dengan Gemini API key kamu

const WELCOME_IMAGE = "https://files.catbox.moe/f68qg9.jpg";
const QR_IMAGE      = "https://files.catbox.moe/enl8lt.jpg";
const DUITNOW_NUM   = "181837537347";

// ── Item catalog ──────────────────────────────────────────────
const ITEMS = {
  partner: {
    label: "🤝 Benefits Partner",
    price: 15,
    currency: "MYR",
    delivery: "link",
    content: "https://t.me/+PARTNER_GROUP_LINK", // ganti link group partner
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║  ✦  SELAMAT DATANG  ✦   ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🎉 Tahniah! Kamu kini adalah <b>Partner Rasmi TENZXI</b>!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "🔗 <b>Link Group Partner:</b>\n" +
      "{CONTENT}\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "⚡ <i>Akses eksklusif kamu telah diaktifkan.</i>\n" +
      "💼 Nikmati semua faedah partner!\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
  murban: {
    label: "🔓 Murban / Unban",
    price: 10,
    currency: "MYR",
    delivery: "text",
    content:
      "Servis unban kamu telah diproses. Admin akan hubungi kamu dalam masa 5–10 minit. Sila tunggu. ✅",
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║   ✦  ORDER COMPLETE  ✦  ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🔓 <b>Murban / Unban</b> — Pesanan diterima!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "📌 Status: <b>Dalam Proses</b>\n" +
      "⏳ ETA: <b>5 – 10 minit</b>\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "💬 Admin akan menghubungi kamu tidak lama lagi.\n" +
      "🙏 Terima kasih kerana mempercayai TENZXI!\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
  murbug: {
    label: "🐛 Murbug / SC+APK",
    price: 20,
    currency: "MYR",
    delivery: "text",
    content: "File SC+APK akan dihantar oleh admin dalam masa terdekat. Sila standby. 📦",
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║   ✦  ORDER COMPLETE  ✦  ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🐛 <b>Murbug / SC+APK</b> — Pesanan disahkan!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "📦 File akan dihantar tidak lama lagi\n" +
      "⚡ Kualiti terjamin 100%\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "✅ Terima kasih! Standby ya.\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
  panel_vps: {
    label: "🖥️ Panel / VPS",
    price: 25,
    currency: "MYR",
    delivery: "text",
    content: "VPS/Panel kamu sedang disiapkan. Maklumat login akan dihantar kepada kamu dalam masa 15 minit. 🖥️",
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║   ✦  ORDER COMPLETE  ✦  ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🖥️ <b>Panel / VPS</b> — Akses sedang disiapkan!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "🔧 Server: <b>Dalam Proses Setup</b>\n" +
      "⏳ ETA: <b>10 – 15 minit</b>\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "📨 Login credentials akan dihantar via bot ini.\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
  murbuild: {
    label: "🏗️ Murbuild",
    price: 30,
    currency: "MYR",
    delivery: "text",
    content: "Build kamu telah diterima. Admin akan mula proses build dalam masa terdekat. ⚙️",
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║   ✦  ORDER COMPLETE  ✦  ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🏗️ <b>Murbuild</b> — Build diterima!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "⚙️ Status: <b>Queue — Dalam Proses</b>\n" +
      "🛠️ Admin akan hubungi kamu\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "💪 Kualiti premium, harga berpatutan!\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
  all_jasa: {
    label: "🌟 All Jasa Tenzxi",
    price: 50,
    currency: "MYR",
    delivery: "text",
    content: "Pakej All Jasa TENZXI telah diaktifkan! Admin akan hubungi kamu untuk bincang skop penuh. 🌟",
    deliveryCaption:
      "╔══════════════════════════╗\n" +
      "║  ✦  VIP PACKAGE  ✦      ║\n" +
      "╚══════════════════════════╝\n\n" +
      "🌟 <b>All Jasa TENZXI</b> — Pakej VIP Aktif!\n\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "👑 Kamu kini pelanggan VIP TENZXI!\n" +
      "📋 Semua servis dalam satu pakej\n" +
      "🎯 Support priority 24/7\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
      "🤝 Admin akan hubungi kamu tidak lama lagi!\n\n" +
      "✦ TENZXI STORE ✦ @unknownxry",
  },
};

// ── Welcome caption ───────────────────────────────────────────
const WELCOME_CAPTION =
  "╔═══════════════════════════╗\n" +
  "║  ✦  TENZXI STORE  ✦      ║\n" +
  "╚═══════════════════════════╝\n\n" +
  "🌟 Selamat datang ke <b>TENZXI STORE</b>!\n" +
  "Khidmat terbaik, harga paling berpatutan.\n\n" +
  "◈━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
  "⚡ <b>Servis Kami:</b>\n\n" +
  "  🤝 Benefits Partner\n" +
  "  🔓 Murban / Unban\n" +
  "  🐛 Murbug / SC+APK\n" +
  "  🖥️ Panel / VPS\n" +
  "  🏗️ Murbuild\n" +
  "  🌟 All Jasa Tenzxi\n\n" +
  "◈━━━━━━━━━━━━━━━━━━━━━━━◈\n\n" +
  "👇 <b>Pilih servis di bawah untuk order:</b>\n\n" +
  "⚙️ Owner: @unknownxry\n" +
  "🔐 OTP System: <b>ACTIVE</b>  |  Token: <b>ENABLED</b>\n\n" +
  "✦ ◆ TENZXI THE ONE'S ◆ ✦";

// ── Payment caption ────────────────────────────────────────────
const paymentCaption = (item) =>
  `╔══════════════════════════╗\n` +
  `║  ✦  PAYMENT  ✦          ║\n` +
  `╚══════════════════════════╝\n\n` +
  `💳 <b>Complete your payment below:</b>\n\n` +
  `◈━━━━━━━━━━━━━━━━━━━━━━◈\n` +
  `📦 Item   : <b>${ITEMS[item].label}</b>\n` +
  `💰 Amount : <b>RM ${ITEMS[item].price}.00</b>\n` +
  `◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n` +
  `🏦 <b>DuitNow Number:</b>\n` +
  `<code>${DUITNOW_NUM}</code>\n\n` +
  `📸 <i>After payment, please send your transfer receipt here.</i>\n` +
  `⚠️ <b>Bot will auto-verify your payment screenshot.</b>\n\n` +
  `✦ TENZXI STORE ✦`;

// ============================================================
//  BOT INIT
// ============================================================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// session: chatId → { step, item }
const sessions = {};

// ── /start ────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = {};

  await bot.sendPhoto(chatId, WELCOME_IMAGE, {
    caption: WELCOME_CAPTION,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: ITEMS.partner.label,   callback_data: "order_partner" }],
        [
          { text: ITEMS.murban.label,   callback_data: "order_murban" },
          { text: ITEMS.murbug.label,   callback_data: "order_murbug" },
        ],
        [
          { text: ITEMS.panel_vps.label, callback_data: "order_panel_vps" },
          { text: ITEMS.murbuild.label,  callback_data: "order_murbuild" },
        ],
        [{ text: ITEMS.all_jasa.label,  callback_data: "order_all_jasa" }],
      ],
    },
  });
});

// ── Callback query (button presses) ──────────────────────────
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data   = query.data;

  await bot.answerCallbackQuery(query.id);

  // ── Order button pressed → confirm prompt
  if (data.startsWith("order_")) {
    const itemKey = data.replace("order_", "");
    const item    = ITEMS[itemKey];
    if (!item) return;

    sessions[chatId] = { step: "confirm", item: itemKey };

    await bot.sendMessage(
      chatId,
      `╔══════════════════════════╗\n` +
      `║  ✦  PENGESAHAN ORDER  ✦ ║\n` +
      `╚══════════════════════════╝\n\n` +
      `🛒 <b>${item.label}</b>\n\n` +
      `◈━━━━━━━━━━━━━━━━━━━━━━◈\n` +
      `💰 Harga: <b>RM ${item.price}.00</b>\n` +
      `◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n` +
      `❓ <b>Adakah anda pasti ingin membeli dengan harga RM ${item.price}.00?</b>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "✅ Yes — Teruskan",  callback_data: `confirm_yes_${itemKey}` },
            { text: "❌ No — Batal",      callback_data: "confirm_no" },
          ]],
        },
      }
    );
    return;
  }

  // ── Confirmed YES → send QR
  if (data.startsWith("confirm_yes_")) {
    const itemKey = data.replace("confirm_yes_", "");
    sessions[chatId] = { step: "awaiting_proof", item: itemKey };

    await bot.sendPhoto(chatId, QR_IMAGE, {
      caption: paymentCaption(itemKey),
      parse_mode: "HTML",
    });
    return;
  }

  // ── Confirmed NO → cancel
  if (data === "confirm_no") {
    sessions[chatId] = {};
    await bot.sendMessage(
      chatId,
      "❌ <b>Order dibatalkan.</b>\n\nTaip /start untuk order semula.",
      { parse_mode: "HTML" }
    );
    return;
  }
});

// ── Incoming photo (payment proof) ───────────────────────────
bot.on("photo", async (msg) => {
  const chatId  = msg.chat.id;
  const session = sessions[chatId];

  if (!session || session.step !== "awaiting_proof") return;

  const itemKey = session.item;
  const item    = ITEMS[itemKey];
  const user    = msg.from;

  // Acknowledge immediately
  const ackMsg = await bot.sendMessage(
    chatId,
    "⏳ <b>Verifying your payment receipt...</b>\n\n🔍 Sedang semak bukti pembayaran kamu...",
    { parse_mode: "HTML" }
  );

  try {
    // Get highest res photo
    const photoArr  = msg.photo;
    const photo     = photoArr[photoArr.length - 1];
    const fileInfo  = await bot.getFile(photo.file_id);
    const fileUrl   = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    // Download image as base64
    const imgResp  = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const base64   = Buffer.from(imgResp.data).toString("base64");
    const mimeType = "image/jpeg";

    // ── Ask Gemini to verify ──────────────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const geminiBody = {
      contents: [{
        parts: [
          {
            text:
              `You are a strict payment verifier. Analyse this image carefully.\n` +
              `Check if this is a valid DuitNow or bank transfer receipt.\n` +
              `The expected amount is RM ${item.price}.00.\n` +
              `The DuitNow number is ${DUITNOW_NUM}.\n\n` +
              `Rules:\n` +
              `1. It MUST be a real payment screenshot (not edited, not a blank screen).\n` +
              `2. The amount transferred must be EXACTLY RM ${item.price}.00 or more.\n` +
              `3. The recipient number or name must match ${DUITNOW_NUM} or be consistent.\n` +
              `4. The status must show SUCCESS / BERJAYA / APPROVED.\n\n` +
              `Reply ONLY with a JSON object like this (no markdown, no extra text):\n` +
              `{"valid": true, "amount": "XX.XX", "reason": "short reason"}\n` +
              `or\n` +
              `{"valid": false, "amount": null, "reason": "short reason why invalid"}`,
          },
          {
            inline_data: { mime_type: mimeType, data: base64 },
          },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
    };

    const geminiResp = await axios.post(geminiUrl, geminiBody, {
      headers: { "Content-Type": "application/json" },
    });

    const rawText = geminiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;

    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { valid: false, reason: "Cannot parse AI response" };
    }

    // ── VALID PAYMENT ─────────────────────────────────────────
    if (parsed.valid === true) {
      sessions[chatId] = {}; // clear session

      // Edit ack message
      await bot.editMessageText(
        "✅ <b>Pembayaran Disahkan!</b>\n\n🎉 Terima kasih! Item kamu sedang diproses...",
        { chat_id: chatId, message_id: ackMsg.message_id, parse_mode: "HTML" }
      );

      // Deliver item
      await deliverItem(chatId, itemKey, item);

      // Notify admin
      const adminCaption =
        `╔══════════════════════════╗\n` +
        `║  💰  BAYARAN BERJAYA  💰 ║\n` +
        `╚══════════════════════════╝\n\n` +
        `✅ <b>Pembayaran disahkan oleh AI!</b>\n\n` +
        `◈━━━━━━━━━━━━━━━━━━━━━━◈\n` +
        `📦 Item       : <b>${item.label}</b>\n` +
        `💰 Jumlah     : <b>RM ${parsed.amount || item.price}.00</b>\n` +
        `◈━━━━━━━━━━━━━━━━━━━━━━◈\n` +
        `👤 Customer   : <b>${user.first_name || ""} ${user.last_name || ""}`.trim() + `</b>\n` +
        `🔖 Username   : <b>@${user.username || "tiada"}</b>\n` +
        `🆔 User ID    : <b>${user.id}</b>\n` +
        `◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n` +
        `📸 Bukti transfer dilampirkan di atas ⬆️`;

      await bot.sendPhoto(ADMIN_ID, photo.file_id, {
        caption: adminCaption,
        parse_mode: "HTML",
      });

    // ── INVALID PAYMENT ───────────────────────────────────────
    } else {
      await bot.editMessageText(
        `❌ <b>Pengesahan Gagal</b>\n\n` +
        `◈━━━━━━━━━━━━━━━━━━━━━━◈\n` +
        `⚠️ Sebab: <i>${parsed.reason || "Tidak dapat mengesahkan pembayaran"}</i>\n` +
        `◈━━━━━━━━━━━━━━━━━━━━━━◈\n\n` +
        `📸 Sila hantar semula bukti transfer yang <b>jelas dan sah</b>.\n` +
        `💡 Pastikan amaun <b>RM ${item.price}.00</b> kelihatan dalam screenshot.`,
        { chat_id: chatId, message_id: ackMsg.message_id, parse_mode: "HTML" }
      );
    }

  } catch (err) {
    console.error("Verification error:", err?.response?.data || err.message);
    await bot.editMessageText(
      "⚠️ <b>Ralat semasa verifikasi.</b>\n\nSila hantar semula bukti transfer kamu atau hubungi @unknownxry.",
      { chat_id: chatId, message_id: ackMsg.message_id, parse_mode: "HTML" }
    );
  }
});

// ── Deliver item to customer ──────────────────────────────────
async function deliverItem(chatId, itemKey, item) {
  const caption = item.deliveryCaption.replace("{CONTENT}", item.content);

  if (item.delivery === "link") {
    await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });
  } else {
    await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });
  }
}

// ── Error handler ─────────────────────────────────────────────
bot.on("polling_error", (err) => console.error("Polling error:", err.message));

console.log("✅ TENZXI STORE Bot is running...");
