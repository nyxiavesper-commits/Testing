import TelegramBot from 'node-telegram-bot-api';
import fs           from 'fs';
import path         from 'path';
import https        from 'https';
import http         from 'http';
import archiver     from 'archiver';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

// ════════════════════════════════════════════
//   ✦  REPP76 SC BUILDER  ✦
//   Dev : @Repp76  |  t.me/Repp76
// ════════════════════════════════════════════

const BOT_TOKEN      = '8293625592:AAFocvaW9d5PgVYQ0LO34nYt-12yK7Hejsg';
const OWNER_ID       = 7624612389;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY || '';
const BANNER_IMAGE   = 'https://files.catbox.moe/30fs2f.png';
const ACCESS_FILE    = path.join(process.cwd(), 'access.json');
const TMP_DIR        = path.join(process.cwd(), 'tmp');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ── Pastikan folder tmp ada ──────────────────
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ════════════════════════════════════════════
//   ACCESS MANAGEMENT
// ════════════════════════════════════════════
function loadAccess() {
  try {
    if (fs.existsSync(ACCESS_FILE)) return JSON.parse(fs.readFileSync(ACCESS_FILE, 'utf8'));
  } catch (_) {}
  return [];
}

function saveAccess(list) {
  fs.writeFileSync(ACCESS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function hasAccess(userId) {
  if (userId === OWNER_ID) return true;
  return loadAccess().includes(userId);
}

// ════════════════════════════════════════════
//   SESI
// ════════════════════════════════════════════
const sessions = {};

// ════════════════════════════════════════════
//   CAPTION — WELCOME
// ════════════════════════════════════════════
function captionWelcome() {
  return (
    `✦ ════════════════════ ✦\n` +
    `      R E P P 7 6\n` +
    `    S C  B U I L D E R\n` +
    `✦ ════════════════════ ✦\n\n` +
    `◈ ── A U T O   C R E A T E ── ◈\n\n` +
    `  Hantar potongan function JS\n` +
    `  bot terus bina script penuh\n` +
    `  siap dalam format  .zip\n\n` +
    `◈ ──────────────────────── ◈\n\n` +
    `  Developer  :  @Repp76`
  );
}

// ════════════════════════════════════════════
//   CAPTION — CREATE GUIDE
// ════════════════════════════════════════════
function captionCreateGuide() {
  return (
    `✦ ════════════════════ ✦\n` +
    `   C A R A  C I P T A\n` +
    `✦ ════════════════════ ✦\n\n` +
    `◈ ── L A N G K A H ── ◈\n\n` +
    `  [ 1 ]  Taip  /create\n\n` +
    `  [ 2 ]  Hantar fail  .js\n` +
    `         yang mengandungi\n` +
    `         function bot anda\n\n` +
    `  [ 3 ]  Bagi tahu nama\n` +
    `         script anda\n\n` +
    `  [ 4 ]  Terima fail\n` +
    `         nama-script.zip\n` +
    `         terus dalam chat\n\n` +
    `◈ ──────────────────────── ◈\n\n` +
    `  Developer  :  @Repp76`
  );
}

// ════════════════════════════════════════════
//   KEYBOARD — MAIN
// ════════════════════════════════════════════
function keyboardMain() {
  return {
    inline_keyboard: [
      [
        { text: '[ Create SC ]', callback_data: 'show_create' },
        { text: '[ Developer ]', url: 'https://t.me/Repp76' },
      ],
    ],
  };
}

// ════════════════════════════════════════════
//   HELPER — safe delete
// ════════════════════════════════════════════
async function safeDelete(chatId, msgId) {
  try { await bot.deleteMessage(chatId, msgId); } catch (_) {}
}

// ════════════════════════════════════════════
//   HELPER — download file dari Telegram
// ════════════════════════════════════════════
async function downloadFile(fileId, destPath) {
  const fileInfo = await bot.getFile(fileId);
  const fileUrl  = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

  await new Promise((resolve, reject) => {
    const file   = createWriteStream(destPath);
    const client = fileUrl.startsWith('https') ? https : http;
    client.get(fileUrl, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

// ════════════════════════════════════════════
//   HELPER — call Anthropic API
// ════════════════════════════════════════════
async function callClaude(systemPrompt, userContent) {
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY tidak ditetapkan.');

  const body = JSON.stringify({
    model      : 'claude-sonnet-4-20250514',
    max_tokens : 8000,
    system     : systemPrompt,
    messages   : [{ role: 'user', content: userContent }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname : 'api.anthropic.com',
      path     : '/v1/messages',
      method   : 'POST',
      headers  : {
        'Content-Type'      : 'application/json',
        'x-api-key'         : ANTHROPIC_KEY,
        'anthropic-version' : '2023-06-01',
        'Content-Length'    : Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.content[0].text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ════════════════════════════════════════════
//   HELPER — bina zip dari content
// ════════════════════════════════════════════
async function buildZip(scriptName, indexContent, pkgContent, outputPath) {
  return new Promise((resolve, reject) => {
    const output  = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);

    archive.append(indexContent, { name: `${scriptName}/index.js` });
    archive.append(pkgContent,   { name: `${scriptName}/package.json` });
    archive.finalize();
  });
}

// ════════════════════════════════════════════
//   GENERATE SCRIPT — guna Claude API
// ════════════════════════════════════════════
async function generateBotScript(functionCode, scriptName) {

  const systemPrompt = `Kau adalah seorang developer Node.js expert yang pakar dalam membina Telegram bot.
Tugasmu adalah menganalisis potongan function JavaScript yang diberikan dan membina sebuah Telegram bot yang lengkap berdasarkan logic tersebut.

PERATURAN WAJIB:
1. Hasilkan HANYA dua bahagian: INDEX_JS dan PACKAGE_JSON
2. Format output MESTI tepat seperti ini (jangan ada teks lain):
===INDEX_JS===
[kandungan index.js di sini]
===PACKAGE_JSON===
[kandungan package.json di sini]
===END===

3. index.js MESTI:
   - Guna ES modules (import/export)
   - Compatible Node.js 20+
   - Ada placeholder khas: // BOT_TOKEN: letak token bot anda di sini
   - Ada placeholder khas: // OWNER_ID: letak ID Telegram owner di sini
   - Declare: const BOT_TOKEN = 'LETAK_TOKEN_BOT_ANDA_DI_SINI';
   - Declare: const OWNER_ID = 0; // TUKAR KEPADA ID TELEGRAM ANDA
   - Guna node-telegram-bot-api
   - Fully functional, siap guna
   - Berfungsi 100% tanpa error
   - Ada error handling yang proper
   - Comment dalam Bahasa Melayu

4. package.json MESTI:
   - "type": "module"
   - "main": "index.js"
   - Node engines >= 20
   - Include semua dependency yang diperlukan

5. JANGAN letak sebarang API key, token atau ID sebenar dalam code
6. Script mesti boleh run di VPS panel PTE dengan node index.js`;

  const userContent = `Ini adalah potongan function JavaScript dari bot Telegram:

\`\`\`javascript
${functionCode}
\`\`\`

Nama script: ${scriptName}

Analisis logic dalam function ini dan bina Telegram bot yang lengkap berdasarkan fungsi tersebut. Bot mesti fully functional dan siap deploy.`;

  const result = await callClaude(systemPrompt, userContent);

  // Parse output
  const indexMatch = result.match(/===INDEX_JS===\n([\s\S]*?)===PACKAGE_JSON===/);
  const pkgMatch   = result.match(/===PACKAGE_JSON===\n([\s\S]*?)===END===/);

  if (!indexMatch || !pkgMatch) {
    throw new Error('Format output Claude tidak dapat diproses.');
  }

  return {
    indexJs     : indexMatch[1].trim(),
    packageJson : pkgMatch[1].trim(),
  };
}

// ════════════════════════════════════════════
//   COMMAND /start
// ════════════════════════════════════════════
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  sessions[chatId] = {};

  if (!hasAccess(userId)) {
    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `      A K S E S\n` +
      `     D I T O L A K\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Anda tidak mempunyai akses.\n` +
      `  Hubungi developer untuk\n` +
      `  mendapatkan akses.\n\n` +
      `  Developer  :  @Repp76`
    );
    return;
  }

  await bot.sendPhoto(chatId, BANNER_IMAGE, {
    caption      : captionWelcome(),
    reply_markup : keyboardMain(),
  });
});

// ════════════════════════════════════════════
//   COMMAND /giveaccess — owner sahaja
// ════════════════════════════════════════════
bot.onText(/\/giveaccess(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== OWNER_ID) {
    await bot.sendMessage(chatId,
      `✦  Akses ditolak.\n` +
      `   Command ini hanya untuk owner sahaja.`
    );
    return;
  }

  const targetId = match[1] ? parseInt(match[1]) : null;

  if (!targetId) {
    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `   G I V E  A C C E S S\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Format  :  /giveaccess {ID Telegram}\n\n` +
      `  Contoh  :  /giveaccess 123456789`
    );
    return;
  }

  const list = loadAccess();

  if (list.includes(targetId)) {
    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `      S U D A H  A D A\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  ID  ${targetId}  sudah mempunyai akses.`
    );
    return;
  }

  list.push(targetId);
  saveAccess(list);

  await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `   A K S E S  D I B E R I\n` +
    `✦ ════════════════════ ✦\n\n` +
    `  ID       :  ${targetId}\n` +
    `  Status   :  Akses diberikan\n` +
    `  Total    :  ${list.length} pengguna\n\n` +
    `  Pengguna boleh guna bot sekarang.`
  );

  // Notif pada pengguna yang dapat akses
  try {
    await bot.sendMessage(targetId,
      `✦ ════════════════════ ✦\n` +
      `   A K S E S  D I B E R I\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Anda telah diberi akses\n` +
      `  kepada Repp76 SC Builder.\n\n` +
      `  Taip  /start  untuk mulakan.\n\n` +
      `  Developer  :  @Repp76`
    );
  } catch (_) {}
});

// ════════════════════════════════════════════
//   COMMAND /revokeaccess — owner sahaja
// ════════════════════════════════════════════
bot.onText(/\/revokeaccess(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== OWNER_ID) return;

  const targetId = match[1] ? parseInt(match[1]) : null;

  if (!targetId) {
    await bot.sendMessage(chatId,
      `  Format  :  /revokeaccess {ID Telegram}`
    );
    return;
  }

  const list    = loadAccess();
  const newList = list.filter(id => id !== targetId);

  if (list.length === newList.length) {
    await bot.sendMessage(chatId, `  ID ${targetId} tidak mempunyai akses.`);
    return;
  }

  saveAccess(newList);
  await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `  A K S E S  D I T A R I K\n` +
    `✦ ════════════════════ ✦\n\n` +
    `  ID  ${targetId}  akses telah ditarik.`
  );
});

// ════════════════════════════════════════════
//   COMMAND /listaccess — owner sahaja
// ════════════════════════════════════════════
bot.onText(/\/listaccess/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.from.id !== OWNER_ID) return;

  const list = loadAccess();
  if (list.length === 0) {
    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `   S E N A R A I  A K S E S\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Tiada pengguna dengan akses.`
    );
    return;
  }

  const lines = list.map((id, i) => `  [ ${i + 1} ]  ${id}`).join('\n');
  await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `   S E N A R A I  A K S E S\n` +
    `✦ ════════════════════ ✦\n\n` +
    `${lines}\n\n` +
    `  Total  :  ${list.length} pengguna`
  );
});

