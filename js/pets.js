// Домашние питомцы персонажа: кошки, собаки, попугаи, рыбки — 22 породы и окраса, до трёх питомцев.
// У питомцев свои потребности: корм, лакомства, игрушки, ветеринар, прививки, груминг и т. д. Корм нужен каждую неделю:
// не купили — питомец грустит, и это огорчает персонажа. Питомцы «просят» посреди недели, как дети.
// Покупка — мультик с питомцем в 3D (ест из миски, играет, у ветеринара). Данные — C.hero.pets; 3D — js/pets3d.js.

const PET_KINDS = {
  cat: { ico: '🐱', t: L('Кошка', 'Cat'), price: 12, names: L(['Барсик', 'Мурка', 'Пушок', 'Симба', 'Маркиза', 'Персик', 'Тиша', 'Луна'], ['Tiger', 'Misty', 'Fluffy', 'Simba', 'Luna', 'Peach', 'Milo', 'Cleo']) },
  dog: { ico: '🐶', t: L('Собака', 'Dog'), price: 15, names: L(['Шарик', 'Бобик', 'Рекс', 'Джесси', 'Лаки', 'Граф', 'Булка', 'Тайсон'], ['Buddy', 'Rex', 'Lucky', 'Max', 'Bella', 'Duke', 'Biscuit', 'Rocky']) },
  parrot: { ico: '🦜', t: L('Попугай', 'Parrot'), price: 8, names: L(['Кеша', 'Гоша', 'Рио', 'Чика', 'Жако', 'Петруша'], ['Polly', 'Kiwi', 'Rio', 'Mango', 'Coco', 'Sunny']) },
  fish: { ico: '🐠', t: L('Рыбка', 'Fish'), price: 6, names: L(['Немо', 'Голди', 'Бульк', 'Дори', 'Искра', 'Адмирал'], ['Nemo', 'Goldie', 'Bubbles', 'Dory', 'Sparky', 'Admiral']) },
};
const PET_BREEDS = [
  { id: 'cat_british', kind: 'cat', t: L('Британская голубая', 'British Shorthair'), color: '#8a93a3', eyes: '#e8a33a', size: 1.08 },
  { id: 'cat_ginger', kind: 'cat', t: L('Рыжий полосатый', 'Ginger tabby'), color: '#e8892f', stripes: '#b85f18', face: '#f6dcc0', eyes: '#7ac943' },
  { id: 'cat_siamese', kind: 'cat', t: L('Сиамская', 'Siamese'), color: '#efe2c8', points: '#4a3428', mask: true, eyes: '#4aa3ff' },
  { id: 'cat_mainecoon', kind: 'cat', t: L('Мейн-кун', 'Maine Coon'), color: '#8a6a4a', stripes: '#4f3a28', face: '#e8dcc8', tufts: true, fluffy: true, mane: true, size: 1.25, eyes: '#c9a23a' },
  { id: 'cat_sphynx', kind: 'cat', t: L('Сфинкс', 'Sphynx'), color: '#e8b8a8', ears: 'big', eyes: '#7ac943' },
  { id: 'cat_black', kind: 'cat', t: L('Чёрный кот', 'Black cat'), color: '#1e1e24', eyes: '#f2c84a', collar: '#e0153f' },
  { id: 'dog_corgi', kind: 'dog', t: L('Корги', 'Corgi'), color: '#e0903a', belly: true, alt: '#f6efe4', face: '#f6efe4', shortLegs: true, ears: 'big', stub: true, collar: '#2563c9' },
  { id: 'dog_lab', kind: 'dog', t: L('Лабрадор', 'Labrador'), color: '#e2b866', ears: 'floppy', size: 1.2, collar: '#e0153f' },
  { id: 'dog_dachshund', kind: 'dog', t: L('Такса', 'Dachshund'), color: '#7a3e1e', ears: 'floppy', long: true, shortLegs: true, earColor: '#5a2c14' },
  { id: 'dog_husky', kind: 'dog', t: L('Хаски', 'Husky'), color: '#7d838e', belly: true, alt: '#f2f2f2', face: '#f4f4f4', eyes: '#4aa3ff', curl: true, size: 1.12 },
  { id: 'dog_pug', kind: 'dog', t: L('Мопс', 'Pug'), color: '#d9bf94', muzzle: '#2a2420', earColor: '#2a2420', ears: 'floppy', flat: true, curl: true, size: 0.85 },
  { id: 'dog_spitz', kind: 'dog', t: L('Шпиц', 'Pomeranian'), color: '#f0a040', mane: true, curl: true, size: 0.8 },
  { id: 'dog_black', kind: 'dog', t: L('Чёрный терьер', 'Black terrier'), color: '#24242a', ears: 'floppy', size: 1.15, collar: '#ffb02e' },
  { id: 'par_budgie_g', kind: 'parrot', t: L('Волнистый, зелёный', 'Budgie, green'), color: '#7ac943', head: '#f2e14a', alt: '#5a9a2a', beak: '#f0d9a0' },
  { id: 'par_budgie_b', kind: 'parrot', t: L('Волнистый, голубой', 'Budgie, blue'), color: '#5aa0e6', head: '#ffffff', alt: '#3a70b0', beak: '#f0d9a0' },
  { id: 'par_cockatoo', kind: 'parrot', t: L('Какаду', 'Cockatoo'), color: '#f5f5f0', crest: '#f6d23a', beak: '#3a3a3a' },
  { id: 'par_ara', kind: 'parrot', t: L('Ара', 'Macaw'), color: '#d8262c', alt: '#2a63c9', tail: '#2a63c9', beak: '#f0e8d8', longTail: true },
  { id: 'par_cockatiel', kind: 'parrot', t: L('Корелла', 'Cockatiel'), color: '#9a9a9a', head: '#f2d14a', crest: '#f2d14a', cheek: '#ff8c1a', longTail: true },
  { id: 'fish_gold', kind: 'fish', t: L('Золотая рыбка', 'Goldfish'), color: '#ff8c1a', alt: '#ffb45a', bigTail: true },
  { id: 'fish_guppy', kind: 'fish', t: L('Гуппи', 'Guppy'), color: '#c9d4e0', alt: '#ff5c8a', bigTail: true, slim: true },
  { id: 'fish_betta', kind: 'fish', t: L('Петушок', 'Betta'), color: '#c9184a', alt: '#7a0a2a', bigTail: true },
  { id: 'fish_neon', kind: 'fish', t: L('Неон', 'Neon tetra'), color: '#2a6ad6', stripe: '#2de2e6', alt: '#e0153f', slim: true },
];
const petBreed = id => PET_BREEDS.find(b => b.id === id) || PET_BREEDS[0];

