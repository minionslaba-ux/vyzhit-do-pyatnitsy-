-- «Как ответили другие» во всех режимах: сводный счётчик ответов по карточке (js/game.js → livePick → card_vote)
create table if not exists public.card_stats (
  card_id text primary key check (char_length(card_id) between 1 and 40),
  l integer not null default 0, r integer not null default 0, updated_at timestamptz not null default now()
);
alter table public.card_stats enable row level security;
revoke all on public.card_stats from anon, authenticated;
create or replace function public.card_vote(p_id uuid, p_card text, p_side text)
returns table (l integer, r integer) language plpgsql security definer set search_path = public as $$
begin
  if p_side not in ('left', 'right') or p_card is null or char_length(p_card) > 40 then return; end if;
  insert into card_stats as cs (card_id, l, r) values (p_card, (p_side = 'left')::int, (p_side = 'right')::int)
  on conflict (card_id) do update set l = cs.l + (p_side = 'left')::int, r = cs.r + (p_side = 'right')::int, updated_at = now();
  return query select cs.l, cs.r from card_stats cs where cs.card_id = p_card;
end $$;
revoke all on function public.card_vote(uuid, text, text) from public;
grant execute on function public.card_vote(uuid, text, text) to anon, authenticated;
