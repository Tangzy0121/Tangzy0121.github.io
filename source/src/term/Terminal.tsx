// The view layer: renders scrollback, the prompt line editor and the pager.
// All command semantics live in src/shell + src/apps; this file only wires I/O.
import React, { useLayoutEffect, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Context, LineKind, Part } from '../shell/types';
import { applyCandidate, complete, ghost } from '../shell/complete';
import { histNext, histPrev, reverseSearch, sanitizePaste, transpose, wordLeft, wordRight } from '../shell/readline';
import { NO_DEEPLINK } from '../apps/site';
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
/** The CV / paper viewers are modals and never get a route; a legacy #cv link opens the modal once and is stripped. */
const ROUTES = new Set([...pageNames, 'help']);
const THEME_KEY = 'tang-shell-theme';
const ONBOARD_KEY = 'tang-shell-onboarded';
/** Commands whose long output opens the pager automatically (like `git log` with a pager). */
const AUTO_PAGE = new Set(['cat', 'ls', 'll', 'tree', 'grep', 'find', 'history', 'head', 'tail', 'help']);
const lineText = (l: NewLine) => (l.type === 'output' ? l.text : l.type === 'parts' ? l.parts.map((p) => p.text).join('') : '');

function Prompt({ path, fail }: { path: string; fail?: boolean }) {
  return (
    <span className="shrink-0">
      <span className="text-primary">{profile.handle}</span><span className="text-sub">:</span>
      <span className="text-dir">{path}</span><span className={fail ? 'prompt-fail' : 'text-sub'} title={fail ? 'last command failed (exit 1)' : undefined}>{fail ? "[1]$\u00a0" : "$\u00a0"}</span>
    </span>
  );
}

