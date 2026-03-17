import TelegramBot from 'node-telegram-bot-api';

// ════════════════════════════════════════════
//   ✦  REPP76 STORE — AUTO ORDER BOT  ✦
//   Dev : @Repp76  |  t.me/Repp76
// ════════════════════════════════════════════

const BOT_TOKEN   = '8293625592:AAFocvaW9d5PgVYQ0LO34nYt-12yK7Hejsg';
const OWNER_ID    = 7624612389;
const STORE_IMAGE = 'https://files.catbox.moe/f68qg9.jpg';
const QR_IMAGE    = 'https://files.catbox.moe/enl8lt.jpg';
const DUITNOW_NO  = '181837537347';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ── sesi aktif per pengguna ──────────────────
const sessions = {};

// ════════════════════════════════════════════
//   HARGA
// ════════════════════════════════════════════
const PRICES = {
  partner       : { label: '🤝 Partner',                      price: 37  },
  unban_spam    : { label: '🔓 Unban Nombor — Ban Spam',       price: 3   },
  unban_perm    : { label: '🔐 Unban Nombor — Unban Permanent',price: 10  },
  tools         : { label: '⚙️ Tools Hacking',                  price: 10  },
  reseller_panel: { label: '🖥️ Reseller Panel',                price: 15  },
  reseller_sc   : { label: '💎 Reseller SC Xyura Infinity',    price: 15  },
  website       : { label: '🌐 Jasa Pembuatan Website',        price: 20  },
  panel_1gb     : { label: '📦 Panel 1GB',                     price: 1   },
  panel_2gb     : { label: '📦 Panel 2GB',                     price: 2   },
  panel_3gb     : { label: '📦 Panel 3GB',                     price: 3   },
  panel_4gb     : { label: '📦 Panel 4GB',                     price: 4   },
  panel_5gb     : { label: '📦 Panel 5GB',                     price: 5   },
  panel_6gb     : { label: '📦 Panel 6GB',                     price: 6   },
  panel_7gb     : { label: '📦 Panel 7GB',                     price: 7   },
  panel_8gb     : { label: '📦 Panel 8GB',                     price: 8   },
  panel_9gb     : { label: '📦 Panel 9GB',                     price: 9   },
  panel_10gb    : { label: '📦 Panel 10GB',                    price: 10  },
  panel_unli    : { label: '♾️ Panel Unlimited',               price: 11  },
};

// ════════════════════════════════════════════
//   CAPTION — WELCOME
// ════════════════════════════════════════════
function captionWelcome() {
  return (
    `✦ ─────────────────────── ✦\n` +
    `         𝐑𝐄𝐏𝐏𝟕𝟔  𝐒𝐓𝐎𝐑𝐄\n` +
    `✦ ─────────────────────── ✦\n\n` +
    `🌟 Selamat datang! Khidmat terbaik,\n` +
    `   harga paling berpatutan.\n\n` +
    `◈ ──── 𝐒𝐄𝐑𝐕𝐈𝐒 𝐊𝐀𝐌𝐈 ──── ◈\n\n` +
    `🤝  Partner                  — RM37\n` +
    `🔓  Unban Nombor Spam        — RM3\n` +
    `🔐  Unban Nombor Permanent   — RM10\n` +
    `⚙️   Tools Hacking             — RM10\n` +
    `🖥️   Reseller Panel           — RM15\n` +
    `💎  Reseller SC Xyura Infinity— RM15\n` +
    `🌐  Jasa Pembuatan Website    — RM20\n` +
    `📦  Panel PTE  (1GB–Unli)    — RM1–RM11\n\n` +
    `◈ ─────────────────────── ◈\n\n` +
    `👇 Pilih servis di bawah untuk order:\n\n` +
    `⚙️  Owner  : @Repp76\n` +
    `📲  WA     : wa.me/60112093960\n` +
    `✈️   TG     : t.me/Repp76`
  );
}

