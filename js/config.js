// Подключение общего рейтинга офиса к Supabase.
// Supabase → Project Settings → API: Project URL и публичный ключ — publishable (sb_publishable_…) или anon (eyJ…).
// Ключ anon публичный: его можно хранить в открытом репозитории, доступ ограничен политиками из supabase/schema.sql.
// Пока поля пустые, рейтинг хранится только в браузере игрока.
window.SUPABASE_CONFIG = {
  url: 'https://auequuxfcwdshblqrwbd.supabase.co',
  anonKey: 'sb_publishable_ZF67r4UX91_n180NPFQuvA_0D_-8Ya2',
  // Telegram Mini App (необязательно): имя бота без @ и короткое имя приложения из BotFather.
  // Ссылки-приглашения открывают игру прямо в Telegram: t.me/<bot>/<app>?startapp=… или, без app, t.me/<bot>?startapp=…
  // botId — номер бота (первая часть токена, не секрет) для кнопки «Войти через Telegram» на сайте; домен бота задаётся в BotFather → /setdomain
  telegram: { bot: 'Survivefridaybot', app: '', botId: 9083461235 },  // главное мини-приложение бота: t.me/Survivefridaybot?startapp=… открывает игру сразу
  // VK ID (необязательно): ID приложения с id.vk.com (не секрет). Пусто — кнопки «Войти через VK» нет
  vk: { app: '54866781' },
  // Реклама за награду (Рекламная сеть Яндекса): блок из кабинета РСЯ. type: 'rewarded' — блок «с вознаграждением»
  // (награда только за досмотр), 'fullscreen' — полноэкранный (награда после закрытия). Пусто — кнопок рекламы нет
  // platforms — для каких устройств создан блок в кабинете РСЯ: touch — телефоны, desktop — компьютеры (на остальных кнопки нет)
  ads: { blockId: 'R-A-20310847-1', type: 'fullscreen', platforms: ['touch'] },
};
