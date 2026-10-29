// Подключение общего рейтинга офиса к Supabase.
// Supabase → Project Settings → API: скопируйте Project URL и ключ anon (public).
// Ключ anon публичный: его можно хранить в открытом репозитории, доступ ограничен политиками из supabase/schema.sql.
// Пока поля пустые, рейтинг хранится только в браузере игрока.
window.SUPABASE_CONFIG = {
  url: '',      // например: 'https://abcdefghijkl.supabase.co'
  anonKey: '',  // длинная строка, начинается с 'eyJ...'
};
