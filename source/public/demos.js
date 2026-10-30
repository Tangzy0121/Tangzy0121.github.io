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

  const note = (t) => `<p class="mut" style="font-size:12px;margin:8px 0 0">${t}</p>`;

  // ---------- Folio: the repo's own interactive prototype (design/folio-demo.html), embedded unchanged ----------
  function folio(el) {
    el.innerHTML = `<div class="dm"><iframe src="./showcase/folio-demo.html" title="Folio interactive prototype" style="height:640px"></iframe>${note('This is <b>Folio\'s own clickable prototype</b> (<code>design/folio-demo.html</code> in the repo, the design the Android app was built from): file cards for MD / ZIP / HTML, recent and favourites with ★, the <b>Aa</b> sheet with the app\'s 9 reading themes (纸白 · 米黄 · 青墨 · 灰岩 · 夜黑 · 深蓝夜 · 晨曦 · 远山 · 竹林, same as <code>ReaderTheme.kt</code>), fonts and size, ☰ table of contents, and 🗂 the file tree inside a ZIP. The real app is native Kotlin on Android 7.0+; this web prototype is simplified.')}</div>`;
  }

  // ---------- Loci: flow from the public privacy policy (material -> learning book & chapters -> quiz -> review) ----------
  function loci(el) {
    const steps = [
      ['登录', 'Sign in via OIDC', 'Only the identity provider\'s user ID is kept, never your password.'],
      ['上传资料', 'Upload study material', 'Documents you add become the source of a learning project.'],
      ['生成学习书', 'Generate a learning book', 'Loci\'s server sends parts of the material to the LLM (DeepSeek by default, OpenAI-compatible). The model key stays on the server.'],
      ['章节阅读', 'Read by chapter', 'The book is split into chapters you can read, with each point traceable to the material.'],
      ['测验', 'Quiz & verify', 'Answer questions generated from the chapters; answers are recorded.'],
      ['复习安排', 'Review schedule', 'Quiz results drive what to review next and the project\'s progress.'],
    ];
    let k = 0;
    el.innerHTML = `<div class="dm"><div class="row" style="gap:4px;margin-bottom:10px">${steps.map((s, i) => `<button data-s="${i}">${i + 1}. ${s[0]}</button>`).join('<span class="mut">→</span>')}</div><div class="pane" style="min-height:150px"><div class="cap" style="font-size:15px;color:var(--path)"></div><p class="txt" style="margin:8px 0"></p><div class="flow mut" style="font-size:12px"></div></div><div class="row" style="margin-top:8px"><button data-k="p">‹ prev</button><button data-k="n">next ›</button></div>${note('Loci\'s source is private, so this is a <b>walkthrough of the stated product flow</b>, not the app. Every step and data-handling line comes from the public <a href="https://tangzy0121.github.io/loci-privacy/" target="_blank" rel="noopener">Loci privacy policy</a> (2026-09-29): OIDC login, learning data on Loci\'s server (PostgreSQL/JSON) and the device, LLM via DeepSeek with the key server-side only.')}</div>`;
    const where = ['device ⇄ OIDC provider', 'device → Loci server', 'Loci server → LLM (DeepSeek) → Loci server', 'Loci server ⇄ device (local DB)', 'device → Loci server', 'Loci server ⇄ device'];
    const show = () => { el.querySelectorAll('[data-s]').forEach((b, i) => b.classList.toggle('on', i === k)); el.querySelector('.cap').textContent = `${k + 1}. ${steps[k][0]} · ${steps[k][1]}`; el.querySelector('.txt').textContent = steps[k][2]; el.querySelector('.flow').textContent = 'data path: ' + where[k]; el.querySelector('[data-k=p]').disabled = !k; el.querySelector('[data-k=n]').disabled = k === steps.length - 1; };
    el.addEventListener('click', (e) => { const s = e.target.closest('[data-s]'); if (s) k = +s.dataset.s; const b = e.target.closest('[data-k]')?.dataset.k; if (b === 'p') k--; if (b === 'n') k++; show(); });
    show();
  }

  // ---------- MewCode: v0's real agent loop: 6 tools, 3 permission modes, tool cards, [a]/[s]/[d] prompt ----------
  function mewcode(el) {
    const SIDE = { write: 1, edit: 1, bash: 1 };
    el.innerHTML = `<div class="dm"><div class="row" style="margin-bottom:6px"><span class="mut">mode:</span>${['default', 'plan', 'auto'].map((m) => `<button data-m="${m}" class="${m === 'default' ? 'on' : ''}">${m}</button>`).join('')}<span class="mut aa" style="font-size:12px"></span></div><div class="term"><span style="color:#f0c48c"> /\\_/\\\n( o.o )\n &gt; ^ &lt;</span>\n<span class="d">mewcode · tools: read write edit glob grep bash</span>\n<span class="d">try: "fix the failing test" — then switch mode and run it again</span>\n</div><div class="perm" style="display:none;margin-top:6px"></div><div class="row" style="margin-top:8px"><input value="fix the failing test" style="flex:1"><button data-k="run">send</button></div>${note('Replays the <b>mewcode-v0</b> agent loop from its source: the six tools in <code>tools/registry.go</code>; <code>permission.go</code> modes (read-only tools always run; write/edit/bash ask in <b>default</b>, are refused in <b>plan</b>, run in <b>auto</b>); the TUI\'s ⏳/✓/✗ tool cards and the <code>✋ allow …? [a] allow once [s] always allow [d] deny</code> prompt. Scripted: no model is called. v1 (<a href="https://github.com/Tangzy0121/mewcode-go" target="_blank" rel="noopener">mewcode-go</a>) is being rebuilt chapter by chapter.')}</div>`;
    const t = el.querySelector('.term'), inp = el.querySelector('input'), btn = el.querySelector('[data-k=run]'), perm = el.querySelector('.perm'), aaL = el.querySelector('.aa');
    let mode = 'default'; const always = new Set();
    const setAA = () => (aaL.textContent = always.size ? '· always allowed: ' + [...always].join(', ') : '');
    el.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { mode = b.dataset.m; el.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b)); }));
    const w = (cls, s) => { const sp = document.createElement('span'); sp.className = cls; sp.textContent = s; t.appendChild(sp); t.scrollTop = t.scrollHeight; return sp; };
    const card = async (name, arg, out, bad) => { const c = w('t', `╭ ⏳ ${name}  ${arg}\n`); await sleep(450); c.className = bad ? 'r' : 'g'; c.textContent = `╭ ${bad ? '✗' : '✓'} ${name}  ${arg}\n╰ ${out}\n`; };
    const ask = (name, arg) => new Promise((res) => { perm.style.display = ''; perm.innerHTML = `<span class="warn">✋ allow ${name}?</span> <span class="mut">${h(arg)}</span><div class="row" style="margin-top:4px"><button data-c="a">[a] allow once</button><button data-c="s">[s] always allow</button><button data-c="d">[d] deny</button></div>`; perm.onclick = (e) => { const c = e.target.closest('[data-c]')?.dataset.c; if (!c) return; perm.style.display = 'none'; res(c); }; });
    const gate = async (name, arg) => {
      if (!SIDE[name]) return true;
      if (mode === 'plan') { w('r', `╭ ✗ ${name}  ${arg}\n╰ denied: plan mode is read-only; switch to default or auto mode to run write/edit/bash tools\n`); return false; }
      if (mode === 'auto' || always.has(name)) return true;
      const c = await ask(name, arg); if (c === 's') { always.add(name); setAA(); } if (c === 'd') { w('r', `╭ ✗ ${name}  refused by user\n`); return false; } return true;
    };
    const run = async () => {
      const q = inp.value.trim() || 'fix the failing test'; btn.disabled = true;
      w('u', `\n› ${q}\n`);
      if (await gate('bash', '{"command":"go test ./..."}')) await card('bash', '{"command":"go test ./..."}', 'FAIL TestAdd: got -1, want 5', true);
      await card('grep', '{"pattern":"func Add"}', 'calc.go:3', false);
      await card('read', '{"path":"calc.go"}', '7 lines', false);
      w('', 'Add subtracts instead of adding; changing `a - b` to `a + b`.\n');
      if (await gate('edit', '{"path":"calc.go","old":"a - b","new":"a + b"}')) {
        await card('edit', '{"path":"calc.go"}', '1 replacement', false);
        if (await gate('bash', '{"command":"go test ./..."}')) { await card('bash', '{"command":"go test ./..."}', 'ok  calc  0.004s', false); w('', 'Fixed: TestAdd passes.\n'); }
        else w('', 'Edit made, but I could not re-run the tests.\n');
      } else w('', mode === 'plan' ? 'No files changed. In plan mode I can only read and propose: replace `a - b` with `a + b` in calc.go.\n' : 'No files changed (edit refused).\n');
      btn.disabled = false;
    };
    btn.onclick = run; inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); run(); } };
  }

  // ---------- tangzy-btw: bottom overlay, one-shot answers with waiting timer, Recap line, conversations ----------
  function btw(el) {
    el.innerHTML = `<div class="dm"><div class="btwwrap"><div class="term"><div class="u">› refactor the parser into two passes</div><div>● read src/parser.ts</div><div>● Pass 1 tokenizes, pass 2 builds the AST.</div><div>● edit src/parser.ts (+48 −31)</div><div class="d">pi main session · keeps running</div></div></div><div class="row" style="margin-top:8px"><input value="/btw what does Array.prototype.at(-1) return?" style="flex:1"><button data-k="ask">enter</button></div><div class="row" style="margin-top:6px"><span class="mut">try:</span><button data-q="/btw new">/btw new</button><button data-q="/btw history">/btw history</button><button data-q="/btw clear">/btw clear</button><button data-k="esc">Esc</button></div><p class="mut cnt" style="font-size:12px"></p>${note('Mirrors the README: <code>/btw &lt;question&gt;</code> opens a <b>bottom overlay</b> (no terminal takeover); a live waiting timer while the model thinks; the answer arrives <b>one-shot</b> (not token-streamed, by design) and lands at its beginning, ending with a <code>&gt; Recap:</code> line; follow-ups keep context; <code>/btw new</code> · <code>history</code> · <code>clear</code>; header shows <code>turn n/N</code> and <code>#n/N</code>; <code>Esc</code> closes and aborts. Side threads never touch the main transcript. Answers here are canned; the real one calls your pi model.')}</div>`;
    const wrap = el.querySelector('.btwwrap'), main = el.querySelector('.term'), inp = el.querySelector('input'), cnt = el.querySelector('.cnt');
    const convs = [[]]; let ci = 0, ov, timer, abort = false;
    const lines0 = main.children.length; const upd = () => (cnt.textContent = `main transcript: ${main.children.length} lines (was ${lines0}) · side conversations: ${convs.length}`);
    const ans = (q) => /at\(/.test(q) ? 'It returns the **last element**, same as `arr[arr.length - 1]`; negative indexes count from the end.\n\n```js\n[1, 2, 3].at(-1) // 3\n```\n> Recap: `.at(-1)` = last item.'
      : /why|为什么/.test(q) ? 'Because the follow-up keeps this side thread as context, the panel can answer relative to the previous turn.\n> Recap: follow-ups share side-thread context.'
      : `Here is a short side answer to “${q}”, using a read-only snapshot of the main session.\n> Recap: side answer, main session untouched.`;
    const md = (s) => h(s).replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#0f1115;padding:6px;border-radius:4px;margin:6px 0">$2</pre>').replace(/^&gt; (Recap:.*)$/m, '<div style="color:#98c379">&gt; $1</div>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
    const paint = (extra = '') => {
      if (!ov) { ov = document.createElement('div'); ov.className = 'ov'; wrap.appendChild(ov); }
      const c = convs[ci];
      ov.innerHTML = `<div class="d" style="color:#7d8590;margin-bottom:4px">btw · turn ${c.length}/${c.length}${convs.length > 1 ? ` · #${ci + 1}/${convs.length}` : ''} · Esc close</div>` + c.map((x) => `<div style="color:#7fb3ff">› ${h(x.q)}</div><div style="margin-bottom:8px">${md(x.a)}</div>`).join('') + extra;
      const last = ov.querySelectorAll('div[style*="7fb3ff"]'); if (last.length) ov.scrollTop = last[last.length - 1].offsetTop - 30; upd();
    };
    const close = () => { abort = true; clearInterval(timer); ov?.remove(); ov = null; upd(); };
    const send = async () => {
      const raw = inp.value.trim(); if (!raw.startsWith('/btw')) { inp.value = '/btw '; return; }
      const arg = raw.replace(/^\/btw\s*/, '');
      if (arg === 'new') { convs.push([]); ci = convs.length - 1; paint('<div class="d">new side conversation</div>'); inp.value = '/btw '; return; }
      if (arg === 'clear') { convs[ci] = []; paint('<div class="d">conversation cleared</div>'); inp.value = '/btw '; return; }
      if (arg === 'history') { paint('<div class="d">history:</div>' + convs.map((c, i) => `<div>#${i + 1} ${h(c[0]?.q || '(empty)')}</div>`).join('')); inp.value = '/btw '; return; }
      if (!arg) return;
      abort = false; paint(`<div style="color:#7fb3ff">› ${h(arg)}</div><div class="wait d">⠋ thinking… 0s · Esc to abort</div>`);
      let s = 0; timer = setInterval(() => { s++; const wv = ov?.querySelector('.wait'); if (wv) wv.textContent = `⠋ thinking… ${s}s · Esc to abort`; }, 1000);
      await sleep(1800); clearInterval(timer); if (abort || !ov) return;
      convs[ci].push({ q: arg, a: ans(arg) }); paint(); inp.value = '/btw why?'; inp.focus();
    };
    el.querySelector('[data-k=ask]').onclick = send; el.querySelector('[data-k=esc]').onclick = close;
    el.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { inp.value = b.dataset.q; send(); }));
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); send(); } if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    upd();
  }

  // ---------- clawd-roxy-theme: theme.json state map -> real APNGs ----------
  function roxy(el) {
    const S = './showcase/roxy-';
    const map = { idle: 'idle', thinking: 'thinking', working: 'working', juggling: 'working', sweeping: 'working', carrying: 'working', attention: 'happy', notification: 'notification', error: 'error', sleeping: 'sleeping' };
    el.innerHTML = `<div class="dm pet"><img src="${S}idle.apng" alt="Roxy idle"><div class="mut st"></div><div class="row" style="justify-content:center">${Object.keys(map).map((s) => `<button data-s="${s}">${s}</button>`).join('')}</div><div class="row" style="justify-content:center"><button data-k="sim">▶ replay a Claude Code session</button></div>${note('Every button is a state key from <code>themes/roxy-chibi/theme.json</code>, showing the APNG that file maps it to (e.g. juggling / sweeping / carrying → <code>roxy-working.apng</code>, attention → <code>roxy-happy.apng</code>). In Clawd on Desk the agent\'s hook events pick the state; here you pick it, or replay a typical sequence.')}</div>`;
    const img = el.querySelector('img'), lab = el.querySelector('.st');
    const set = (s) => { img.src = S + map[s] + '.apng'; img.alt = 'Roxy ' + s; lab.innerHTML = `state <b>${s}</b> → roxy-${map[s]}.apng`; el.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('on', b.dataset.s === s)); };
    el.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => set(b.dataset.s)));
    el.querySelector('[data-k=sim]').onclick = async (e) => { e.target.disabled = true; for (const [s, ms] of [['thinking', 1500], ['working', 2200], ['notification', 1500], ['attention', 1500], ['idle', 1500], ['sleeping', 0]]) { set(s); await sleep(ms); } e.target.disabled = false; };
    set('idle');
  }

  // ---------- Market Survey Awards: the live site ----------
  function msa(el) {
    const U = 'https://tangzy0121.github.io/market-survey-awards/';
    el.innerHTML = `<div class="dm"><div class="row" style="margin-bottom:6px"><span class="mut">The real site, live. Reports, appendices and the 67 defense-video links are all usable here.</span><span style="flex:1"></span><button data-k="r">↻ reload</button><a href="${U}" target="_blank" rel="noopener" style="color:var(--link)">open in new tab ↗</a></div><iframe src="${U}" title="Market Survey Awards live site" loading="lazy"></iframe>${note('Not a mock: this is the deployed GitHub Pages site (built by the repo\'s Actions from a pinned Release, SHA-256 checked). Some defense videos are on Bilibili and may ask for login.')}</div>`;
    el.querySelector('[data-k=r]').onclick = () => { el.querySelector('iframe').src = U; };
  }

  window.__demos = { Folio: folio, Loci: loci, MewCode: mewcode, 'tangzy-btw': btw, 'clawd-roxy-theme': roxy, 'Market Survey Awards': msa };
})();
