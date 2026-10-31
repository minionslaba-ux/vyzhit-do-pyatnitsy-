-- 2026-10-31: проверка безопасности и нагрузки (уже применено в проекте Supabase).

-- 1. Представления — только чтение. Через простое представление approved_cards (SECURITY DEFINER) роль anon
--    могла UPDATE/DELETE одобренные карточки в обход RLS.
do $$ declare v record; begin
  for v in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'v' loop
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from anon, authenticated', v.relname);
  end loop;
end $$;
alter default privileges in schema public revoke truncate, references, trigger on tables from anon, authenticated;

-- 2. RLS: auth.uid() вычисляется один раз на запрос
drop policy if exists "users add own scores" on public.scores;
create policy "users add own scores" on public.scores for insert with check (player_id = (select auth.uid()));
drop policy if exists "users suggest" on public.suggestions;
create policy "users suggest" on public.suggestions for insert with check (status = 'new' and player_id = (select auth.uid()));

-- 3. Аналитика: новые события (buy_intent, cert_*, hero_*, pet_adopt, guest_*, answer_timeout…) отклонялись ограничением
alter table public.events drop constraint if exists events_kind_check;
alter table public.events add constraint events_kind_check check (kind ~ '^[a-z][a-z_]{1,23}$');

-- 4. Индексы: лимиты «N в час на игрока» и внешние ключи (на 200 тыс. событий log_event: 3 мс → 0,1 мс)
create index if not exists events_player_time_idx on public.events (player_id, created_at);
create index if not exists scores_player_time_idx on public.scores (player_id, created_at);
create index if not exists referrals_ref_player_idx on public.referrals (ref_player);
create index if not exists message_reports_message_idx on public.message_reports (message_id);
create index if not exists invites_team_id_idx on public.invites (team_id);
create index if not exists team_members_team_id_idx on public.team_members (team_id);

-- 5. Фиксированный search_path
alter function public.short_id(uuid) set search_path = public;
alter function public.is_rude(text) set search_path = public;