// ════════════════════════════════════════════
//   KEYBOARD — MAIN MENU
// ════════════════════════════════════════════
function keyboardMain() {
  return {
    inline_keyboard: [
      [{ text: '🤝 Partner', callback_data: 'order:partner' }],
      [
        { text: '🔓 Unban Spam',      callback_data: 'order:unban_spam' },
        { text: '🔐 Unban Permanent', callback_data: 'order:unban_perm' },
      ],
      [
        { text: '⚙️ Tools Hacking',         callback_data: 'order:tools' },
        { text: '🖥️ Reseller Panel',        callback_data: 'show_panel' },
      ],
      [
        { text: '💎 Reseller SC Xyura',    callback_data: 'order:reseller_sc' },
        { text: '🌐 Jasa Website',         callback_data: 'order:website' },
      ],
    ],
  };
}

// ════════════════════════════════════════════
//   CAPTION — PANEL PTE
// ════════════════════════════════════════════
function captionPanel() {
  return (
    `✦ ─────────────────────── ✦\n` +
    `       𝐑𝐄𝐏𝐏𝟕𝟔  𝐏𝐀𝐍𝐄𝐋  𝐏𝐓𝐄\n` +
    `✦ ─────────────────────── ✦\n\n` +
    `📦 Panel peribadi berkuasa penuh.\n` +
    `   Stabil, laju & fully managed.\n\n` +
    `◈ ──── 𝐒𝐄𝐍𝐀𝐑𝐀𝐈 𝐏𝐀𝐊𝐄𝐉 ──── ◈\n\n` +
    `📦  1GB   → RM1       📦  2GB  → RM2\n` +
    `📦  3GB   → RM3       📦  4GB  → RM4\n` +
    `📦  5GB   → RM5       📦  6GB  → RM6\n` +
    `📦  7GB   → RM7       📦  8GB  → RM8\n` +
    `📦  9GB   → RM9       📦  10GB → RM10\n` +
    `♾️   Unlimited         → RM11\n\n` +
    `◈ ─────────────────────── ◈\n\n` +
    `👇 Pilih saiz panel yang dikehendaki:\n\n` +
    `⚙️  Owner  : @Repp76\n` +
    `✈️   TG     : t.me/Repp76`
  );
}

// ════════════════════════════════════════════
//   KEYBOARD — PANEL
// ════════════════════════════════════════════
function keyboardPanel() {
  return {
    inline_keyboard: [
      [
        { text: '📦 1GB — RM1',   callback_data: 'order:panel_1gb' },
        { text: '📦 2GB — RM2',   callback_data: 'order:panel_2gb' },
        { text: '📦 3GB — RM3',   callback_data: 'order:panel_3gb' },
      ],
      [
        { text: '📦 4GB — RM4',   callback_data: 'order:panel_4gb' },
        { text: '📦 5GB — RM5',   callback_data: 'order:panel_5gb' },
        { text: '📦 6GB — RM6',   callback_data: 'order:panel_6gb' },
      ],
      [
        { text: '📦 7GB — RM7',   callback_data: 'order:panel_7gb' },
        { text: '📦 8GB — RM8',   callback_data: 'order:panel_8gb' },
        { text: '📦 9GB — RM9',   callback_data: 'order:panel_9gb' },
      ],
      [
        { text: '📦 10GB — RM10', callback_data: 'order:panel_10gb' },
        { text: '♾️ Unlimited — RM11', callback_data: 'order:panel_unli' },
      ],
      [{ text: '‹ Kembali ke Menu', callback_data: 'back_main' }],
    ],
  };
}

