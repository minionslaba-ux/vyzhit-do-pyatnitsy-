// Вебхук бота MAX: MAX присылает сюда события (POST /subscriptions делает команда /maxsetup в боте Telegram).
// Список каналов бота API MAX не отдаёт — chat_id приходит только в событиях, поэтому сохраняем их в max_chats.
// Подлинность — заголовок X-Max-Bot-Api-Secret: секрет выводится из токена бота (maxHookSecret), отдельный секрет не нужен.
import { createClient } from 'jsr:@supabase/supabase-js@2';

async function maxHookSecret(token: string) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('max-hook:' + token)));
  return [...h].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('ok');
  const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
  if (!token || req.headers.get('X-Max-Bot-Api-Secret') !== await maxHookSecret(token)) return new Response('forbidden', { status: 403 });
  try {
    const u = await req.json();
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const title = async (id: number) => {
      for (const h of ['https://platform-api.max.ru', 'https://platform-api2.max.ru']) {
        try { const c = await (await fetch(`${h}/chats/${id}`, { headers: { Authorization: token } })).json(); return c?.title ? String(c.title).slice(0, 100) : null; } catch {}
      }
      return null;
    };
    const add = async (id: number, channel: boolean) => {
      await db.from('max_chats').upsert({ chat_id: id, is_channel: channel, enabled: true, title: await title(id) });
    };
    const t = u?.update_type;
    if (t === 'bot_added' && u.chat_id) await add(Number(u.chat_id), !!u.is_channel);
    else if (t === 'bot_removed' && u.chat_id) await db.from('max_chats').update({ enabled: false }).eq('chat_id', u.chat_id);
    else if (t === 'chat_title_changed' && u.chat_id) await db.from('max_chats').update({ title: String(u.title || '').slice(0, 100) }).eq('chat_id', u.chat_id);
    else if (t === 'message_created') {  // пост в канале, где бот уже админ — тоже даёт chat_id
      const r = u.message?.recipient;
      if (r?.chat_type === 'channel' && r.chat_id) {
        const { data } = await db.from('max_chats').select('chat_id').eq('chat_id', r.chat_id).maybeSingle();
        if (!data) await add(Number(r.chat_id), true);
      }
    }
  } catch (e) { console.log('max-hook', String(e)); }
  return new Response('ok');
});
