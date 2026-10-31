// Быстрое меню в Telegram-группах: сообщение с кнопками (Играть, Неделя дня, Разминка, Магазин, Лента, Рейтинг) — на русском
// и английском — бот отправляет и закрепляет (если у бота есть право закреплять). Вызов: POST {"code": "<одноразовый код>"}
// из bot_test_tokens (как у тестовой рассылки). Повторный вызов отправит и закрепит новое меню.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const BOT = 'https://t.me/Survivefridaybot?startapp';
const TEXT = `🕔 «Выжить до пятницы» — быстрое меню
Нажмите кнопку — игра откроется сразу в нужном разделе.

🕔 Survive till Friday — quick menu
Tap a button to jump straight into the game.`;
const KB = { inline_keyboard: [
  [{ text: '▶ Играть · Play', url: BOT }],
  [{ text: '📅 Неделя дня · Daily', url: `${BOT}=go-daily` }, { text: '☕ Разминка · Breaks', url: `${BOT}=go-breaks` }],
  [{ text: '🛒 Магазин · Shop', url: `${BOT}=go-shop` }, { text: '📰 Лента · Feed', url: `${BOT}=go-feed` }],
  [{ text: '🏆 Рейтинг · Top', url: `${BOT}=go-top` }, { text: '🌐 Сайт · Web', url: 'https://survivefriday.com' }],
] };

Deno.serve(async req => {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) return new Response('not configured', { status: 503 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { code, action } = await req.json().catch(() => ({}));
  if (typeof code !== 'string') return new Response('forbidden', { status: 403 });
  const { data: t } = await db.from('bot_test_tokens').delete().eq('token', code).gt('created_at', new Date(Date.now() - 600e3).toISOString()).select();
  if (!t?.length) return new Response('forbidden', { status: 403 });
  const api = (m: string, body: unknown) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).catch(() => ({}));
  const { data: gs } = await db.from('tg_groups').select('chat_id').eq('enabled', true).limit(500);
  const out: unknown[] = [];
  // action 'desc': добавить в описание группы строку «▶ Играть / Play» (нужно право бота «Изменять профиль группы»)
  if (action === 'desc') {
    const LINE = '▶ Играть / Play: t.me/Survivefridaybot?startapp';
    for (const g of gs || []) {
      const c = await api('getChat', { chat_id: g.chat_id });
      const cur: string = c.result?.description || '';
      if (cur.includes('Survivefridaybot?startapp')) { out.push({ desc: 'already' }); continue; }
      const next = (LINE + (cur ? '\n\n' + cur : '')).slice(0, 255);
      const r = await api('setChatDescription', { chat_id: g.chat_id, description: next });
      out.push({ desc: !!r.ok, err: r.description });
      await new Promise(r2 => setTimeout(r2, 1100));
    }
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
  }
  for (const g of gs || []) {
    const s = await api('sendMessage', { chat_id: g.chat_id, text: TEXT, reply_markup: KB, disable_notification: true });
    const pin = s.ok ? await api('pinChatMessage', { chat_id: g.chat_id, message_id: s.result.message_id, disable_notification: true }) : null;
    out.push({ sent: !!s.ok, pinned: !!pin?.ok, err: s.ok ? pin?.description : s.description });
    await new Promise(r => setTimeout(r, 1100));
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
});
