// Автомодерация в игре: мат, оскорбления, ненависть, «туалетное», ссылки. Те же правила в базе — supabase/update-2026-11-03-moderation.sql (меняйте вместе).
// MOD.rude(t) — чат и личка, MOD.bad(t) — имя, отдел, офис, своя профессия. База всё равно проверит сама.
const MOD = (() => {
  const B = '(?:^|[^а-я])', E = '(?=[^а-я]|$)';
  const MAT = new RegExp(B + '(?:(?:за|на|от|по|при|вы|у|ра[зс]ъ?|до|съ|подъ?|объ?|изъ?|въ)?еб[аеиоуылнт]|ху[йеияю]|пизд|пезд|бля|муд[аои]к|мудил|сук[аи]' + E + '|сучк[аиеу]' + E + '|сучар|сукин|г[оа]ндон|залуп|пид[оа]р|пидр|педик|педераст|шлюх|шалав|долбо|дроч|манд[аеуы]' + E + '|трах[ан]|минет|оргазм|порно' + E + '|порнух|порнограф|порнхаб)');
  const INSULT = new RegExp(B + '(?:дебил|идиот|урод|ублюд|мраз|тварь|твари' + E + '|гнид|чмо|даун' + E + '|лох' + E + '|лошар|кретин|придур|дегенерат)');
  const HATE = new RegExp(B + '(?:нацист|фашист|гитлер|свастик|хохл(?:ы|ов|у|а|ушк)' + E + '|хохол|москал|жид' + E + '|жиды|жидов|чурк|хач' + E + '|хачик|негр' + E + '|негры|нигер' + E + '|нигеры|ниггер)');
  // Пошлое: интимные части тела и т. п. — и в чате, и в именах (владелец, 2026-11: «пися» — грубость)
  const VULGAR = new RegExp(B + '(?:пис[яюеи]' + E + '|писюн|писюх|письк|пипис|сись|сиси' + E + '|сиск[аи]' + E + '|сисяр|титьк|мошонк|вагин[аеуы]' + E + '|вагинальн|пенис|сперм|елд[аы]' + E + '|елдак|шмар[аы]' + E + '|давалк|отсос|соси' + E + '|хер' + E + '|херн|херов|херас|хуйн)');
  const SQZ = /пизд|пезд|бляд|блять|залуп|пидор|пидар|гандон|гондон|шлюх|долбоеб|мудак|мудил|уебок|уебан|ниггер/;
  const TOILET = new RegExp(B + '(?:понос|говн|поп[аеуы]' + E + '|попк[аеиу]' + E + '|очко' + E + '|член' + E + '|задниц|туалетн|унитаз|секс|трах|дерьм|срак|сран|срат|обоср|засран|жоп|перд[еиуя]|пердун|ссан|ссат|ссык|какаш|кака' + E + '|дрист|моча' + E + '|блев|блюв)');
  const EN = /(?:^|[^a-z])(?:f+u+c+k|fck|sh[i1]t|b[i1]tch|cunt|n[i1]gg|wh[o0]re|slut|d[i1]ck(?:s|head)?(?:[^a-z]|$)|cock(?!tail)|puss(?:y|ies)|fag|retard|asshole|bastard|motherf|wank|porn|nazi|hitler|rape|penis|vagina|poop|piss(?:[^a-z]|$)|crap(?:[^a-z]|$)|idiot|moron)/;
  const LINK = /https?:|www\.|\.(?:ru|com|net|org|io|me|рф|su|xyz|top)(?:\W|$)|t\.me|@|telegram|vk\.com|whats ?app/;
  const FROM = 'aeopcxykmthb3046@ёu1', TO = 'аеорсхукмтнвзочбаеии';
  const norm = t => [...String(t || '').toLowerCase()].map(c => { const i = FROM.indexOf(c); return i < 0 ? c : TO[i]; }).join('')
    .replace(/[^а-я0-9 ]+/g, '').replace(/\s+/g, ' ').trim()
    .replace(/(?:^| )((?:[а-я] ){2,}[а-я])(?= |$)/g, m => ' ' + m.replace(/ /g, ''));  // «х у й» → «хуй»
  // Латиница «по звучанию»: pisya → пися, blyat → блять (двойники вида xyй ловит norm)
  const TR2 = [['shch', 'щ'], ['sch', 'щ'], ['sh', 'ш'], ['ch', 'ч'], ['zh', 'ж'], ['kh', 'х'], ['ts', 'ц'], ['ya', 'я'], ['yu', 'ю'], ['yo', 'е'], ['ye', 'е'], ['ja', 'я'], ['ju', 'ю'], ['uy', 'уй'], ['iy', 'ий'], ['ey', 'ей'], ['oy', 'ой'], ['ay', 'ай']];
  const TR1 = { a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'х', y: 'ы', z: 'з' };
  const translit = t => { let x = String(t || '').toLowerCase(); if (!/[a-z]/.test(x)) return ''; for (const [a, b] of TR2) x = x.split(a).join(b); return x.replace(/[a-z]/g, ch => TR1[ch]); };
  const rude = t => rude1(t) || (translit(t) ? rude1(translit(t)) : false);
  const rude1 = t => {
    const n = norm(t), c = n.replace(/(.)\1+/g, '$1'), s = n.replace(/ /g, ''), l = String(t || '').toLowerCase().replace(/[^a-z0-9 ]+/g, '');
    return [n, c].some(x => MAT.test(x) || INSULT.test(x) || HATE.test(x) || VULGAR.test(x)) || SQZ.test(s) || EN.test(l);
  };
  const bad = t => bad1(t) || (translit(t) ? bad1(translit(t)) : false);
  const bad1 = t => {
    const n = norm(t), c = n.replace(/(.)\1+/g, '$1'), l = String(t || '').toLowerCase();
    return rude1(t) || TOILET.test(n) || TOILET.test(c) || LINK.test(l) || (String(t || '').match(/\d/g) || []).length >= 5;
  };
  return { rude, bad };
})();