// Покупки для питомцев. for — каким видам; every — повторять раз в N недель (корм — каждую неделю, прививка — раз в 26);
// toon: feed — ест, play — играет, vet — у ветеринара, groom — груминг
const PET_GOODS = [
  { id: 'p_food', ico: '🥣', price: 2, mood: 10, every: 1, toon: 'feed', t: L('Корм на неделю', 'Food for a week') },
  { id: 'p_treat', ico: '🍖', price: 1, mood: 6, toon: 'feed', for: ['cat', 'dog'], t: L('Лакомство', 'Treat') },
  { id: 'p_seeds', ico: '🌻', price: 1, mood: 6, toon: 'feed', for: ['parrot'], t: L('Семечки и фрукты', 'Seeds and fruit') },
  { id: 'p_mouse', ico: '🐭', price: 2, mood: 9, toon: 'play', for: ['cat'], t: L('Игрушечная мышка', 'Toy mouse') },
  { id: 'p_teaser', ico: '🪶', price: 3, mood: 10, toon: 'play', for: ['cat'], t: L('Удочка-дразнилка', 'Feather teaser') },
  { id: 'p_scratch', ico: '🪵', price: 4, mood: 10, own: true, toon: 'play', for: ['cat'], t: L('Когтеточка', 'Scratching post') },
  { id: 'p_litter', ico: '🪣', price: 2, mood: 5, every: 2, toon: 'groom', for: ['cat'], t: L('Наполнитель для лотка', 'Cat litter') },
  { id: 'p_ball', ico: '🎾', price: 2, mood: 10, toon: 'play', for: ['dog'], t: L('Мячик', 'Ball') },
  { id: 'p_bone', ico: '🦴', price: 2, mood: 9, toon: 'play', for: ['dog'], t: L('Косточка', 'Chew bone') },
  { id: 'p_leash', ico: '🦮', price: 4, mood: 12, own: true, toon: 'play', for: ['dog'], t: L('Поводок и прогулка в парке', 'Leash and a walk in the park') },
  { id: 'p_bed', ico: '🛏️', price: 6, mood: 12, own: true, toon: 'play', for: ['cat', 'dog'], t: L('Лежанка', 'Pet bed') },
  { id: 'p_groom', ico: '✂️', price: 5, mood: 10, every: 4, toon: 'groom', for: ['cat', 'dog'], t: L('Груминг', 'Grooming') },
  { id: 'p_bell', ico: '🔔', price: 2, mood: 9, toon: 'play', for: ['parrot'], t: L('Колокольчик и зеркальце', 'Bell and mirror') },
  { id: 'p_cage', ico: '🏠', price: 10, mood: 16, own: true, toon: 'play', for: ['parrot'], t: L('Просторная клетка', 'A bigger cage') },
  { id: 'p_castle', ico: '🏰', price: 3, mood: 9, own: true, toon: 'play', for: ['fish'], t: L('Замок для аквариума', 'Aquarium castle') },
  { id: 'p_tank', ico: '🫧', price: 12, mood: 16, own: true, toon: 'play', for: ['fish'], t: L('Аквариум побольше с фильтром', 'Bigger tank with a filter') },
  { id: 'p_vet', ico: '🩺', price: 6, mood: 8, every: 8, toon: 'vet', t: L('Осмотр у ветеринара', 'Vet check-up') },
  { id: 'p_vaccine', ico: '💉', price: 5, mood: 4, every: 26, toon: 'vet', for: ['cat', 'dog'], t: L('Прививка', 'Vaccination') },
];
const petGoodsFor = p => PET_GOODS.filter(x => !x.for || x.for.includes(p.kind));
const petState = (x, p, week) => x.own && p.have.includes(x.id) ? { st: 'owned' } : x.every && p.last[x.id] != null && week - p.last[x.id] < x.every ? { st: 'paid', left: x.every - (week - p.last[x.id]) } : { st: 'open' };
const PET_MAX = 3;
const petVoice = p => ({ cat: { fem: true, kid: true }, dog: { fem: false }, parrot: { fem: true, kid: true }, fish: { fem: true, kid: true } })[p.kind];
const petLine = p => lineFor('pet_' + p.kind, false);
// «Спасибо» за покупку питомцу — без реплик про чужой вид («котик» для собаки и т. п.)
const PET_WORDS = { cat: /кот|кош|мур|когт/i, dog: /пёс|пес|собак|щен|гав|лап/i, parrot: /попуг|птич|перь|клетк/i, fish: /рыб|аквари|буль/i };
function petThanks(p, fem) {
  const pool = (LINES.pet_thanks || []).filter(t => Object.entries(PET_WORDS).every(([k, re]) => k === p.kind || !re.test(t)));
  return genderLine(pool.length ? rnd(pool) : lineFor('thanks', fem), fem);
}