// ════════════════════════════════════════════
//   CAPTION — ORDER CONFIRM
// ════════════════════════════════════════════
function captionOrderConfirm(item) {
  return (
    `✦ ─────────────────────── ✦\n` +
    `        𝐑𝐈𝐍𝐆𝐊𝐀𝐒𝐀𝐍  𝐎𝐑𝐃𝐄𝐑\n` +
    `✦ ─────────────────────── ✦\n\n` +
    `🛒  Item    :  ${item.label}\n` +
    `💰  Harga   :  RM${item.price}\n\n` +
    `◈ ─────────────────────── ◈\n\n` +
    `✅  Teruskan pembayaran?\n\n` +
    `👇 Pilih tindakan di bawah:`
  );
}

// ════════════════════════════════════════════
//   CAPTION — PAYMENT INFO
// ════════════════════════════════════════════
function captionPayment(item) {
  return (
    `✦ ─────────────────────── ✦\n` +
    `         𝐌𝐀𝐊𝐋𝐔𝐌𝐀𝐓  𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍\n` +
    `✦ ─────────────────────── ✦\n\n` +
    `🛒  Item    :  ${item.label}\n` +
    `💰  Jumlah  :  RM${item.price}\n\n` +
    `◈ ──── 𝐃𝐔𝐈𝐓𝐍𝐎𝐖 ──── ◈\n\n` +
    `📲  Nombor DuitNow  :  ${DUITNOW_NO}\n` +
    `    (Nama Akaun     :  Repp76 Store)\n\n` +
    `◈ ─────────────────────── ◈\n\n` +
    `⚠️  PERHATIAN :\n` +
    `   • Transfer tepat RM${item.price} sahaja.\n` +
    `   • Jangan letak sebarang catatan / nota.\n` +
    `   • Imbas QR atau transfer ke nombor di atas.\n\n` +
    `📸  Setelah bayar, hantar tangkapan skrin\n` +
    `    bukti pembayaran anda di sini.\n\n` +
    `⚙️  Sebarang pertanyaan : @Repp76`
  );
}

// ════════════════════════════════════════════
//   CAPTION — NOTIFY OWNER (order baru)
// ════════════════════════════════════════════
function captionOwnerOrder({ item, user, proof }) {
  const name    = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  const uname   = user.username ? '@' + user.username : '(tiada username)';
  const proofTx = proof ? '✅ Diterima' : '⏳ Belum diterima';
  return (
    `╔══════════════════════════╗\n` +
    `║   🔔  ORDER BAHARU  🔔   ║\n` +
    `╚══════════════════════════╝\n\n` +
    `🛒  Item     :  ${item.label}\n` +
    `💰  Harga    :  RM${item.price}\n\n` +
    `👤  Pembeli  :  ${name}\n` +
    `🆔  ID TG    :  ${user.id}\n` +
    `✈️   Username :  ${uname}\n\n` +
    `📸  Bukti Bayar : ${proofTx}\n\n` +
    `◈ ─────────────────────── ◈\n` +
    `   𝐑𝐄𝐏𝐏𝟕𝟔  𝐒𝐓𝐎𝐑𝐄  |  t.me/Repp76`
  );
}

// ════════════════════════════════════════════
//   CAPTION — NOTIFY OWNER (nombor unban)
// ════════════════════════════════════════════
function captionOwnerUnban({ item, user, phone }) {
  const name  = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  const uname = user.username ? '@' + user.username : '(tiada username)';
  return (
    `╔══════════════════════════╗\n` +
    `║  🔓  REQUEST UNBAN  🔓   ║\n` +
    `╚══════════════════════════╝\n\n` +
    `🛒  Item        :  ${item.label}\n` +
    `💰  Harga       :  RM${item.price}\n\n` +
    `👤  Pembeli     :  ${name}\n` +
    `🆔  ID TG       :  ${user.id}\n` +
    `✈️   Username    :  ${uname}\n\n` +
    `📱  Nombor Unban:  ${phone}\n\n` +
    `◈ ─────────────────────── ◈\n` +
    `   𝐑𝐄𝐏𝐏𝟕𝟔  𝐒𝐓𝐎𝐑𝐄  |  t.me/Repp76`
  );
}

