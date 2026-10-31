// Стикерпак «Выжить до пятницы» в Telegram: бот создаёт набор из картинок сайта (data/stickers/NN.png, 512×512 PNG,
// эмодзи — data/stickers/emoji.json; рендер — tools/make-stickers.js). Владелец набора — первый из dev_admins (tg_id).
// Вызов: POST {"code": "<одноразовый код>"} из bot_test_tokens (как tg-pin). Набора нет — createNewStickerSet (до 50 штук),
// есть — addStickerToSet для недостающих (по количеству). Повторный вызов безопасен.
// action 'post' — после этого отправить в группы (tg_groups.enabled) первый стикер и ссылку на набор.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SITE = 'https://survivefriday.com/data/stickers/';
const BASE = 'office_friday';
const TITLE = 'Выжить до пятницы · @Survivefridaybot';  // ≤ 64 символов; упоминание бота кликабельно в превью набора
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) return new Response('not configured', { status: 503 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { code, action } = await req.json().catch(() => ({}));
  if (typeof code !== 'string') return new Response('forbidden', { status: 403 });
  const { data: t } = await db.from('bot_test_tokens').delete().eq('token', code).gt('created_at', new Date(Date.now() - 600e3).toISOString()).select();
  if (!t?.length) return new Response('forbidden', { status: 403 });
  const api = (m: string, body: unknown = {}) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).catch(e => ({ ok: false, description: String(e) }));

  const me = await api('getMe');
  if (!me.ok) return json({ error: 'getMe', detail: me.description }, 502);
  const name = `${BASE}_by_${me.result.username}`, link = `https://t.me/addstickers/${name}`;
  const { data: adm } = await db.from('dev_admins').select('tg_id').limit(1).maybeSingle();
  if (!adm?.tg_id) return json({ error: 'no dev_admins owner' }, 500);
  const user_id = Number(adm.tg_id);

  const list: { file: string; emoji: string[] }[] = await fetch(SITE + 'emoji.json').then(r => r.json()).catch(() => []);
  if (!list.length) return json({ error: 'emoji.json not available', url: SITE + 'emoji.json' }, 502);
  const input = (s: { file: string; emoji: string[] }) => ({ sticker: SITE + s.file, format: 'static', emoji_list: s.emoji.slice(0, 20) });

  const out: Record<string, unknown> = { name, link, title: TITLE, total: list.length };
  let set = await api('getStickerSet', { name });
  if (!set.ok) {  // набора ещё нет
    const first = list.slice(0, 50);
    const r = await api('createNewStickerSet', { user_id, name, title: TITLE, sticker_type: 'regular', stickers: first.map(input) });
    out.created = !!r.ok; if (!r.ok) return json({ ...out, error: r.description }, 502);
    out.added = first.length;
    for (const s of list.slice(50)) { const a = await api('addStickerToSet', { user_id, name, sticker: input(s) }); if (!a.ok) { out.error = a.description; break; } out.added = (out.added as number) + 1; await new Promise(r2 => setTimeout(r2, 400)); }
  } else {  // есть — дополняем недостающие по порядку
    const have = set.result.stickers?.length || 0, errs: string[] = [];
    let added = 0;
    if (set.result.title !== TITLE) out.retitled = !!(await api('setStickerSetTitle', { name, title: TITLE })).ok;
    for (const s of list.slice(have)) {
      const a = await api('addStickerToSet', { user_id, name, sticker: input(s) });
      if (a.ok) added++; else { errs.push(`${s.file}: ${a.description}`); break; }
      await new Promise(r2 => setTimeout(r2, 400));
    }
    Object.assign(out, { created: false, had: have, added, errors: errs.length ? errs : undefined });
  }
  set = await api('getStickerSet', { name });
  out.count = set.result?.stickers?.length ?? null;

  // action 'post': первый стикер + ссылка на набор во все включённые группы
  if (action === 'post' && set.ok) {
    const fileId = set.result.stickers?.[0]?.file_id;
    const { data: gs } = await db.from('tg_groups').select('chat_id').eq('enabled', true).limit(500);
    const posted: unknown[] = [];
    for (const g of gs || []) {
      const st = fileId ? await api('sendSticker', { chat_id: g.chat_id, sticker: fileId, disable_notification: true }) : null;
      const m = await api('sendMessage', { chat_id: g.chat_id, disable_notification: true,
        text: '🕔 Стикеры «Выжить до пятницы» — офисная жизнь в 24 картинках.\n🕔 Survive till Friday stickers — office life in 24 pics.',
        reply_markup: { inline_keyboard: [[{ text: '➕ Добавить стикеры · Add stickers', url: link }], [{ text: '▶ Играть · Play', url: `https://t.me/${me.result.username}?startapp` }]] } });
      posted.push({ chat: g.chat_id, sticker: st ? !!st.ok : null, sent: !!m.ok, err: m.ok ? st?.description : m.description });
      await new Promise(r2 => setTimeout(r2, 1100));
    }
    out.posted = posted;
  }
  return json(out);
});