// ---------- завести питомца ----------
function petAdopt(after) {
  const C2 = careerNow(), h = C2?.hero; if (!h) return;
  h.pets ||= [];
  if (h.pets.length >= PET_MAX) return toast(L(`Больше ${PET_MAX} питомцев не поместится в квартиру`, `No room for more than ${PET_MAX} pets`));
  dropView();
  const m = $('modal');
  let kind = 'cat', breed = PET_BREEDS[0], view = null, name = '';
  const close = () => { view?.dispose(); view = null; m.hidden = true; };
  const render = () => {
    const k = PET_KINDS[kind], can = C2.bank >= k.price;
    m.innerHTML = `<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="paTitle">
      <h2 id="paTitle">🐾 ${L('Завести питомца', 'Adopt a pet')}</h2>
      <div class="pa-kinds">${Object.entries(PET_KINDS).map(([id, x]) => `<button type="button" class="btn-chip${id === kind ? ' on' : ''}" data-kind="${id}">${x.ico} ${esc(x.t)}</button>`).join('')}</div>
      <canvas class="pet-cv" aria-label="${L('Питомец в 3D', '3D pet')}"></canvas>
      <div class="pa-breeds">${PET_BREEDS.filter(b => b.kind === kind).map(b => `<button type="button" class="btn-chip${b === breed ? ' on' : ''}" data-breed="${b.id}"><i style="background:${b.color}"></i>${esc(b.t)}</button>`).join('')}</div>
      <label class="field"><span>${L('Кличка', 'Name')}</span><input type="text" id="paName" maxlength="14" autocomplete="off" value="${esc(name || rnd(k.names))}"></label>
      <p class="hero-lead">${L(`${k.t} — ${money(k.price)}. Потом — корм каждую неделю, игрушки, ветеринар.`, `${k.t} — ${money(k.price)}. Then food every week, toys, vet visits.`)}</p>
      ${can ? `<button class="btn-main" type="button" id="paGo">🏡 ${L(`Забрать домой за ${money(k.price)}`, `Take home for ${money(k.price)}`)}</button>` : topupBtn(lackOf(k.price), '', L(`${k.t} стоит ${money(k.price)} · на счёте ${money(C2.bank)}`, `${k.t} costs ${money(k.price)} · you have ${money(C2.bank)}`), 'btn-main tu-btn')}
      <button class="btn-ghost" type="button" id="paBack">${L('Назад', 'Back')}</button></div>`;
    m.hidden = false;
    const cv = m.querySelector('.pet-cv');
    view?.dispose(); view = null;
    petViewer(cv, breed, { action: 'happy' }).then(v => { if (v && cv.isConnected && !m.hidden) view = v; else v?.dispose(); });
    $('paName').oninput = e => { name = e.target.value; };
    m.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { kind = b.dataset.kind; breed = PET_BREEDS.find(x => x.kind === kind); name = ''; render(); });
    m.querySelectorAll('[data-breed]').forEach(b => b.onclick = () => { breed = petBreed(b.dataset.breed); m.querySelectorAll('[data-breed]').forEach(x => x.classList.toggle('on', x === b)); view?.setSpec(breed); view?.setAction('happy'); });
    if ($('paGo')) $('paGo').onclick = () => {
      const nm = ($('paName').value || rnd(k.names)).trim().slice(0, 14) || rnd(k.names);
      C2.bank -= k.price; C2.spent = (C2.spent || 0) + k.price;
      const p = { id: 'p' + Date.now().toString(36), kind, breed: breed.id, name: nm, mood: 80, have: [], last: { p_food: C2.week } };
      h.pets.push(p); h.mood = Math.min(100, (h.mood ?? 70) + 15);
      careerSave(C2); track('pet_adopt', { detail: breed.id });
      close(); petToon('adopt', p, null, after);
    };
    $('paBack').onclick = () => { close(); after?.(); };
  };
  render();
}

