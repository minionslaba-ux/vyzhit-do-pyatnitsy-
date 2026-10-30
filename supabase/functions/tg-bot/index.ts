// Бот @Survivefridaybot: принимает команды (вебхук Telegram).
// В группе: /remind — каждый день в 12:30 по Москве бот пишет сюда «Неделя дня готова» с итогами вчерашнего дня,
// /stop — перестать, /play — кнопка «Играть». Включать и выключать могут только админы группы.
// В личке: /start — кнопка, открывающая игру.
// Подключение вебхука (один раз): GET …/functions/v1/tg-bot?setup=1. Чужой вебхук не перезаписывается без &force=1.
// Запросы от Telegram проверяются секретом, который выводится из токена бота (TELEGRAM_BOT_TOKEN в секретах функций).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const token = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const SELF = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tg-bot`;
const SITE = 'https://survivefriday.com/';
const APP = 'https://t.me/Survivefridaybot?startapp';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const api = async (method: string, body: Record<string, unknown> = {}) => {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json().catch(() => ({ ok: false }));
};
const secret = async () => {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('vdp-webhook:' + token)));
  return [...h].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 48);
};
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'Content-Type': 'application/json' } });

const T = {
  ru: {
    hello: '👋 Привет! Я бот игры «Выжить до пятницы».\n\nАдмин группы, напишите /remind — и я буду каждый день в 12:30 (МСК) напоминать здесь о неделе дня и рассказывать, кто вчера продержался лучше всех.',
    on: '✅ Готово: каждый день в 12:30 (МСК) напомню здесь о неделе дня. Выключить — /stop',
    off: '🔕 Напоминания в этой группе выключены. Включить снова — /remind',
    admin: 'Включать и выключать напоминания могут только админы группы.',
    play: '🏢 «Выжить до пятницы» — офисная игра: 25 решений до пятницы, 18:00. Каждый день — новая неделя дня, одна на всех.',
    start: '🏢 «Выжить до пятницы» — офисная игра: 25 решений до пятницы, 18:00.\n\nЧтобы получать напоминания о неделе дня, откройте игру и нажмите в меню «🔔 Напоминать в Telegram».\nХотите напоминания для своей группы? Добавьте меня в группу и напишите там /remind.',
    btn: '▶ Играть',
  },
  en: {
    hello: '👋 Hi! I’m the bot for “Survive till Friday”.\n\nGroup admins: send /remind and I’ll post the Daily Week here every day at 12:30 Moscow time, plus who lasted longest yesterday.',
    on: '✅ Done: I’ll post the Daily Week here every day at 12:30 Moscow time. To stop — /stop',
    off: '🔕 Reminders are off for this group. To turn them back on — /remind',
    admin: 'Only group admins can turn reminders on or off.',
    play: '🏢 “Survive till Friday” — an office survival game: 25 decisions until Friday, 6 PM. A new Daily Week every day, the same for everyone.',
    start: '🏢 “Survive till Friday” — an office survival game: 25 decisions until Friday, 6 PM.\n\nFor Daily Week reminders, open the game and tap “🔔 Daily reminder in Telegram” in the menu.\nWant reminders for your group? Add me to the group and send /remind there.',
    btn: '▶ Play',
  },
};
type Lang = keyof typeof T;
const langOf = (code?: string, arg?: string): Lang => arg === 'en' || arg === 'ru' ? arg : (code && !/^(ru|uk|be|kk)/.test(code) ? 'en' : 'ru');
const groupBtn = (l: Lang) => ({ inline_keyboard: [[{ text: T[l].btn, url: APP }]] });

let me: { id: number; username: string } | null = null;
async function isAdmin(msg: any) {
  if (msg.sender_chat?.id === msg.chat.id) return true;  // анонимный админ пишет от имени группы
  const r = await api('getChatMember', { chat_id: msg.chat.id, user_id: msg.from?.id });
  return ['creator', 'administrator'].includes(r.result?.status);
}

