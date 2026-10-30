// Line-oriented markdown → terminal styling. Supports # / ## headings, > quotes,
// - lists, `code`, *em*, [label](url). Link schemes:
//   cmd:<line>  run a shell command      mailto:<addr>  address + [copy]
//   http(s):    open in a new tab
import { useState, type ReactNode } from 'react';
import type { LineKind } from '../shell/types';
import { copyText } from './copy';

export const KIND_CLASS: Record<LineKind, string> = {
  output: 'text-ink', error: 'text-err', dir: 'text-dir', success: 'text-ok', warning: 'text-warn', muted: 'text-sub', link: 'text-primary',
};

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="term-link" aria-label="Copy email address"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); void copyText(text).then((ok) => { if (ok) { setDone(true); setTimeout(() => setDone(false), 1500); } }); }}>
      {done ? 'copied ✓' : '[copy]'}
    </button>
  );
}

function plain(s: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  s.split(/`([^`]+)`/g).forEach((chunk, i) => {
    if (i % 2) return out.push(<span key={`${key}c${i}`} className="md-code">{chunk}</span>);
    chunk.split(/\*([^*]+)\*/g).forEach((t, j) => {
      if (j % 2) out.push(<em key={`${key}e${i}-${j}`}>{t}</em>);
      else if (t) out.push(t);
    });
  });
  return out;
}

export function inline(s: string, run: (cmd: string) => void): ReactNode[] {
  const bits = s.split(/\[([^\]]+)\]\(([^)]+)\)/g);
  const out: ReactNode[] = [];
  for (let i = 0; i < bits.length; i += 3) {
    out.push(...plain(bits[i], `p${i}`));
    if (i + 2 >= bits.length) break;
    const [label, url] = [bits[i + 1], bits[i + 2]];
    if (url.startsWith('cmd:')) out.push(<button key={i} className="term-link" onClick={() => run(url.slice(4))}>{label}</button>);
    else if (url.startsWith('mailto:'))
      out.push(<span key={i}><span className="select-all">{url.slice(7)}</span> <CopyButton text={url.slice(7)} /></span>);
    else out.push(<a key={i} href={url} target={url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="term-link"
      download={/\.pdf$/i.test(url) && !url.startsWith('http') ? '' : undefined} onClick={(e) => e.stopPropagation()}>{label}</a>);
  }
  return out;
}

export function MdLine({ text, kind = 'output', run }: { text: string; kind?: LineKind; run: (cmd: string) => void }) {
  const h = text.match(/^(#{1,2})\s+(.*)$/);
  if (h && h[1].length === 1)
    return (
      <div>
        <div className="whitespace-pre-wrap break-words font-semibold text-primary">{inline(h[2], run)}</div>
        <div className="md-h1-divider" aria-hidden="true">{'─'.repeat(h[2].length)}</div>
      </div>
    );
  if (h) return <div className="md-h2"><span className="md-h2-mark" aria-hidden="true">▍</span>{inline(h[2], run)}</div>;
  const chip = text.match(/^- (.+?) :: (.*)$/);
  if (chip)
    return <div className="md-chip-row"><span className="md-chip">{inline(chip[1], run)}</span><span className="md-chip-text">{inline(chip[2], run)}</span></div>;
  if (/^\d\d  /.test(text)) return <div className="whitespace-pre-wrap break-words md-item">{inline(text, run)}</div>;
  if (/^\s+Status: /.test(text)) return <div className="whitespace-pre-wrap break-words text-warn">{inline(text, run)}</div>;
  if (text.startsWith('>> '))
    return <div className="md-lead">{inline(text.slice(3), run)}</div>;
  if (text.startsWith('> '))
    return <div className="whitespace-pre-wrap break-words"><span className="md-quote">│ </span>{inline(text.slice(2), run)}</div>;
  const li = text.startsWith('- ') || text.startsWith('* ');
  return <div className={`whitespace-pre-wrap break-words ${KIND_CLASS[kind]} ${li ? 'md-li' : ''}`}>{inline(li ? `- ${text.slice(2)}` : text, run)}</div>;
}
