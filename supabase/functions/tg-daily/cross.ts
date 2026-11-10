// Перекрёстный обмен игроками: раз в день пост о другой игре владельца (data/bot/cross_promo.json) — в русские группы Telegram
// и каналы MAX, с кнопкой «Играть». В группу ВК — только если в файле vk: true (своя игра из каталога ВК: правила VK Mini Apps 4.1.8).
// Тексты — по кругу; до даты until; день отмечается в cross_promo_posts (повторный вызов не задвоит).
import { maxApi } from './max.ts';

// MAX не берёт картинку по ссылке («Failed to upload image»): скачиваем и загружаем файлом — POST /uploads?type=image → url,
// файл туда (поле data) → ответ с токеном фото; он и есть payload вложения. Не вышло — пробуем по ссылке, потом без картинки.
const maxImgCache: Record<string, any> = {};
async function maxImage(url: string): Promise<any> {
  if (maxImgCache[url]) return maxImgCache[url];
  try {
    const img = await fetch(url); if (!img.ok) return null;
    const blob = await img.blob();
    const up = await maxApi('/uploads?type=image', { method: 'POST' });
    if (!up?.url) return null;
    const fd = new FormData(); fd.append('data', blob, url.split('/').pop() || 'image.jpg');
    const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
    const r = await fetch(up.url, { method: 'POST', headers: { Authorization: token }, body: fd });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return null;
    return (maxImgCache[url] = j);
  } catch { return null; }
}
// Пост в канал MAX: картинка (файлом → по ссылке → без неё) + текст + кнопка-ссылка. «Вложение ещё не готово» — повтор через 2 с
export async function maxPost(chatId: number | string, text: string, btn: string, url: string, photo = ''): Promise<{ ok: boolean; mid?: string; how: string; err?: string }> {
  const kbd = { type: 'inline_keyboard', payload: { buttons: [[{ type: 'link', text: btn, url }]] } };
  const send = (att: any[]) => maxApi(`/messages?chat_id=${chatId}`, { method: 'POST', body: JSON.stringify({ text: text.slice(0, 3900), attachments: att }) });
  const errs: string[] = [];
  if (photo) {
    const up = await maxImage(photo);
    if (up) {
      let r = await send([{ type: 'image', payload: up }, kbd]);
      if (r?.error && /not.ready|attachment/i.test(JSON.stringify(r.error))) { await new Promise(res => setTimeout(res, 2000)); r = await send([{ type: 'image', payload: up }, kbd]); }
      if (!r?.error) return { ok: true, mid: r?.message?.body?.mid, how: 'photo upload' };
      errs.push('upload: ' + JSON.stringify(r.error).slice(0, 100));
    } else errs.push('upload: failed');
    const r = await send([{ type: 'image', payload: { url: photo } }, kbd]);
    if (!r?.error) return { ok: true, mid: r?.message?.body?.mid, how: 'photo url' };
    errs.push('url: ' + JSON.stringify(r.error).slice(0, 100));
  }
  const r = await send([kbd]);
  return { ok: !r?.error, mid: r?.message?.body?.mid, how: photo ? 'text' : 'text (no photo)', err: r?.error ? JSON.stringify(r.error).slice(0, 150) : errs.join('; ') || undefined };
}
// Пост в группу Telegram: фото с подписью (HTML) → иначе текстом с превью картинки
export async function tgPost(tgToken: string, chatId: number | string, html: string, btn: string, url: string, photo = ''): Promise<{ ok: boolean; msg?: number; how: string; err?: string }> {
  const kb = { inline_keyboard: [[{ text: btn, url }]] };
  const send = (m: string, body: Record<string, unknown>) => fetch(`https://api.telegram.org/bot${tgToken}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', reply_markup: kb, ...body }) }).then(r => r.json()).catch(e => ({ ok: false, description: String(e) }));
  let r: any = photo ? await send('sendPhoto', { photo, caption: html.slice(0, 1024) }) : null, how = 'photo', e1 = '';
  if (!r?.ok) { e1 = r?.description || ''; r = await send('sendMessage', { text: html, link_preview_options: { url: photo || url, prefer_large_media: true } }); how = 'text'; }
  return { ok: !!r?.ok, msg: r?.result?.message_id, how, err: r?.ok ? (e1 ? `photo: ${e1}` : undefined) : r?.description };
}

const SITE = 'https://survivefriday.com/';
type Promo = { slug: string; title: string; until?: string; url: string; tg_url?: string; max_url?: string; button?: string; photos?: string[]; posts: string[] };

export async function crossPromo(db: any, tgToken: string, mskDate: string): Promise<string> {
  const cfg: Promo | null = await fetch(`${SITE}data/bot/cross_promo.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!cfg?.slug || !cfg.posts?.length || !cfg.url) return 'off';
  if (cfg.until && mskDate > cfg.until) return 'ended';
  const { error: dup } = await db.from('cross_promo_posts').insert({ day: mskDate, slug: cfg.slug });
  if (dup) return dup.code === '23505' ? 'already' : `error: ${dup.message}`;
  const n = Math.floor(Date.parse(mskDate) / 864e5);
  const text = cfg.posts[((n % cfg.posts.length) + cfg.posts.length) % cfg.posts.length];
  const btn = cfg.button || `▶ Играть в «${cfg.title}»`;
  // картинка из игры: свой порядок (сдвиг на 7), чтобы текст и кадр сочетались по-разному; нет картинок — пост текстом
  const photos = (cfg.photos || []).filter(u => /^https:\/\//.test(u));
  const photo = photos.length ? photos[(((n * 7) % photos.length) + photos.length) % photos.length] : '';

  // Telegram: русские группы
  let tg = 0;
  const { data: gs } = await db.from('tg_groups').select('chat_id, lang').eq('enabled', true);
  for (const g of gs || []) {
    if (g.lang === 'en') continue;
    const kb = { inline_keyboard: [[{ text: btn, url: cfg.tg_url || cfg.url }]] };
    const tgSend = (m: string, body: Record<string, unknown>) => fetch(`https://api.telegram.org/bot${tgToken}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let r = photo ? await tgSend('sendPhoto', { chat_id: g.chat_id, photo, caption: text.slice(0, 1024), reply_markup: kb }) : null;
    if (!r?.ok) r = await tgSend('sendMessage', { chat_id: g.chat_id, text, reply_markup: kb });  // картинка не загрузилась — текстом
    if (r.ok) tg++;
    await new Promise(res => setTimeout(res, 60));
  }
  // MAX: каналы игры
  let mx = 0;
  if ((Deno.env.get('MAX_BOT_TOKEN') || '').trim()) {
    const { data: chats } = await db.from('max_chats').select('chat_id').eq('enabled', true).eq('is_channel', true).limit(10);
    for (const c of chats || []) if ((await maxPost(c.chat_id, text, btn, cfg.max_url || cfg.url, photo)).ok) mx++;
  }
  await db.from('cross_promo_posts').update({ tg_groups: tg, max_chats: mx }).eq('day', mskDate).eq('slug', cfg.slug);
  return `${cfg.slug}: tg ${tg}, max ${mx}`;
}

// Разовый пост о другой игре (data/bot/cross_once.json): одна картинка + текст (Telegram — HTML), кнопка «Играть».
// Повтор того же slug в тот же день не отправится — отметка в cross_promo_posts. Ответ — куда ушло и id сообщений.
type Once = { slug: string; title: string; url: string; button?: string; photo?: string; tg_html: string; text: string };
export async function crossOnce(db: any, tgToken: string, slug: string, mskDate: string): Promise<Record<string, unknown>> {
  const cfg = await fetch(`${SITE}data/bot/cross_once.json`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);
  const p: Once | undefined = (cfg?.items || []).find((x: Once) => x.slug === slug);
  if (!p?.url || !p.tg_html || !p.text) return { error: 'no such item' };
  const { error: dup } = await db.from('cross_promo_posts').insert({ day: mskDate, slug: p.slug });
  if (dup) return { error: dup.code === '23505' ? 'already sent today' : dup.message };
  const btn = p.button || `▶ Играть в «${p.title}»`, photo = /^https:\/\//.test(p.photo || '') ? p.photo : '';
  const r = await postBoth(db, tgToken, p.tg_html, p.text, btn, p.url, photo);
  await db.from('cross_promo_posts').update({ tg_groups: r.tg, max_chats: r.max }).eq('day', mskDate).eq('slug', p.slug);
  return { slug: p.slug, ...r };
}

// Во все русские группы Telegram и каналы MAX: один пост, отчёт по каждому каналу
async function postBoth(db: any, tgToken: string, html: string, text: string, btn: string, url: string, photo = '') {
  const out: Record<string, unknown>[] = [];
  let tg = 0, max = 0;
  const { data: gs } = await db.from('tg_groups').select('chat_id, lang').eq('enabled', true);
  for (const g of gs || []) {
    if (g.lang === 'en') continue;
    const r = await tgPost(tgToken, g.chat_id, html, btn, url, photo);
    if (r.ok) tg++;
    out.push({ tg: g.chat_id, ...r });
    await new Promise(res => setTimeout(res, 300));
  }
  if ((Deno.env.get('MAX_BOT_TOKEN') || '').trim()) {
    const { data: chats } = await db.from('max_chats').select('chat_id').eq('enabled', true).eq('is_channel', true).limit(10);
    for (const c of chats || []) { const r = await maxPost(c.chat_id, text, btn, url, photo); if (r.ok) max++; out.push({ max: c.chat_id, ...r }); }
  }
  return { tg, max, out };
}

// Ежедневная серия постов о другой игре (data/bot/cross_daily_<slug>.json — пост на каждую дату по Москве), cron в 13:00 МСК.
// Повтор в тот же день не отправится (cross_promo_posts: день + slug).
type Daily = { slug: string; title: string; url: string; button?: string; start: string; posts: { date: string; image?: string; tg_html: string; max_text: string }[] };
export async function crossDaily(db: any, tgToken: string, slug: string, mskDate: string): Promise<Record<string, unknown>> {
  if (!/^[a-z0-9-]{2,30}$/.test(slug)) return { error: 'bad slug' };
  const cfg: Daily | null = await fetch(`${SITE}data/bot/cross_daily_${slug}.json`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!cfg?.posts?.length || !cfg.url) return { error: 'no config' };
  // пост на сегодня; год прошёл — по кругу от даты start
  let p = cfg.posts.find(x => x.date === mskDate);
  if (!p) { const n = Math.floor((Date.parse(mskDate) - Date.parse(cfg.start)) / 864e5); p = cfg.posts[((n % cfg.posts.length) + cfg.posts.length) % cfg.posts.length]; }
  if (!p?.tg_html || !p.max_text) return { error: 'no post' };
  const { error: dup } = await db.from('cross_promo_posts').insert({ day: mskDate, slug: cfg.slug || slug });
  if (dup) return { error: dup.code === '23505' ? 'already sent today' : dup.message };
  const btn = cfg.button || `▶ Играть в «${cfg.title}»`, photo = /^https:\/\//.test(p.image || '') ? p.image! : '';
  const r = await postBoth(db, tgToken, p.tg_html, p.max_text, btn, cfg.url, photo);
  await db.from('cross_promo_posts').update({ tg_groups: r.tg, max_chats: r.max }).eq('day', mskDate).eq('slug', cfg.slug || slug);
  return { slug: cfg.slug || slug, date: mskDate, ...r };
}
