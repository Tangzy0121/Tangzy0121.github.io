// Playable in-browser mocks for the project rooms. Each mounts into an element; all data is local and illustrative.
(() => {
  const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const css = `
.dm{font-size:13px;line-height:1.6}.dm button{font:inherit;font-size:12.5px;color:var(--link);background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer}.dm button.on{background:var(--link);color:var(--term-bg);border-color:var(--link)}.dm button:disabled{opacity:.35;cursor:default}
.dm input,.dm textarea{font:inherit;font-size:13px;color:var(--text);background:var(--term-bg);border:1px solid var(--border);border-radius:6px;padding:6px 8px;width:100%;box-sizing:border-box}
.dm .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.dm .mut{color:var(--muted)}.dm .ok{color:var(--success,#3a3)}.dm .warn{color:var(--warning)}
.dm .phone{width:300px;max-width:100%;height:520px;margin:0 auto;border:10px solid #222;border-radius:28px;overflow:hidden;display:flex;flex-direction:column;font-family:Georgia,'Noto Serif SC',serif;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.dm .phone .top{display:flex;align-items:center;gap:6px;padding:8px 10px;font-family:inherit;font-size:13px;border-bottom:1px solid rgba(128,128,128,.25)}.dm .phone .top b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dm .phone .top button{padding:2px 7px;color:inherit;border-color:rgba(128,128,128,.4)}
.dm h3{font-size:17px;color:inherit;font-weight:600;margin:0 0 10px}.dm .phone .ft button{font-size:16px;min-width:34px}.dm .phone .pgc{flex:1;overflow:auto;padding:14px 18px}.dm .phone .ft{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;font-size:12px;border-top:1px solid rgba(128,128,128,.25)}
.dm .phone .ft button{color:inherit;border-color:rgba(128,128,128,.4)}
.dm .doc{padding:10px;border:1px solid rgba(128,128,128,.3);border-radius:8px;margin-bottom:8px;cursor:pointer}.dm .doc small{opacity:.65}
.dm .chip{font-size:11px;border:1px solid rgba(128,128,128,.4);border-radius:10px;padding:0 6px;margin-left:4px}
.dm .th-paper{background:#fbfaf6;color:#222}.dm .th-sepia{background:#f3e7cf;color:#4a3b25}.dm .th-night{background:#16181d;color:#c9ccd3}
.dm .term{background:#0f1115;color:#d6d9df;border-radius:8px;padding:12px;font-family:'Maple Mono',ui-monospace,monospace;min-height:300px;max-height:420px;overflow:auto;white-space:pre-wrap}
.dm .term .u{color:#7fb3ff}.dm .term .t{color:#e5c07b}.dm .term .g{color:#98c379}.dm .term .d{color:#7d8590}.dm .term .r{color:#e06c75}
.dm .pane{border:1px solid var(--border);border-radius:8px;padding:10px}.dm .chat .m{margin:6px 0;padding:8px 10px;border-radius:8px;max-width:92%}.dm .chat .me{background:color-mix(in srgb,var(--link) 14%,transparent);margin-left:auto}.dm .chat .ag{background:color-mix(in srgb,var(--border) 40%,transparent)}
.dm .btwwrap{position:relative;height:380px;border-radius:8px;overflow:hidden}.dm .btwwrap .term{height:100%;max-height:none;box-sizing:border-box}
.dm .ov{position:absolute;left:8px;right:8px;bottom:8px;background:#1d2230;border:1px solid #3b4252;border-radius:8px;padding:10px;color:#d6d9df;font-family:'Maple Mono',ui-monospace,monospace;max-height:62%;overflow:auto}
.dm .ov code{background:#0f1115;padding:0 4px;border-radius:4px;color:#e5c07b}
.dm .pet{display:flex;flex-direction:column;align-items:center;gap:10px}.dm .pet img{width:180px;height:180px;object-fit:contain;cursor:pointer}
.dm iframe{width:100%;height:460px;border:1px solid var(--border);border-radius:8px;background:#fff}`;
  if (!document.getElementById('dm-css')) { const s = document.createElement('style'); s.id = 'dm-css'; s.textContent = css; document.head.appendChild(s); }

  // ---------- Folio: local-first reader ----------
  function folio(el) {
    const docs = [
      { n: 'Reading notes.md', tags: ['notes'], fav: true, ch: [['Why local-first', 'Files are copied into the app\'s own library. The original stays untouched, nothing is uploaded, and there is no account.'], ['Themes', 'Tap Aa to switch between paper, sepia and night. Font size and code colours follow the theme.'], ['Progress', 'Reading position is remembered per document, so next time you continue where you stopped.']] },
      { n: 'Lecture-03.html', tags: ['course'], fav: false, ch: [['Processes', 'A process is a running program with its own address space.'], ['Threads', 'Threads share memory inside one process and are scheduled independently.']] },
      { n: 'site-export.zip', tags: ['web'], fav: false, ch: [['index.html', 'Zipped web pages open offline, with their images and styles.'], ['about.html', 'Links between pages inside the zip keep working.']] },
    ];
    let theme = 'paper', fs = 15, d = null, c = 0;
    const pos = {};
    el.innerHTML = `<div class="dm"><div class="phone th-paper"></div><p class="mut" style="text-align:center;margin-top:8px">Try: open a file · ☰ table of contents · ‹ › pages · Aa theme · A−/A+ · ★ favourite · ✏️ edit</p></div>`;
    const ph = el.querySelector('.phone');
    const render = () => {
      ph.className = 'phone th-' + theme;
      if (!d) {
        ph.innerHTML = `<div class="top"><b>Folio · Recent</b><button data-k="aa">Aa</button></div><div class="pgc">${docs.map((x, i) => `<div class="doc" data-o="${i}">${x.fav ? '★ ' : ''}${h(x.n)}${x.tags.map((t) => `<span class="chip">${t}</span>`).join('')}<br><small>${pos[i] != null ? 'continue at ' + (pos[i] + 1) + '/' + x.ch.length : 'not opened yet'}</small></div>`).join('')}<div class="mut" style="font-size:12px;margin-top:12px">🔒 Local library · 0 accounts · 0 uploads</div></div><div class="ft"><span>${docs.length} files</span><button data-k="imp">＋ Open / import</button></div>`;
        return;
      }
      const [t, body] = d.ch[c];
      ph.innerHTML = `<div class="top"><button data-k="home">←</button><b>${h(d.n)}</b><button data-k="toc">☰</button><button data-k="fav">${d.fav ? '★' : '☆'}</button><button data-k="aa">Aa</button><button data-k="edit">✏️</button></div><div class="pgc" style="font-size:${fs}px"><h3 style="margin-top:0">${h(t)}</h3><p class="body">${h(body)}</p></div><div class="ft"><button data-k="prev" ${c ? '' : 'disabled'}>‹</button><span>${c + 1} / ${d.ch.length} · <button data-k="sm">A−</button> <button data-k="lg">A+</button></span><button data-k="next" ${c < d.ch.length - 1 ? '' : 'disabled'}>›</button></div>`;
    };
    ph.addEventListener('click', (e) => {
      const o = e.target.closest('[data-o]'); if (o) { d = docs[+o.dataset.o]; c = pos[+o.dataset.o] || 0; return render(); }
      const k = e.target.closest('[data-k]')?.dataset.k; const i = docs.indexOf(d);
      if (k === 'aa') theme = { paper: 'sepia', sepia: 'night', night: 'paper' }[theme];
      if (k === 'home') d = null; if (k === 'prev') c--; if (k === 'next') c++; if (k === 'fav') d.fav = !d.fav;
      if (k === 'sm') fs = Math.max(12, fs - 1); if (k === 'lg') fs = Math.min(22, fs + 1);
      if (k === 'imp') { docs.push({ n: `imported-${docs.length + 1}.md`, tags: ['new'], fav: false, ch: [['Imported', 'A copy now lives in the local library; the original file was not modified.']] }); }
      if (k === 'toc') { ph.querySelector('.pgc').innerHTML = `<h3 style="margin-top:0">Contents</h3>${d.ch.map((x, j) => `<div class="doc" data-c="${j}">${j === c ? '▸ ' : ''}${h(x[0])}</div>`).join('')}`; return; }
      const cc = e.target.closest('[data-c]'); if (cc) c = +cc.dataset.c;
      if (k === 'edit') { const p = ph.querySelector('.body'); p.contentEditable = 'true'; p.style.outline = '1px dashed currentColor'; p.focus(); p.onblur = () => { d.ch[c][1] = p.textContent; render(); }; return; }
      if (d) pos[i] = c; render();
    });
    render();
  }

  // ---------- Loci: study material -> traceable learning project ----------
  function loci(el) {
    const sample = 'Gradient descent updates parameters in the direction that reduces the loss.\nThe learning rate controls the step size of each update.\nA learning rate that is too large can make training diverge.\nMomentum accumulates past gradients to smooth the updates.';
    el.innerHTML = `<div class="dm"><div class="row" style="align-items:stretch;gap:12px"><div style="flex:1;min-width:240px"><div class="mut">1 · Paste study material (or keep the sample)</div><textarea rows="7">${sample}</textarea><div class="row" style="margin-top:6px"><button data-k="go">▶ Build learning project</button><label class="mut"><input type="checkbox" checked style="width:auto"> keep material on this device</label></div></div><div class="pane chat" style="flex:1.3;min-width:260px;min-height:220px;max-height:380px;overflow:auto"><div class="mut">2 · Loci agent output appears here</div></div></div><p class="mut" style="font-size:12px">Mock of the idea only (Loci's source is private); runs entirely in your browser, nothing is sent anywhere.</p></div>`;
    const out = el.querySelector('.chat'), ta = el.querySelector('textarea');
    const say = (cls, html) => { const m = document.createElement('div'); m.className = 'm ' + cls; m.innerHTML = html; out.appendChild(m); out.scrollTop = out.scrollHeight; return m; };
    el.querySelector('[data-k=go]').onclick = async (e) => {
      e.target.disabled = true; out.innerHTML = '';
      const lines = ta.value.split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
      say('me', `Turn this into a study project (${lines.length} lines).`);
      const t = say('ag', '<span class="mut">reading material…</span>'); await sleep(600);
      t.innerHTML = '<b>Outline</b> (each point cites its source line)<br>' + lines.map((l, i) => `• ${h(l.split(/[,.;]/)[0])} <a href="#" data-l="${i}">[L${i + 1}]</a>`).join('<br>');
      await sleep(500);
      const words = lines[0].replace(/[.,;]/g, '').split(/\s+/).sort((a, b) => b.length - a.length);
      const key = words[0]; const src = lines.findIndex((l) => l.includes(key));
      const q = say('ag', `<b>Check yourself</b><br>${h(lines[src].replace(key, '_____'))}<div class="row" style="margin-top:6px"><input placeholder="your answer" style="flex:1"><button>check</button></div>`);
      q.querySelector('button').onclick = () => { const ok = q.querySelector('input').value.trim().toLowerCase().replace(/[.,]/g, '') === key.toLowerCase().replace(/[.,]/g, ''); say('ag', ok ? `<span class="ok">✓ correct</span> · verified against <b>[L${src + 1}]</b>` : `<span class="warn">✗ not quite</span> · answer: <b>${h(key)}</b> (see [L${src + 1}])`); };
      out.querySelectorAll('[data-l]').forEach((a) => (a.onclick = (ev) => { ev.preventDefault(); const i = +a.dataset.l; say('ag', `<span class="mut">source [L${i + 1}]:</span> “${h(lines[i])}”`); }));
      e.target.disabled = false;
    };
  }

  // ---------- MewCode: agent loop with tool calls + permission gate ----------
  function mewcode(el) {
    el.innerHTML = `<div class="dm"><div class="term"><span class="d">mewcode v1.0-dev · model: (mock) · cwd: ~/demo\nType a task, e.g. "fix the failing test" or "add a hello command".</span>\n</div><div class="row" style="margin-top:8px"><input placeholder="› ask mewcode…" style="flex:1"><button data-k="run">send</button></div><p class="mut" style="font-size:12px">Scripted replay of MewCode's agent loop (no real model is called): plan → tool call → permission gate → edit → test.</p></div>`;
    const t = el.querySelector('.term'), inp = el.querySelector('input'), btn = el.querySelector('[data-k=run]');
    const w = (cls, s) => { const sp = document.createElement('span'); sp.className = cls; sp.textContent = s; t.appendChild(sp); t.scrollTop = t.scrollHeight; return sp; };
    const stream = async (cls, s) => { const sp = w(cls, ''); for (const ch of s) { sp.textContent += ch; t.scrollTop = t.scrollHeight; await sleep(12); } };
    const ask = () => new Promise((res) => { const r = document.createElement('span'); r.innerHTML = '<span class="r">⚠ permission: run </span><b>edit main.go</b>? '; const y = document.createElement('button'), n = document.createElement('button'); y.textContent = 'allow'; n.textContent = 'deny'; [y, n].forEach((b) => { b.style.cssText = 'color:#d6d9df;border-color:#555;margin-right:4px'; r.appendChild(b); }); t.appendChild(r); t.scrollTop = t.scrollHeight; y.onclick = () => { r.remove(); res(true); }; n.onclick = () => { r.remove(); res(false); }; });
    const run = async () => {
      const q = inp.value.trim() || 'add a hello command'; inp.value = ''; btn.disabled = true;
      w('u', `\n› ${q}\n`); await sleep(300);
      const fix = /fix|bug|fail|test/i.test(q);
      if (fix) { w('t', '⚙ tool bash("go test ./...")'); await sleep(500); w('r', '  ✗ FAIL TestAdd: got 3, want 4\n'); await stream('d', '· thinking: Add() returns a-b instead of a+b\n'); w('t', '⚙ tool read_file("main.go")'); await sleep(400); w('g', '  ✓ 42 lines\n'); }
      else { await stream('d', '· thinking: need to find where commands are registered\n'); w('t', '⚙ tool read_file("main.go")'); await sleep(400); w('g', '  ✓ 42 lines\n'); w('t', '⚙ tool grep("func register")'); await sleep(400); w('g', '  ✓ cmd/registry.go:12\n'); }
      const ok = await ask();
      if (!ok) { w('r', '✗ denied · no files changed. Tell me what to do instead.\n'); btn.disabled = false; return; }
      w('t', fix ? '⚙ tool edit_file("main.go", +1 −1)\n' : '⚙ tool edit_file("main.go", +6 −1)\n'); await sleep(300);
      if (fix) { w('r', '- return a - b\n'); w('g', '+ return a + b\n'); } else w('g', '+ reg.Register("hello", func() { fmt.Println("hello") })\n');
      w('t', '⚙ tool bash("go test ./...")'); await sleep(700); w('g', '  ✓ ok  demo  0.21s\n');
      await stream('', `Done: "${q}". 1 file changed, tests pass. Evidence: go test output above.\n`);
      btn.disabled = false; inp.focus();
    };
    btn.onclick = run; inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); run(); } };
  }

  // ---------- tangzy-btw: side question overlay that never touches the transcript ----------
  function btw(el) {
    const main = ['› refactor the parser into two passes', '● Reading src/parser.ts …', '● Pass 1: tokenize; pass 2: build AST', '● Editing src/parser.ts (+48 −31)'];
    el.innerHTML = `<div class="dm"><div class="btwwrap"><div class="term"></div></div><div class="row" style="margin-top:8px"><input value="/btw what does Array.prototype.at(-1) return?" style="flex:1"><button data-k="ask">ask</button><button data-k="x">close panel</button></div><p class="mut" style="font-size:12px">Main session keeps running; the /btw panel overlays the bottom. <span class="cnt"></span></p></div>`;
    const t = el.querySelector('.term'), wrap = el.querySelector('.btwwrap'), inp = el.querySelector('input'), cnt = el.querySelector('.cnt');
    t.innerHTML = main.map((l) => `<div>${h(l)}</div>`).join('');
    const upd = () => (cnt.textContent = `Main transcript: ${t.children.length} lines (unchanged by /btw).`); upd();
    const answers = (q) => /at\(/.test(q) ? 'It returns the **last element**, like `arr[arr.length - 1]`.\n\n```js\n[1, 2, 3].at(-1) // 3\n```' : `Short answer to “${q.replace(/^\/btw\s*/, '')}”: keep it simple and check the docs. *(mock answer)*`;
    const md = (s) => h(s).replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#0f1115;padding:6px;border-radius:4px;margin:6px 0">$2</pre>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
    let ov;
    const ask = async () => {
      const q = inp.value.trim(); if (!q) return;
      if (!ov) { ov = document.createElement('div'); ov.className = 'ov'; wrap.appendChild(ov); }
      const a = document.createElement('div'); a.innerHTML = `<div style="color:#7fb3ff">btw › ${h(q.replace(/^\/btw\s*/, ''))}</div><div class="ans"></div>`; ov.appendChild(a);
      const full = answers(q); const box = a.querySelector('.ans');
      for (let i = 0; i <= full.length; i += 3) { box.innerHTML = md(full.slice(0, i)); ov.scrollTop = ov.scrollHeight; await sleep(15); }
      inp.value = '/btw '; inp.focus(); upd();
    };
    el.querySelector('[data-k=ask]').onclick = ask; inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); ask(); } };
    el.querySelector('[data-k=x]').onclick = () => { ov?.remove(); ov = null; upd(); };
  }

  // ---------- clawd-roxy-theme: switch the real APNG states ----------
  function roxy(el) {
    const S = './showcase/roxy-', st = ['idle', 'thinking', 'working', 'sleeping'];
    el.innerHTML = `<div class="dm pet"><img src="${S}idle.apng" alt="Roxy idle"><div class="row">${st.map((s) => `<button data-s="${s}" class="${s === 'idle' ? 'on' : ''}">${s}</button>`).join('')}<button data-k="sim">▶ simulate an agent task</button></div><div class="mut st">state: idle · click Roxy to poke her</div></div>`;
    const img = el.querySelector('img'), lab = el.querySelector('.st'); let busy = false, idleT;
    const set = (s, why = '') => { img.src = S + s + '.apng'; img.alt = 'Roxy ' + s; el.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('on', b.dataset.s === s)); lab.textContent = 'state: ' + s + (why ? ' · ' + why : ''); clearTimeout(idleT); if (s !== 'sleeping') idleT = setTimeout(() => !busy && set('sleeping', 'no activity for 20s'), 20000); };
    el.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => set(b.dataset.s)));
    img.onclick = () => set('thinking', 'poked!');
    el.querySelector('[data-k=sim]').onclick = async (e) => { busy = true; e.target.disabled = true; set('thinking', 'agent is planning'); await sleep(1800); set('working', 'agent is running tools'); await sleep(2600); set('idle', 'task done'); busy = false; e.target.disabled = false; };
    set('idle');
  }

  // ---------- Market Survey Awards: the live site, embedded ----------
  function msa(el) {
    const U = 'https://tangzy0121.github.io/market-survey-awards/';
    el.innerHTML = `<div class="dm"><div class="row" style="margin-bottom:6px"><span class="mut">Live site below — scroll, search and open papers right here.</span><span style="flex:1"></span><button data-k="r">↻ reload</button><a href="${U}" target="_blank" rel="noopener" style="color:var(--link)">open in new tab ↗</a></div><iframe src="${U}" title="Market Survey Awards live site" loading="lazy"></iframe></div>`;
    el.querySelector('[data-k=r]').onclick = () => { const f = el.querySelector('iframe'); f.src = U; };
  }

  window.__demos = { Folio: folio, Loci: loci, MewCode: mewcode, 'tangzy-btw': btw, 'clawd-roxy-theme': roxy, 'Market Survey Awards': msa };
})();
