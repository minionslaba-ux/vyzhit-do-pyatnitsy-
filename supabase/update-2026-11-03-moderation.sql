-- Автомодерация: мат, оскорбления, ненависть, «туалетные» слова и ссылки.
--   mod_norm(t)    — нормализация: латиница-двойники → кириллица (xyй → хуй), ё → е, без знаков (х.у.й), «х у й» → «хуй»
--   is_rude(t)     — чат и личка: мат, оскорбления, ненависть (пересоздана, сильнее прежней)
--   is_bad_name(t) — имя, отдел, офис, своя профессия: всё из is_rude + «понос», «жопа»…, ссылки, 5+ цифр
--   is_bad_title   — теперь просто is_bad_name
-- Триггеры: players / scores — плохое имя → «Игрок XXXX», плохой отдел → '', профессия → null;
--           messages, direct_messages, teams, suggestions — отказ с понятным текстом.
-- Копия правил для подсказки в игре — js/moder.js (меняйте вместе).

create or replace function public.mod_norm(t text) returns text
language plpgsql immutable set search_path = public as $$
declare n text; m text[];
begin
  n := translate(lower(coalesce(t, '')), 'aeopcxykmthb3046@ёu1', 'аеорсхукмтнвзочбаеии');
  n := btrim(regexp_replace(regexp_replace(n, '[^а-я0-9 ]+', '', 'g'), '\s+', ' ', 'g'));
  for i in 1..10 loop  -- «х у й» → «хуй»
    m := regexp_match(n, '(?:^| )((?:[а-я] )+[а-я])(?= |$)');
    exit when m is null;
    n := replace(n, m[1], replace(m[1], ' ', ''));
  end loop;
  return n;
end $$;

create or replace function public.mod_re(k text) returns text language sql immutable as $$
  select case k
    when 'mat' then '(?:^|[^а-я])(?:(?:за|на|от|по|при|вы|у|ра[зс]ъ?|до|съ|подъ?|объ?|изъ?|въ)?еб[аеиоуылнт]|ху[йеияю]|пизд|пезд|бля|муд[аои]к|мудил|сук[аи](?=[^а-я]|$)|сучк[аиеу](?=[^а-я]|$)|сучар|сукин|г[оа]ндон|залуп|пид[оа]р|пидр|педик|педераст|шлюх|шалав|долбо|дроч|манд[аеуы](?=[^а-я]|$)|трах[ан]|минет|оргазм|порно(?=[^а-я]|$)|порнух|порнограф|порнхаб)'
    when 'insult' then '(?:^|[^а-я])(?:дебил|идиот|урод|ублюд|мраз|тварь|твари(?=[^а-я]|$)|гнид|чмо|даун(?=[^а-я]|$)|лох(?=[^а-я]|$)|лошар|кретин|придур|дегенерат)'
    when 'hate' then '(?:^|[^а-я])(?:нацист|фашист|гитлер|свастик|хохл(?:ы|ов|у|а|ушк)(?=[^а-я]|$)|хохол|москал|жид(?=[^а-я]|$)|жиды|жидов|чурк|хач(?=[^а-я]|$)|хачик|негр(?=[^а-я]|$)|негры|нигер(?=[^а-я]|$)|нигеры|ниггер)'
    when 'sqz' then '(?:пизд|пезд|бляд|блять|залуп|пидор|пидар|гандон|гондон|шлюх|долбоеб|мудак|мудил|уебок|уебан|ниггер)'
    when 'toilet' then '(?:^|[^а-я])(?:понос|говн|дерьм|срак|сран|срат|обоср|засран|жоп|перд[еиуя]|пердун|ссан|ссат|ссык|какаш|кака(?=[^а-я]|$)|дрист|моча(?=[^а-я]|$)|блев|блюв)'
    when 'en' then '(?:^|[^a-z])(?:f+u+c+k|fck|sh[i1]t|b[i1]tch|cunt|n[i1]gg|wh[o0]re|slut|d[i1]ck(?:s|head)?(?:[^a-z]|$)|cock(?!tail)|puss(?:y|ies)|fag|retard|asshole|bastard|motherf|wank|porn|nazi|hitler|rape|penis|vagina|poop|piss(?:[^a-z]|$)|crap(?:[^a-z]|$)|idiot|moron)'
    when 'link' then '(?:https?:|www\.|\.(?:ru|com|net|org|io|me|рф|su|xyz|top)(?:\W|$)|t\.me|@|telegram|vk\.com|whats ?app)'
  end
