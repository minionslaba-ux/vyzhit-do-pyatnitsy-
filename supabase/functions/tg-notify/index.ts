// Сообщение разработчикам (dev_admins) в личку бота — для отчёта автоматического разбора идей (/idea).
// Защита — cron_key из закрытой таблицы push_keys. Вызывается из базы: net.http_post(... body {key, text}).
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async req => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { key, text } = await req.json().catch(() => ({}));
  const { data: k } = await db.from('push_keys').select('cron_key').eq('id', 1).maybeSingle();
  if (!k || key !== k.cron_key || typeof text !== 'string' || !text.trim()) return new Response('forbidden', { status: 403 });
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) return new Response('not configured', { status: 503 });
  const { data: admins } = await db.from('dev_admins').select('tg_id');
  let sent = 0;
  for (const a of admins || []) {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: a.tg_id, text: text.slice(0, 4000), disable_web_page_preview: true }) });
    if (r.ok) sent++;
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