async function onMessage(msg: any) {
  const chat = msg.chat, group = chat.type === 'group' || chat.type === 'supergroup';
  if (msg.migrate_to_chat_id) {  // группа стала супергруппой — у неё новый id
    await db.from('tg_groups').update({ chat_id: msg.migrate_to_chat_id }).eq('chat_id', chat.id);
    return;
  }
  const m = String(msg.text || '').match(/^\/(\w+)(?:@(\w+))?\s*(\w*)/);
  if (!m) return;
  me ||= (await api('getMe')).result;
  if (m[2] && me && m[2].toLowerCase() !== me.username.toLowerCase()) return;  // команда другому боту
  const cmd = m[1].toLowerCase(), arg = m[3].toLowerCase();
  if (!group) {
    if (cmd !== 'start') return;
    const l = langOf(msg.from?.language_code);
    await api('sendMessage', { chat_id: chat.id, text: T[l].start, reply_markup: { inline_keyboard: [[{ text: T[l].btn, web_app: { url: SITE + (l === 'en' ? 'en.html' : '') } }]] } });
    return;
  }
  const { data: g } = await db.from('tg_groups').select('lang').eq('chat_id', chat.id).maybeSingle();
  let l: Lang = (g?.lang as Lang) || langOf(msg.from?.language_code, arg);
  const reply = (text: string, markup?: unknown) => api('sendMessage', { chat_id: chat.id, text, reply_to_message_id: msg.message_id, ...(markup ? { reply_markup: markup } : {}) });
  if (cmd === 'remind' || cmd === 'stop') {
    if (!(await isAdmin(msg))) return reply(T[l].admin);
    if (cmd === 'remind') {
      l = langOf(msg.from?.language_code, arg || g?.lang);
      await db.from('tg_groups').upsert({ chat_id: chat.id, title: String(chat.title || '').slice(0, 100), lang: l, enabled: true });
      return reply(T[l].on, groupBtn(l));
    }
    await db.from('tg_groups').update({ enabled: false }).eq('chat_id', chat.id);
    return reply(T[l].off);
  }
  if (cmd === 'play' || cmd === 'start') return reply(T[l].play, groupBtn(l));
}

async function onMember(u: any) {
  const chat = u.chat, st = u.new_chat_member?.status;
  if (chat.type !== 'group' && chat.type !== 'supergroup') return;
  if (st === 'left' || st === 'kicked') await db.from('tg_groups').update({ enabled: false }).eq('chat_id', chat.id);
  else if ((st === 'member' || st === 'administrator') && ['left', 'kicked'].includes(u.old_chat_member?.status)) {
    const l = langOf(u.from?.language_code);
    await api('sendMessage', { chat_id: chat.id, text: T[l].hello });
  }
}

Deno.serve(async req => {
  if (!token) return json({ error: 'not_configured' }, 503);
  const url = new URL(req.url);
  if (req.method === 'GET' && url.searchParams.get('setup')) {
    const info = (await api('getWebhookInfo')).result || {};
    if (info.url && info.url !== SELF && !url.searchParams.get('force')) return json({ ok: false, reason: 'другой вебхук уже подключён', current: info.url });
    const set = await api('setWebhook', { url: SELF, secret_token: await secret(), allowed_updates: ['message', 'my_chat_member'], drop_pending_updates: true });
    const scope = { type: 'all_group_chats' };
    await api('setMyCommands', { scope, commands: [{ command: 'remind', description: 'Напоминать о неделе дня каждый день' }, { command: 'stop', description: 'Выключить напоминания' }, { command: 'play', description: 'Играть' }] });
    await api('setMyCommands', { scope, language_code: 'en', commands: [{ command: 'remind', description: 'Daily Week reminder every day' }, { command: 'stop', description: 'Turn reminders off' }, { command: 'play', description: 'Play' }] });
    return json({ ok: !!set.ok, description: set.description });
  }
  if (req.method !== 'POST' || req.headers.get('x-telegram-bot-api-secret-token') !== await secret()) return json({ error: 'forbidden' }, 403);
  try {
    const u = await req.json();
    if (u.message) await onMessage(u.message);
    else if (u.my_chat_member) await onMember(u.my_chat_member);
  } catch (e) { console.error(e); }
  return json({ ok: true });  // Telegram ждёт 200, иначе будет повторять
});
