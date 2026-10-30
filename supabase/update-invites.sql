-- Обновление базы: приглашения в офис видят гости, пригласивший узнаёт ответ.
-- Supabase → SQL Editor → New query → вставить всё → Run. Повторный запуск безопасен.

alter table public.invites add column if not exists answered_at timestamptz;

-- Свои приглашения. Гость тоже видит их (по своему секретному player_id), принять — после регистрации
create or replace function public.my_invites(p_id uuid) returns table (invite_id bigint, team_name text, code text, from_name text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select i.id, t.name, t.code, coalesce(f.name, 'Игрок'), i.created_at
  from invites i join teams t on t.id = i.team_id left join players f on f.player_id = i.from_player
  where i.to_player = p_id and (p_id = auth.uid() or not public.is_registered(p_id)) and i.status = 'new' order by i.created_at desc;
$$;

-- Ответы на мои приглашения за сутки: «Марина приняла приглашение»
create or replace function public.my_sent_invites(p_id uuid) returns table (invite_id bigint, to_name text, team_name text, status text, answered_at timestamptz)
language sql security definer set search_path = public as $$
  select i.id, coalesce(p.name, 'Игрок'), t.name, i.status, i.answered_at
  from invites i join teams t on t.id = i.team_id left join players p on p.player_id = i.to_player
  where i.from_player = p_id and p_id = auth.uid() and i.status <> 'new' and i.answered_at > now() - interval '1 day'
  order by i.answered_at desc limit 20;
$$;

-- Ответ на приглашение: запоминаем время ответа
create or replace function public.answer_invite(p_id uuid, p_invite bigint, p_accept boolean) returns text
language plpgsql security definer set search_path = public as $$
declare v_team bigint;
begin
  perform public.require_player(p_id);
  select i.team_id into v_team from invites i where i.id = p_invite and i.to_player = p_id and i.status = 'new';
  if v_team is null then raise exception 'Приглашение не найдено'; end if;
  update invites set status = case when p_accept then 'accepted' else 'declined' end, answered_at = now() where id = p_invite;
  if p_accept then
    insert into team_members (player_id, team_id) values (p_id, v_team)
      on conflict (player_id) do update set team_id = excluded.team_id, joined_at = now();
  end if;
  return (select t.name from teams t where t.id = v_team);
end $$;

revoke all on function public.my_invites(uuid) from public;
revoke all on function public.my_sent_invites(uuid) from public;
revoke all on function public.answer_invite(uuid, bigint, boolean) from public;
grant execute on function public.my_invites(uuid) to anon, authenticated;
grant execute on function public.my_sent_invites(uuid) to anon, authenticated;
grant execute on function public.answer_invite(uuid, bigint, boolean) to anon, authenticated;

-- Обновить кэш API, чтобы новые функции сразу заработали
notify pgrst, 'reload schema';

-- Проверка: должны вернуться 3 строки
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name in ('my_invites', 'my_sent_invites', 'answer_invite');