export function Terminal() {
  const shell = useMemo(createShell, []);
  const words = useMemo(() => shell.reg.names(), [shell]);
  const phrases = useMemo(() => Object.keys(shell.phrases), [shell]);

  const rawHash = (() => { try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ''; } })();
  const initialHash = rawHash.toLowerCase();
  const [lines, setLines] = useState<Line[]>(() => (ROUTES.has(initialHash) ? [] : [{ id: 0, type: 'welcome' }]));
  const [cwd, setCwd] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [caret, setCaret] = useState({ v: '', p: 0 });
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [pager, setPager] = useState<string[] | null>(null);
  /** Corrected line offered after `command not found` (zsh-style); Tab/→ on the empty prompt accepts. */
  const [fixLine, setFixLine] = useState<string | null>(null);
  const [pct, setPct] = useState(100);
  const [oldCwd, setOldCwd] = useState<string[] | undefined>();
  /** zsh-style menu-select: candidates, selected index (-1 = none yet) and the line before selection. */
  const [menu, setMenu] = useState<{ items: string[]; sel: number; base: string } | null>(null);
  /** Ctrl-R incremental search: query, matched history index, and the line to restore on cancel. */
  const [search, setSearch] = useState<{ q: string; idx: number; saved: string } | null>(null);
  const [lastFail, setLastFail] = useState(false);
  const [ghostOff, setGhostOff] = useState(false);
  const [onboard, setOnboard] = useState(() => { try { return !localStorage.getItem(ONBOARD_KEY); } catch { return false; } });
  const histPrefix = useRef('');
  /** Caret to restore after the next render (applied synchronously, so fast typing never races it). */
  const pendingSel = useRef<number | null>(null);
  const killRing = useRef('');
  const route = useRef<string | undefined>();
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
    route.current = name;
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
    setFixLine(null); setMenu(null); setSearch(null); setGhostOff(false);
    if (!line) return;
    if (onboard) { setOnboard(false); try { localStorage.setItem(ONBOARD_KEY, '1'); } catch { /* ignore */ } }
    document.title = `~${profile.handle}: ${line}`;
    if (history.current[history.current.length - 1] !== line) history.current.push(line);
    // Buffer synchronous output so long results can go to the pager; later async output streams live.
    const buf: NewLine[] = [];
    let live = false;
    const emit = (l: NewLine[]) => (live ? push(...l) : buf.push(...l));
    const ctx: Context = {
      fs: shell.fs, cwd, oldCwd, route: route.current,
      setCwd: (seg) => { setOldCwd(cwd); setCwd(seg); },
      print: (text, kind = 'output') => emit(text.split('\n').map((t) => ({ type: 'output' as const, text: t, kind }))),
      printParts: (parts) => emit([{ type: 'parts', parts }]), clear, welcome, switchPage,
      home: () => {
        setLines([]); scrollTop.current = true; setOldCwd(cwd); setCwd([]); welcome();
        route.current = undefined; document.title = `~${profile.handle}`;
        if (window.location.hash && !fromPop.current) window.history.pushState({}, '', window.location.pathname + window.location.search);
      },
      page: setPager, history: history.current, theme, setTheme: setThemeState, cols: cols.current, rows: rows.current, tty: true,
      openUrl: (u) => window.open(u, '_blank', 'noopener'),
      copy: copyText,
      suggest: setFixLine,
      openCV: () => (window as unknown as { __openCV?: () => void }).__openCV?.(),
      openPaper: (i) => (window as unknown as { __openPaper?: (i: number) => boolean }).__openPaper?.(i) ?? false,
    };
    runLine(line, shell.reg, ctx, shell.phrases);
    live = true;
    setLastFail(buf.some((l) => l.type === 'output' && l.kind === 'error'));
    const head = shell.reg.get(line.split(/\s+/)[0])?.name ?? '';
    if (AUTO_PAGE.has(head) && !line.includes('|') && buf.length > rows.current - 3) setPager(buf.map(lineText));
    else if (buf.length) push(...buf);
  }, [cwd, oldCwd, shell, print, push, clear, welcome, switchPage, theme, onboard]);
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

  useLayoutEffect(() => {
    const el = inputRef.current, p = pendingSel.current;
    if (el && p !== null) { pendingSel.current = null; el.setSelectionRange(p, p); }
  });
  // Focus the prompt on load and whenever the pager closes.
  useEffect(() => { if (!pager) inputRef.current?.focus(); }, [pager]);
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
    } else if (rawHash.trim()) {
      // Shared command link (`share ls -l projects`): run it once if it is a safe, known command.
      const cmd = shell.reg.get(rawHash.trim().split(/\s+/)[0]);
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
      if (cmd && !NO_DEEPLINK.has(cmd.name)) runRef.current(rawHash.trim());
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

  const setLine = (v: string, p = v.length) => { pendingSel.current = p; setInput(v); setCaret({ v, p }); };
  const moveTo = (el: HTMLInputElement, p: number) => { el.setSelectionRange(p, p); setCaret({ v: input, p }); };

  const tab = (back = false) => {
    if (menu) {
      const n = menu.items.length, sel = menu.sel < 0 ? (back ? n - 1 : 0) : (menu.sel + (back ? n - 1 : 1)) % n;
      setMenu({ ...menu, sel }); setLine(applyCandidate(menu.base, menu.items[sel]).replace(/ $/, ''));
      return;
    }
    if (input === '' && fixLine) { setLine(`${fixLine} `); setFixLine(null); return; }
    const c = complete(input, words, phrases, shell.fs, cwd);
    const next = c.next ?? input;
    if (c.candidates && c.candidates.length > 1) setMenu({ items: c.candidates, sel: -1, base: next });
    if (c.next !== undefined) setLine(c.next);
  };
  const pick = (i: number) => { if (!menu) return; setLine(applyCandidate(menu.base, menu.items[i])); setMenu(null); };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>, k: string) => {
    if (!search) return false;
    const h = history.current, hit = search.idx >= 0 ? h[search.idx] : '';
    if (e.ctrlKey && k === 'r') { e.preventDefault(); const i = reverseSearch(h, search.q, search.idx < 0 ? h.length : search.idx); if (i >= 0) setSearch({ ...search, idx: i }); }
    else if (e.key === 'Enter') { e.preventDefault(); setSearch(null); run(hit || search.saved); setLine(''); setHistIdx(null); }
    else if (e.key === 'Escape' || (e.ctrlKey && (k === 'g' || k === 'c'))) { e.preventDefault(); setSearch(null); setLine(search.saved); }
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'].includes(e.key) || (e.ctrlKey && (k === 'a' || k === 'e'))) {
      e.preventDefault(); setSearch(null); setLine(hit || search.saved);
    } else return false;
    return true;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current, el = e.currentTarget, k = e.key.toLowerCase();
    const s0 = el.selectionStart ?? input.length, t0 = el.selectionEnd ?? input.length;
    if (onSearchKey(e, k)) return;
    if (search) return; // printable keys edit the query via onChange
    if (menu) {
      if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); tab(e.shiftKey || e.key === 'ArrowUp'); return; }
      if (e.key === 'Enter' && menu.sel >= 0) { e.preventDefault(); pick(menu.sel); return; }
      if (/^[1-9]$/.test(e.key) && +e.key <= menu.items.length) { e.preventDefault(); pick(+e.key - 1); return; }
      if (e.key === 'Escape') { e.preventDefault(); setMenu(null); setLine(menu.base); return; }
      setMenu(null);
    }
    if (e.key === 'Escape') { e.preventDefault(); setFixLine(null); setGhostOff(true); return; }
    if (e.ctrlKey && k === 'r') { e.preventDefault(); setSearch({ q: '', idx: -1, saved: input }); setInput(''); return; }
    if (e.altKey && !e.ctrlKey && ['KeyB', 'KeyF', 'KeyD', 'Backspace', 'Period'].includes(e.code)) {
      e.preventDefault();
      if (e.code === 'KeyB') moveTo(el, wordLeft(input, s0));
      else if (e.code === 'KeyF') moveTo(el, wordRight(input, s0));
      else if (e.code === 'KeyD') { const r = wordRight(input, s0); killRing.current = input.slice(s0, r); setLine(input.slice(0, s0) + input.slice(r), s0); }
      else if (e.code === 'Backspace') { const l = wordLeft(input, s0); killRing.current = input.slice(l, s0); setLine(input.slice(0, l) + input.slice(s0), l); }
      else { const prev = h[h.length - 1]?.split(/\s+/).pop() ?? ''; setLine(input.slice(0, s0) + prev + input.slice(t0), s0 + prev.length); } // Alt-. last arg
      return;
    }
    if (e.key === 'Enter') { run(input); setInput(''); setHistIdx(null); }
    else if (e.key === 'ArrowUp' || (e.ctrlKey && k === 'p')) {
      e.preventDefault();
      if (histIdx === null) histPrefix.current = input;
      const i = histPrev(h, histPrefix.current, histIdx ?? h.length);
      if (i >= 0) { setHistIdx(i); setLine(h[i]); }
    } else if (e.key === 'ArrowDown' || (e.ctrlKey && k === 'n')) {
      e.preventDefault();
      if (histIdx === null) return;
      const i = histNext(h, histPrefix.current, histIdx);
      if (i < 0) { setHistIdx(null); setLine(histPrefix.current); } else { setHistIdx(i); setLine(h[i]); }
    } else if (e.key === 'ArrowRight' && input === '' && fixLine) {
      e.preventDefault(); setLine(`${fixLine} `); setFixLine(null);
    } else if (e.key === 'ArrowRight' && s0 >= input.length && !ghostOff) {
      const g = ghost(input, words, phrases, shell.fs, cwd);
      if (g) { e.preventDefault(); setLine(complete(input, words, phrases, shell.fs, cwd).next ?? input); }
    } else if (e.key === 'Tab') { e.preventDefault(); tab(e.shiftKey); }
    else if (e.ctrlKey && k === 'l') { e.preventDefault(); clear(); }
    else if (e.ctrlKey && k === 'd') {
      e.preventDefault();
      if (input.trim() === '') { run('exit'); setHistIdx(null); }
      else setLine(input.slice(0, s0) + input.slice(s0 + 1), s0);
    } else if (e.ctrlKey && k === 'c') {
      e.preventDefault(); push({ type: 'command', path: pathString(cwd), text: `${input}^C` }); setInput(''); setHistIdx(null); setFixLine(null); setLastFail(false);
    } else if (e.ctrlKey && ['a', 'e', 'u', 'k', 'w', 'y', 't', 'b', 'f', 'h'].includes(k)) {
      e.preventDefault();
      if (k === 'a') moveTo(el, 0);
      else if (k === 'e') moveTo(el, input.length);
      else if (k === 'b') moveTo(el, Math.max(0, s0 - 1));
      else if (k === 'f') moveTo(el, Math.min(input.length, s0 + 1));
      else if (k === 'h') { if (s0 > 0) setLine(input.slice(0, s0 - 1) + input.slice(s0), s0 - 1); }
      else if (k === 'u') { killRing.current = input.slice(0, s0); setLine(input.slice(t0), 0); }
      else if (k === 'k') { killRing.current = input.slice(s0); setLine(input.slice(0, s0), s0); }
      else if (k === 'y') setLine(input.slice(0, s0) + killRing.current + input.slice(t0), s0 + killRing.current.length);
      else if (k === 't') { const r = transpose(input, s0); setLine(r.s, r.pos); }
      else { const pre = input.slice(0, s0).replace(/\s+$/, '').replace(/\S+$/, ''); killRing.current = input.slice(pre.length, s0); setLine(pre + input.slice(t0), pre.length); }
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const el = e.currentTarget, t = sanitizePaste(e.clipboardData.getData('text'));
    const s0 = el.selectionStart ?? input.length, t0 = el.selectionEnd ?? input.length;
    if (search) { const q = search.q + t; setSearch({ ...search, q, idx: reverseSearch(history.current, q, history.current.length) }); setInput(q); return; }
    setLine(input.slice(0, s0) + t + input.slice(t0), s0 + t.length); setHistIdx(null); setMenu(null);
  };
  const touch = (key: string, opts: KeyboardEventInit = {}) => inputRef.current?.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
  const dismissOnboard = () => { setOnboard(false); try { localStorage.setItem(ONBOARD_KEY, '1'); } catch { /* ignore */ } };

  const pos = caret.v === input ? Math.min(caret.p, input.length) : input.length;
  const under = input.slice(pos, pos + 1);
  const hint = search || menu ? '' : input === '' && fixLine ? fixLine : pos === input.length && !ghostOff ? ghost(input, words, phrases, shell.fs, cwd) : '';
  const hit = search && search.idx >= 0 ? history.current[search.idx] : '';
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
            {search ? (
              <span className={search.q && !hit ? 'isearch fail' : 'isearch'}>{search.q && !hit ? '(failed reverse-i-search)`' : '(reverse-i-search)`'}<span className="q">{search.q}</span>{"':\u00a0"}</span>
            ) : <Prompt path={pathString(cwd)} fail={lastFail} />}
            {search ? <span className="whitespace-pre-wrap break-all">{input}</span> : <span className="whitespace-pre-wrap break-all">{input.slice(0, pos)}</span>}
            <span key={`c${pos}|${input}`} className={under ? 'cursor-block has-ch' : 'cursor-block'} aria-hidden="true">{under || undefined}</span>
            <span className="whitespace-pre-wrap break-all">{input.slice(pos + 1)}</span>
            {search && hit && <span className="text-sub whitespace-pre-wrap">{`\u00a0→\u00a0${hit}`}</span>}
            {hint && <span className="cmp-ghost" aria-hidden="true">{hint}</span>}
            <input ref={inputRef} value={input}
              onChange={(e) => {
                const v = e.target.value;
                setInput(v); setHistIdx(null); onCaret(e.target); setMenu(null); setGhostOff(false);
                if (search) setSearch({ ...search, q: v, idx: reverseSearch(history.current, v, history.current.length) });
              }}
              onSelect={(e) => onCaret(e.currentTarget)} onKeyDown={onKeyDown} onPaste={onPaste}
              className="absolute inset-0 h-full w-full cursor-text opacity-0" aria-label="Terminal input"
              autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" />
          </div>
        )}
        {!pager && menu && (
          <div className="cmp-menu" role="listbox" aria-label="completions">
            {menu.items.map((c, i) => (
              <button key={c} role="option" aria-selected={i === menu.sel} className={i === menu.sel ? 'sel' : undefined}
                onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); pick(i); inputRef.current?.focus(); }}>
                {i < 9 && <span className="n">{i + 1}</span>}{c}
              </button>
            ))}
            <span className="cmp-menu-hint">Tab/↑↓ select · 1-9 or Enter pick · Esc cancel</span>
          </div>
        )}
        {!pager && onboard && !menu && (
          <div className="onboard">
            {'new here? try: '}
            {['help', 'bio', 'scholar'].map((c, i) => <span key={c}>{i > 0 && ' · '}<button onClick={(e) => { e.stopPropagation(); run(c); }}>{c}</button></span>)}
            <button className="x" aria-label="dismiss hint" onClick={(e) => { e.stopPropagation(); dismissOnboard(); }}>×</button>
          </div>
        )}
      </div>
      {pager && (
        <div className="pager">
          <div ref={pagerRef} onScroll={pagerScroll} className="pager-body">{pager.map((t, i) => <MdLine key={i} text={t} run={run} />)}</div>
          <div className="pager-status"><span>{`--More--(${pct}%)`}</span><button onClick={closePager}>q quit</button></div>
        </div>
      )}
      {!pager && (
        <div className="touchbar" onMouseDown={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => touch('Tab')}>Tab</button>
          <button onClick={() => touch('ArrowRight')}>→</button>
          <button onClick={() => touch('ArrowUp')}>↑</button>
          <button onClick={() => touch('ArrowDown')}>↓</button>
          <button onClick={() => touch('Escape')}>Esc</button>
          <button onClick={() => touch('c', { ctrlKey: true })}>^C</button>
        </div>
      )}
    </div>
  );
}
