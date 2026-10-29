// Сеть: Supabase (рейтинг, участники, офисы, чаты, вход по почте) и локальная замена без ключей.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- общий рейтинг и участники ----------
// С ключами Supabase из js/config.js данные общие для всего офиса, без них — хранятся в этом браузере.
// Чужие player_id наружу не отдаются: строки узнаются по tag = SHA-256(player_id).
async function sha256hex(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch { return 'local-' + text; }
}
const myTag = sha256hex(prefs.playerId);
const board = (() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const online = !!(cfg.url && cfg.anonKey);
  const base = online ? cfg.url.replace(/\/+$/, '') + '/rest/v1' : '';
  // Ключ нового формата (sb_publishable_…) передаётся только в apikey; старый anon-ключ (JWT) — ещё и как Bearer
  const headers = online ? { apikey: cfg.anonKey, 'Content-Type': 'application/json',
    ...(cfg.anonKey.startsWith('eyJ') ? { Authorization: `Bearer ${cfg.anonKey}` } : {}) } : {};
  const better = (a, b) => (b.won - a.won) || (b.step - a.step) || (b.total - a.total) || (a.created_at < b.created_at ? -1 : 1);
  const LOCAL = 'vdp-board', PEOPLE = 'vdp-people';
  const req = async (path, opts = {}) => {
    const r = await fetch(`${base}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
    if (!r.ok) {
      let detail = '';
      try { const j = await r.json(); detail = [j.code, j.message].filter(Boolean).join(' '); } catch {}
      throw new Error(`Supabase ответил ${r.status} на ${path.split('?')[0]}${detail ? ` (${detail})` : ''}`);
    }
    return r.status === 204 || opts.method === 'POST' ? null : r.json();
  };
  const me = async () => ({ tag: await myTag, name: prefs.name, dept: prefs.dept, avatar: prefs.avatar });
  const authBase = online ? cfg.url.replace(/\/+$/, '') + '/auth/v1' : '';
  // Токен входа: хранится в браузере и продлевается сам; база по нему проверяет, кто вы
  let refreshing = null;
  async function token() {
    const ss = prefs.session;
    if (!online || !ss) return null;
    if (ss.exp - Date.now() > 60000) return ss.access;
    refreshing = refreshing || (async () => {
      const r = await fetch(`${authBase}/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: cfg.anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: ss.refresh }) });
      if (!r.ok) { delete prefs.session; store.set(KEY.prefs, prefs); toast('Сессия входа истекла — войдите по почте ещё раз'); return null; }
      const j = await r.json();
      prefs.session = { access: j.access_token, refresh: j.refresh_token, exp: (j.expires_at ? j.expires_at * 1000 : Date.now() + j.expires_in * 1000) };
      store.set(KEY.prefs, prefs);
      return j.access_token;
    })().finally(() => { refreshing = null; });
    return refreshing;
  }
  const authHeaders = async (explicit) => { const t = explicit || await token(); return t ? { Authorization: `Bearer ${t}` } : {}; };
  const deptQ = dept => dept ? `&dept=eq.${encodeURIComponent(dept)}` : '';
  return {
    online, token,
    async logout() { const t = prefs.session?.access; if (t) await fetch(`${authBase}/logout`, { method: 'POST', headers: { apikey: cfg.anonKey, Authorization: `Bearer ${t}` } }).catch(() => {}); },
    async touch(status, step = 0) {
      if (!prefs.name) return;
      if (!online) {
        const all = store.get(PEOPLE, {}), m = await me();
        all[m.tag] = { ...all[m.tag], ...m, prof: prefs.prof, status, step, updated_at: new Date().toISOString(), created_at: all[m.tag]?.created_at || new Date().toISOString() };
        store.set(PEOPLE, all); return;
      }
      await req('/rpc/touch_player', { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ p_id: prefs.playerId, p_name: prefs.name, p_dept: prefs.dept,
        p_avatar: prefs.avatar, p_prof: prefs.prof, p_status: status, p_step: step }) });
    },
    async submit(entry) {
      if (!online) {
        const all = store.get(LOCAL, []); all.push({ ...entry, ...(await me()), created_at: new Date().toISOString() });
        store.set(LOCAL, all.slice(-300)); return;
      }
      const auth = await authHeaders();
      const post = body => req('/scores', { method: 'POST', headers: { Prefer: 'return=minimal', ...auth }, body: JSON.stringify(body) });
      try { await post(entry); }
      catch (err) {
        // база со старой схемой: без колонок mode/day/overheat. Неделю дня так не записать — просим обновить schema.sql
        if (!/PGRST204|column/i.test(err.message)) throw err;
        if (entry.mode !== 'career') throw new Error('обновите базу: выполните свежий supabase/schema.sql');
        const { mode, day, overheat, ...old } = entry; await post(old);
      }
    },
    async top(dept) {
      if (!online) {
        const bestOf = {};
        for (const e of store.get(LOCAL, []).filter(e => (e.mode || 'career') === 'career')) if (!bestOf[e.tag] || better(e, bestOf[e.tag]) < 0) bestOf[e.tag] = e;
        return Object.values(bestOf).filter(e => !dept || e.dept === dept).sort(better).slice(0, 100);
      }
      return req(`/leaderboard?select=*&order=won.desc,step.desc,total.desc,created_at.asc&limit=100${deptQ(dept)}`);
    },
    async daily(day, dept) {
      if (!online) {
        const first = {};
        for (const e of store.get(LOCAL, []).filter(e => e.mode === 'daily' && e.day === day)) if (!first[e.tag]) first[e.tag] = e;
        return Object.values(first).filter(e => !dept || e.dept === dept).sort(better);
      }
      return req(`/daily_leaderboard?select=*&day=eq.${day}&order=won.desc,step.desc,total.desc,created_at.asc&limit=100${deptQ(dept)}`);
    },
    async depts() {
      if (!online) {
        const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const by = {};
        for (const e of store.get(LOCAL, []).filter(e => e.dept && e.mode !== 'pack' && new Date(e.created_at) >= monday)) {
          const d = by[e.dept] = by[e.dept] || { dept: e.dept, players: new Set(), weeks: 0, sum: 0, wins: 0 };
          d.players.add(e.tag); d.weeks++; d.sum += e.won ? e.total : e.step * 10; d.wins += e.won ? 1 : 0;
        }
        return Object.values(by).map(d => ({ dept: d.dept, players: d.players.size, weeks: d.weeks, avg_score: Math.round(d.sum / d.weeks), win_rate: Math.round(100 * d.wins / d.weeks) }))
          .sort((a, b) => b.avg_score - a.avg_score);
      }
      return req('/dept_week?select=*&order=avg_score.desc');
    },
    async people(dept) {
      if (!online) {
        const games = store.get(LOCAL, []);
        return Object.values(store.get(PEOPLE, {})).filter(p => !dept || p.dept === dept).map(p => {
          const mine = games.filter(g => g.tag === p.tag), best = [...mine].sort(better)[0];
          return { ...p, games: mine.length, wins: mine.filter(g => g.won).length, best_won: best?.won, best_step: best?.step, best_total: best?.total };
        }).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      }
      return req(`/participants?select=*&order=updated_at.desc&limit=200${deptQ(dept)}`);
    },
    async suggest(card) {
      if (!online) throw new Error('общий офис не подключён: предложения принимаются только с ключами Supabase');
      const auth = await authHeaders();
      if (!auth.Authorization) throw new Error('предлагать карточки можно после входа по почте');
      await req('/suggestions', { method: 'POST', headers: { Prefer: 'return=minimal', ...auth }, body: JSON.stringify({ ...card, player_id: prefs.playerId }) });
    },
    async approved() { return online ? req('/approved_cards?select=*&limit=200') : []; },
    // Функции офисов и чатов; ошибки из базы приходят готовым русским текстом
    async rpc(name, args, token) {
      if (!online) throw new Error('общий офис не подключён: нужны ключи Supabase в js/config.js');
      const r = await fetch(`${base}/rpc/${name}`, { method: 'POST', body: JSON.stringify(args),
        headers: { ...headers, ...(await authHeaders(token)) } });
      const t = await r.text();
      if (!r.ok) { let m = ''; try { m = JSON.parse(t).message; } catch {} throw new Error(m || `Supabase ответил ${r.status}`); }
      return t ? JSON.parse(t) : null;
    },
    // Регистрация: ссылка для входа на почту (Supabase Auth)
    async sendLink(email) {
      const redirect = location.origin + location.pathname;
      const r = await fetch(`${cfg.url.replace(/\/+$/, '')}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
        method: 'POST', headers: { apikey: cfg.anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: true }) });
      if (!r.ok) { let m = ''; try { const j = await r.json(); m = j.msg || j.message || j.error_description || ''; } catch {} throw new Error(m || `Supabase ответил ${r.status}`); }
    },
    async user(token) {
      const r = await fetch(`${cfg.url.replace(/\/+$/, '')}/auth/v1/user`, { headers: { apikey: cfg.anonKey, Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error(`вход не удался (${r.status})`);
      return r.json();
    },
  };
})();
