// Автопостинг в группу ВКонтакте — раз в день, вместе с ежедневной рассылкой (index.ts).
// Секреты (владелец добавляет сам: Supabase → Edge Functions → Secrets):
//   VK_GROUP_TOKEN — ключ доступа сообщества (Управление → Работа с API → Ключи доступа) с правом «Стена»;
//   VK_GROUP_ID — числовой id группы (без минуса).
// Нет секретов — ничего не делает. Второй пост в тот же день не уходит (таблица vk_posts, ключ — дата по Москве).
// Чередование по дням: совет Миры → разминка дня → ситуация «Что бы вы выбрали?» из карточек игры.
import { mskDay } from './report.ts';
const SITE = 'https://survivefriday.com/';
const POOLS = ['pool_l1a', 'pool_l1b', 'pool_l1c', 'pool_l1d', 'pool_l2a', 'pool_l3a'];
const getJson = (f: string) => fetch(SITE + f).then(r => r.ok ? r.json() : null).catch(() => null);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const vkApi = (method: string, params: Record<string, string>, token: string) =>
  fetch(`https://api.vk.com/method/${method}`, { method: 'POST', body: new URLSearchParams({ ...params, access_token: token, v: '5.199' }) }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
// Картинки к постам: альбом группы «Для постов» (владелец загрузил 30 файлов из promo/vk/vk-posts-30.zip одним разом).
// Порядок фото в альбоме = порядок имён файлов: ask-01…07, brk-05…49, mira-01…10 (tools/vk-pack.js).
// Читать альбом: сервисный ключ приложения VK_SERVICE_TOKEN (если задан) или ключ группы. Не вышло — пост без картинки.
const VK_ALBUM = '314848064';
const PACK = [...[1, 2, 3, 4, 5, 6, 7].map(i => `ask-${String(i).padStart(2, '0')}`), ...[5, 6, 22, 24, 28, 30, 34, 39, 41, 43, 44, 45, 49].map(i => `brk-${String(i).padStart(2, '0')}`),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `mira-${String(i).padStart(2, '0')}`)];
export async function vkAlbum(gid: string): Promise<{ map: Record<string, string>; err?: string; n?: number }> {
  const token = Deno.env.get('VK_SERVICE_TOKEN') || Deno.env.get('VK_GROUP_TOKEN') || '';
  const r = await vkApi('photos.get', { owner_id: `-${gid}`, album_id: VK_ALBUM, rev: '0', count: '100' }, token);
  const items = (r.response?.items || []).sort((a: any, b: any) => a.id - b.id);
  if (!items.length) return { map: {}, err: r.error?.error_msg || 'empty album' };
  if (items.length !== PACK.length) return { map: {}, err: `в альбоме ${items.length} фото, ожидалось ${PACK.length}`, n: items.length };
  return { map: Object.fromEntries(PACK.map((f, i) => [f, `photo${items[i].owner_id}_${items[i].id}`])), n: items.length };
}
// Номера фото альбома «Для постов»: 29 из 30 (не загрузилась ask-07 или brk-05). Сверено владельцем: …027 — «Последняя печенька»,
// …039 — Мира. Значит: …020–025 — ситуации (ask), …027–038 — разминки 6…49, …039–048 — Мира. «Пятнашки» (brk-05) — без картинки.
const ph = (n: number) => `photo-242860183_457239${String(n).padStart(3, '0')}`;
const VK_ASK = [20, 21, 22, 23, 24, 25].map(ph);
const VK_MIRA = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48].map(ph);
const VK_BRK: Record<number, string> = Object.fromEntries([6, 22, 24, 28, 30, 34, 39, 41, 43, 44, 45, 49].map((id, i) => [id, ph(27 + i)]));  // номер разминки → фото
const picStatic = (kind: number, brkId: number) => kind === 0 ? pick(VK_MIRA) : kind === 1 ? VK_BRK[brkId] || '' : pick(VK_ASK);
const picFor = (map: Record<string, string>, kind: number, brkId: number) => {
  const keys = Object.keys(map), want = kind === 0 ? keys.filter(k => k.startsWith('mira')) : kind === 1 ? [`brk-${String(brkId).padStart(2, '0')}`] : keys.filter(k => k.startsWith('ask'));
  const ok = want.filter(k => map[k]); return ok.length ? map[pick(ok)] : '';
};

