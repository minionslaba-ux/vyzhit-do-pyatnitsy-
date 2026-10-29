// Подключение общего рейтинга офиса к Supabase.
// Supabase → Project Settings → API: Project URL и публичный ключ — publishable (sb_publishable_…) или anon (eyJ…).
// Ключ anon публичный: его можно хранить в открытом репозитории, доступ ограничен политиками из supabase/schema.sql.
// Пока поля пустые, рейтинг хранится только в браузере игрока.
window.SUPABASE_CONFIG = {
  url: 'https://auequuxfcwdshblqrwbd.supabase.co',
  anonKey: 'sb_publishable_ZF67r4UX91_n180NPFQuvA_0D_-8Ya2',
  // Telegram Mini App (необязательно): имя бота без @ и короткое имя приложения из BotFather.
  // Если заполнено, ссылки-приглашения открывают игру прямо в Telegram: t.me/<bot>/<app>?startapp=…
  telegram: { bot: '', app: '' },
};
