# Study handoff for Claude / Cursor

This folder packages **SMC Fall 2026 course work** so Claude (Claude Code, Claude.ai project, or another Cursor agent) can continue without the original chat transcript.

**Do not mix these files into Athlink product app logic.** Product code stays at repo root (`src/`, etc.). Study materials live under `study/`.

## Student

- Kai Nozawa — F-1, SMC, Geography major
- Courses: GIS 20 / GEOG 20 (Liu, Canvas `85288`), GEOG 5 (Fritschle `86105`), STAT C1000 (Martinez `84818`), SOCIOL 1, ARTH C1200

## What’s here

| Path | Contents |
|---|---|
| `study/gis20/` | Module 2 notes, Discussion 2 Discrete vs Continuous draft + Mia reply |
| `study/stat-c1000/` | Exam 1 study sheet + practice PDFs (P1/P2 if present) |
| `study/geog5/` | GEOG 5 lecture review site mirror (if copied) |
| `study/canvases/` | Cursor canvas sources (read-only copies; live canvases also under `~/.cursor/projects/.../canvases/`) |

## Live Cursor canvases (original paths)

- `~/.cursor/projects/Users-kainozawa-athlink/canvases/gis20-module2-study.canvas.tsx`
- `.../gis20-stat-discrete-continuous-lecture.canvas.tsx`
- `.../stat-c1000-exam1-study.canvas.tsx`
- `.../stat-c1000-exam1-review-ja.canvas.tsx`
- `.../smc-canvas-checklist.canvas.tsx`

## Recent state (as of handoff)

- **GIS 20 Discussion 2 (Discrete vs Continuous):** draft + reply to Mia Cassle in `study/gis20/gis20-discussion2-discrete-continuous.md`
- **GIS 20 Module 2:** study canvas + markdown notes ready
- **STAT Exam 1:** variable classification + sampling methods; practice PDFs on Desktop / study folder
- **Beyond Making Maps Discussion 2:** already graded 10/10 (older draft may still exist at repo root `gis20-discussion2-draft.md` if present)
- **Integrity:** do not submit AI answers for graded quizzes that forbid it; discussions should stay in Kai’s voice

## How to continue in Claude

1. Clone or open this GitHub repo / branch.
2. Read this file first, then the relevant `study/<course>/` notes.
3. Prefer editing files under `study/` (and syncing canvases back to `~/.cursor/projects/.../canvases/` if the user still uses Cursor Canvas UI).
4. For Canvas/MyLab live work, use the user’s logged-in browser; don’t invent submission dates.

## Remote

- GitHub: `https://github.com/kaibouz/Athlink.git`
- Branch used for this handoff: see latest push message (typically `cursor/pdf-flow-market-app-unify` or a study-specific branch)

## Product vs school

| Area | Location |
|---|---|
| AthlinkPro app | repo root |
| SMC study | `study/` |
