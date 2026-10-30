// Award certificates: gallery grid -> lightbox. window.__openCerts(i?) (0-based). Images rendered from the user's certificate collection PDF.
(() => {
  const C = [
    ['2025.04', '黑龙江省大学生工程实践与创新能力大赛 · 工程文化赛项', '一等奖', 'c'],
    ['2025.04', '哈尔滨工业大学 2024 秋季学期人民奖学金', '三等', 'h'],
    ['2025.05', '第 20 届黑龙江省大学生程序设计竞赛', '二等奖', 'c'],
    ['2025.05', 'CCPC 2025 全国邀请赛（东北）', '优胜奖 · Honorable Mention', 'c'],
    ['2025.05', '第 19 届东北地区大学生程序设计竞赛', '铜牌 · Bronze Medal', 'c'],
    ['2025', '哈工大基础学部 2024–2025 年度五四表彰', '优秀团员', 'h'],
    ['2025.06', '2025“拓竹杯”暨首届“新睿创新”杯 3D 造物大赛', '二等奖', 'c'],
    ['2025.07', '大一年度项目计划 · 基于 Jetson Nano 和 YOLO 的定时定位系统', '二等奖', 'c'],
    ['2025.08', '2025 全国大学生 5 分钟科研英语演讲（5MRP）', '全国特等奖 · Grand Prize', 'c'],
    ['2025.09', '2025 大学生“AI+信息素养”大赛 · 哈工大校赛', '三等奖', 'c'],
    ['2025.10', '哈尔滨工业大学 2025 春季学期人民奖学金', '二等', 'h'],
    ['2025.10', '全国大学生数学建模竞赛 · 黑龙江赛区', '一等奖', 'c'],
    ['2025.11', 'CCPC 2025 哈尔滨站', '优秀志愿者 · Excellent Volunteer', 'h'],
    ['2025.11', '第十七届全国大学生数学竞赛（黑龙江赛区）', '二等奖', 'c'],
    ['2025', '第十七届全国大学生数学竞赛（非数学 B 类）', '二等奖', 'c'],
    ['2025', '第四届黑龙江省大学生智能感知对抗赛', '三等奖', 'c'],
    ['2025', '哈尔滨工业大学 2024–2025 年度', '优秀学生', 'h'],
    ['2025.12', '哈工大经济与管理学院 2024–2025 年度', '优秀学业帮辅志愿者', 'h'],
    ['2026.01', 'ShuWei Cup IMCM 2025', 'Honorable Mention', 'c'],
    ['2026.02', '2026 牛客寒假算法集训营', '排名证书 · 第 1110 名', 'c'],
    ['2026.02', '2026 牛客寒假算法集训营', '二等奖', 'c'],
    ['2026.04', '哈尔滨工业大学 2025 秋季学期人民奖学金', '二等', 'h'],
    ['2026', 'MCM 2026 (Mathematical Contest in Modeling)', 'Honorable Mention', 'c'],
    ['2026.05', '第 21 届黑龙江省大学生程序设计竞赛', '二等奖', 'c'],
    ['2026.05', '共青团哈尔滨工业大学委员会 2025–2026 年度', '优秀团员 · 勤学求真奖', 'h'],
    ['2026.05', '哈工大经济与管理学院 2026 年度', '“最美笔记”', 'h'],
  ].map(([d, t, l, k], i) => ({ d, t, l, k, n: String(i + 1).padStart(2, '0') }));
  const ORDER = C.map((_, i) => i).reverse(); // newest first
  const css = `
#crt{position:fixed;inset:0;z-index:9998;background:color-mix(in srgb,var(--page-bg) 80%,transparent);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:'Maple Mono','JetBrains Mono',ui-monospace,monospace;color:var(--text)}
#crt .win{outline:none;width:min(1180px,calc(100vw - 16px));height:calc(100vh - 16px);background:var(--term-bg);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25)}
#crt .bar{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:14px}#crt .bar .t{color:var(--path);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}#crt .sp{flex:1}#crt .hint{color:var(--faint);font-size:12px}
#crt button{font:inherit;font-size:13px;color:var(--link);background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;white-space:nowrap}#crt button:hover,#crt button:focus-visible{border-color:var(--link);outline:none}
#crt .body{flex:1;overflow:auto;padding:18px}
#crt .boot{font-size:13px;color:var(--muted);margin-bottom:10px}#crt .boot b{color:var(--path);font-weight:400}
#crt h3{font-size:13px;color:var(--path);font-weight:600;letter-spacing:.03em;margin:8px 0 12px;padding-left:9px;border-left:3px solid var(--link)}
#crt .fl{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}#crt .fl button.on{background:var(--link);color:var(--term-bg);border-color:var(--link)}
#crt .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
#crt .card{padding:0;text-align:left;display:flex;flex-direction:column;overflow:hidden;border-radius:8px;color:var(--text);animation:cin .35s ease both;animation-delay:calc(var(--k)*25ms)}
#crt .card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.08)}#crt .card{transition:transform .15s,box-shadow .15s,border-color .15s}
#crt .th{height:150px;background:color-mix(in srgb,var(--border) 30%,transparent);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}#crt .th img{max-width:100%;max-height:100%;object-fit:contain}
#crt .num{position:absolute;top:6px;left:6px;font-size:11px;background:rgba(0,0,0,.55);color:#fff;border-radius:4px;padding:1px 6px}
#crt .c{padding:9px 11px;display:flex;flex-direction:column;gap:3px}#crt .tg{font-size:11.5px;color:var(--muted)}#crt .nm{font-size:12.5px;line-height:1.45;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#crt .lv{font-size:12.5px;color:var(--warning)}
#crt .lb{position:fixed;inset:0;z-index:2;background:rgba(10,12,14,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px}
#crt .lb img{max-width:min(1400px,96vw);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;box-shadow:0 10px 40px rgba(0,0,0,.5);background:#fff}
#crt .lb .cap{color:#e6e6e6;font-size:13px;text-align:center;max-width:92vw}#crt .lb .cap .lv{color:#f0b46c}#crt .lb .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:100%}#crt .lb button{color:#cfd6ff;border-color:#555;background:rgba(0,0,0,.3)}
@keyframes cin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#crt .card{animation:none;transition:none}#crt .card:hover{transform:none}}
@media (max-width:639px){#crt .grid{grid-template-columns:repeat(2,1fr);gap:10px}#crt .th{height:110px}#crt .body{padding:12px}#crt .hint{display:none}}`;
  let root, cur = -1, filt = 'all', lastFocus;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const $ = (s) => root.querySelector(s);
  const list = () => ORDER.filter((i) => filt === 'all' || C[i].k === filt);
  function gallery() {
    const L = list();
    $('.body').innerHTML = `<div class="boot"><b>tang:~/awards$</b> ls certificates/ · ${C.length} · newest first · terminal + hall</div><h3>Certificates · click to view full size</h3><div class="fl">${[['all', 'all'], ['c', 'competitions'], ['h', 'scholarships & honors']].map(([k, l]) => `<button data-f="${k}" class="${filt === k ? 'on' : ''}">${l} (${k === 'all' ? C.length : C.filter((x) => x.k === k).length})</button>`).join('')}</div><div class="grid">${L.map((i, k) => { const c = C[i]; return `<button class="card" style="--k:${k}" data-i="${i}" aria-label="${esc(c.t + ' ' + c.l)}"><div class="th"><span class="num">${c.d}</span><img src="./awards/${c.n}-t.jpg" alt="${esc(c.t)} certificate" loading="lazy"></div><div class="c"><span class="nm">${esc(c.t)}</span><span class="lv">${esc(c.l)}</span></div></button>`; }).join('')}</div>`;
  }
  function lb(i) {
    cur = i; const c = C[i], L = list(), p = L.indexOf(i);
    let el = $('.lb'); if (!el) { el = document.createElement('div'); el.className = 'lb'; el.setAttribute('role', 'dialog'); root.querySelector('.win').appendChild(el); }
    el.innerHTML = `<img src="./awards/${c.n}.jpg" alt="${esc(c.t)} certificate"><div class="cap">${c.d} · ${esc(c.t)} · <span class="lv">${esc(c.l)}</span> <span style="opacity:.6">(${p + 1}/${L.length})</span></div><div class="row"><button data-a="lp" ${p <= 0 ? 'disabled' : ''}>← prev</button><button data-a="lo">open original ↗</button><button data-a="lx">close (esc)</button><button data-a="ln" ${p >= L.length - 1 ? 'disabled' : ''}>next →</button></div>`;
  }
  const step = (d) => { const L = list(), p = L.indexOf(cur) + d; if (p >= 0 && p < L.length) lb(L[p]); };
  const closeLb = () => { $('.lb')?.remove(); cur = -1; };
  function close() { root?.remove(); root = null; document.removeEventListener('keydown', key, true); lastFocus?.focus?.(); }
  function key(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return cur >= 0 ? closeLb() : close(); }
    if (cur >= 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); }
  }
  window.__openCerts = (i) => {
    if (i != null && (i < 0 || i >= C.length)) return false;
    if (!document.getElementById('crt-css')) { const s = document.createElement('style'); s.id = 'crt-css'; s.textContent = css; document.head.appendChild(s); }
    if (!root) {
      lastFocus = document.activeElement; filt = 'all';
      root = document.createElement('div'); root.id = 'crt';
      root.innerHTML = `<div class="win" tabindex="-1" role="dialog" aria-label="Award certificates"><div class="bar"><span class="t">~/awards · certificates</span><span class="sp"></span><span class="hint">click to enlarge · ←/→ · esc</span><button data-a="close" aria-label="Close">×</button></div><div class="body"></div></div>`;
      document.body.appendChild(root); document.addEventListener('keydown', key, true);
      root.addEventListener('click', (e) => {
        if (e.target === root) return close();
        const lbEl = e.target.closest('.lb'); if (lbEl && e.target === lbEl) return closeLb();
        const b = e.target.closest('[data-a],[data-i],[data-f]'); if (!b) return;
        if (b.dataset.f) { filt = b.dataset.f; return gallery(); }
        if (b.dataset.i) return lb(+b.dataset.i);
        const a = b.dataset.a;
        if (a === 'close') close(); else if (a === 'lx') closeLb(); else if (a === 'lp') step(-1); else if (a === 'ln') step(1);
        else if (a === 'lo') window.open(`./awards/${C[cur].n}.jpg`, '_blank', 'noopener');
      });
      let x0 = null; root.addEventListener('touchstart', (e) => { if (cur >= 0) x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
      gallery(); root.querySelector('.win').focus();
    }
    if (i != null) lb(i);
    return true;
  };
})();
