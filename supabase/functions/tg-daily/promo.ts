// Посты о канале игры в MAX: раз в 3 дня до даты until (data/bot/max_promo.json), в русские группы Telegram и группу ВК.
// Тексты — по кругу; день отмечается в max_promo_posts (повторный вызов не задвоит).
const SITE = 'https://survivefriday.com/';
const MAX_CHANNEL = 'https://max.ru/se14877440_biz';
const vkApi = (method: string, params: Record<string, string>, token: string) =>
  fetch(`https://api.vk.com/method/${method}`, { method: 'POST', body: new URLSearchParams({ ...params, access_token: token, v: '5.199' }) }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));

export async function maxPromo(db: any, tgToken: string, mskDate: string): Promise<string> {
  const n = Math.floor(Date.parse(mskDate) / 864e5);
  if (n % 3 !== 0) return 'skip';
  const cfg = await fetch(`${SITE}data/bot/max_promo.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  const posts: string[] = cfg?.posts || [];
  if (!posts.length || (cfg.until && mskDate > cfg.until)) return 'off';
  const { error: dup } = await db.from('max_promo_posts').insert({ day: mskDate });
  if (dup) return dup.code === '23505' ? 'already' : `error: ${dup.message}`;
  const text = posts[(((Math.floor(n / 3) - 6920) % posts.length) + posts.length) % posts.length];  // 6920 — 3 ноября 2026, первый пост — первый в списке

  // Telegram: русские группы (MAX — российский мессенджер)
  let tg = 0;
  const { data: gs } = await db.from('tg_groups').select('chat_id, lang').eq('enabled', true);
  for (const g of gs || []) {
    if (g.lang === 'en') continue;
    const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: g.chat_id, text, reply_markup: { inline_keyboard: [[{ text: '💬 Канал игры в MAX', url: MAX_CHANNEL }]] } }) });
    if (r.ok) tg++;
    await new Promise(res => setTimeout(res, 60));
  }
  // ВК: ссылка в тексте (ключ сообщества не публикует вложение-ссылку без картинки)
  let vk = 'off', postId: number | null = null;
  const token = Deno.env.get('VK_GROUP_TOKEN'), gid = (Deno.env.get('VK_GROUP_ID') || '').replace(/^-/, '');
  if (token && gid) {
    const r = await vkApi('wall.post', { owner_id: `-${gid}`, from_group: '1', message: `${text}\n\nКанал: ${MAX_CHANNEL}` }, token);
    postId = r.response?.post_id ?? null;
    vk = r.error ? `error: ${r.error.error_msg || r.error.error_code}` : `posted ${postId}`;
  }
  await db.from('max_promo_posts').update({ tg_groups: tg, vk_post_id: postId }).eq('day', mskDate);
  return `tg ${tg}; vk ${vk}`;
}
