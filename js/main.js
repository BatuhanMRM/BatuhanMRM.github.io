(() => {
  const games = window.GAMES;
  const $ = (s) => document.querySelector(s);

  const LABEL = {
    platform: { steam: "Steam", google_play: "Google Play" },
    status: { released: "Released", early_access: "Early Access", coming_soon: "Coming soon" },
  };

  const genreFamily = (g) => {
    if (/puzzle/i.test(g)) return "Puzzle";
    if (/idle|merge|restoration|farm/i.test(g)) return "Idle & builder";
    if (/simulation/i.test(g)) return "Simulation";
    return "Multiplayer party";
  };

  const uniq = (key) => [...new Set(games.map((g) => g[key]))];
  const OPTIONS = {
    platform: [null, "steam", "google_play"],
    status: [null, "released", "early_access", "coming_soon"],
    role: [null, ...uniq("role")],
  };
  const query = { platform: null, status: null, role: null };
  let view = "cards";

  /* ---------- Query tokens ---------- */
  const tokens = document.querySelectorAll(".tok");

  function renderTokens() {
    tokens.forEach((t) => {
      const v = query[t.dataset.key];
      t.textContent = v === null ? "ANY" : `'${v}'`;
      t.classList.toggle("is-any", v === null);
    });
  }

  tokens.forEach((t) =>
    t.addEventListener("click", () => {
      const key = t.dataset.key;
      const opts = OPTIONS[key];
      query[key] = opts[(opts.indexOf(query[key]) + 1) % opts.length];
      update();
    })
  );

  $("#resetQuery").addEventListener("click", () => {
    Object.keys(query).forEach((k) => (query[k] = null));
    update();
  });

  document.querySelectorAll(".vt").forEach((b) =>
    b.addEventListener("click", () => {
      view = b.dataset.view;
      document.querySelectorAll(".vt").forEach((x) => {
        const on = x === b;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-checked", on);
      });
      update();
    })
  );

  const filtered = () =>
    games
      .filter((g) => Object.entries(query).every(([k, v]) => v === null || g[k] === v))
      .sort((a, b) => (a.platform === b.platform ? (a.sort || 0) - (b.sort || 0) : a.platform === "steam" ? -1 : 1));

  /* ---------- Cards & table ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function cardHTML(g, i) {
    const steam = g.platform === "steam";
    const media = steam
      ? `<img src="${g.image}" alt="" loading="lazy">`
      : `<img class="bgshot" src="${g.shot}" alt="" loading="lazy"><img class="icon" src="${g.image}" alt="" loading="lazy">`;
    const meta = [LABEL.platform[g.platform], g.genre, g.release].filter(Boolean).join(" · ");
    return `<button type="button" class="card ${steam ? "card-steam" : "card-play"}" data-id="${g.id}" style="animation-delay:${i * 40}ms">
      <div class="card-media">${media}<span class="badge st-${g.status}">${LABEL.status[g.status]}</span></div>
      <div class="card-body">
        <h3 class="card-title">${esc(g.title)}</h3>
        <span class="card-meta">${esc(meta)}</span>
        <span class="card-role">${esc(g.role)}</span>
      </div>
    </button>`;
  }

  function tableHTML(rows) {
    return `<table class="dt"><thead><tr><th>#</th><th>title</th><th>platform</th><th>status</th><th>role</th><th>genre</th></tr></thead><tbody>${rows
      .map(
        (g, i) => `<tr data-id="${g.id}" tabindex="0">
          <td class="idx">${String(i + 1).padStart(2, "0")}</td>
          <td><span class="t-title"><img src="${g.image}" alt="">${esc(g.title)}</span></td>
          <td>${LABEL.platform[g.platform]}</td><td>${LABEL.status[g.status]}</td>
          <td>${esc(g.role)}</td><td>${esc(g.genre)}</td></tr>`
      )
      .join("")}</tbody></table>`;
  }

  function update() {
    renderTokens();
    const rows = filtered();
    $("#rowCount").textContent = rows.length;
    $("#empty").hidden = rows.length > 0;
    $("#grid").hidden = view !== "cards";
    $("#table").hidden = view !== "table";
    if (view === "cards") $("#grid").innerHTML = rows.map(cardHTML).join("");
    else $("#table").innerHTML = rows.length ? tableHTML(rows) : "";
  }

  /* ---------- Detail modal ---------- */
  const modal = $("#modal");

  function openGame(id) {
    const g = games.find((x) => x.id === id);
    if (!g) return;
    const portrait = g.platform === "google_play" && g.id !== "wild-west-rails";
    const facts = [
      ["My role", g.role, "is-role"],
      ["Platform", LABEL.platform[g.platform]],
      ["Status", LABEL.status[g.status] + (g.release ? ` · ${g.release}` : "")],
      ["Genre", g.genre],
    ];
    $("#modalBody").innerHTML = `
      <div class="m-hero ${portrait ? "is-portrait" : ""}">
        <img class="m-shot" src="${g.shot}" alt="Screenshot of ${esc(g.title)}">
        <div class="m-info">
          <p class="eyebrow eyebrow-game">Triarch Interactive</p>
          <h2 id="mTitle">${esc(g.title)}</h2>
          <dl class="m-facts">${facts.map(([k, v, c]) => `<div class="${c || ""}"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          <p>${esc(g.description)}</p>
          ${g.contribution ? `<ul>${g.contribution.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
          ${g.note ? `<p class="m-note">★ ${esc(g.note)}</p>` : ""}
          <a class="btn btn-game" href="${g.url}" target="_blank" rel="noopener">${g.platform === "steam" ? "View on Steam" : "Get it on Google Play"} ↗</a>
        </div>
      </div>`;
    modal.showModal();
  }

  const pick = (e) => {
    const el = e.target.closest("[data-id]");
    if (el) openGame(el.dataset.id);
  };
  $("#grid").addEventListener("click", pick);
  $("#table").addEventListener("click", pick);
  $("#table").addEventListener("keydown", (e) => e.key === "Enter" && pick(e));
  modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => e.target === modal && modal.close());

  /* ---------- Analytics ---------- */
  function countBy(fn) {
    const m = new Map();
    games.forEach((g) => m.set(fn(g), (m.get(fn(g)) || 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]);
  }

  function bars(el, data, color) {
    const max = Math.max(...data.map((d) => d[1]));
    el.innerHTML = data
      .map(
        ([k, v]) => `<div class="bar-row"><span class="lbl">${esc(k)}</span><span class="val">${v}</span>
        <div class="bar-track"><div class="bar-fill" data-w="${(v / max) * 100}" style="${color ? `background:${color}` : ""}"></div></div></div>`
      )
      .join("");
  }

  const live = games.filter((g) => g.status !== "coming_soon").length;
  $("#kpis").innerHTML = [
    [games.length, "games total"],
    [uniq("platform").length, "platforms"],
    [live, "playable now"],
    [games.length - live, "in production"],
  ]
    .map(([n, l]) => `<div class="kpi"><b>${n}</b><span>${l}</span></div>`)
    .join("");

  bars($("#chartRole"), countBy((g) => g.role), "var(--game)");
  bars($("#chartGenre"), countBy((g) => genreFamily(g.genre)));

  $("#chartTimeline").innerHTML = games
    .filter((g) => g.platform === "steam")
    .sort((a, b) => a.sort - b.sort)
    .map((g) => `<div class="tl-item ${g.status !== "coming_soon" ? "done" : ""}"><b>${g.release}</b><span>${esc(g.title)}</span></div>`)
    .join("");

  // Animate bars when the dashboard scrolls into view
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.querySelectorAll(".bar-fill").forEach((b) => (b.style.width = b.dataset.w + "%"));
        io.unobserve(en.target);
      }),
    { threshold: 0.3 }
  );
  io.observe($("#analytics"));

  update();
})();