// ════════════════════════════════════════════
//   COMMAND /create
// ════════════════════════════════════════════
bot.onText(/\/create/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!hasAccess(userId)) {
    await bot.sendMessage(chatId, `  Akses ditolak. Hubungi @Repp76`);
    return;
  }

  sessions[chatId] = { step: 'awaiting_js_file' };

  await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `   C R E A T E  S C R I P T\n` +
    `✦ ════════════════════ ✦\n\n` +
    `  Langkah  [ 1 / 2 ]\n\n` +
    `  Hantar fail  .js  yang\n` +
    `  mengandungi function\n` +
    `  bot anda sekarang.\n\n` +
    `◈ ──────────────────────── ◈\n\n` +
    `  Taip  /cancel  untuk batal.`
  );
});

// ════════════════════════════════════════════
//   COMMAND /cancel
// ════════════════════════════════════════════
bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = {};
  await bot.sendMessage(chatId,
    `  Proses dibatalkan.\n\n` +
    `  Taip  /start  untuk kembali ke menu.`
  );
});

// ════════════════════════════════════════════
//   CALLBACK QUERIES
// ════════════════════════════════════════════
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const msgId  = query.message.message_id;
  const data   = query.data;
  const userId = query.from.id;

  await bot.answerCallbackQuery(query.id);

  if (data === 'show_create') {
    if (!hasAccess(userId)) return;

    await safeDelete(chatId, msgId);

    await bot.sendMessage(chatId, captionCreateGuide(), {
      reply_markup: {
        inline_keyboard: [[
          { text: '[ Mula Sekarang ]', callback_data: 'start_create' },
          { text: '[ Kembali ]',       callback_data: 'back_main'    },
        ]],
      },
    });
    return;
  }

  if (data === 'start_create') {
    if (!hasAccess(userId)) return;

    await safeDelete(chatId, msgId);
    sessions[chatId] = { step: 'awaiting_js_file' };

    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `   C R E A T E  S C R I P T\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Langkah  [ 1 / 2 ]\n\n` +
      `  Hantar fail  .js  yang\n` +
      `  mengandungi function\n` +
      `  bot anda sekarang.\n\n` +
      `◈ ──────────────────────── ◈\n\n` +
      `  Taip  /cancel  untuk batal.`
    );
    return;
  }

  if (data === 'back_main') {
    if (!hasAccess(userId)) return;

    await safeDelete(chatId, msgId);
    sessions[chatId] = {};

    await bot.sendPhoto(chatId, BANNER_IMAGE, {
      caption      : captionWelcome(),
      reply_markup : keyboardMain(),
    });
    return;
  }
});

