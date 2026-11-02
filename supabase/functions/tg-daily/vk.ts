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
  const body = new URLSearchParams({ owner_id: `-${gid}`, from_group: '1', message: `${message}\n\n${url}`, access_token: token, v: '5.199' });
  const r = await fetch('https://api.vk.com/method/wall.post', { method: 'POST', body }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
  if (r.error) { if (!test) await db.from('vk_posts').delete().eq('day', mskDate); return `error: ${r.error.error_msg || r.error.error_code}`; }  // попробуем при следующем вызове
  if (test) return `posted ${r.response?.post_id}`;
  await db.from('vk_posts').update({ post_id: r.response?.post_id ?? null }).eq('day', mskDate);
  return `posted ${r.response?.post_id}`;
}
