# Письма регистрации и входа

Supabase → Authentication → Emails (Email Templates):

| Шаблон | Тема письма (Subject) | Текст (Message body) |
|---|---|---|
| **Confirm signup** | Подтвердите регистрацию в «Выжить до пятницы» | `confirm-signup.html` |
| **Magic Link** | Ваш вход в «Выжить до пятницы» | `magic-link.html` |

Новому игроку приходит «Confirm signup», при повторном входе — «Magic Link». Кнопка в письме подтверждает почту и сразу открывает игру; в игре появляется экран «Регистрация подтверждена!».

Authentication → URL Configuration: **Site URL** — `https://survivefriday.com`, в **Redirect URLs** — `https://survivefriday.com/**`.