// ════════════════════════════════════════════
//   HELPER — safe delete mesej
// ════════════════════════════════════════════
async function safeDelete(chatId, msgId) {
  try { await bot.deleteMessage(chatId, msgId); } catch (_) {}
}

// ════════════════════════════════════════════
//   HELPER — normalize nombor telefon
// ════════════════════════════════════════════
function normalizePhone(raw) {
  let n = raw.replace(/[\s\-().+]/g, '');
  if (n.startsWith('0')) n = '60' + n.slice(1);
  return n;
}

function isValidPhone(n) {
  return /^[0-9]{9,15}$/.test(n);
}

// ════════════════════════════════════════════
//   COMMAND /start
// ════════════════════════════════════════════
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = {};

  await bot.sendPhoto(chatId, STORE_IMAGE, {
    caption : captionWelcome(),
    parse_mode   : 'HTML',
    reply_markup : keyboardMain(),
  });
});

// ════════════════════════════════════════════
//   CALLBACK QUERIES
// ════════════════════════════════════════════
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const msgId  = query.message.message_id;
  const data   = query.data;
  const user   = query.from;

  await bot.answerCallbackQuery(query.id);

  // ── Papar panel PTE ─────────────────────
  if (data === 'show_panel') {
    await safeDelete(chatId, msgId);
    await bot.sendPhoto(chatId, STORE_IMAGE, {
      caption      : captionPanel(),
      reply_markup : keyboardPanel(),
    });
    return;
  }

  // ── Kembali ke menu utama ────────────────
  if (data === 'back_main') {
    await safeDelete(chatId, msgId);
    sessions[chatId] = {};
    await bot.sendPhoto(chatId, STORE_IMAGE, {
      caption      : captionWelcome(),
      reply_markup : keyboardMain(),
    });
    return;
  }

  // ── Pilih item order ─────────────────────
  if (data.startsWith('order:')) {
    const key  = data.replace('order:', '');
    const item = PRICES[key];
    if (!item) return;

    sessions[chatId] = { step: 'confirm', itemKey: key, item };

    // buang mesej lama (terutama untuk panel)
    await safeDelete(chatId, msgId);

    await bot.sendMessage(chatId, captionOrderConfirm(item), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Ya, Teruskan', callback_data: 'pay:yes' },
            { text: '❌ Batal',        callback_data: 'pay:no'  },
          ],
        ],
      },
    });
    return;
  }

  // ── Confirm bayar: ya / tidak ────────────
  if (data === 'pay:no') {
    sessions[chatId] = {};
    await safeDelete(chatId, msgId);
    await bot.sendMessage(chatId,
      `❌ Order dibatalkan.\n\n` +
      `Taip /start untuk kembali ke menu utama.`
    );
    return;
  }

  if (data === 'pay:yes') {
    const sess = sessions[chatId] || {};
    if (!sess.item) return;
    sess.step = 'awaiting_payment';

    await safeDelete(chatId, msgId);

    // Hantar QR code + maklumat bayar
    await bot.sendPhoto(chatId, QR_IMAGE, {
      caption: captionPayment(sess.item),
    });

    await bot.sendMessage(chatId,
      `📸  Sila hantar gambar bukti pembayaran\n` +
      `    setelah selesai membayar.\n\n` +
      `⚙️  Sebarang masalah : @Repp76`
    );
    return;
  }
});