// Итоги недели (по понедельникам): только общие цифры — имена игроков в соцсеть не выносим
const DEATH: Record<string, string> = { psyche: 'Кукуха', energy: 'Энергия', boss: 'Босс', colleagues: 'Коллеги' };
async function weekRecap(db: any): Promise<string> {
  const r = (await db.rpc('dev_report', { p_from: mskDay(-7).toISOString(), p_to: mskDay(0).toISOString() })).data || {};
  if (!r.weeks) return '';
  const from = new Date(mskDay(-7).getTime() + 3 * 3600e3).toISOString().slice(0, 10), to = new Date(mskDay(-1).getTime() + 3 * 3600e3).toISOString().slice(0, 10);
  const { data: best } = await db.from('daily_leaderboard').select('won, step, total').gte('day', from).lte('day', to)
    .order('won', { ascending: false }).order('step', { ascending: false }).order('total', { ascending: false }).limit(1);
  const b = best?.[0], d = r.deaths?.[0];
  const pct = Math.round(100 * (r.won || 0) / r.weeks);
  return ['📊 Итоги недели в «Выжить до пятницы»', '',
    `🗓 Сыграно недель: ${r.weeks} · до пятницы дожили: ${r.won || 0} (${pct}%)`,
    r.avg_step ? `⏱ В среднем продержались ${r.avg_step} из 25 решений` : '',
    d ? `💀 Чаще всего неделю заканчивала шкала «${DEATH[d.death] || d.death}»` : '',
    b ? `🏆 Лучший результат недели дня: ${b.won ? `до пятницы, ${b.total} очков` : `${b.step} из 25 решений`}` : '',
    '', 'Себя ищите в рейтинге игры. А на этой неделе — доживёте до пятницы? 👇'].filter((x, i, a) => x || a[i - 1]).join('\n');
}

export async function vkDaily(db: any, mskDate: string, brk: [number, string, string, string], test = false, kindArg?: number): Promise<string> {
  const token = Deno.env.get('VK_GROUP_TOKEN'), gid = (Deno.env.get('VK_GROUP_ID') || '').replace(/^-/, '');
  if (!token || !gid) return 'off';
  if (!test) {
    const { error: dup } = await db.from('vk_posts').insert({ day: mskDate });
    if (dup) return dup.code === '23505' ? 'already' : `error: ${dup.message}`;
  }
  // по понедельникам — итоги недели (kind 3); в остальные дни по кругу 0 Мира, 1 разминка, 2 ситуация
  const kind = kindArg ?? (new Date(mskDate).getUTCDay() === 1 ? 3 : Math.floor(Date.parse(mskDate) / 864e5) % 3);
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
  if (kind === 3) message = await weekRecap(db).catch(() => '');
  if (!message) {
    const cards = (await getJson(`data/${pick(POOLS)}.json`)) || [];
    const c = pick(cards as any[]);
    message = c ? `🤔 Что бы вы выбрали?\n\n${c.who ? c.who + ': ' : ''}${c.text}\n\n⬅ ${c.answers.left.label}\n➡ ${c.answers.right.label}\n\nПишите в комментариях! А чем кончится неделя — узнаете в игре 👇`
      : '🗓 Новая неделя в офисе уже началась. Доживёте до пятницы 18:00? 👇';
  }
  // ссылка — в тексте: вложение-ссылку без картинки ключ сообщества публиковать не может (link_photo_sizing_rule)
  const log: string[] = [];
  const pic = picStatic(kind, brk[0]);
  let r = await vkApi('wall.post', { owner_id: `-${gid}`, from_group: '1', message: `${message}\n\n${url}`, ...(pic ? { attachments: pic } : {}) }, token);
  if (r.error && pic) { log.push(`post with pic: ${r.error.error_msg}`); r = await vkApi('wall.post', { owner_id: `-${gid}`, from_group: '1', message: `${message}\n\n${url}` }, token); }
  const note = pic && !log.length ? ' +pic' : log.length ? ` (${log.join('; ')})` : '';
  if (r.error) { if (!test) await db.from('vk_posts').delete().eq('day', mskDate); return `error: ${r.error.error_msg || r.error.error_code}${note}`; }  // попробуем при следующем вызове
  if (!test) await db.from('vk_posts').update({ post_id: r.response?.post_id ?? null }).eq('day', mskDate);
  return `posted ${r.response?.post_id}${note}`;
}
