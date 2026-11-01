-- «Крот в офисе» — игра в стиле «Мафии» в Telegram-группах (бот @Survivefridaybot, модуль tg-bot/mafia.ts).
-- Состояние партий и игроков. RLS включён, политик нет — доступ только у service role (Edge Function).

create table if not exists public.mafia_games (
  id bigint generated always as identity primary key,
  chat_id bigint not null,
  lang text not null default 'ru' check (lang in ('ru', 'en')),
  status text not null default 'lobby' check (status in ('lobby', 'night', 'day', 'finished')),
  sub text,                                   -- день: 'talk' (обсуждение) или 'vote' (голосование)
  seq int not null default 0,                 -- номер перехода фазы: защита от двойного перехода (tick + кнопка)
  phase_ends_at timestamptz,
  day_no int not null default 0,
  starter_tg bigint,
  lobby_msg_id bigint,
  vote_msg_id bigint,
  winner text check (winner in ('moles', 'staff', 'stopped', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- не больше одной активной партии в группе
create unique index if not exists mafia_games_one_active on public.mafia_games (chat_id) where status <> 'finished';
create index if not exists mafia_games_due on public.mafia_games (phase_ends_at) where status <> 'finished';

create table if not exists public.mafia_players (
  game_id bigint not null references public.mafia_games (id) on delete cascade,
  tg_id bigint not null,
  name text not null,
  lang text not null default 'ru',
  role text check (role in ('mole', 'detective', 'union', 'staff')),
  alive boolean not null default true,
  protected_until_day int,                    -- профсоюз защитил на эту ночь (номер ночи)
  last_protect bigint,                        -- кого профсоюз защищал прошлой ночью (подряд нельзя)
  night_target bigint,
  night_at timestamptz,
  voted_for bigint,                           -- 0 = воздержался
  joined_at timestamptz not null default now(),
  primary key (game_id, tg_id)
);
create index if not exists mafia_players_tg on public.mafia_players (tg_id);

alter table public.mafia_games enable row level security;
alter table public.mafia_players enable row level security;
revoke all on public.mafia_games, public.mafia_players from anon, authenticated;

-- Таймер фаз: раз в минуту tg-bot?mafia_tick=1 двигает партии, у которых истекло время фазы
select cron.schedule('mafia-tick', '* * * * *', $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/tg-bot?mafia_tick=1', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1)), timeout_milliseconds := 30000)$$);

-- Проверить: select * from cron.job where jobname = 'mafia-tick';   Выключить: select cron.unschedule('mafia-tick');
-- Активные партии: select * from public.mafia_games where status <> 'finished';
