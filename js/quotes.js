// «Цитаты»: слова великих людей о работе, успехе, неудачах, упорстве, команде, лидерстве, отдыхе, деньгах и юморе.
// Данные — data/quotes.json ({ ru, en, who_ru, who_en, tag, source?, attr? }), грузятся лениво, только когда нужны.
// Где показываем: 1) «Цитата дня» в главном меню — одна на день для всех (по дате), «↻» — другая, «Поделиться»;
// 2) на экране итогов недели — короткая цитата под результатом (победа: успех/упорство/юмор; увольнение: неудача/упорство/юмор);
// 3) утро понедельника в карьере — ненавязчивая плашка на несколько секунд, не чаще раза за неделю карьеры.
const QT_SITE = 'https://survivefriday.com';
let qtList = null, qtLoading = null;
const qtGet = () => qtList ? Promise.resolve(qtList) : qtLoading || (qtLoading = fetch('data/quotes.json')
  .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
  .then(a => (qtList = Array.isArray(a) ? a.filter(x => x && x.ru && x.en) : []))
  .catch(() => { qtLoading = null; return []; }));
const qtText = x => EN ? x.en : x.ru;
const qtWho = x => EN ? x.who_en : x.who_ru;
const qtOpen = EN ? '“' : '«', qtClose = EN ? '”' : '»';
const qtPick = (list, tags, maxLen = 200) => { const a = list.filter(x => (!tags || tags.includes(x.tag)) && qtText(x).length <= maxLen); return a.length ? a[Math.floor(Math.random() * a.length)] : null; };

// ---------- «Цитата дня» в главном меню ----------
let qtCur = -1;  // индекс показанной цитаты (по умолчанию — цитата дня)
const qtDayIdx = n => Math.floor(seeded(`qt-day-${today()}`)() * n);
function qtBox() {
  let box = $('qtDay');
  if (!box) {
    const after = $('brkDay'); if (!after) return null;
    box = Object.assign(document.createElement('div'), { id: 'qtDay', className: 'qt-day' });
    after.after(box);
  }
  return box;
}
function qtCardHtml(x, isDay) {
  const src = !EN && x.source ? `<small class="qt-src">${esc(x.source)}</small>` : '';
  return `<figure class="qt-card qt-t-${esc(x.tag)}">
      <span class="qt-kick">${isDay ? L('Цитата дня', 'Quote of the day') : L('Ещё цитата', 'Another quote')}</span>
      <blockquote class="qt-text"><p>${esc(qtText(x))}</p></blockquote>
      <figcaption class="qt-who"><span>${esc(qtWho(x))}</span>${src}</figcaption>
      <div class="qt-acts">
        <button type="button" class="qt-btn qt-more" id="qtMore" aria-label="${L('Другая цитата', 'Another quote')}" title="${L('Другая цитата', 'Another quote')}">↻</button>
        <button type="button" class="qt-btn qt-vk" id="qtVk" aria-label="${L('Поделиться ВКонтакте', 'Share on VK')}">VK</button>
        <button type="button" class="qt-btn qt-share" id="qtShare">${L('Поделиться', 'Share')}</button>
      </div>
    </figure>`;
}
async function renderQuoteDay(anim) {
  const box = qtBox(); if (!box) return;
  const list = await qtGet(); if (!list.length) { box.hidden = true; return; }
  const day = qtDayIdx(list.length);
  if (qtCur < 0 || qtCur >= list.length) qtCur = day;
  const x = list[qtCur];
  box.hidden = false;
  box.innerHTML = qtCardHtml(x, qtCur === day);
  if (anim) box.firstElementChild.classList.add('qt-in');
  $('qtMore').onclick = () => {
    let n = qtCur;
    if (list.length > 1) while (n === qtCur) n = Math.floor(Math.random() * list.length);
    qtCur = n; renderQuoteDay(true);
    if (typeof track === 'function') track('quote_more');
  };
  $('qtShare').onclick = () => qtShare(x);
  $('qtVk').onclick = () => qtVk(x);
}
bus.on('menu', () => renderQuoteDay());
if (!views.menu.hidden) renderQuoteDay();

