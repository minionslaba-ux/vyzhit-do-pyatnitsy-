// Бот в сообщениях группы ВКонтакте (Callback API). ВК присылает сюда события группы, бот отвечает от имени группы.
// Секреты (владелец добавляет сам: Supabase → Edge Functions → Secrets):
//   VK_GROUP_TOKEN — ключ сообщества, нужны права «Сообщения сообщества» (+ «Стена», «Фотографии» для автопостинга tg-daily);
//   VK_CALLBACK_SECRET — «Секретный ключ» из Управление → Работа с API → Callback API (придумывает владелец);
//   VK_CONFIRM — «Строка, которую должен вернуть сервер» оттуда же (для подтверждения адреса).
// Без VK_CALLBACK_SECRET бот только подтверждает адрес и ничего не отвечает. Беседы (peer_id > 2e9) не трогает.
// Команды (по словам в сообщении): совет / Мира → совет психолога Миры; разминка → разминка дня; у.е., оплата, не пришло → помощь с оплатой;
// играть / привет / начать → меню. Остальное — меню не чаще раза в 12 часов на человека (vk_bot_seen), чтобы не мешать переписке с людьми.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SITE = 'https://survivefriday.com/';
// Ссылки бота группы — только в мини-приложение ВК (правила VK Mini Apps 4.1.8 и 5.2.2: не уводить из ВК и не звать платить на сайте)
const APP = 'https://vk.com/app54871699';
const PLAY = APP;
const ok = () => new Response('ok');
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const getJson = (f: string) => fetch(SITE + f).then(r => r.ok ? r.json() : null).catch(() => null);

// «Разминка дня» — как в tg-daily и в игре (seeded по дате по Москве)
const BRK_QUICK: [number, string, string][] = [[5, '🗂️', 'Пятнашки «Разобрать стол»'], [6, '🍪', 'Последняя печенька'], [22, '☕', 'Поймай кофе'], [24, '📧', 'Отбей спам'],
  [28, '🗑️', 'Баскетбол в мусорку'], [30, '⏱️', 'Ровно в 18:00'], [34, '🔀', 'Анаграммы профессий'], [39, '🪪', 'Мемори «Визитки»'], [41, '🖥️', 'Запомни стол'],
  [43, '🎨', 'Цветная путаница'], [44, '🧮', 'Бухгалтерия в уме'], [45, '🙃', 'Кто лишний'], [49, '🫧', 'Пупырка']];
const seeded = (str: string) => { let h = 1779033703 ^ str.length; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = h << 13 | h >>> 19;
  let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const brkOfDay = () => { const d = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); return BRK_QUICK[Math.floor(seeded(`brk-day-${d}`)() * BRK_QUICK.length)]; };

const KEYBOARD = JSON.stringify({ one_time: false, buttons: [
  [{ action: { type: 'text', label: '💡 Совет Миры' }, color: 'primary' }, { action: { type: 'text', label: '☕ Разминка дня' }, color: 'primary' }],
  [{ action: { type: 'open_link', link: PLAY, label: '▶ Играть' } }],
  [{ action: { type: 'text', label: '💰 Оплата и у.е.' }, color: 'secondary' }],
] });

const MENU = `👋 Это «Выжить до пятницы» — офисная игра на 5 минут: 25 решений до пятницы, 18:00.

Что я умею:
💡 «совет» — совет Миры, психолога офиса
☕ «разминка» — разминка дня на 1–3 минуты
💰 «оплата» — если вопрос про у.е. и покупки
▶ Играть: ${PLAY}

Если нужен живой человек — просто напишите вопрос, вам ответят здесь же.`;
const PAY = `💰 Оплата и у.е.

Покупки — прямо в игре во ВКонтакте, за голоса ВК: магазин и «Пополнить» в меню игры. У.е. начисляются на ваш аккаунт игры сразу после оплаты.

Если оплатили, а у.е. не пришли:
1. Закройте игру и откройте её заново во ВКонтакте: ${APP}
2. Подождите пару минут.
3. Не помогло — напишите сюда дату, товар и имя в игре: проверим платёж и разберёмся.`;

async function send(token: string, peer: number, message: string, withKb = true) {
  const p = new URLSearchParams({ peer_id: String(peer), random_id: String(Math.floor(Math.random() * 2e9)), message, dont_parse_links: '0', access_token: token, v: '5.199' });
  if (withKb) p.set('keyboard', KEYBOARD);
  const r = await fetch('https://api.vk.com/method/messages.send', { method: 'POST', body: p }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
  if (r.error && withKb) return send(token, peer, message, false);  // клавиатура выключена в настройках ботов — шлём без неё
  if (r.error) console.log('vk send error', r.error.error_msg);
}

async function answer(text: string): Promise<string | null> {
  const t = text.toLowerCase();
  if (/совет|мир[аеуы]|психолог|выгоран|устал|тяжел/.test(t)) {
    const tips = (await getJson(`data/psy/tips_${1 + Math.floor(Math.random() * 6)}.json`)) || (await getJson('data/tips.json'))?.tips || [];
    const tip = pick((tips as any[]).filter(x => x.cat !== 'keep'));
    return tip ? `🛋️ Совет Миры, психолога офиса\n\n${tip.ru}\n\nЕщё советы и тест самопроверки — в кабинете Миры: ${APP}#psy\n\n🤖 Мира — персонаж игры. Её советы не заменяют специалиста.` : null;
  }
  if (/размин|перерыв|мини.?игр/.test(t)) {
    const b = brkOfDay();
    return `☕ Разминка дня: ${b[1]} ${b[2]}\n\nМинута, чтобы переключиться. Играть: ${APP}#brk-${b[0]}\n\nВсе 54 разминки — в игре, раздел «Разминки».`;
  }
  if (/у\.?\s?е\b|оплат|купил|покупк|не приш|не начисл|деньг|возврат|чек|робокасс|цен[аы]/.test(t)) return PAY;
  if (/^(начать|старт|start|привет|здравствуй|здравствуйте|меню|играть|игра|помощь|help|\/start)/.test(t.trim())) return MENU;
  return null;  // остальное — вопрос к людям
}

Deno.serve(async req => {
  if (req.method !== 'POST') return ok();
  const b = await req.json().catch(() => ({}));
  if (b.type === 'confirmation') return new Response(Deno.env.get('VK_CONFIRM') || '');
  const secret = Deno.env.get('VK_CALLBACK_SECRET'), token = Deno.env.get('VK_GROUP_TOKEN');
  if (!secret || b.secret !== secret || !token) return ok();
  if (b.type !== 'message_new') return ok();
  const m = b.object?.message || {}, peer = +m.peer_id, from = +m.from_id;
  if (!peer || peer > 2e9 || from <= 0 || m.out) return ok();
  const text = String(m.text || '');
  let reply = await answer(text);
  if (!reply) {  // непонятное сообщение: меню не чаще раза в 12 часов, иначе молчим — ответит человек
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: seen } = await db.from('vk_bot_seen').select('last_menu').eq('user_id', from).maybeSingle();
    if (seen && Date.now() - Date.parse(seen.last_menu) < 12 * 3600e3) return ok();
    await db.from('vk_bot_seen').upsert({ user_id: from, last_menu: new Date().toISOString() });
    reply = MENU;
  }
  await send(token, peer, reply);
  return ok();
});