$$;

create or replace function public.is_rude(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare n text; c text;
begin
  if t is null or btrim(t) = '' then return false; end if;
  n := public.mod_norm(t); c := regexp_replace(n, '(.)\1+', '\1', 'g');
  return n ~ public.mod_re('mat') or c ~ public.mod_re('mat')
      or n ~ public.mod_re('insult') or c ~ public.mod_re('insult')
      or n ~ public.mod_re('hate') or c ~ public.mod_re('hate')
      or replace(n, ' ', '') ~ public.mod_re('sqz')
      or regexp_replace(lower(t), '[^a-z0-9 ]+', '', 'g') ~ public.mod_re('en');
end $$;

create or replace function public.is_bad_name(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare n text;
begin
  if t is null or btrim(t) = '' then return false; end if;
  n := public.mod_norm(t);
  return public.is_rude(t)
      or n ~ public.mod_re('toilet') or regexp_replace(n, '(.)\1+', '\1', 'g') ~ public.mod_re('toilet')
      or lower(t) ~ public.mod_re('link')
      or char_length(regexp_replace(t, '\D', '', 'g')) >= 5;
end $$;

create or replace function public.is_bad_title(t text) returns boolean language sql immutable set search_path = public as $$
  select public.is_bad_name(t)
$$;

-- Игрок: плохое имя → «Игрок XXXX», плохой отдел / профессия → пусто
create or replace function public.mod_player() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.is_bad_name(new.name) then new.name := 'Игрок ' || upper(left(md5(new.player_id::text), 4)); end if;
  if public.is_bad_name(new.dept) then new.dept := ''; end if;
  if public.is_bad_name(new.prof_custom) then new.prof_custom := null; end if;
  return new;
end $$;
drop trigger if exists mod_player on public.players;
create trigger mod_player before insert or update of name, dept, prof_custom on public.players
  for each row execute function public.mod_player();

create or replace function public.mod_score() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.is_bad_name(new.name) then new.name := 'Игрок'; end if;
  if public.is_bad_name(new.dept) then new.dept := ''; end if;
  return new;
end $$;
drop trigger if exists mod_score on public.scores;
create trigger mod_score before insert or update of name, dept on public.scores
  for each row execute function public.mod_score();

-- Сообщения и личка: отказ (текст ошибки игра покажет как есть)
create or replace function public.mod_message() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.is_rude(new.text) then raise exception 'Сообщение не отправлено: давайте без грубостей'; end if;
  return new;
end $$;
drop trigger if exists mod_message on public.messages;
create trigger mod_message before insert or update of text on public.messages for each row execute function public.mod_message();
drop trigger if exists mod_dm on public.direct_messages;
create trigger mod_dm before insert or update of text on public.direct_messages for each row execute function public.mod_message();

create or replace function public.mod_team() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.is_bad_name(new.name) then raise exception 'Такое название офиса не подойдёт — давайте без грубостей'; end if;
  return new;
end $$;
drop trigger if exists mod_team on public.teams;
create trigger mod_team before insert or update of name on public.teams for each row execute function public.mod_team();

create or replace function public.mod_suggestion() returns trigger
language plpgsql set search_path = public as $$
begin
  if public.is_rude(new.text) or public.is_rude(new.left_label) or public.is_rude(new.right_label) or public.is_bad_name(new.who) or public.is_bad_name(new.author)
    then raise exception 'Карточка не отправлена: давайте без грубостей'; end if;
  return new;
end $$;
drop trigger if exists mod_suggestion on public.suggestions;
create trigger mod_suggestion before insert on public.suggestions for each row execute function public.mod_suggestion();

-- Уже сохранённое: почистить имена, отделы, профессии, рейтинг; грубые сообщения скрыть
update public.players set name = name, dept = dept, prof_custom = prof_custom
  where public.is_bad_name(name) or public.is_bad_name(dept) or public.is_bad_name(prof_custom);
update public.scores set name = name, dept = dept where public.is_bad_name(name) or public.is_bad_name(dept);
update public.messages set hidden = true where not hidden and public.is_rude(text);

revoke all on function public.mod_player(), public.mod_score(), public.mod_message(), public.mod_team(), public.mod_suggestion() from public, anon, authenticated;
