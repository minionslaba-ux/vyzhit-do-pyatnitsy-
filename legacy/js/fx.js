/* сгенерировано tools/make-legacy.js из js/fx.js — не править */
const RM = matchMedia("(prefers-reduced-motion: reduce)");
const FX = {
  get off() {
    return RM.matches;
  },
  // Временный элемент: удаляется сам после анимации
  temp(parent, cls, html, ms) {
    const el = document.createElement("span");
    el.className = cls;
    el.innerHTML = html;
    el.setAttribute("aria-hidden", "true");
    parent.appendChild(el);
    setTimeout(() => el.remove(), ms);
    return el;
  },
  // Класс на время: снять и поставить заново, чтобы анимация повторялась
  pulse(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el["_fx" + cls]);
    el["_fx" + cls] = setTimeout(() => el.classList.remove(cls), ms);
  },
  // 1, 4. После ответа из каждой шкалы вылетает «+15» или «−20»; сильный удар (±20) встряхивает трубку
  stats(eff) {
    if (this.off) return;
    for (const [k, v] of Object.entries(eff)) {
      if (!v) continue;
      const w = document.getElementById("st-" + k), big = Math.abs(v) >= 20;
      this.temp(w, "fnum ".concat(v > 0 ? "up" : "down").concat(big ? " big" : ""), "".concat(v > 0 ? "+" : "−").concat(Math.abs(v)), 1300);
      if (big) this.pulse(w, "hit", 600);
    }
  },
  // 8. Предмет срабатывает: копия чипа летит к своей шкале, вокруг неё вспыхивает щит ◆
  shield(itemName, stat) {
    if (this.off) return;
    const w = document.getElementById("st-" + stat), chip = [...document.querySelectorAll("#inv .item")].find((x) => x.textContent === itemName);
    const burst = () => {
      this.pulse(w, "shielded", 900);
      this.temp(w, "shield-ring", "◆", 900);
    };
    if (!chip || !w || !chip.animate) return burst();
    const a = chip.getBoundingClientRect(), b = w.querySelector(".tube").getBoundingClientRect();
    const fly = this.temp(document.body, "fly-chip", itemName, 700);
    Object.assign(fly.style, { left: a.left + "px", top: a.top + "px" });
    fly.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: "translate(".concat(b.left + b.width / 2 - a.left - a.width / 2, "px, ").concat(b.top + b.height / 2 - a.top - a.height / 2, "px) scale(.4)"), opacity: 0.2 }
      ],
      { duration: 520, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }
    ).onfinish = burst;
  },
  // 9. Зарплата: монетка «+3» прыгает в счёт
  coin(amount) {
    if (this.off) return;
    const bank = document.getElementById("bankChip");
    if (!bank || bank.hidden || !bank.animate) return;
    const b = bank.getBoundingClientRect(), c = document.getElementById("clock").getBoundingClientRect();
    const el = this.temp(document.body, "fly-coin", "+".concat(amount), 900);
    Object.assign(el.style, { left: c.left + c.width / 2 + "px", top: c.top + c.height / 2 + "px" });
    const dx = b.left + b.width / 2 - c.left - c.width / 2, dy = b.top + b.height / 2 - c.top - c.height / 2;
    el.animate(
      [
        { transform: "translate(-50%, -50%) scale(.6)", opacity: 0 },
        { transform: "translate(calc(-50% + ".concat(dx * 0.45, "px), calc(-50% + ").concat(dy * 0.45 - 46, "px)) scale(1.15)"), opacity: 1, offset: 0.45 },
        { transform: "translate(calc(-50% + ".concat(dx, "px), calc(-50% + ").concat(dy, "px)) scale(.5)"), opacity: 0.3 }
      ],
      { duration: 820, easing: "ease-in-out", fill: "forwards" }
    ).onfinish = () => this.pulse(bank, "paid", 600);
  },
  // 5. Штамп ответа на карточке при свайпе: проступает тем сильнее, чем дальше тянете
  stamp(side, k) {
    const s = document.querySelector("#card .stamp");
    if (!s) return;
    if (!side) {
      s.style.opacity = 0;
      return;
    }
    const label = current().answers[side].label;
    if (s.textContent !== label) s.textContent = label;
    s.dataset.side = side;
    s.style.opacity = Math.min(1, Math.max(0, k * 1.8)).toFixed(2);
  },
  // 11. Часы-табло: изменившиеся цифры перелистываются
  clock(text) {
    const el = document.getElementById("clock"), old = el.dataset.t || "";
    el.dataset.t = text;
    if (this.off || !old) {
      el.textContent = text;
      return;
    }
    el.innerHTML = [...text].map((ch, i) => '<span class="dg'.concat(ch !== old[i] ? " flip" : "", '">').concat(ch, "</span>")).join("");
  },
  // 6, 7. Вход карточки: новый день — лист календаря, случайное событие — помехи, последствие — перемотка
  enter(card, kind) {
    card.classList.remove("idle", "glitch", "rewind", "page");
    if (this.off) return;
    if (kind) this.pulse(card, kind, kind === "page" ? 650 : 750);
    clearTimeout(card._idle);
    card._idle = setTimeout(() => card.classList.add("idle"), 700);
  },
  // 12. Финалы: перегрев — трубка взрывается паром и экран краснеет; ноль — шкала гаснет и экран темнеет
  finale(k, high) {
    if (this.off) return;
    const w = document.getElementById("st-" + k);
    this.pulse(w, high ? "burst" : "drain", 1400);
    if (high) for (let i = 0; i < 6; i++) this.temp(w, "puff", "", 1200).style.setProperty("--i", i);
    this.temp(document.body, "fx-screen ".concat(high ? "heat" : "dim"), "", 1300);
  },
  // Коллега запомнил ответ: «Фёдор ♥ +1» над репликой
  relNote(name, d) {
    const r = document.getElementById("react");
    if (!r) return;
    const el = this.temp(r.parentElement, "rel-note ".concat(d > 0 ? "up" : "down"), "".concat(d > 0 ? "♥" : "💢", " ").concat(name, ": ").concat(d > 0 ? L("отношение лучше", "likes you more") : L("отношение хуже", "likes you less")), 2200);
    if (this.off) el.style.animation = "none";
  },
  // Пятница, 18:00: двери офиса разъезжаются, в офисе гаснет свет
  doors() {
    if (this.off) return;
    document.body.dataset.phase = "night";
    this.temp(document.body, "fx-doors", "<i></i><i></i><b>18:00</b>", 1900);
  }
};