// ---------- покупки для питомца ----------
let petReopen = null;
function petShop(i, after) {
  const C2 = careerNow(), h = C2?.hero, p = h?.pets?.[i]; if (!p) return after?.();
  const m = $('modal'), k = PET_KINDS[p.kind];
  petReopen = () => petShop(i, after);
  dropView();
  let view = null;
  const close = () => { view?.dispose(); view = null; m.hidden = true; };
  m.innerHTML = `<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="psTitle">
    <h2 id="psTitle">${k.ico} ${esc(p.name)} · ${esc(petBreed(p.breed).t)}</h2>
    <canvas class="pet-cv small" aria-label="${esc(p.name)}"></canvas>
    <p class="hero-lead">${L(`Настроение ${p.mood}/100 · на счёте ${money(C2.bank)}`, `Mood ${p.mood}/100 · balance ${money(C2.bank)}`)}${p.last.p_food !== C2.week ? ` · <b class="pet-hungry">${L('🥣 ждёт корм на эту неделю', '🥣 waiting for this week’s food')}</b>` : ''}</p>
    <div class="gp-list">${petGoodsFor(p).map(x => {
      const s = petState(x, p, C2.week), short = C2.bank < x.price;
      return `<div class="gp-item${s.st !== 'open' ? ' worn' : short ? ' short' : ''}"><span class="gp-ico" aria-hidden="true">${x.ico}</span>
        <span class="gp-txt"><b>${esc(x.t)}</b><small>${s.st === 'owned' ? L('уже есть', 'owned') : s.st === 'paid' ? L(`снова через ${s.left} нед.`, `again in ${s.left} wk`) : `${money(x.price)} · ${L(`радость +${x.mood}`, `joy +${x.mood}`)}${x.every ? L(` · раз в ${x.every} нед.`, ` · every ${x.every} wk`) : ''}`}</small></span>
        ${s.st !== 'open' ? `<em class="gp-own">✓</em>` : short ? `<button type="button" class="btn-chip tu-btn" data-topup="${lackOf(x.price)}" data-topup-back="pet" data-topup-why="${esc(`${p.name}: ${x.t} — ${money(x.price)}`)}">💰 ${L(`не хватает ${lackOf(x.price)}`, `${money(lackOf(x.price))} short`)}</button>`
          : `<button type="button" class="btn-chip" data-pbuy="${x.id}">${L('Купить', 'Buy')} · ${money(x.price)}</button>`}</div>`;
    }).join('')}</div>
    <button class="btn-ghost" type="button" id="psClose">${L('Назад', 'Back')}</button></div>`;
  m.hidden = false;
  const cv = m.querySelector('.pet-cv');
  petViewer(cv, petBreed(p.breed), { action: p.mood < 40 ? 'sad' : null }).then(v => { if (v && cv.isConnected && !m.hidden) view = v; else v?.dispose(); });
  cv.addEventListener('click', () => { const t = petLine(p); say(t, petVoice(p)); toast(`${p.name}: «${t}»`); view?.setAction('happy'); });
  m.querySelectorAll('[data-pbuy]').forEach(b => b.onclick = () => { close(); petReopen = null; buyPet(p, PET_GOODS.find(x => x.id === b.dataset.pbuy), after); });
  $('psClose').onclick = () => { close(); petReopen = null; after?.(); };
}

