// In-terminal PDF gallery (CV + papers): PDF.js pages + thumbnails, styled with the shell's CSS variables.
// window.__openPDF({ url, title, label, pending }) · window.__openCV() · window.__openPaper(index)
(() => {
  const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
  const WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  // Only real, public files. A paper without `url` shows an honest "not public yet" panel.
  const PAPERS = [
    { id: 'asimov-cascade', title: 'Asimov Cascade Monitoring in Humanoid Robotics: An Evidence-Gated Technology Management Framework with Quantification', venue: 'ICRA 2027 · Under Review',
      url: './papers/asimov-cascade-anon.pdf' /* anonymized review copy only */ },
  ];
  const CV = { url: './cv.pdf', title: '~/cv.pdf', label: 'Curriculum vitae viewer',
    pending: '<div><span class="w">cv.pdf</span> is not published yet.</div><div class="m">Meanwhile: try <b>bio</b>, <b>projects</b>, <b>awards</b> or <b>contact</b>.</div>' };
  const css = `
#cvv{position:fixed;inset:0;z-index:9999;background:color-mix(in srgb,var(--page-bg) 80%,transparent);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:'Maple Mono','JetBrains Mono',ui-monospace,monospace;color:var(--text)}
#cvv .win{outline:none;width:calc(100vw - 16px);height:calc(100vh - 16px);background:var(--term-bg);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25)}
#cvv .bar{display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:14px;flex-wrap:wrap}
#cvv .bar .t{color:var(--path);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50vw} #cvv .pg{white-space:nowrap} #cvv .bar .sp{flex:1}
#cvv button,#cvv a.b{font:inherit;font-size:13px;color:var(--link);background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;text-decoration:none}
#cvv button:hover,#cvv a.b:hover,#cvv button:focus-visible{border-color:var(--link);outline:none}
#cvv .body{flex:1;display:flex;min-height:0}
#cvv .thumbs{width:176px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:12px}
#cvv .thumbs canvas{width:100%;border:1px solid var(--border);border-radius:4px;cursor:pointer;background:#fff}
#cvv .thumbs canvas.on{border-color:var(--link);box-shadow:0 0 0 2px var(--link)}
#cvv .stage{flex:1;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:20px}
#cvv .stage canvas{background:#fff;border-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,.18)}
#cvv .msg{margin:auto;text-align:left;font-size:15px;line-height:1.8;max-width:640px;padding:20px}
#cvv .msg .w{color:var(--warning)} #cvv .msg .m{color:var(--muted)} #cvv .msg .h{color:var(--text);font-weight:600}
#cvv .hint{color:var(--faint);font-size:12px}
@media (max-width:640px){#cvv .thumbs{display:none}#cvv .win{width:100vw;height:100vh;height:100dvh;border-radius:0;border:0}#cvv .hint,#cvv [data-a=in],#cvv [data-a=out]{display:none}#cvv .bar{gap:8px;padding:8px}#cvv .stage{padding:8px}#cvv button,#cvv a.b{padding:8px 12px}}`;
  let lib, doc, cur, page = 1, zoom = 1, root, renderTask;
  const docs = new Map();
  const $ = (s) => root.querySelector(s);
  function close(){ root?.remove(); root=null; doc=null; document.removeEventListener('keydown', onKey, true); document.querySelector('textarea,input')?.focus(); }
  function onKey(e){ if(!root) return; if(e.key==='Escape'||e.key==='q') close(); else if(['ArrowRight','j','PageDown'].includes(e.key)) go(page+1); else if(['ArrowLeft','k','PageUp'].includes(e.key)) go(page-1); else if(e.key==='+'||e.key==='=') setZoom(zoom*1.15); else if(e.key==='-') setZoom(zoom/1.15); else return; e.preventDefault(); e.stopPropagation(); }
  function setZoom(z){ zoom=Math.min(2.5,Math.max(.5,z)); $('.zm')&&($('.zm').textContent=Math.round(zoom*100)+'%'); go(page); }
  async function draw(p, canvas, width){ const pg=await doc.getPage(p); const v1=pg.getViewport({scale:1}); const dpr=window.devicePixelRatio||1; const v=pg.getViewport({scale:width/v1.width*dpr}); canvas.width=v.width; canvas.height=v.height; canvas.style.width=(v.width/dpr)+'px'; return pg.render({canvasContext:canvas.getContext('2d'),viewport:v}); }
  /** Fit the page to the stage: full width (capped for readability), zoom multiplies. */
  // Comfortable reading width (~A4 at 100–110%), not edge-to-edge; zoom steps are ×1.15.
  const MAX_W = 880;
  function fitWidth(){ const st=$('.stage'); return Math.max(240, Math.min(st.clientWidth-40, MAX_W)) * zoom; }
  async function go(p){ if(!doc) return; page=Math.min(doc.numPages,Math.max(1,p)); $('.pg').textContent=`${page} / ${doc.numPages}`; root.querySelectorAll('.thumbs canvas').forEach((c,i)=>c.classList.toggle('on',i+1===page)); renderTask?.cancel?.(); renderTask=await draw(page,$('.stage canvas'),fitWidth()); try{await renderTask.promise}catch{} root.querySelectorAll('.thumbs canvas')[page-1]?.scrollIntoView({block:'nearest'}); }
  function shell(o){ root=document.createElement('div'); root.id='cvv'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-label',o.label);
    root.innerHTML=`<div class="win"><div class="bar"><span class="t" title="${o.title}">${o.title}</span><span class="pg" aria-live="polite"></span><span class="sp"></span><span class="hint">←/→ page · +/- zoom · esc close</span><button data-a="prev" aria-label="Previous page">‹</button><button data-a="next" aria-label="Next page">›</button><button data-a="out" aria-label="Zoom out">−</button><span class="zm hint">100%</span><button data-a="in" aria-label="Zoom in">+</button><a class="b" href="${o.url||'#'}" download>download</a><button data-a="close" aria-label="Close viewer">✕</button></div><div class="body"><nav class="thumbs" aria-label="Pages"></nav><div class="stage"><canvas aria-label="PDF page"></canvas></div></div></div>`;
    root.addEventListener('click',e=>{ if(e.target===root) return close(); const a=e.target.closest('[data-a]')?.dataset.a; ({prev:()=>go(page-1),next:()=>go(page+1),in:()=>setZoom(zoom*1.15),out:()=>setZoom(zoom/1.15),close})[a]?.(); });
    document.body.appendChild(root); document.addEventListener('keydown',onKey,true); const win=$('.win'); win.tabIndex=-1; setTimeout(()=>win.focus({preventScroll:true}),0); }
  function pending(html){ $('.body').innerHTML=`<div class="msg">${html}</div>`; root.querySelectorAll('.bar button:not([data-a=close]),.bar a').forEach(b=>b.style.display='none'); }
  let resizeT; window.addEventListener('resize',()=>{ clearTimeout(resizeT); resizeT=setTimeout(()=>root&&doc&&go(page),150); });
  window.__openPDF = async (o) => { if(root) close(); if(!document.getElementById('cvv-css')){const s=document.createElement('style');s.id='cvv-css';s.textContent=css;document.head.appendChild(s);}
    cur=o; page=1; zoom=1; shell(o); $('.pg').textContent='loading…';
    try{ if(!o.url) throw 0; const head=await fetch(o.url,{method:'HEAD'}); if(!head.ok) throw 0; lib ||= await import(PDFJS); lib.GlobalWorkerOptions.workerSrc=WORKER;
      if(!docs.has(o.url)) docs.set(o.url, lib.getDocument(o.url).promise); doc=await docs.get(o.url); }
    catch{ docs.delete(o.url); if(root){ $('.pg').textContent=''; pending(o.pending); } return; }
    if(!root||cur!==o) return;
    const th=$('.thumbs'); for(let i=1;i<=doc.numPages;i++){ const c=document.createElement('canvas'); c.tabIndex=0; c.setAttribute('aria-label',`Page ${i}`); c.onclick=()=>go(i); c.onkeydown=e=>{if(e.key==='Enter')go(i)}; th.appendChild(c); draw(i,c,150).then(t=>t.promise).catch(()=>{}); }
    go(1); };
  window.__openCV = () => window.__openPDF(CV);
  window.__papers = PAPERS.map(({id,title,venue})=>({id,title,venue}));
  window.__openPaper = (i = 0) => { const p = PAPERS[i]; if(!p) return false;
    window.__openPDF({ url: p.url, title: `~/papers/${p.id}-anon.pdf — ${p.title}`, label: `Paper viewer: ${p.title}`,
      pending: `<div class="h">${p.title}</div><div class="m">${p.venue}</div><br><div><span class="w">${p.id}.pdf</span> is not public yet.</div><div class="m">The manuscript is under review; the PDF will appear here as a browsable gallery once it is released.</div><div class="m">Meanwhile: <b>scholar</b> · <b>projects</b> · <b>cat projects/asimov-cascade</b></div>` });
    return true; };
})();
