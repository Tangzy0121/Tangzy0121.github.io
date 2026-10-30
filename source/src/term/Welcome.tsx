import type { ReactNode } from 'react';
import { profile } from '../generated/content';
import { CopyButton } from './markdown';

const ASCII = [
  '  ______',
  ' /_  __/___ _____  ____ _____  __  __',
  '  / / / __ `/ __ \\/ __ `/_  / / / / /',
  ' / / / /_/ / / / / /_/ / / /_/ /_/ /',
  '/_/  \\__,_/_/ /_/\\__, / /___/\\__, /',
  '                /____/      /____/',
].join('\n');

const Sep = () => <span className="text-sub"> · </span>;
const Bar = () => <span className="welcome-bar">│ </span>;

export function Welcome({ run }: { run: (cmd: string) => void }) {
  const B = ({ cmd, children }: { cmd: string; children: ReactNode }) => <button className="term-link" onClick={() => run(cmd)}>{children}</button>;
  return (
    <div>
      <div className="welcome-title"># {profile.nameZh}   {profile.site}</div>
      <div className="text-sub break-all">{'─'.repeat(56)}</div>
      <pre className="ascii-name" aria-label="Tangzy">{ASCII}</pre>
      <div className="ascii-fallback">Tangzy</div>
      <div className="mt-4">{profile.name} / {profile.nameZh}</div>
      <div className="text-sub">{profile.role} · {profile.affiliation}</div>
      <div className="text-sub">{profile.interests.join(' · ')}</div>
      <div className="mt-4">
        <div><Bar /><B cmd="bio">● Bio</B><Sep /><B cmd="research">◈ Research</B><Sep /><B cmd="papers">▣ Papers</B></div>
        <div>
          <Bar /><B cmd="projects">◇ Projects</B><Sep /><B cmd="cv">◌ CV</B><Sep /><B cmd="scholar">§ Scholar</B><Sep />
          <a href={profile.links.github.url} target="_blank" rel="noreferrer" className="term-link">⌘ GitHub</a>
        </div>
        <div><Bar /><span className="select-all">{profile.email}</span> <CopyButton text={profile.email} /><Sep /><span className="text-sub">{profile.location}</span></div>
      </div>
      <div className="mt-4"><em>{profile.tagline}</em></div>
      <div className="text-sub">
        This page doubles as a shell. Try:{' '}
        {['help', 'bio', 'research', 'projects', 'papers', 'tree', 'cat bio | grep -i safety'].map((c, i, a) => (
          <span key={c}><B cmd={c}>{c}</B>{i < a.length - 1 ? ', ' : '.'}</span>
        ))}
      </div>
      <div className="text-sub">Last update: {profile.lastUpdate}</div>
    </div>
  );
}
