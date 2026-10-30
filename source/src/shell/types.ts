// Contract between the shell framework and command modules.
// The framework knows nothing about markdown or the site's content.

export type FileNode = { type: 'file'; name: string; content: string; pdf?: boolean };
export type DirNode = { type: 'dir'; name: string; children: Record<string, VNode> };
export type VNode = FileNode | DirNode;

export type LineKind = 'output' | 'error' | 'dir' | 'success' | 'warning' | 'muted' | 'link';
export type Part = { text: string; kind?: LineKind };

export interface Context {
  fs: DirNode;
  cwd: string[];
  setCwd(seg: string[]): void;
  /** Previous directory for `cd -` (OLDPWD). */
  oldCwd?: string[];
  /** Current page name (for `share`), if any. */
  route?: string;
  /** Reset to the home screen: clear, cd ~, welcome banner, and drop any #page from the URL. */
  home?: () => void;
  print(text: string, kind?: LineKind): void;
  printParts(parts: Part[]): void;
  clear(): void;
  welcome(): void;
  /** Start a new "page" (clears screen, pushes history entry). */
  switchPage(name: string): void;
  /** Open the pager over the given lines. */
  page(lines: string[]): void;
  history: string[];
  theme: 'light' | 'dark';
  setTheme(t: 'light' | 'dark'): void;
  cols: number;
  rows: number;
  /** True only for the last stage of a pipeline (output goes to the screen). */
  tty: boolean;
  stdin?: string;
  /** Side-effect hooks (injected so commands stay testable). */
  openUrl(url: string): void;
  copy(text: string): Promise<boolean>;
  openCV(): void;
  /** Open paper #i (0-based) in the PDF gallery; false if there is no such paper. */
  openPaper?(i: number): boolean;
  /** Open the projects showcase (gallery, or project #i detail, 0-based); false if no such project. */
  openShowcase?(i?: number): boolean;
  /** Offer a corrected command line for the next prompt (Tab/→ accepts). */
  suggest?(line: string): void;
}

export interface Command {
  name: string;
  desc: string;
  group: 'Navigation' | 'Filesystem' | 'Text' | 'Shell';
  /** Document command: shown in Navigation, not listed in /bin. */
  doc?: boolean;
  /** Hidden from help and /bin (e.g. aliases). */
  hidden?: boolean;
  run(argv: string[], ctx: Context): void;
}
