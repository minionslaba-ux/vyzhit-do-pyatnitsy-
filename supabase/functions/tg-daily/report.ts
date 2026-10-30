// Отчёт разработчику в Telegram: сводка по игре за период (только агрегаты — dev_report в базе).
// Используют tg-daily (каждый день за вчера) и tg-bot (команды /stats и /week в личке, только для dev_admins).
// Копия этого файла лежит рядом с index.ts в каждой функции: так её проще выкладывать.

const MSK = 3 * 3600e3;
// Начало дня по Москве, сдвиг в днях: mskDay(0) — сегодня 00:00 МСК, mskDay(-1) — вчера
export const mskDay = (shift = 0) => new Date(Math.floor((Date.now() + MSK) / 864e5 + shift) * 864e5 - MSK);
const fmt = (d: Date) => new Date(d.getTime() + MSK).toISOString().slice(5, 10).split('-').reverse().join('.');
const pct = (a: number, b: number) => b ? `${Math.round(100 * a / b)}%` : '—';
const diff = (a: number, b: number) => a === b ? '' : ` (${a > b ? '+' : '−'}${Math.abs(a - b)})`;
const DEATH: Record<string, string> = { psyche: 'Кукуха', energy: 'Энергия', boss: 'Босс', colleagues: 'Коллеги' };
const MODE: Record<string, string> = { career: 'карьера', daily: 'неделя дня', pack: 'спецнеделя', tour: 'турнир' };
const SRC: Record<string, string> = { web: 'сайт', telegram: 'Telegram', app: 'приложение' };

// title — «за 30.10», from/to — период, prev — такой же период раньше (для сравнения)
export async function buildReport(db: any, title: string, from: Date, to: Date, prev?: [Date, Date]) {
  const rep = async (a: Date, b: Date) => (await db.rpc('dev_report', { p_from: a.toISOString(), p_to: b.toISOString() })).data || {};
  const r = await rep(from, to), p = prev ? await rep(prev[0], prev[1]) : null;
  const { data: f } = await db.from('stats_funnel').select('*').maybeSingle();
  const cmp = (k: string) => p ? diff(r[k] || 0, p[k] || 0) : '';
  const a = r.accounts || {};
  const lines = [
    `📊 <b>«Выжить до пятницы» ${title}</b>`,
    '',
    `👥 Новые игроки: <b>${r.new_players}</b>${cmp('new_players')} · активных: <b>${r.active}</b>${cmp('active')} · заходов: ${r.opens}`,
    `🔑 Новые аккаунты: почта ${a.email || 0} · Telegram ${a.tg || 0} · VK ${a.vk || 0}`,
    `🗓 Недели: <b>${r.weeks}</b>${cmp('weeks')} · до пятницы ${r.won} (${pct(r.won, r.weeks)}) · в среднем ${r.avg_step ?? 0} из 25 карточек`,
  ];
  if (r.modes?.length) lines.push(`   ${r.modes.map((m: any) => `${MODE[m.mode] || m.mode} ${m.n}`).join(' · ')}`);
  if (r.deaths?.length) lines.push(`💀 Увольняет чаще: ${r.deaths.map((d: any) => `${DEATH[d.death] || d.death} ${d.n}`).join(', ')}`);
  if (r.sources?.length) lines.push(`📣 Откуда: ${r.sources.map((s: any) => `${SRC[s.src.split(':')[0]] || s.src}${s.src.includes(':') ? ' (' + s.src.split(':')[1] + ')' : ''} ${s.n}`).join(', ')}`);
  lines.push(`🔗 Поделились ${r.shares} · установили ${r.installs} · пришли по ссылке ${r.invites} · вступили в группу ${r.group_joins}`);
  lines.push('', `Всего: игроков ${r.total_players}, аккаунтов ${r.total_accounts}, напоминания у ${r.tg_subs}, групп с ботом ${r.tg_groups}`);
  if (f) lines.push(`Воронка за всё время: зашли ${f.opened} → 1 неделя ${f.week1} (${pct(f.week1, f.opened)}) → 3 недели ${f.week3} → 10 недель ${f.week10} → год ${f.year}`);
  return lines.join('\n');
}

export const reportMarkup = { inline_keyboard: [[{ text: '📈 Вся статистика', url: 'https://survivefriday.com/?stats' }]] };
export const yesterdayTitle = () => `за ${fmt(mskDay(-1))}`;
export const todayTitle = () => `сегодня, ${fmt(mskDay(0))} (с 00:00 МСК)`;
export const weekTitle = () => `за 7 дней (${fmt(mskDay(-7))}–${fmt(mskDay(-1))})`;
