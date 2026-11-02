-- Автомодерация, часть 2 (владелец: «пися» прошла фильтр — это грубость).
--   vulgar — пошлое (интимные части тела и т. п.): в чате и в именах; toilet расширен («попа», «очко», «секс»…) — только имена.
--   mod_translit — латиница «по звучанию»: pisya → пися, blyat → блять (двойники вида xyй ловит mod_norm).
-- Те же правила в игре — js/moder.js (меняйте вместе).

create or replace function public.mod_translit(t text) returns text
language plpgsql immutable set search_path = public as $$
declare x text := lower(coalesce(t, '')); p text[];
begin
  if x !~ '[a-z]' then return ''; end if;
  foreach p slice 1 in array array[['shch','щ'],['sch','щ'],['sh','ш'],['ch','ч'],['zh','ж'],['kh','х'],['ts','ц'],['ya','я'],['yu','ю'],['yo','е'],['ye','е'],['ja','я'],['ju','ю'],['uy','уй'],['iy','ий'],['ey','ей'],['oy','ой'],['ay','ай']] loop
    x := replace(x, p[1], p[2]);
  end loop;
  return translate(x, 'abcdefghijklmnopqrstuvwxyz', 'абкдефгхийклмнопкрстуввхыз');
end $$;

create or replace function public.mod_re2(k text) returns text language sql immutable as $re$
  select case k
    when 'vulgar' then '(?:^|[^а-я])(?:пис[яюеи](?=[^а-я]|$)|писюн|писюх|письк|пипис|сись|сиси(?=[^а-я]|$)|сиск[аи](?=[^а-я]|$)|сисяр|титьк|мошонк|вагин[аеуы](?=[^а-я]|$)|вагинальн|пенис|сперм|елд[аы](?=[^а-я]|$)|елдак|шмар[аы](?=[^а-я]|$)|давалк|отсос|соси(?=[^а-я]|$)|хер(?=[^а-я]|$)|херн|херов|херас|хуйн)'
    when 'toilet' then '(?:^|[^а-я])(?:понос|говн|поп[аеуы](?=[^а-я]|$)|попк[аеиу](?=[^а-я]|$)|очко(?=[^а-я]|$)|член(?=[^а-я]|$)|задниц|туалетн|унитаз|секс|трах|дерьм|срак|сран|срат|обоср|засран|жоп|перд[еиуя]|пердун|ссан|ссат|ссык|какаш|кака(?=[^а-я]|$)|дрист|моча(?=[^а-я]|$)|блев|блюв)'
  end
$re$;

-- одна проверка без транслита
create or replace function public.is_rude1(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare n text; c text;
begin
  if t is null or btrim(t) = '' then return false; end if;
  n := public.mod_norm(t); c := regexp_replace(n, '(.)\1+', '\1', 'g');
  return n ~ public.mod_re('mat') or c ~ public.mod_re('mat')
      or n ~ public.mod_re('insult') or c ~ public.mod_re('insult')
      or n ~ public.mod_re('hate') or c ~ public.mod_re('hate')
      or n ~ public.mod_re2('vulgar') or c ~ public.mod_re2('vulgar')
      or replace(n, ' ', '') ~ public.mod_re('sqz')
      or regexp_replace(lower(t), '[^a-z0-9 ]+', '', 'g') ~ public.mod_re('en');
end $$;

create or replace function public.is_rude(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare tr text := public.mod_translit(t);
begin
  return public.is_rude1(t) or (tr <> '' and public.is_rude1(tr));
end $$;

create or replace function public.is_bad_name1(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare n text;
begin
  if t is null or btrim(t) = '' then return false; end if;
  n := public.mod_norm(t);
  return public.is_rude1(t)
      or n ~ public.mod_re2('toilet') or regexp_replace(n, '(.)\1+', '\1', 'g') ~ public.mod_re2('toilet')
      or lower(t) ~ public.mod_re('link')
      or char_length(regexp_replace(t, '\D', '', 'g')) >= 5;
end $$;

create or replace function public.is_bad_name(t text) returns boolean
language plpgsql immutable set search_path = public as $$
declare tr text := public.mod_translit(t);
begin
  return public.is_bad_name1(t) or (tr <> '' and public.is_bad_name1(tr));
end $$;

-- Уже сохранённое: почистить (триггеры mod_player / mod_score заменят имя и отдел), грубые сообщения скрыть
update public.players set name = name, dept = dept, prof_custom = prof_custom
  where public.is_bad_name(name) or public.is_bad_name(dept) or public.is_bad_name(prof_custom);
update public.scores set name = name, dept = dept where public.is_bad_name(name) or public.is_bad_name(dept);
update public.messages set hidden = true where not hidden and public.is_rude(text);
