// Посты в каналы MAX (мессенджер VK): тот же текст, что уходит в группу ВК, + кнопка «Играть».
// Токен бота — секрет MAX_BOT_TOKEN (владелец добавил сам). Каналы — таблица max_chats (команда /maxsetup в боте Telegram).
// Адрес API: platform-api.max.ru (у platform-api2 сертификат Минцифры, которому сервер Supabase не доверяет), запасной — api2.
const HOSTS = ['https://platform-api.max.ru', 'https://platform-api2.max.ru'];
export async function maxApi(path: string, init: RequestInit = {}): Promise<any> {
  const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
  if (!token) return { error: 'no_token' };
  let last: any = null;
  for (const h of HOSTS) {
    try {
      const r = await fetch(h + path, { ...init, headers: { Authorization: token, 'Content-Type': 'application/json', ...(init.headers || {}) } });
      const j = await r.json().catch(() => ({}));
      if (r.ok) return j;
      last = { error: j.message || j.code || `http ${r.status}` };
      if (r.status < 500) return last;  // ошибка запроса — второй адрес не поможет
    } catch (e) { last = { error: String(e).slice(0, 120) }; }
  }
  return last || { error: 'unknown' };
}
// Отправить пост во все включённые каналы MAX. Возвращает краткий итог для лога.
export async function maxBroadcast(db: any, text: string, url = 'https://survivefriday.com/?utm_source=max'): Promise<string> {
  if (!(Deno.env.get('MAX_BOT_TOKEN') || '').trim()) return 'max: off';
  const { data: chats } = await db.from('max_chats').select('chat_id').eq('enabled', true).eq('is_channel', true).limit(10);
  if (!chats?.length) return 'max: no channels (/maxsetup)';
  const out: string[] = [];
  for (const c of chats) {
    const r = await maxSend(c.chat_id, text, url);
    if (r?.error) out.push(`${c.chat_id}: ${r.error}`); else { out.push(`${c.chat_id}: ok`); await db.from('max_chats').update({ last_post: new Date().toISOString() }).eq('chat_id', c.chat_id); }
  }
  return 'max: ' + out.join(', ');
}

// Бот игры в MAX — кнопка «Играть» открывает мини-приложение прямо в MAX (вход без регистрации)
export const MAX_BOT = 'se14877440_bot';
const kb = (button: Record<string, string>) => [{ type: 'inline_keyboard', payload: { buttons: [[button]] } }];
// Сообщение с кнопкой «▶ Играть» (open_app); не принял — запасная кнопка-ссылка на сайт
export async function maxSend(chatId: number | string, text: string, url = 'https://survivefriday.com/?utm_source=max', start = 'channel'): Promise<any> {
  const send = (attachments: any) => maxApi(`/messages?chat_id=${chatId}`, { method: 'POST', body: JSON.stringify({ text: text.slice(0, 3900), attachments }) });
  let r = await send(kb({ type: 'open_app', text: '▶ Играть', web_app: MAX_BOT, payload: start }));
  if (r?.error) r = await send(kb({ type: 'link', text: '▶ Играть', url }));
  return r;
}
