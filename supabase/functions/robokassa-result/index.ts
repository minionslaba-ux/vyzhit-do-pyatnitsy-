// Робокасса → Result URL: оплата прошла. Проверяем подпись MD5(OutSum:InvId:Пароль№2) и сумму счёта,
// помечаем покупку оплаченной (повторное уведомление ничего не меняет) и отвечаем «OK<InvId>», как требует Робокасса.
// У.е. попадут на счёт игрока, когда игра вызовет claim_purchases (сразу после возврата с оплаты или при следующем входе).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const md5 = (s: string) => createHash('md5').update(s).digest('hex');
const text = (s: string, status = 200) => new Response(s, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

Deno.serve(async req => {
  try {
    const pass2 = Deno.env.get('ROBOKASSA_PASS2');
    if (!pass2) return text('not configured', 503);
    // Робокасса шлёт POST (form) или GET — в зависимости от настройки «Метод отсылки данных по Result Url»
    const p = req.method === 'POST' ? new URLSearchParams(await req.text()) : new URL(req.url).searchParams;
    const out = p.get('OutSum') || '', inv = p.get('InvId') || '', sig = (p.get('SignatureValue') || '').toLowerCase();
    if (!out || !/^\d+$/.test(inv) || md5(`${out}:${inv}:${pass2}`) !== sig) return text('bad sign', 400);
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: row } = await db.from('purchases').select('inv_id, rub, status').eq('inv_id', Number(inv)).maybeSingle();
    if (!row) return text('no invoice', 404);
    if (Math.round(Number(out)) !== row.rub) return text('bad sum', 400);
    if (row.status !== 'paid') await db.from('purchases').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('inv_id', row.inv_id).eq('status', 'new');
    return text(`OK${inv}`);
  } catch (e) {
    return text(String(e), 500);
  }
});
