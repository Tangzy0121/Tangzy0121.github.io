// Projects showcase: gallery of cards -> detail with a real demo asset (images from the public repos / live pages).
// window.__openShowcase(i?) — i is 0-based; returns false if out of range.
(() => {
  const S = './showcase/';
  const gh = (r) => ({ t: 'GitHub', u: 'https://github.com/Tangzy0121/' + r });
  const P = [
    { n: 'Asimov Cascade', tag: 'Research · AI Safety / Robotics', blurb: 'Detecting cascading safety failures across interacting humanoid robotic subsystems.', status: 'ICRA 2027 · Under Review', paper: 0 },
    { n: 'SafeCE', tag: 'Research · Database Systems', blurb: 'Risk-aware evaluation and upper-tail calibration for cardinality estimation.', status: 'In preparation' },
    { n: 'Anyscale-DBCO', tag: 'Research · ML4CO', blurb: 'Scaling combinatorial optimization through decomposition, solver routing and composition.', status: 'Ongoing' },
    { n: 'Folio', tag: 'Android · Kotlin', blurb: 'Local-first, privacy-friendly reader for Markdown, HTML and zipped web pages. E-book style themes, TOC, reading progress, Markdown editing, tags. No account, no cloud, no tracking.', img: [S + 'og-Folio.png'], icon: S + 'folio-icon.png', src: 'GitHub social preview + app launcher icon from the repo', links: [gh('Folio')] },
    { n: 'Loci', tag: 'App · TypeScript', blurb: 'A personal learning agent that turns study material into readable, verifiable, traceable learning projects.', status: 'In progress · source private', img: [S + 'loci.jpg'], src: 'Live capture of the public Loci privacy-policy page', links: [{ t: 'Privacy policy', u: 'https://tangzy0121.github.io/loci-privacy/' }] },
    { n: 'MewCode', tag: 'Go · AI coding agent', blurb: 'A terminal AI coding agent built from scratch in Go: agent loop, tool calling, permission gating, streaming TUI. Every chapter ships with real-machine evidence.', status: 'v1.0 in progress', img: [S + 'og-mewcode-go.png'], src: 'GitHub social preview of mewcode-go', links: [gh('mewcode-go'), { t: 'v0 (earlier)', u: 'https://github.com/Tangzy0121/mewcode-v0' }] },
    { n: 'tangzy-btw', tag: 'TypeScript · pi extension', blurb: 'KimiCode-style /btw side questions for pi: a bottom overlay panel with markdown streaming and in-panel follow-ups, never touching the main transcript.', img: [S + 'btw.png'], src: 'docs/screenshot.png from the repo', links: [gh('tangzy-btw')] },
    { n: 'clawd-roxy-theme', tag: 'Desktop pet theme', blurb: 'Chibi Roxy theme for Clawd on Desk, with animated states for idle, thinking, working and sleeping.', img: ['idle', 'thinking', 'working', 'sleeping'].map((s) => S + 'roxy-' + s + '.apng'), caps: ['idle', 'thinking', 'working', 'sleeping'], src: 'APNG animations from themes/roxy-chibi/assets', links: [gh('clawd-roxy-theme')] },
    { n: 'Market Survey Awards', tag: 'Web · Reading site', blurb: 'Reading pages for 2024–2026 market survey competition winning papers, official appendices and defense videos.', img: [S + 'msa.jpg'], src: 'Live capture of the public site', links: [{ t: 'Open site', u: 'https://tangzy0121.github.io/market-survey-awards/' }, gh('market-survey-awards')] },
  ];
  const css = `
#scv{position:fixed;inset:0;z-index:9998;background:color-mix(in srgb,var(--page-bg) 80%,transparent);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:'Maple Mono','JetBrains Mono',ui-monospace,monospace;color:var(--text)}
#scv .win{outline:none;width:min(1180px,calc(100vw - 16px));height:calc(100vh - 16px);background:var(--term-bg);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25)}
#scv .bar{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:14px}
#scv .bar .t{color:var(--path);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0} #scv .bar button{white-space:nowrap;flex-shrink:0} #scv .sp{flex:1} #scv .hint{color:var(--faint);font-size:12px}
#scv button,#scv a.b{font:inherit;font-size:13px;color:var(--link);background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;text-decoration:none}
#scv button:hover,#scv a.b:hover,#scv button:focus-visible,#scv .card:focus-visible{border-color:var(--link);outline:none}
#scv .body{flex:1;overflow:auto;padding:18px}
#scv h3{font-size:13px;color:var(--muted);font-weight:400;margin:4px 0 10px}
#scv .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-bottom:22px}
#scv .card{text-align:left;padding:0;display:flex;flex-direction:column;overflow:hidden;color:var(--text);border-radius:8px}
#scv .card .th{height:140px;background:color-mix(in srgb,var(--border) 35%,transparent);display:flex;align-items:center;justify-content:center;gap:4px;overflow:hidden}
#scv .card .th img{width:100%;height:100%;object-fit:cover} #scv .card .th img.sm{width:25%;height:auto;object-fit:contain}
#scv .card .th .txt{color:var(--muted);font-size:13px;padding:12px;text-align:center}
#scv .card .c{padding:10px 12px;display:flex;flex-direction:column;gap:4px}
#scv .card .nm{color:var(--link);font-size:15px} #scv .tg{color:var(--muted);font-size:12px} #scv .st{color:var(--warning);font-size:12px}
#scv .card .bl{font-size:12.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#scv .det{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
#scv .demo{border:1px solid var(--border);border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--border) 25%,transparent);display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
#scv .demo img{max-width:100%;display:block} #scv .demo figure{margin:8px;text-align:center;font-size:12px;color:var(--muted)} #scv .demo figure img{width:140px}
#scv .demo .ph{padding:40px;color:var(--muted);font-size:14px;text-align:center;line-height:1.8}
#scv .det .nm{font-size:20px;color:var(--path)} #scv .det p{margin:0;line-height:1.7} #scv .lk{display:flex;gap:8px;flex-wrap:wrap}
#scv .src{color:var(--faint);font-size:12px}
@media (max-width:640px){#scv .win{width:100vw;height:100vh;height:100dvh;border-radius:0;border:0}#scv .hint{display:none}#scv .body{padding:10px}#scv .grid{grid-template-columns:1fr 1fr;gap:8px}#scv .card .th{height:90px}#scv .card .bl{display:none}#scv .demo figure img{width:110px}}`;
  let root, cur = -1;
  const $ = (s) => root.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function close() { root?.remove(); root = null; document.removeEventListener('keydown', onKey, true); document.querySelector('textarea,input')?.focus(); }
  function thumb(p) {
    if (!p.img) return `<div class="th"><div class="txt">${esc(p.tag.split(' · ')[1] || p.tag)}</div></div>`;
    if (p.img.length > 1) return `<div class="th">${p.img.map((u) => `<img class="sm" src="${u}" alt="" loading="lazy">`).join('')}</div>`;
    return `<div class="th"><img src="${p.img[0]}" alt="${esc(p.n)} preview" loading="lazy"></div>`;
  }
  const card = (p, i) => `<button class="card" data-i="${i}" aria-label="${esc(p.n)}">${thumb(p)}<div class="c"><span class="nm">${esc(p.n)}</span><span class="tg">${esc(p.tag)}</span>${p.status ? `<span class="st">${esc(p.status)}</span>` : ''}<span class="bl">${esc(p.blurb)}</span></div></button>`;
  function gallery() {
    cur = -1; $('.t').textContent = '~/projects · showcase'; $('[data-a=back]').style.display = 'none';
    const r = P.map((p, i) => [p, i]).filter(([p]) => p.tag.startsWith('Research')), o = P.map((p, i) => [p, i]).filter(([p]) => !p.tag.startsWith('Research'));
    $('.body').innerHTML = `<h3>Personal projects · click a card for the demo</h3><div class="grid">${o.map(([p, i]) => card(p, i)).join('')}</div><h3>Research</h3><div class="grid">${r.map(([p, i]) => card(p, i)).join('')}</div>`;
    $('.body').scrollTop = 0;
  }
  function detail(i) {
    const p = P[i]; cur = i; $('.t').textContent = `~/projects/${p.n} · ${i + 1}/${P.length}`; $('[data-a=back]').style.display = '';
    const demo = !p.img ? `<div class="ph">Research project · no public demo yet.<br>Details: <b>projects</b> in the terminal${p.paper != null ? ', or read the paper below' : ''}.</div>`
      : p.caps ? p.img.map((u, k) => `<figure><img src="${u}" alt="${p.caps[k]}"><figcaption>${p.caps[k]}</figcaption></figure>`).join('')
      : `<img src="${p.img[0]}" alt="${esc(p.n)} demo">`;
    const links = (p.links || []).map((l) => `<a class="b" href="${l.u}" target="_blank" rel="noopener">${esc(l.t)} ↗</a>`).join('') + (p.paper != null ? `<button data-a="paper">▣ read paper</button>` : '');
    $('.body').innerHTML = `<div class="det"><div class="demo">${demo}</div><span class="nm">${p.icon ? `<img src="${p.icon}" alt="" style="width:28px;vertical-align:middle;margin-right:8px">` : ''}${esc(p.n)}</span><span class="tg">${esc(p.tag)}</span>${p.status ? `<span class="st">${esc(p.status)}</span>` : ''}<p>${esc(p.blurb)}</p><div class="lk">${links || '<span class="tg">Source not public yet.</span>'}</div>${p.src ? `<span class="src">demo: ${esc(p.src)}</span>` : ''}</div>`;
    $('.body').scrollTop = 0;
  }
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape' || e.key === 'q') cur >= 0 ? gallery() : close();
    else if (cur >= 0 && e.key === 'ArrowRight') detail((cur + 1) % P.length);
    else if (cur >= 0 && e.key === 'ArrowLeft') detail((cur - 1 + P.length) % P.length);
    else return;
    e.preventDefault(); e.stopPropagation();
  }
  window.__openShowcase = (i) => {
    if (i != null && !(i >= 0 && i < P.length)) return false;
    if (root) close();
    if (!document.getElementById('scv-css')) { const s = document.createElement('style'); s.id = 'scv-css'; s.textContent = css; document.head.appendChild(s); }
    root = document.createElement('div'); root.id = 'scv'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Projects showcase');
    root.innerHTML = `<div class="win" tabindex="-1"><div class="bar"><button data-a="back" aria-label="Back to gallery">← all</button><span class="t"></span><span class="sp"></span><span class="hint">click card · ←/→ next · esc back/close</span><button data-a="close" aria-label="Close showcase">✕</button></div><div class="body"></div></div>`;
    root.addEventListener('click', (e) => {
      if (e.target === root) return close();
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'close') return close(); if (a === 'back') return gallery();
      if (a === 'paper') { const k = P[cur].paper; close(); return window.__openPaper?.(k); }
      const c = e.target.closest('.card'); if (c) detail(+c.dataset.i);
    });
    document.body.appendChild(root); document.addEventListener('keydown', onKey, true);
    i == null ? gallery() : detail(i);
    setTimeout(() => $('.win')?.focus({ preventScroll: true }), 0);
    return true;
  };
})();
