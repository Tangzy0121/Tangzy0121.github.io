# tangzy0121.github.io — source

Terminal-style personal site. The repo root is the built GitHub Pages artifact;
this `source/` directory is what it is built from.

## Layers

```
content/*.md + profile.json ──[scripts/build-content.ts]──▶ src/generated/content.ts
                                  (fails on dead links)          │
src/shell/   framework: types, vfs, parser, registry, run (pipes), complete (Tab)
src/apps/    command modules: fs (ls cd pwd tree cat), text (grep find wc head tail more less),
             shell (help whoami history clear exit echo theme neofetch), site (cv email github scholar)
src/content/ manifest → virtual FS (+ /bin, cv.pdf) and one command per page (docs-as-commands)
src/term/    React view: scrollback, line editor, ghost hint, pager, markdown line renderer, home screen
public/      copied verbatim: cv-viewer.js (PDF gallery), cv.pdf, fonts, favicon, robots, sitemap
```

- Edit content: change `content/**.md` or `content/profile.json` (pages, aliases, phrases).
- Add a command: write a `Command` in `src/apps/`, register it in `src/apps/index.ts`.

## Scripts

| command | what |
|---|---|
| `npm ci` | install |
| `npm run dev` | local dev server |
| `npm test` | compile content + node:test unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | compile content, vite build, copy `dist/` into the Pages root (`..`) |

Deploy = `npm run build`, review locally (`python3 -m http.server` in the repo root), commit, ordinary `git push`.