function buyPet(p, x, after) {
  const C2 = careerNow(), h = C2.hero, pp = h.pets.find(q => q.id === p.id) || p;
  if (C2.bank < x.price) return;
  C2.bank -= x.price; C2.spent = (C2.spent || 0) + x.price;
  pp.mood = Math.min(100, (pp.mood ?? 70) + x.mood); h.mood = Math.min(100, (h.mood ?? 70) + Math.ceil(x.mood / 3));
  if (x.own) pp.have.push(x.id); if (x.every) pp.last[x.id] = C2.week;
  careerSave(C2); sfx.coins?.();
  track('hero_buy', { detail: `pet:${x.id}:${x.price}` });
  if (typeof S !== 'undefined' && S?.mode === 'career' && !views.game.hidden) renderBars?.();
  petToon(x.toon, pp, x, after);
}

// ---------- мультик с питомцем ----------
// adopt — новый член семьи, feed — ест из миски, play — играет с игрушкой, vet — у ветеринара, groom — пена и ножницы
function petToon(kind, p, x, after) {
  const m = $('modal'), C2 = careerNow(), h = C2.hero;
  dropView();
  const D = RM.matches ? 3500 : { adopt: 8000, feed: 7000, play: 7500, vet: 8000, groom: 7500 }[kind];
  const nm = esc(p.name), item = x?.ico || '💖';
  const caps = {
    adopt: [L(`Знакомьтесь: ${nm}!`, `Meet ${nm}!`), L('Новый член семьи осматривается…', 'The new family member looks around…'), L('Любовь с первого взгляда', 'Love at first sight')],
    feed: [L(`${nm} слышит шуршание пакета…`, `${nm} hears the bag rustle…`), L('Ням-ням-ням!', 'Nom-nom-nom!'), L('Сыт и доволен', 'Full and happy')],
    play: [L('Новая игрушка!', 'A new toy!'), L(`${nm} в восторге`, `${nm} is thrilled`), L('Лучший день!', 'Best day ever!')],
    vet: [L('Ветеринарная клиника', 'The vet clinic'), L('Немножко страшно… но доктор добрый', 'A little scary… but the vet is kind'), L(`${nm} здоров!`, `${nm} is healthy!`)],
    groom: [L('Салон для питомцев', 'Pet salon'), L('Пена, шампунь, расчёска…', 'Foam, shampoo, comb…'), L('Красавец!', 'Gorgeous!')],
  }[kind];
  const deco = { adopt: '🎀', feed: '🥣', play: '✨', vet: '🩺', groom: '🫧' }[kind];
  m.innerHTML = `<div class="modal-box glass toon-box" role="dialog" aria-modal="true" aria-label="${L('Мультик', 'Cartoon')}">
    <div class="toon toon-pet pet-${kind}" style="--dur:${D}ms">${kind === 'vet' ? '<span class="tn-cross">✚</span>' : ''}${Array.from({ length: 8 }, (_, i) => `<span class="tn-rain" style="--i:${i}">${deco}</span>`).join('')}<canvas class="toon-cv"></canvas><div class="tn-hearts"></div>
      <p class="tn-cap" aria-live="polite">${caps[0]}</p><p class="tn-say" hidden></p><div class="tn-bar"><i></i></div></div>
    <p class="tn-sum">${PET_KINDS[p.kind].ico} ${nm}${x ? ` · ${x.ico} ${esc(x.t)}` : ` · ${esc(petBreed(p.breed).t)}`} · ${L(`настроение ${p.mood}/100`, `mood ${p.mood}/100`)} · ${L('на счёте', 'balance')} ${money(C2.bank)}</p>
    <button class="btn-ghost" type="button" id="tnSkip">${L('Пропустить ⏭', 'Skip ⏭')}</button></div>`;
  m.hidden = false;
  const stage = m.querySelector('.toon'), cv = m.querySelector('.toon-cv');
  let view = null, timers = [], over = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const cap = i => { const el = stage.querySelector('.tn-cap'); if (caps[i]) { el.textContent = caps[i]; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); } };
  const bubble = (t, voice) => { const b = stage.querySelector('.tn-say'); b.textContent = `«${t}»`; b.hidden = false; say(t, voice); };
  const hearts = () => { stage.querySelector('.tn-hearts').innerHTML = Array.from({ length: 9 }, (_, i) => `<span style="--i:${i}">${['💖', '🐾', '✨'][i % 3]}</span>`).join(''); };
  petViewer(cv, petBreed(p.breed), { action: kind === 'vet' ? 'sad' : null, interactive: false, yawRest: -0.6, stage: true }).then(v => {
    if (!v || over) return v?.dispose(); view = v;
    if (kind === 'feed') v.hold(item === '🍖' || item === '🌻' ? item : '🥣');
    if (kind === 'play' || kind === 'groom' || kind === 'vet') v.hold(item, 0.2);
  });
  stage.classList.add('go');
  at(D * 0.3, () => { cap(1); view?.setAction({ adopt: 'play', feed: 'eat', play: 'play', vet: 'sad', groom: 'happy' }[kind]); sfx.item?.(); });
  at(D * 0.55, () => bubble(petLine(p), petVoice(p)));
  at(D * 0.72, () => { cap(2); view?.setAction('happy'); hearts(); if (kind === 'vet') view?.hold(null); });
  at(D * 0.82, () => bubble(petThanks(p, heroFem(h)), heroVoice(h)));
  const finish = () => {
    if (over) return; over = true;
    timers.forEach(clearTimeout); view?.dispose(); m.hidden = true;
    if (!views.menu.hidden) renderMenu();
    after?.();
  };
  at(D, finish);
  $('tnSkip').onclick = finish;
}