// ════════════════════════════════════════════
//   TERIMA DOKUMEN — fail .js
// ════════════════════════════════════════════
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const sess   = sessions[chatId];

  if (!hasAccess(userId)) return;
  if (!sess || sess.step !== 'awaiting_js_file') return;

  const doc      = msg.document;
  const fileName = doc.file_name || '';

  if (!fileName.endsWith('.js')) {
    await bot.sendMessage(chatId,
      `✦  Fail tidak sah.\n\n` +
      `   Sila hantar fail  .js  sahaja.`
    );
    return;
  }

  // Download fail
  const tmpFile = path.join(TMP_DIR, `${chatId}_input.js`);
  try {
    await downloadFile(doc.file_id, tmpFile);
  } catch (e) {
    await bot.sendMessage(chatId, `  Gagal muat turun fail. Cuba lagi.`);
    return;
  }

  const functionCode = fs.readFileSync(tmpFile, 'utf8');
  sess.functionCode  = functionCode;
  sess.step          = 'awaiting_script_name';

  await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `   C R E A T E  S C R I P T\n` +
    `✦ ════════════════════ ✦\n\n` +
    `  Langkah  [ 2 / 2 ]\n\n` +
    `  Fail diterima  ✓\n\n` +
    `  Sila taip  nama script\n` +
    `  yang anda inginkan.\n\n` +
    `  Contoh  :  MyBot\n\n` +
    `◈ ──────────────────────── ◈\n\n` +
    `  Taip  /cancel  untuk batal.`
  );
});