// Поделиться: системное окно «Поделиться», если его нет — в буфер обмена (цитата + ссылка на игру)
function qtShare(x) {
  const text = `${qtOpen}${qtText(x)}${qtClose}\n— ${qtWho(x)}\n\n${L('Цитата дня в игре «Выжить до пятницы»', 'Quote of the day from “Survive till Friday”')}`;
  const copy = () => {
    const full = `${text}\n${QT_SITE}`;
    const done = () => toast(L('Цитата со ссылкой скопирована', 'Quote and link copied'));
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(full).then(done, () => qtCopyOld(full) ? done() : toast(L('Не получилось скопировать', 'Couldn’t copy')));
    else qtCopyOld(full) ? done() : toast(L('Не получилось скопировать', 'Couldn’t copy'));
  };
  if (typeof track === 'function') track('quote_share');
  if (navigator.share) navigator.share({ title: L('Выжить до пятницы', 'Survive till Friday'), text, url: QT_SITE }).catch(e => { if (e?.name !== 'AbortError') copy(); });
  else copy();
}
// ВКонтакте: окно «Поделиться» VK с цитатой и ссылкой на игру (в Telegram — через openLink, иначе новая вкладка)
function qtVk(x) {
  const title = `${qtOpen}${qtText(x)}${qtClose} — ${qtWho(x)}`.slice(0, 250);
  if (typeof vkShare === 'function') vkShare(QT_SITE + '/?utm_source=vk', title, 'quote');
}
function qtCopyOld(s) {
  try {
    const t = Object.assign(document.createElement('textarea'), { value: s }); t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok;
  } catch { return false; }
}

// ---------- цитата на экране итогов недели ----------
bus.on('weekEnd', x => {
  const tags = x.won ? ['success', 'persistence', 'humor'] : ['failure', 'persistence', 'humor'];
  qtGet().then(list => setTimeout(() => {
    const sheet = views.end.querySelector('.end-sheet'); if (!sheet || views.end.hidden || sheet.querySelector('.qt-end')) return;
    const q = qtPick(list, tags, 160); if (!q) return;
    const el = Object.assign(document.createElement('figure'), { className: `qt-end ${x.won ? 'qt-win' : 'qt-lose'}` });
    el.innerHTML = `<blockquote><p>${esc(qtText(q))}</p></blockquote><figcaption>— ${esc(qtWho(q))}</figcaption>`;
    const at = sheet.querySelector('#place') || sheet.querySelector('.stack');
    at ? at.before(el) : sheet.append(el);
  }, 250));
});

// ---------- понедельник, первая карточка недели карьеры ----------
bus.on('deck', s => {
  if (s?.mode !== 'career' || s.step || (prefs.gamesPlayed || 0) < 2) return;
  const c = typeof careerNow === 'function' ? careerNow() : null; if (!c) return;
  const key = `${c.week}:${c.firings || 0}:${(c.companies || []).length}`;
  if (store.get('vdp-qt-mon', '') === key) return;
  store.set('vdp-qt-mon', key);
  qtGet().then(list => setTimeout(() => {
    if (views.game.hidden || window.vdpPaused) return;
    const q = qtPick(list, ['work', 'persistence', 'humor', 'success'], 110); if (!q) return;
    document.querySelector('.qt-toast')?.remove();
    const el = Object.assign(document.createElement('button'), { type: 'button', className: 'qt-toast', title: L('Закрыть', 'Close') });
    el.innerHTML = `<small>${L('Понедельник, утро', 'Monday morning')}</small><span>${esc(qtText(q))}</span><i>— ${esc(qtWho(q))}</i>`;
    document.body.append(el);
    requestAnimationFrame(() => el.classList.add('on'));
    const hide = () => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); off(); };
    const t = setTimeout(hide, 7000), off = () => { clearTimeout(t); document.removeEventListener('pointerdown', early, true); };
    const early = e => { if (!el.contains(e.target)) hide(); };
    el.onclick = hide;
    document.addEventListener('pointerdown', early, true);
  }, 1400));
});
