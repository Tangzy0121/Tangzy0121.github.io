// The view layer: renders scrollback, the prompt line editor and the pager.
// All command semantics live in src/shell + src/apps; this file only wires I/O.
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Context, LineKind, Part } from '../shell/types';
import { complete, ghost } from '../shell/complete';
import { runLine } from '../shell/run';
import { pathString } from '../shell/vfs';
import { createShell } from '../apps';
import { pageNames } from '../content/store';
import { profile } from '../generated/content';
import { KIND_CLASS, MdLine } from './markdown';
import { Welcome } from './Welcome';
import { copyText } from './copy';

type Line =
  | { id: number; type: 'welcome' }
  | { id: number; type: 'command'; path: string; text: string }
  | { id: number; type: 'output'; text: string; kind: LineKind }
  | { id: number; type: 'parts'; parts: Part[] };

type NewLine = Line extends infer L ? (L extends Line ? Omit<L, 'id'> : never) : never;

/** Commands that are addressable as #hash pages. */
const ROUTES = new Set([...pageNames, 'cv', 'help']);
const THEME_KEY = 'tang-shell-theme';

function Prompt({ path }: { path: string }) {
  return (
    <span className="shrink-0">
      <span className="text-primary">{profile.handle}</span><span className="text-sub">:</span>
      <span className="text-dir">{path}</span><span className="text-sub">{"$\u00a0"}</span>
    </span>
  );
}

