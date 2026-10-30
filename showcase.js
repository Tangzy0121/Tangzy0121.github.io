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
    { n: 'clawd-roxy-theme', tag: 'Desktop pet theme', blurb: 'Chibi Roxy theme for Clawd on Desk, with animated states for idle, thinking, working and sleeping.', img: ['idle', 'thinking', 'working', 'happy', 'sleeping'].map((s) => S + 'roxy-' + s + '.apng'), caps: ['idle', 'thinking', 'working', 'happy', 'sleeping'], src: 'APNG animations from themes/roxy-chibi/assets', links: [gh('clawd-roxy-theme')] },
    { n: 'Market Survey Awards', tag: 'Web · Reading site', blurb: 'Reading pages for 2024–2026 market survey competition winning papers, official appendices and defense videos.', img: [S + 'msa-preview.png'], src: 'output/preview.png from the repo', links: [{ t: 'Open site', u: 'https://tangzy0121.github.io/market-survey-awards/' }, gh('market-survey-awards')] },
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
#scv .cv{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-family:'Maple Mono',ui-monospace,monospace}#scv .cv .mk{font-size:30px;letter-spacing:.02em}#scv .cv .sb{font-size:11.5px;opacity:.85;display:flex;gap:6px;flex-wrap:wrap;justify-content:center}#scv .cv .sb i{font-style:normal;border-radius:4px;padding:1px 6px;font-weight:700}#scv .card .th .txt{color:var(--muted);font-size:13px;padding:12px;text-align:center}
#scv .card .c{padding:10px 12px;display:flex;flex-direction:column;gap:4px}
#scv .card .nm{color:var(--link);font-size:15px} #scv .tg{color:var(--muted);font-size:12px} #scv .st{color:var(--warning);font-size:12px}
#scv .card .bl{font-size:12.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#scv .det{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
#scv .demo{border:1px solid var(--border);border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--border) 25%,transparent);display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
#scv .demo img{max-width:100%;display:block} #scv .demo figure{margin:8px;text-align:center;font-size:12px;color:var(--muted)} #scv .demo figure img{width:140px}
#scv .demo .ph{padding:40px;color:var(--muted);font-size:14px;text-align:center;line-height:1.8}
#scv .det .nm{font-size:20px;color:var(--path)} #scv .det p{margin:0;line-height:1.7} #scv .lk{display:flex;gap:8px;flex-wrap:wrap}
#scv .room{display:grid;grid-template-columns:300px 1fr;gap:18px;align-items:start}#scv aside{display:flex;flex-direction:column;gap:10px}#scv aside p{margin:0;line-height:1.7;font-size:13.5px}#scv aside .nm{font-size:20px;color:var(--path)}#scv .pv{border:1px solid var(--border);border-radius:8px;overflow:hidden;display:flex;justify-content:center;gap:2px}#scv .pv img{max-width:100%;display:block}#scv section{border:1px solid var(--border);border-radius:10px;padding:14px;min-width:0}#scv .dh{color:var(--path);margin-bottom:10px}#scv .ph{padding:40px;color:var(--muted);text-align:center;line-height:1.8}
@media (max-width:820px){#scv .room{grid-template-columns:1fr}#scv section{order:-1;padding:8px}}
#scv .src{color:var(--faint);font-size:12px}
#scv .grid.bento{grid-template-columns:repeat(4,1fr);grid-auto-flow:dense}
#scv .grid.bento .card.big{grid-column:span 2}#scv .grid.bento .card.big .th{height:220px}
#scv .card{transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,border-color .25s;animation:scvIn .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--k,0)*55ms)}
#scv .card:hover{transform:translateY(-4px);box-shadow:0 12px 28px rgba(0,0,0,.14);border-color:var(--link)}
#scv .card .th img{transition:transform .5s cubic-bezier(.2,.8,.2,1)}#scv .card:hover .th img{transform:scale(1.04)}
#scv .card .num{position:absolute;top:8px;left:10px;font-size:11px;color:#fff;background:rgba(0,0,0,.55);border-radius:4px;padding:1px 6px}#scv .card .th{position:relative}
#scv .card .try{font-size:11.5px;color:var(--link);opacity:.0;transition:opacity .2s}#scv .card:hover .try,#scv .card:focus-visible .try{opacity:1}
#scv .boot{font-size:12.5px;color:var(--muted);margin:-4px 0 12px}#scv .boot b{color:var(--path);font-weight:400}
#scv .room{animation:scvRoom .45s cubic-bezier(.2,.8,.2,1) both}
#scv .pn{display:flex;justify-content:space-between;gap:10px;margin-top:16px;border-top:1px solid var(--border);padding-top:12px}#scv .pn button{max-width:48%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@keyframes scvIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes scvRoom{from{opacity:0;transform:translateX(var(--dx,24px))}to{opacity:1;transform:none}}
@media (max-width:900px){#scv .grid.bento{grid-template-columns:1fr 1fr}#scv .grid.bento .card.big .th{height:150px}}
@media (max-width:640px){#scv .card .try{opacity:1}}
@media (prefers-reduced-motion:reduce){#scv .card,#scv .room{animation:none}#scv .card,#scv .card .th img{transition:none}}
@media (max-width:640px){#scv .win{width:100vw;height:100vh;height:100dvh;border-radius:0;border:0}#scv .hint{display:none}#scv .body{padding:10px}#scv .grid{grid-template-columns:1fr 1fr;gap:8px}#scv .card .th{height:90px}#scv .card .bl{display:none}#scv .demo figure img{width:110px}}`;
  let root, cur = -1;
  const $ = (s) => root.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function close() { root?.remove(); root = null; document.removeEventListener('keydown', onKey, true); document.querySelector('textarea,input')?.focus(); }

  // Card covers: real assets where they exist; otherwise a terminal-style mark (labelled as a mark, not a screenshot).
  const mono = (big, sub, fg = '#98c379') => `<div class="cv" style="background:#0f1115;color:${fg}"><span class="mk">${big}</span><span class="sb">${sub}</span></div>`;
  const COVER = {
    Folio: `<div class="cv" style="background:linear-gradient(135deg,#F2F0EA,#E7EEE9);color:#23272E"><img src="${S}folio-icon.png" alt="" style="width:64px;height:64px;border-radius:16px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,.15)"><span class="mk" style="font-family:Inter,system-ui,sans-serif;font-weight:800;color:#23272E">Folio</span><span class="sb"><i style="background:#DCEBD6;color:#3C7A3C">MD</i><i style="background:#FBE4CC;color:#B45F06">HTML</i><i style="background:#D6E4F0;color:#1F5C99">ZIP</i></span></div>`,
    Loci: mono('loci<span style="color:#7d8590">_</span>', '资料 → 学习书 → 测验 → 复习', '#7fb3ff'),
    MewCode: `<div class="cv" style="background:#0f1115;color:#d6d9df;align-items:flex-start;padding:14px 18px"><pre style="margin:0;color:#f0c48c;font-size:15px;line-height:1.15"> /\\_/\\\n( o.o )\n > ^ <</pre><span class="sb" style="color:#98c379">$ mewcode<br><span style="color:#e5c07b">╭ ✓ read</span> <span style="color:#e5c07b">╭ ✋ edit?</span></span></div>`,
    'Asimov Cascade': mono('[AC]', 'cascade monitoring · ICRA 2027', '#e5c07b'),
    SafeCE: mono('[CE]', 'risk-aware cardinality estimation', '#e5c07b'),
    'Anyscale-DBCO': mono('[CO]', 'decompose → route → compose', '#e5c07b'),
  };
  function thumb(p) {
    const num = '';
    if (COVER[p.n]) return `<div class="th">${COVER[p.n]}</div>`;
    if (!p.img) return `<div class="th"><div class="txt">${esc(p.tag.split(' · ')[1] || p.tag)}</div></div>`;
    if (p.img.length > 1) return `<div class="th">${p.img.map((u) => `<img class="sm" src="${u}" alt="" loading="lazy">`).join('')}</div>`;
    return `<div class="th"><img src="${p.img[0]}" alt="${esc(p.n)} preview" loading="lazy"></div>`;
  }
  const BIG = new Set(['Folio', 'MewCode']);
  const card = (p, i, k = 0) => `<button class="card${BIG.has(p.n) ? ' big' : ''}" style="--k:${k}" data-i="${i}" aria-label="${esc(p.n)}">${thumb(p).replace('<div class="th">', `<div class="th"><span class="num">${String(i + 1).padStart(2, '0')}</span>`)}<div class="c"><span class="nm">${esc(p.n)}</span><span class="tg">${esc(p.tag)}</span>${p.status ? `<span class="st">${esc(p.status)}</span>` : ''}<span class="bl">${esc(p.blurb)}</span><span class="try">${window.__demos?.[p.n] ? '▶ enter demo room' : '→ open'}</span></div></button>`;
  function gallery() {
    cur = -1; $('.t').textContent = '~/projects · showcase'; $('[data-a=back]').style.display = 'none';
    const r = P.map((p, i) => [p, i]).filter(([p]) => p.tag.startsWith('Research')), o = P.map((p, i) => [p, i]).filter(([p]) => !p.tag.startsWith('Research'));
    $('.body').innerHTML = `<div class="boot"><b>tang:~/projects$</b> ls --demos · ${o.length} playable rooms · ${r.length} research</div><h3>Personal projects · click a card to enter its demo room</h3><div class="grid bento">${o.map(([p, i], k) => card(p, i, k)).join('')}</div><h3>Research</h3><div class="grid">${r.map(([p, i], k) => card(p, i, k + o.length)).join('')}</div>`;
    $('.body').scrollTop = 0;
  }
  function detail(i, dx = 24) {
    const p = P[i]; cur = i; $('.t').textContent = `~/projects/${p.n} · demo room · ${i + 1}/${P.length}`; $('[data-a=back]').style.display = '';
    const mount = window.__demos?.[p.n];
    const links = (p.links || []).map((l) => `<a class="b" href="${l.u}" target="_blank" rel="noopener">${esc(l.t)} ↗</a>`).join('') + (p.paper != null ? `<button data-a="paper">▣ read paper</button>` : '');
    const asset = p.img ? (p.caps ? `<div class="pv">${p.img.map((u) => `<img src="${u}" alt="" style="width:23%">`).join('')}</div>` : `<div class="pv"><img src="${p.img[0]}" alt="${esc(p.n)} preview"></div>`) : '';
    const pv = P[(i - 1 + P.length) % P.length], nx = P[(i + 1) % P.length];
    $('.body').innerHTML = `<div class="boot"><b>tang:~/projects$</b> cd ${esc(p.n.toLowerCase().replace(/\s+/g, '-'))} &amp;&amp; ./demo</div><div class="room" style="--dx:${dx}px"><aside><span class="nm">${p.icon ? `<img src="${p.icon}" alt="" style="width:28px;vertical-align:middle;margin-right:8px">` : ''}${esc(p.n)}</span><span class="tg">${esc(p.tag)}</span>${p.status ? `<span class="st">${esc(p.status)}</span>` : ''}<p>${esc(p.blurb)}</p><div class="lk">${links || '<span class="tg">Source not public yet.</span>'}</div>${asset}${p.src ? `<span class="src">image: ${esc(p.src)}</span>` : ''}</aside><section><div class="dh">${mount ? '▶ Try it' : 'Demo'}</div><div class="stage2">${mount ? '' : `<div class="ph">Research project — no public demo yet, so there is nothing interactive here.${p.paper != null ? '<br>The paper (anonymized review copy) is readable with the button on the left.' : '<br>Details: type <b>projects</b> in the terminal.'}</div>`}</div></section></div><div class="pn"><button data-a="pv">← ${esc(pv.n)}</button><button data-a="nx">${esc(nx.n)} →</button></div>`;
    if (mount) try { mount($('.stage2')); } catch (err) { $('.stage2').textContent = 'demo failed to load'; }
    $('.body').scrollTop = 0;
  }
  function onKey(e) {
    if (!root) return;
    const typing = e.target.closest?.('input,textarea,[contenteditable=true]');
    if (typing && e.key !== 'Escape') return;
    if (e.key === 'Escape' || e.key === 'q') cur >= 0 ? gallery() : close();
    else if (cur >= 0 && e.key === 'ArrowRight') detail((cur + 1) % P.length, 24);
    else if (cur >= 0 && e.key === 'ArrowLeft') detail((cur - 1 + P.length) % P.length, -24);
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
      if (a === 'close') return close(); if (a === 'pv') return detail((cur - 1 + P.length) % P.length, -24); if (a === 'nx') return detail((cur + 1) % P.length, 24); if (a === 'back') return gallery();
      if (a === 'paper') { const k = P[cur].paper; close(); return window.__openPaper?.(k); }
      const c = e.target.closest('.card'); if (c) detail(+c.dataset.i);
    });
    document.body.appendChild(root); document.addEventListener('keydown', onKey, true);
    i == null ? gallery() : detail(i);
    setTimeout(() => $('.win')?.focus({ preventScroll: true }), 0);
    return true;
  };
})();