// ════════════════════════════════════════════
//   TERIMA TEKS — nama script
// ════════════════════════════════════════════
bot.on('text', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const sess   = sessions[chatId];

  if (!hasAccess(userId)) return;
  if (!sess || sess.step !== 'awaiting_script_name') return;

  const rawName    = msg.text.trim();
  // Sanitize nama — buang char yang tak sesuai untuk folder/zip
  const scriptName = rawName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_') || 'MyBot';

  sessions[chatId] = {};

  const processingMsg = await bot.sendMessage(chatId,
    `✦ ════════════════════ ✦\n` +
    `    M E M B I N A . . .\n` +
    `✦ ════════════════════ ✦\n\n` +
    `  Script   :  ${scriptName}\n\n` +
    `  Sedang menganalisis function\n` +
    `  dan membina script penuh...\n\n` +
    `  Sila tunggu sebentar.`
  );

  try {
    // Generate script via Claude API
    const { indexJs, packageJson } = await generateBotScript(sess.functionCode, scriptName);

    // Bina zip
    const zipPath = path.join(TMP_DIR, `${scriptName}.zip`);
    await buildZip(scriptName, indexJs, packageJson, zipPath);

    // Padam mesej "memproses"
    await safeDelete(chatId, processingMsg.message_id);

    // Hantar zip
    await bot.sendDocument(chatId, zipPath, {
      caption:
        `✦ ════════════════════ ✦\n` +
        `   S C R I P T  S I A P\n` +
        `✦ ════════════════════ ✦\n\n` +
        `  Nama      :  ${scriptName}.zip\n` +
        `  Kandungan :\n` +
        `    - ${scriptName}/index.js\n` +
        `    - ${scriptName}/package.json\n\n` +
        `◈ ── C A R A  G U N A ── ◈\n\n` +
        `  [ 1 ]  Extract fail zip\n` +
        `  [ 2 ]  Buka index.js\n` +
        `  [ 3 ]  Isi BOT_TOKEN\n` +
        `         & OWNER_ID\n` +
        `  [ 4 ]  npm install\n` +
        `  [ 5 ]  node index.js\n\n` +
        `◈ ──────────────────────── ◈\n\n` +
        `  Developer  :  @Repp76`,
    });

    // Buang fail temp
    try { fs.unlinkSync(zipPath); } catch (_) {}
    try { fs.unlinkSync(path.join(TMP_DIR, `${chatId}_input.js`)); } catch (_) {}

  } catch (e) {
    await safeDelete(chatId, processingMsg.message_id);
    console.error('Generate error:', e.message);

    await bot.sendMessage(chatId,
      `✦ ════════════════════ ✦\n` +
      `      R A L A T\n` +
      `✦ ════════════════════ ✦\n\n` +
      `  Gagal membina script.\n\n` +
      `  ${e.message}\n\n` +
      `  Cuba lagi dengan  /create`
    );
  }
});

// ════════════════════════════════════════════
//   POLLING ERROR HANDLER
// ════════════════════════════════════════════
bot.on('polling_error', (err) => {
  console.error('[Polling Error]', err.message);
});

// ════════════════════════════════════════════
console.log('✦ Repp76 SC Builder — ONLINE ✦');
console.log('  Dev : @Repp76  |  t.me/Repp76');
console.log('─────────────────────────────────');
console.log('  ANTHROPIC_API_KEY:', ANTHROPIC_KEY ? 'OK' : 'TIDAK DITETAPKAN');
console.log('─────────────────────────────────');
