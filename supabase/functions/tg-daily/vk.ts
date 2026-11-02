// Автопостинг в группу ВКонтакте — раз в день, вместе с ежедневной рассылкой (index.ts).
// Секреты (владелец добавляет сам: Supabase → Edge Functions → Secrets):
//   VK_GROUP_TOKEN — ключ доступа сообщества (Управление → Работа с API → Ключи доступа) с правом «Стена»;
//   VK_GROUP_ID — числовой id группы (без минуса).
// Нет секретов — ничего не делает. Второй пост в тот же день не уходит (таблица vk_posts, ключ — дата по Москве).
// Чередование по дням: совет Миры → разминка дня → ситуация «Что бы вы выбрали?» из карточек игры.
const SITE = 'https://survivefriday.com/';
const POOLS = ['pool_l1a', 'pool_l1b', 'pool_l1c', 'pool_l1d', 'pool_l2a', 'pool_l3a'];
const getJson = (f: string) => fetch(SITE + f).then(r => r.ok ? r.json() : null).catch(() => null);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
// Картинки к постам — с сайта (promo/vk, их рисует tools/vk-promo.js); по виду поста
const PICS: Record<number, string[]> = { 0: ['promo/vk/post-3-mira.png'], 1: ['promo/vk/post-4-breaks.png'], 2: ['promo/vk/post-2-how.png', 'promo/vk/post-6-daily.png', 'promo/vk/post-5-mole.png', 'promo/vk/post-7-career.png', 'promo/vk/post-1-welcome.png'] };
const vkApi = (method: string, params: Record<string, string>, token: string) =>
  fetch(`https://api.vk.com/method/${method}`, { method: 'POST', body: new URLSearchParams({ ...params, access_token: token, v: '5.199' }) }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
// Загрузить картинку и вернуть вложение photo<owner>_<id>. Стена — только для ключа пользователя, поэтому если не вышло,
// пробуем загрузку «для сообщений» (её ключ сообщества умеет). Не получилось ничего — пост уйдёт без картинки. log — что пробовали.
async function uploadPic(path: string, gid: string, token: string, log: string[]): Promise<string> {
  const img = await fetch(SITE + path).then(r => r.ok ? r.blob() : null).catch(() => null);
  if (!img) { log.push('no image'); return ''; }
  const send = async (url: string) => { const f = new FormData(); f.append('photo', img, 'post.png'); return fetch(url, { method: 'POST', body: f }).then(x => x.json()).catch(() => null); };
  const w = await vkApi('photos.getWallUploadServer', { group_id: gid }, token);
  if (w.response?.upload_url) {
    const u = await send(w.response.upload_url);
    const s = u && await vkApi('photos.saveWallPhoto', { group_id: gid, photo: u.photo, server: String(u.server), hash: u.hash }, token);
    const p = s?.response?.[0]; if (p) return `photo${p.owner_id}_${p.id}`;
    log.push(`wall save: ${s?.error?.error_msg || 'no upload'}`);
  } else log.push(`wall: ${w.error?.error_msg}`);
  const m = await vkApi('photos.getMessagesUploadServer', { peer_id: '0' }, token);
  if (m.response?.upload_url) {
    const u = await send(m.response.upload_url);
    const s = u && await vkApi('photos.saveMessagesPhoto', { photo: u.photo, server: String(u.server), hash: u.hash }, token);
    const p = s?.response?.[0]; if (p) return `photo${p.owner_id}_${p.id}${p.access_key ? '_' + p.access_key : ''}`;
    log.push(`msg save: ${s?.error?.error_msg || 'no upload'}`);
  } else log.push(`msg: ${m.error?.error_msg}`);
  return '';
}

// test: пробный пост по одноразовому коду (index.ts, body.vk_test) — без записи в vk_posts, ежедневный пост не блокирует; kind — 0 Мира, 1 разминка, 2 ситуация
export async function vkDaily(db: any, mskDate: string, brk: [number, string, string, string], test = false, kindArg?: number): Promise<string> {
  const token = Deno.env.get('VK_GROUP_TOKEN'), gid = (Deno.env.get('VK_GROUP_ID') || '').replace(/^-/, '');
  if (!token || !gid) return 'off';
  if (!test) {
    const { error: dup } = await db.from('vk_posts').insert({ day: mskDate });
    if (dup) return dup.code === '23505' ? 'already' : `error: ${dup.message}`;
  }
  const kind = kindArg ?? Math.floor(Date.parse(mskDate) / 864e5) % 3;
  const link = (q = '') => `${SITE}?utm_source=vk${q}`;
  let message = '', url = link();
  if (kind === 0) {
    const tips = (await getJson(`data/psy/tips_${1 + Math.floor(Math.random() * 6)}.json`)) || (await getJson('data/tips.json'))?.tips || [];
    const t = pick((tips as any[]).filter(x => x.cat !== 'keep'));
    message = t ? `🛋️ Совет Миры, психолога офиса\n\n${t.ru}\n\nБольше советов и тест самопроверки — в кабинете Миры в игре 👇\n\n🤖 Мира — персонаж игры. Её советы не заменяют специалиста.` : '';
    url = link('&psy=1');
  } else if (kind === 1) {
    message = `☕ Разминка дня: ${brk[1]} ${brk[2]}\n\nМинута, чтобы переключиться между задачами. Без регистрации, прямо в браузере 👇`;
    url = link(`&brk=${brk[0]}`);
  }
  if (!message) {
    const cards = (await getJson(`data/${pick(POOLS)}.json`)) || [];
    const c = pick(cards as any[]);
    message = c ? `🤔 Что бы вы выбрали?\n\n${c.who ? c.who + ': ' : ''}${c.text}\n\n⬅ ${c.answers.left.label}\n➡ ${c.answers.right.label}\n\nПишите в комментариях! А чем кончится неделя — узнаете в игре 👇`
      : '🗓 Новая неделя в офисе уже началась. Доживёте до пятницы 18:00? 👇';
  }
  // ссылка — в тексте: вложение-ссылку без картинки ключ сообщества публиковать не может (link_photo_sizing_rule)
  const log: string[] = [];
  const pic = await uploadPic(pick(PICS[kind] || PICS[2]), gid, token, log);
  let r = await vkApi('wall.post', { owner_id: `-${gid}`, from_group: '1', message: `${message}\n\n${url}`, ...(pic ? { attachments: pic } : {}) }, token);
  if (r.error && pic) { log.push(`post with pic: ${r.error.error_msg}`); r = await vkApi('wall.post', { owner_id: `-${gid}`, from_group: '1', message: `${message}\n\n${url}` }, token); }
  const note = pic && !log.length ? ' +pic' : log.length ? ` (${log.join('; ')})` : '';
  if (r.error) { if (!test) await db.from('vk_posts').delete().eq('day', mskDate); return `error: ${r.error.error_msg || r.error.error_code}${note}`; }  // попробуем при следующем вызове
  if (!test) await db.from('vk_posts').update({ post_id: r.response?.post_id ?? null }).eq('day', mskDate);
  return `posted ${r.response?.post_id}${note}`;
}
