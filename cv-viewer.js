// In-terminal CV viewer: PDF.js multi-page gallery styled with the shell's CSS variables.
(() => {
  const PDF_URL = './cv.pdf';
  const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
  const WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const css = `
#cvv{position:fixed;inset:0;z-index:9999;background:color-mix(in srgb,var(--page-bg) 88%,transparent);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;font-family:'Maple Mono','JetBrains Mono',ui-monospace,monospace;color:var(--text)}
#cvv .win{outline:none;width:min(1100px,96vw);height:min(92vh,1000px);background:var(--term-bg);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25)}
#cvv .bar{display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:13px}
#cvv .bar .t{color:var(--path)} #cvv .pg{white-space:nowrap} #cvv .bar .sp{flex:1}
#cvv button,#cvv a.b{font:inherit;font-size:12px;color:var(--link);background:none;border:1px solid var(--border);border-radius:6px;padding:3px 9px;cursor:pointer;text-decoration:none}
#cvv button:hover,#cvv a.b:hover,#cvv button:focus-visible{border-color:var(--link);outline:none}
#cvv .body{flex:1;display:flex;min-height:0}
#cvv .thumbs{width:132px;overflow-y:auto;border-right:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:10px}
#cvv .thumbs canvas{width:100%;border:1px solid var(--border);border-radius:4px;cursor:pointer;background:#fff}
#cvv .thumbs canvas.on{border-color:var(--link);box-shadow:0 0 0 2px var(--link)}
#cvv .stage{flex:1;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:20px}
#cvv .stage canvas{max-width:100%;height:auto;background:#fff;border-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,.18)}
#cvv .msg{margin:auto;text-align:left;font-size:14px;line-height:1.7}
#cvv .msg .w{color:var(--warning)} #cvv .msg .m{color:var(--muted)}
#cvv .hint{color:var(--faint);font-size:11px}
@media (max-width:640px){#cvv .thumbs{display:none}#cvv .win{outline:none;height:96vh;border-radius:0;width:100vw}#cvv .hint,#cvv [data-a=in],#cvv [data-a=out]{display:none}#cvv .bar{gap:8px}}`;
  let lib, doc, page = 1, zoom = 1, root, renderTask;
  const $ = (s) => root.querySelector(s);
  function close(){ root?.remove(); root=null; document.removeEventListener('keydown', onKey); document.querySelector('textarea,input')?.focus(); }
  function onKey(e){ if(!root) return; if(e.key==='Escape'||e.key==='q') close(); else if(['ArrowRight','j','PageDown'].includes(e.key)) go(page+1); else if(['ArrowLeft','k','PageUp'].includes(e.key)) go(page-1); else if(e.key==='+'||e.key==='=') setZoom(zoom+.2); else if(e.key==='-') setZoom(zoom-.2); else return; e.preventDefault(); e.stopPropagation(); }
  function setZoom(z){ zoom=Math.min(3,Math.max(.6,z)); go(page); }
  async function draw(p, canvas, width){ const pg=await doc.getPage(p); const v1=pg.getViewport({scale:1}); const dpr=window.devicePixelRatio||1; const v=pg.getViewport({scale:width/v1.width*dpr}); canvas.width=v.width; canvas.height=v.height; canvas.style.width=(v.width/dpr)+'px'; const t=pg.render({canvasContext:canvas.getContext('2d'),viewport:v}); return t; }
  async function go(p){ if(!doc) return; page=Math.min(doc.numPages,Math.max(1,p)); $('.pg').textContent=`${page} / ${doc.numPages}`; root.querySelectorAll('.thumbs canvas').forEach((c,i)=>c.classList.toggle('on',i+1===page)); const st=$('.stage'); const w=Math.min(st.clientWidth-40,820)*zoom; renderTask?.cancel?.(); renderTask=await draw(page,$('.stage canvas'),w); try{await renderTask.promise}catch{} root.querySelectorAll('.thumbs canvas')[page-1]?.scrollIntoView({block:'nearest'}); }
  function shell(){ root=document.createElement('div'); root.id='cvv'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-label','Curriculum vitae viewer');
    root.innerHTML=`<div class="win"><div class="bar"><span class="t">~/cv.pdf</span><span class="pg" aria-live="polite"></span><span class="sp"></span><span class="hint">←/→ page · +/- zoom · esc close</span><button data-a="prev" aria-label="Previous page">‹</button><button data-a="next" aria-label="Next page">›</button><button data-a="out" aria-label="Zoom out">−</button><button data-a="in" aria-label="Zoom in">+</button><a class="b" href="${PDF_URL}" download>download</a><button data-a="close" aria-label="Close viewer">✕</button></div><div class="body"><nav class="thumbs" aria-label="Pages"></nav><div class="stage"><canvas aria-label="CV page"></canvas></div></div></div>`;
    root.addEventListener('click',e=>{ if(e.target===root) return close(); const a=e.target.closest('[data-a]')?.dataset.a; ({prev:()=>go(page-1),next:()=>go(page+1),in:()=>setZoom(zoom+.2),out:()=>setZoom(zoom-.2),close})[a]?.(); });
    document.body.appendChild(root); document.addEventListener('keydown',onKey,true); const win=$('.win'); win.tabIndex=-1; setTimeout(()=>win.focus({preventScroll:true}),0); }
  function pending(){ $('.body').innerHTML=`<div class="msg"><div><span class="w">cv.pdf</span> is not published yet.</div><div class="m">The full CV will appear here as a browsable gallery.</div><div class="m">Meanwhile: try <b>bio</b>, <b>projects</b>, <b>awards</b> or <b>contact</b>.</div></div>`; root.querySelectorAll('.bar button:not([data-a=close]),.bar a').forEach(b=>b.style.display='none'); }
  window.__openCV = async () => { if(root) return; if(!document.getElementById('cvv-css')){const s=document.createElement('style');s.id='cvv-css';s.textContent=css;document.head.appendChild(s);} shell(); $('.pg').textContent='loading…';
    try{ const head=await fetch(PDF_URL,{method:'HEAD'}); if(!head.ok) throw 0; lib ||= await import(PDFJS); lib.GlobalWorkerOptions.workerSrc=WORKER; doc ||= await lib.getDocument(PDF_URL).promise; }
    catch{ $('.pg').textContent=''; return pending(); }
    const th=$('.thumbs'); for(let i=1;i<=doc.numPages;i++){ const c=document.createElement('canvas'); c.tabIndex=0; c.setAttribute('aria-label',`Page ${i}`); c.onclick=()=>go(i); c.onkeydown=e=>{if(e.key==='Enter')go(i)}; th.appendChild(c); draw(i,c,110).then(t=>t.promise).catch(()=>{}); }
    go(1); };
})();