// ---------- желания питомцев посреди недели и голод ----------
const PET_ASK = {
  cat: [L('мяукает у пустой миски', 'meows at the empty bowl'), L('точит когти о диван — намекает на когтеточку', 'is scratching the sofa — hinting at a scratching post'), L('тащит вам носок. Поиграем?', 'is dragging a sock over. Play time?')],
  dog: [L('гремит пустой миской', 'is rattling the empty bowl'), L('сидит у двери с поводком в зубах', 'is sitting by the door with the leash in its mouth'), L('смотрит на вас глазами кота из «Шрека»', 'is giving you the puppy eyes'), L('грызёт тапок — пора купить косточку', 'is chewing a slipper — time for a bone')],
  parrot: [L('кричит «Кор-р-рм!» на всю квартиру', 'is yelling “Food!” across the flat'), L('скучает и разговаривает с отражением', 'is bored and talking to its reflection')],
  fish: [L('выразительно булькает у кормушки', 'is bubbling meaningfully by the feeder'), L('плавает кругами — в аквариуме скучновато', 'is swimming in circles — the tank is a bit dull')],
};
function petWishPop(p) {
  const h = C.hero, k = PET_KINDS[p.kind], hungry = p.last.p_food !== C.week;
  const want = hungry ? PET_GOODS[0] : rnd(petGoodsFor(p).filter(x => petState(x, p, C.week).st === 'open' && x.id !== 'p_food')) || PET_GOODS[0];
  busy = true; sfx.sms?.();
  const done = () => { busy = false; renderBars?.(); };
  const ask = hungry ? PET_ASK[p.kind][0] : rnd(PET_ASK[p.kind]);
  const m = $('modal');
  let view = null;
  const close = () => { view?.dispose(); view = null; m.hidden = true; };
  m.innerHTML = `<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="pwTitle">
    <canvas class="pet-cv" aria-label="${esc(p.name)}"></canvas>
    <div class="hero-bubble"><b id="pwTitle">${k.ico} ${esc(p.name)} ${esc(ask)}</b><p class="say">«${esc(petLine(p))}»</p><span>${want.ico} ${esc(want.t)} · ${money(want.price)} · ${L('на счёте', 'balance')} ${money(C.bank)}</span></div>
    <div class="hero-acts">${C.bank >= want.price ? `<button class="btn-main" type="button" id="pwBuy">${want.ico} ${L(`Купить за ${money(want.price)}`, `Buy for ${money(want.price)}`)}</button>` : topupBtn(lackOf(want.price), 'petWish', `${p.name}: ${want.t} — ${money(want.price)}`, 'btn-main tu-btn')}
      <button class="btn-link" type="button" id="pwNo">${L(`Потом (${p.name} загрустит)`, `Later (${p.name} will be sad)`)}</button></div></div>`;
  m.hidden = false;
  petWishBack = () => petWishPop(p);
  const cv = m.querySelector('.pet-cv');
  petViewer(cv, petBreed(p.breed), { action: hungry ? 'sad' : 'happy' }).then(v => { if (v && cv.isConnected && !m.hidden) view = v; else v?.dispose(); });
  setTimeout(() => say(m.querySelector('.say')?.textContent.replace(/[«»]/g, ''), petVoice(p)), 400);
  if ($('pwBuy')) $('pwBuy').onclick = () => { close(); buyPet(p, want, done); };
  $('pwNo').onclick = () => { p.mood = Math.max(0, p.mood - 8); h.mood = Math.max(0, (h.mood ?? 70) - 3); saveCareer(); close(); toast(L(`${p.name} грустит`, `${p.name} is sad`)); done(); };
}
let petWishBack = null;

