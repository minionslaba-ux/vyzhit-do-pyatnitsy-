/* сгенерировано tools/make-legacy.js из js/board.js — не править */
async function sha256hex(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    return "local-" + text;
  }
}
const myTag = sha256hex(prefs.playerId);
const board = (() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const online = !!(cfg.url && cfg.anonKey);
  const base = online ? cfg.url.replace(/\/+$/, "") + "/rest/v1" : "";
  const headers = online ? {
    apikey: cfg.anonKey,
    "Content-Type": "application/json",
    ...cfg.anonKey.startsWith("eyJ") ? { Authorization: "Bearer ".concat(cfg.anonKey) } : {}
  } : {};
  const better = (a, b) => b.won - a.won || b.step - a.step || b.total - a.total || (a.created_at < b.created_at ? -1 : 1);
  const LOCAL = "vdp-board", PEOPLE = "vdp-people";
  const req = async (path, opts = {}) => {
    const r = await fetch("".concat(base).concat(path), { ...opts, headers: { ...headers, ...opts.headers || {} } });
    if (!r.ok) {
      let detail = "";
      try {
        const j = await r.json();
        detail = [j.code, j.message].filter(Boolean).join(" ");
      } catch (e) {
      }
      throw new Error(L("Supabase ответил ".concat(r.status, " на ").concat(path.split("?")[0]), "Supabase returned ".concat(r.status, " for ").concat(path.split("?")[0])) + (detail ? " (".concat(detail, ")") : ""));
    }
    return r.status === 204 || opts.method === "POST" ? null : r.json();
  };
  const me = async () => ({ tag: await myTag, name: prefs.name, dept: prefs.dept, avatar: prefs.avatar });
  const authBase = online ? cfg.url.replace(/\/+$/, "") + "/auth/v1" : "";
  let refreshing = null;
  async function token() {
    const ss = prefs.session;
    if (!online || !ss) return null;
    if (ss.exp - Date.now() > 6e4) return ss.access;
    refreshing = refreshing || (async () => {
      const r = await fetch("".concat(authBase, "/token?grant_type=refresh_token"), {
        method: "POST",
        headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: ss.refresh })
      });
      if (!r.ok) {
        delete prefs.session;
        store.set(KEY.prefs, prefs);
        toast(L("Сессия входа истекла — войдите ещё раз", "Your session expired — please sign in again"));
        if (typeof renderJoin === "function" && views.game.hidden) setTimeout(() => renderJoin("login", L("Сессия входа истекла. Войдите снова — прогресс и рейтинг сохранятся.", "Your session expired. Sign in again — your progress and ranking are kept.")), 600);
        return null;
      }
      const j = await r.json();
      prefs.session = { access: j.access_token, refresh: j.refresh_token, exp: j.expires_at ? j.expires_at * 1e3 : Date.now() + j.expires_in * 1e3 };
      store.set(KEY.prefs, prefs);
      return j.access_token;
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }
  const authHeaders = async (explicit) => {
    const t = explicit || await token();
    return t ? { Authorization: "Bearer ".concat(t) } : {};
  };
  const deptQ = (dept) => dept ? "&dept=eq.".concat(encodeURIComponent(dept)) : "";
  return {
    online,
    token,
    async logout() {
      var _a;
      const t = (_a = prefs.session) == null ? void 0 : _a.access;
      if (t) await fetch("".concat(authBase, "/logout"), { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer ".concat(t) } }).catch(() => {
      });
    },
    async touch(status, step = 0) {
      var _a;
      if (!prefs.name) return;
      if (!online) {
        const all = store.get(PEOPLE, {}), m = await me();
        all[m.tag] = { ...all[m.tag], ...m, prof: prefs.prof, status, step, updated_at: (/* @__PURE__ */ new Date()).toISOString(), created_at: ((_a = all[m.tag]) == null ? void 0 : _a.created_at) || (/* @__PURE__ */ new Date()).toISOString() };
        store.set(PEOPLE, all);
        return;
      }
      if (prefs.email && !prefs.session) return;
      await req("/rpc/touch_player", { method: "POST", headers: await authHeaders(), body: JSON.stringify({
        p_id: prefs.playerId,
        p_name: prefs.name,
        p_dept: prefs.dept,
        p_avatar: prefs.avatar,
        p_prof: prefs.prof,
        p_status: status,
        p_step: step
      }) });
    },
    async submit(entry) {
      if (!online) {
        const all = store.get(LOCAL, []);
        all.push({ ...entry, ...await me(), created_at: (/* @__PURE__ */ new Date()).toISOString() });
        store.set(LOCAL, all.slice(-300));
        return;
      }
      const auth = await authHeaders();
      if (prefs.email && !prefs.session) throw new Error(L("войдите в аккаунт — тогда результат попадёт в рейтинг", "sign in so your result is added to the leaderboard"));
      const post = (body) => req("/scores", { method: "POST", headers: { Prefer: "return=minimal", ...auth }, body: JSON.stringify(body) });
      try {
        await post(entry);
      } catch (err) {
        if (!/PGRST204|column/i.test(err.message)) throw err;
        if (entry.mode !== "career") throw new Error(L("обновите базу: выполните свежий supabase/schema.sql", "update the database: run the latest supabase/schema.sql"));
        const { mode, day, overheat, ...old } = entry;
        await post(old);
      }
    },
    async top(dept) {
      if (!online) {
        const bestOf = {};
        for (const e of store.get(LOCAL, []).filter((e2) => (e2.mode || "career") === "career")) if (!bestOf[e.tag] || better(e, bestOf[e.tag]) < 0) bestOf[e.tag] = e;
        return Object.values(bestOf).filter((e) => !dept || e.dept === dept).sort(better).slice(0, 100);
      }
      return req("/leaderboard?select=*&order=won.desc,step.desc,total.desc,created_at.asc&limit=100".concat(deptQ(dept)));
    },
    async daily(day, dept) {
      if (!online) {
        const first = {};
        for (const e of store.get(LOCAL, []).filter((e2) => e2.mode === "daily" && e2.day === day)) if (!first[e.tag]) first[e.tag] = e;
        return Object.values(first).filter((e) => !dept || e.dept === dept).sort(better);
      }
      return req("/daily_leaderboard?select=*&day=eq.".concat(day, "&order=won.desc,step.desc,total.desc,created_at.asc&limit=100").concat(deptQ(dept)));
    },
    async depts() {
      if (!online) {
        const monday = /* @__PURE__ */ new Date();
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const by = {};
        for (const e of store.get(LOCAL, []).filter((e2) => e2.dept && e2.mode !== "pack" && new Date(e2.created_at) >= monday)) {
          const d = by[e.dept] = by[e.dept] || { dept: e.dept, players: /* @__PURE__ */ new Set(), weeks: 0, sum: 0, wins: 0 };
          d.players.add(e.tag);
          d.weeks++;
          d.sum += e.won ? e.total : e.step * 10;
          d.wins += e.won ? 1 : 0;
        }
        return Object.values(by).map((d) => ({ dept: d.dept, players: d.players.size, weeks: d.weeks, avg_score: Math.round(d.sum / d.weeks), win_rate: Math.round(100 * d.wins / d.weeks) })).sort((a, b) => b.avg_score - a.avg_score);
      }
      return req("/dept_week?select=*&order=avg_score.desc");
    },
    async people(dept) {
      if (!online) {
        const games = store.get(LOCAL, []);
        return Object.values(store.get(PEOPLE, {})).filter((p) => !dept || p.dept === dept).map((p) => {
          const mine = games.filter((g) => g.tag === p.tag), best = [...mine].sort(better)[0];
          return { ...p, games: mine.length, wins: mine.filter((g) => g.won).length, best_won: best == null ? void 0 : best.won, best_step: best == null ? void 0 : best.step, best_total: best == null ? void 0 : best.total };
        }).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      }
      return req("/participants?select=*&order=updated_at.desc&limit=200".concat(deptQ(dept)));
    },
    async suggest(card) {
      if (!online) throw new Error(L("общий офис не подключён: предложения принимаются только с ключами Supabase", "shared office isn’t connected: suggestions only work with Supabase keys"));
      const auth = await authHeaders();
      if (!auth.Authorization) throw new Error(L("предлагать карточки можно после входа по почте", "sign in by email to suggest cards"));
      await req("/suggestions", { method: "POST", headers: { Prefer: "return=minimal", ...auth }, body: JSON.stringify({ ...card, player_id: prefs.playerId }) });
    },
    async approved() {
      return online ? req("/approved_cards?select=*&limit=200") : [];
    },
    // Функции офисов и чатов; ошибки из базы приходят готовым русским текстом
    async rpc(name, args, token2) {
      if (!online) throw new Error(L("общий офис не подключён: нужны ключи Supabase в js/config.js", "shared office isn’t connected: add Supabase keys to js/config.js"));
      const r = await fetch("".concat(base, "/rpc/").concat(name), {
        method: "POST",
        body: JSON.stringify(args),
        headers: { ...headers, ...await authHeaders(token2) }
      });
      const t = await r.text();
      if (!r.ok) {
        let m = "";
        try {
          m = JSON.parse(t).message;
        } catch (e) {
        }
        throw new Error(m || L("Supabase ответил ".concat(r.status), "Supabase returned ".concat(r.status)));
      }
      return t ? JSON.parse(t) : null;
    },
    // Регистрация: ссылка для входа на почту (Supabase Auth)
    async sendLink(email) {
      const redirect = location.origin + location.pathname;
      const r = await fetch("".concat(cfg.url.replace(/\/+$/, ""), "/auth/v1/otp?redirect_to=").concat(encodeURIComponent(redirect)), {
        method: "POST",
        headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, create_user: true })
      });
      if (!r.ok) {
        let m = "";
        try {
          const j = await r.json();
          m = j.msg || j.message || j.error_description || "";
        } catch (e) {
        }
        throw new Error(m || L("Supabase ответил ".concat(r.status), "Supabase returned ".concat(r.status)));
      }
    },
    accessToken: token,
    // Вход и регистрация по паролю (Supabase Auth). Ответ с access_token — сразу сессия; без него — ждём подтверждения почты
    async password(email, password, signup) {
      const a = cfg.url.replace(/\/+$/, "") + "/auth/v1";
      const url = signup ? "".concat(a, "/signup?redirect_to=").concat(encodeURIComponent(location.origin + location.pathname)) : "".concat(a, "/token?grant_type=password");
      const r = await fetch(url, { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const m = j.msg || j.message || j.error_description || "";
        throw new Error(/invalid login/i.test(m) ? L("неверная почта или пароль", "wrong email or password") : /not confirmed/i.test(m) ? L("почта ещё не подтверждена — откройте ссылку из письма", "email not confirmed yet — open the link in the email") : /at least|weak|short/i.test(m) ? L("пароль слишком простой — нужно хотя бы 6 символов", "password too weak — use at least 6 characters") : /already registered/i.test(m) ? L("эта почта уже зарегистрирована — войдите", "this email is already registered — sign in") : m || L("Supabase ответил ".concat(r.status), "Supabase returned ".concat(r.status)));
      }
      return j;
    },
    async setPassword(password) {
      const t = await token();
      if (!t) throw new Error(L("войдите ещё раз", "please sign in again"));
      const r = await fetch("".concat(authBase, "/user"), { method: "PUT", headers: { apikey: cfg.anonKey, Authorization: "Bearer ".concat(t), "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const m = j.msg || j.message || "";
        throw new Error(/at least|weak|short/i.test(m) ? L("нужно хотя бы 6 символов", "use at least 6 characters") : /different/i.test(m) ? L("это и так ваш пароль", "that’s already your password") : m || String(r.status));
      }
    },
    async user(token2) {
      const r = await fetch("".concat(cfg.url.replace(/\/+$/, ""), "/auth/v1/user"), { headers: { apikey: cfg.anonKey, Authorization: "Bearer ".concat(token2) } });
      if (!r.ok) throw new Error(L("вход не удался (".concat(r.status, ")"), "sign-in failed (".concat(r.status, ")")));
      return r.json();
    }
  };
})();
