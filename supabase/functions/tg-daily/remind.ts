// Напоминания там, где нет веб-пушей (таблица msg_remind, включают игроки в игре через msg-remind):
//  • ВК — уведомления мини-приложения: notifications.sendMessage, сервисный ключ мини-приложения (секрет VK_MINI_SERVICE_TOKEN,
//    добавляет владелец: настройки приложения ВК → «Ключи доступа» → «Сервисный ключ»). Нет ключа — ВК пропускаем.
//    Правила VK Mini Apps 2.7: до 250 символов, без рекламы, отключить можно в игре.
//  • MAX — личное сообщение от бота игры с кнопкой «▶ Играть» (open_app).
// Раз в день: last_sent < сегодня (по Москве).
import { maxSend } from './max.ts';

const cut = (s: string, n: number) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

export async function msgReminders(db: any, mskDate: string, textFor: (en: boolean) => string, brkId: number): Promise<string> {
  const out: string[] = [];
  // ---- ВК ----
  const vkTok = (Deno.env.get('VK_MINI_SERVICE_TOKEN') || '').trim();
  const { data: vk } = await db.from('msg_remind').select('uid, lang').eq('via', 'vk').eq('enabled', true).or(`last_sent.is.null,last_sent.lt.${mskDate}`).limit(5000);
  if (vk?.length && !vkTok) out.push(`vk: ${vk.length} waiting, no VK_MINI_SERVICE_TOKEN`);
  else if (vk?.length) {
    let ok = 0;
    for (const lang of ['ru', 'en']) {
      const ids = vk.filter((r: any) => (r.lang === 'en') === (lang === 'en')).map((r: any) => r.uid);
      for (let i = 0; i < ids.length; i += 100) {
        const part = ids.slice(i, i + 100);
        const r = await fetch('https://api.vk.com/method/notifications.sendMessage', { method: 'POST', body: new URLSearchParams({
          user_ids: part.join(','), message: cut(textFor(lang === 'en'), 250), fragment: `brk-${brkId}`,
          random_id: String(Math.floor(Math.random() * 2e9)), access_token: vkTok, v: '5.199' }) }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
        if (r.error) { out.push(`vk error: ${r.error.error_msg || r.error.error_code}`); break; }
        const res: any[] = Array.isArray(r.response) ? r.response : [];
        const good = res.filter(x => x.status).map(x => x.user_id), bad = res.filter(x => !x.status);
        ok += good.length;
        if (good.length) await db.from('msg_remind').update({ last_sent: mskDate, last_error: null }).eq('via', 'vk').in('uid', good);
        for (const x of bad) {
          // уведомления запрещены пользователем (код 1 — «не разрешил») — выключаем, чтобы не стучаться каждый день
          const off = /disallow|not allowed|denied/i.test(JSON.stringify(x.error || '')) || x.error?.code === 1;
          await db.from('msg_remind').update({ last_error: String(x.error?.description || x.error?.code || 'fail').slice(0, 200), ...(off ? { enabled: false } : { last_sent: mskDate }) }).eq('via', 'vk').eq('uid', x.user_id);
        }
      }
    }
    out.push(`vk: ${ok}/${vk.length}`);
  }
  // ---- MAX ----
  const { data: mx } = await db.from('msg_remind').select('uid, lang').eq('via', 'max').eq('enabled', true).or(`last_sent.is.null,last_sent.lt.${mskDate}`).limit(2000);
  if (mx?.length) {
    let ok = 0;
    for (const m of mx) {
      const r = await maxSend({ user: m.uid }, textFor(m.lang === 'en'), 'https://survivefriday.com/?utm_source=max_remind', `brk-${brkId}`).catch(e => ({ error: String(e) }));
      if (r?.error) {
        const off = /blocked|forbidden|not found|chat\.denied|403/i.test(String(r.error));
        await db.from('msg_remind').update({ last_error: String(r.error).slice(0, 200), ...(off ? { enabled: false } : { last_sent: mskDate }) }).eq('via', 'max').eq('uid', m.uid);
      } else { ok++; await db.from('msg_remind').update({ last_sent: mskDate, last_error: null }).eq('via', 'max').eq('uid', m.uid); }
      await new Promise(res => setTimeout(res, 60));
    }
    out.push(`max: ${ok}/${mx.length}`);
  }
  return out.join('; ') || 'none';
}