// Конец недели: настроение питомцев падает; без корма — сильнее, и это огорчает персонажа. Счастливые питомцы радуют
bus.on('weekEnd', x => {
  if (x.mode !== 'career') return;
  const C2 = careerNow(), h = C2?.hero; if (!h?.pets?.length) return;
  let hungry = 0;
  for (const p of h.pets) {
    const fed = p.last.p_food === C2.week - 1 || p.last.p_food === C2.week;
    p.mood = Math.max(0, p.mood - (fed ? 5 : 15)); if (!fed) hungry++;
  }
  const avg = h.pets.reduce((s, p) => s + p.mood, 0) / h.pets.length;
  h.mood = Math.max(0, Math.min(100, (h.mood ?? 70) + Math.round((avg - 55) / 10) - hungry * 4));
  careerSave(C2);
  if (hungry) setTimeout(() => toast(L(`🥣 Питомцы голодные (${hungry}) — купите корм, ${h.name} переживает`, `🥣 ${hungry} hungry pet(s) — buy food, ${h.name} is worried`)), 2600);
});

const petsHtml = h => `<span class="hero-kids">${(h.pets || []).map((p, i) => `<button type="button" class="btn-chip" data-pet="${i}" title="${L('Настроение', 'Mood')} ${p.mood}/100">${PET_KINDS[p.kind].ico} ${esc(p.name)}${p.mood < 40 ? ' 😿' : ''}</button>`).join('')}${(h.pets || []).length < PET_MAX ? `<button type="button" class="btn-chip" data-adopt="1">＋🐾 ${L('Завести питомца', 'Adopt a pet')}</button>` : ''}</span>`;
const bindPets = (root, after) => {
  root.querySelectorAll('[data-pet]').forEach(b => b.onclick = () => petShop(+b.dataset.pet, after));
  root.querySelectorAll('[data-adopt]').forEach(b => b.onclick = () => petAdopt(after));
};