// ════════════════════════════════════════════
//   TERIMA GAMBAR — bukti bayar
// ════════════════════════════════════════════
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user   = msg.from;
  const sess   = sessions[chatId];

  if (!sess || sess.step !== 'awaiting_payment') return;

  // Ambil foto saiz terbesar
  const photos  = msg.photo;
  const fileId  = photos[photos.length - 1].file_id;
  const item    = sess.item;

  // ── Semak ringkas: terima sahaja sebagai bukti ──
  sess.step    = 'payment_received';
  sess.proofId = fileId;

  // ── Unban: minta nombor telefon ─────────
  if (sess.itemKey === 'unban_spam' || sess.itemKey === 'unban_perm') {
    sess.step = 'awaiting_phone';
    await bot.sendMessage(chatId,
      `✅  Bukti bayar diterima!\n\n` +
      `📱  Sila masukkan nombor telefon yang ingin\n` +
      `    di-unban dalam format:\n\n` +
      `    ◉  60xxxxxxxxx  (Malaysia)\n` +
      `    ◉  62xxxxxxxxx  (Indonesia)\n` +
      `    ◉  63xxxxxxxxx  (Filipina)\n\n` +
      `⚠️  Jangan letak  +  atau jarak.`
    );
    return;
  }

  // ── Hantar notify ke owner ───────────────
  await notifyOwner({ chatId, user, item, fileId });
});

// ════════════════════════════════════════════
//   TERIMA TEKS — nombor telefon (unban)
// ════════════════════════════════════════════
bot.on('text', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const user   = msg.from;
  const sess   = sessions[chatId];

  if (!sess || sess.step !== 'awaiting_phone') return;

  const raw   = msg.text.trim();
  const phone = normalizePhone(raw);

  if (!isValidPhone(phone)) {
    await bot.sendMessage(chatId,
      `⚠️  Format nombor tidak sah.\n\n` +
      `Sila masukkan nombor yang betul.\n` +
      `Contoh: 60123456789`
    );
    return;
  }

  sess.step  = 'done';
  sess.phone = phone;

  // ── Notif ke owner dengan nombor ────────
  try {
    await bot.sendPhoto(OWNER_ID, sess.proofId, {
      caption: captionOwnerUnban({ item: sess.item, user, phone }),
    });
  } catch (e) {
    console.error('Gagal notify owner (unban):', e.message);
  }

  await bot.sendMessage(chatId,
    `✅  Terima kasih! Order anda telah disahkan.\n\n` +
    `📱  Nombor  :  ${phone}\n` +
    `🛒  Item    :  ${sess.item.label}\n\n` +
    `⏳  Admin akan proses dalam masa terdekat.\n` +
    `✈️   Hubungi : @Repp76 untuk sebarang pertanyaan.\n\n` +
    `◈ ─────────────────────── ◈\n` +
    `   Terima kasih kerana memilih Repp76 Store! 🌟`
  );

  sessions[chatId] = {};
});

// ════════════════════════════════════════════
//   FUNGSI — notify owner (order biasa)
// ════════════════════════════════════════════
async function notifyOwner({ chatId, user, item, fileId }) {
  try {
    await bot.sendPhoto(OWNER_ID, fileId, {
      caption: captionOwnerOrder({ item, user, proof: true }),
    });
  } catch (e) {
    console.error('Gagal notify owner:', e.message);
  }

  await bot.sendMessage(chatId,
    `✅  Terima kasih! Order anda telah disahkan.\n\n` +
    `🛒  Item    :  ${item.label}\n` +
    `💰  Harga   :  RM${item.price}\n\n` +
    `⏳  Admin akan proses dalam masa terdekat.\n` +
    `✈️   Hubungi : @Repp76 untuk sebarang pertanyaan.\n\n` +
    `◈ ─────────────────────── ◈\n` +
    `   Terima kasih kerana memilih Repp76 Store! 🌟`
  );

  sessions[chatId] = {};
}

// ════════════════════════════════════════════
//   POLLING ERROR HANDLER
// ════════════════════════════════════════════
bot.on('polling_error', (err) => {
  console.error('[Polling Error]', err.message);
});

// ════════════════════════════════════════════
console.log('✦ Repp76 Store Bot — ONLINE ✦');
console.log('  Owner : @Repp76  |  t.me/Repp76');
console.log('─────────────────────────────────');
