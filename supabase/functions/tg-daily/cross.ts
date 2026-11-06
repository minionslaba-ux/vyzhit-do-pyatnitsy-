// Перекрёстный обмен игроками: раз в день пост о другой игре владельца (data/bot/cross_promo.json) — в русские группы Telegram
// и каналы MAX, с кнопкой «Играть». В группу ВК — только если в файле vk: true (своя игра из каталога ВК: правила VK Mini Apps 4.1.8).
// Тексты — по кругу; до даты until; день отмечается в cross_promo_posts (повторный вызов не задвоит).
import { maxApi } from './max.ts';

const SITE = 'https://survivefriday.com/';
type Promo = { slug: string; title: string; until?: string; url: string; tg_url?: string; max_url?: string; button?: string; photo?: string; posts: string[] };

export async function crossPromo(db: any, tgToken: string, mskDate: string): Promise<string> {
  const cfg: Promo | null = await fetch(`${SITE}data/bot/cross_promo.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!cfg?.slug || !cfg.posts?.length || !cfg.url) return 'off';
  if (cfg.until && mskDate > cfg.until) return 'ended';
  const { error: dup } = await db.from('cross_promo_posts').insert({ day: mskDate, slug: cfg.slug });
  if (dup) return dup.code === '23505' ? 'already' : `error: ${dup.message}`;
  const n = Math.floor(Date.parse(mskDate) / 864e5);
  const text = cfg.posts[((n % cfg.posts.length) + cfg.posts.length) % cfg.posts.length];
  const btn = cfg.button || `▶ Играть в «${cfg.title}»`;

  // Telegram: русские группы
  let tg = 0;
  const { data: gs } = await db.from('tg_groups').select('chat_id, lang').eq('enabled', true);
  for (const g of gs || []) {
    if (g.lang === 'en') continue;
    const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: g.chat_id, text, reply_markup: { inline_keyboard: [[{ text: btn, url: cfg.tg_url || cfg.url }]] } }) });
    if (r.ok) tg++;
    await new Promise(res => setTimeout(res, 60));
  }
  // MAX: каналы игры
  let mx = 0;
  if ((Deno.env.get('MAX_BOT_TOKEN') || '').trim()) {
    const { data: chats } = await db.from('max_chats').select('chat_id').eq('enabled', true).eq('is_channel', true).limit(10);
    for (const c of chats || []) {
      const r = await maxApi(`/messages?chat_id=${c.chat_id}`, { method: 'POST', body: JSON.stringify({ text: text.slice(0, 3900),
        attachments: [{ type: 'inline_keyboard', payload: { buttons: [[{ type: 'link', text: btn, url: cfg.max_url || cfg.url }]] } }] }) });
      if (!r?.error) mx++;
    }
  }
  await db.from('cross_promo_posts').update({ tg_groups: tg, max_chats: mx }).eq('day', mskDate).eq('slug', cfg.slug);
  return `${cfg.slug}: tg ${tg}, max ${mx}`;
}