export function Terminal() {
  const shell = useMemo(createShell, []);
  const words = useMemo(() => shell.reg.names(), [shell]);
  const phrases = useMemo(() => Object.keys(shell.phrases), [shell]);

  const initialHash = window.location.hash.slice(1).toLowerCase();
  const [lines, setLines] = useState<Line[]>(() => (ROUTES.has(initialHash) ? [] : [{ id: 0, type: 'welcome' }]));
  const [cwd, setCwd] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [caret, setCaret] = useState({ v: '', p: 0 });
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [pager, setPager] = useState<string[] | null>(null);
  /** Corrected line offered after `command not found` (zsh-style); Tab/→ on the empty prompt accepts. */
  const [fixLine, setFixLine] = useState<string | null>(null);
  const [pct, setPct] = useState(100);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });

  const nextId = useRef(1);
  const history = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const cols = useRef(80);
  const rows = useRef(24);
  const scrollTop = useRef(false);
  const fromPop = useRef(false);
  const runRef = useRef<(c: string) => void>(() => {});

  const push = useCallback((...l: NewLine[]) => setLines((p) => [...p, ...l.map((x) => ({ ...x, id: nextId.current++ }) as Line)]), []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  // First paint: reveal only after web fonts settle (no font-swap reflow), with a timeout safety net.
  useEffect(() => {
    document.title = `~${profile.handle}`;
    let done = false;
    const reveal = () => { if (!done) { done = true; winRef.current?.classList.add('ready'); } };
    document.fonts?.ready.then(reveal, reveal);
    const t = setTimeout(reveal, 800);
    return () => clearTimeout(t);
  }, []);

  // Measure terminal size in character cells.
  useEffect(() => {
    const fit = () => {
      const s = scrollRef.current, m = measureRef.current;
      if (!s || !m) return;
      const cw = m.getBoundingClientRect().width / 100;
      if (!cw) return;
      const st = getComputedStyle(s);
      cols.current = Math.max(1, Math.floor((s.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight)) / cw));
      const lh = parseFloat(st.lineHeight);
      if (lh) rows.current = Math.max(1, Math.floor((s.clientHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom)) / lh));
    };
    fit();
    document.fonts?.ready.then(fit, fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const print = useCallback((text: string, kind: LineKind = 'output') => push(...text.split('\n').map((t) => ({ type: 'output' as const, text: t, kind }))), [push]);
  const welcome = useCallback(() => push({ type: 'welcome' }), [push]);
  const clear = useCallback(() => setLines([]), []);
  const switchPage = useCallback((name: string) => {
    setLines([]);
    scrollTop.current = true;
    if (!fromPop.current) window.history.pushState({ cmd: name }, '', `#${name}`);
  }, []);

  const closePager = useCallback(() => {
    if (!pager) return;
    const el = pagerRef.current;
    let shown = pager.length;
    if (el && el.scrollTop + el.clientHeight < el.scrollHeight - 2) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      shown = Math.max(1, Math.min(pager.length, Math.ceil((el.scrollTop + el.clientHeight) / lh)));
    }
    print(pager.slice(0, shown).join('\n'));
    setPager(null);
  }, [pager, print]);

  const run = useCallback((raw: string) => {
    const line = raw.trim();
    push({ type: 'command', path: pathString(cwd), text: line });
    setFixLine(null);
    if (!line) return;
    document.title = `~${profile.handle}: ${line}`;
    history.current.push(line);
    const ctx: Context = {
      fs: shell.fs, cwd, setCwd, print, printParts: (parts) => push({ type: 'parts', parts }), clear, welcome, switchPage,
      page: setPager, history: history.current, theme, setTheme: setThemeState, cols: cols.current, rows: rows.current, tty: true,
      openUrl: (u) => window.open(u, '_blank', 'noopener'),
      copy: copyText,
      suggest: setFixLine,
      openCV: () => (window as unknown as { __openCV?: () => void }).__openCV?.(),
    };
    runLine(line, shell.reg, ctx, shell.phrases);
  }, [cwd, shell, print, push, clear, welcome, switchPage, theme]);
  runRef.current = run;

  // Pager keys + progress.
  const pagerScroll = useCallback(() => {
    const el = pagerRef.current;
    if (!el) return;
    setPct(Math.min(100, Math.floor(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100)));
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) closePager();
  }, [closePager]);
  useEffect(() => {
    if (!pager) return;
    const el = pagerRef.current;
    if (el) {
      if (el.scrollHeight <= el.clientHeight + 2) return void closePager();
      setPct(Math.min(100, Math.floor((el.clientHeight / el.scrollHeight) * 100)));
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = pagerRef.current;
      if (!el) return;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      const by = { ' ': el.clientHeight, f: el.clientHeight, PageDown: el.clientHeight, b: -el.clientHeight, PageUp: -el.clientHeight,
        j: lh, ArrowDown: lh, k: -lh, ArrowUp: -lh } as Record<string, number>;
      if (e.key in by) { e.preventDefault(); el.scrollTop += by[e.key]; pagerScroll(); }
      else if (e.key === 'q' || e.key === 'Escape') { e.preventDefault(); closePager(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [pager, closePager, pagerScroll]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const s = scrollRef.current;
    if (!s) return;
    if (scrollTop.current) { scrollTop.current = false; s.scrollTop = 0; } else s.scrollTop = s.scrollHeight;
  }, [lines]);

  // Browser Back/Forward replays the page recorded in history; no state = home.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const cmd = (e.state as { cmd?: string } | null)?.cmd;
      fromPop.current = true;
      if (cmd && ROUTES.has(cmd)) runRef.current(cmd);
      else { setLines([]); scrollTop.current = true; setCwd([]); welcome(); document.title = `~${profile.handle}`; }
      fromPop.current = false;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [welcome]);

  // Deep link: /#papers opens that page directly.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current) return;
    deepLinked.current = true;
    if (ROUTES.has(initialHash)) {
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
      runRef.current(initialHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "/" or Ctrl/Cmd-K focuses the prompt from anywhere.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (editing) return;
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tab = () => {
    if (input === '' && fixLine) { setInput(`${fixLine} `); setFixLine(null); return; }
    const c = complete(input, words, phrases, shell.fs, cwd);
    if (c.candidates?.length) push({ type: 'command', path: pathString(cwd), text: input }, { type: 'output', text: c.candidates.join('  '), kind: 'muted' });
    if (c.next !== undefined) setInput(c.next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current, el = e.currentTarget, k = e.key.toLowerCase();
    if (e.key === 'Enter') { run(input); setInput(''); setHistIdx(null); }
    else if (e.key === 'ArrowUp' || (e.ctrlKey && k === 'p')) {
      e.preventDefault();
      if (!h.length) return;
      const i = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(i); setInput(h[i]);
    } else if (e.key === 'ArrowDown' || (e.ctrlKey && k === 'n')) {
      e.preventDefault();
      if (histIdx === null) return;
      const i = histIdx + 1;
      if (i >= h.length) { setHistIdx(null); setInput(''); } else { setHistIdx(i); setInput(h[i]); }
    } else if (e.key === 'ArrowRight' && input === '' && fixLine) {
      e.preventDefault(); setInput(`${fixLine} `); setFixLine(null);
    } else if (e.key === 'ArrowRight' && (el.selectionStart ?? 0) >= input.length) {
      const g = ghost(input, words, phrases, shell.fs, cwd);
      if (g) { e.preventDefault(); setInput(complete(input, words, phrases, shell.fs, cwd).next!); }
    } else if (e.key === 'Tab') { e.preventDefault(); tab(); }
    else if (e.ctrlKey && k === 'l') { e.preventDefault(); clear(); }
    else if (e.ctrlKey && k === 'd') {
      e.preventDefault();
      if (input.trim() === '') { run('exit'); setHistIdx(null); }
      else { const p = el.selectionStart ?? input.length; setInput(input.slice(0, p) + input.slice(p + 1)); requestAnimationFrame(() => el.setSelectionRange(p, p)); }
    } else if (e.ctrlKey && k === 'c') {
      e.preventDefault(); push({ type: 'command', path: pathString(cwd), text: `${input}^C` }); setInput(''); setHistIdx(null);
    } else if (e.ctrlKey && ['a', 'e', 'u', 'k', 'w'].includes(k)) {
      e.preventDefault();
      const s = el.selectionStart ?? input.length, t = el.selectionEnd ?? input.length;
      if (k === 'a') el.setSelectionRange(0, 0);
      else if (k === 'e') el.setSelectionRange(input.length, input.length);
      else if (k === 'u') { setInput(input.slice(t)); requestAnimationFrame(() => el.setSelectionRange(0, 0)); }
      else if (k === 'k') setInput(input.slice(0, s));
      else { const pre = input.slice(0, s).replace(/\s+$/, '').replace(/\S+$/, ''); setInput(pre + input.slice(t)); requestAnimationFrame(() => el.setSelectionRange(pre.length, pre.length)); }
    }
  };

  const pos = caret.v === input ? Math.min(caret.p, input.length) : input.length;
  const under = input.slice(pos, pos + 1);
  const hint = input === '' && fixLine ? fixLine : pos === input.length ? ghost(input, words, phrases, shell.fs, cwd) : '';
  const onCaret = (el: HTMLInputElement) => setCaret({ v: el.value, p: el.selectionStart ?? el.value.length });

  return (
    <div ref={winRef} className="term-window" onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}>
      <div ref={scrollRef} className="term-scroll" role="log" aria-live="polite">
        <span ref={measureRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 whitespace-pre opacity-0">{'0'.repeat(100)}</span>
        {lines.map((l) =>
          l.type === 'welcome' ? <Welcome key={l.id} run={run} />
          : l.type === 'command' ? (
            <div key={l.id} className="mt-3 flex flex-wrap"><Prompt path={l.path} /><span className="whitespace-pre-wrap break-words">{l.text}</span></div>
          ) : l.type === 'parts' ? (
            <div key={l.id} className="whitespace-pre-wrap break-words">
              {l.parts.map((p, i) => <span key={i} className={p.kind ? KIND_CLASS[p.kind] : undefined}>{p.text}</span>)}
            </div>
          ) : <MdLine key={l.id} text={l.text} kind={l.kind} run={run} />,
        )}
        {!pager && (
          <div className="relative mt-3 flex flex-wrap">
            <Prompt path={pathString(cwd)} />
            <span className="whitespace-pre-wrap break-all">{input.slice(0, pos)}</span>
            <span key={`c${pos}|${input}`} className={under ? 'cursor-block has-ch' : 'cursor-block'} aria-hidden="true">{under || undefined}</span>
            <span className="whitespace-pre-wrap break-all">{input.slice(pos + 1)}</span>
            {hint && <span className="cmp-ghost" aria-hidden="true">{hint}</span>}
            <input ref={inputRef} value={input}
              onChange={(e) => { setInput(e.target.value); setHistIdx(null); onCaret(e.target); }}
              onSelect={(e) => onCaret(e.currentTarget)} onKeyDown={onKeyDown}
              className="absolute inset-0 h-full w-full cursor-text opacity-0" aria-label="Terminal input"
              autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} />
          </div>
        )}
      </div>
      {pager && (
        <div className="pager">
          <div ref={pagerRef} onScroll={pagerScroll} className="pager-body">{pager.map((t, i) => <MdLine key={i} text={t} run={run} />)}</div>
          <div className="pager-status"><span>{`--More--(${pct}%)`}</span><button onClick={closePager}>q quit</button></div>
        </div>
      )}
    </div>
  );
}
