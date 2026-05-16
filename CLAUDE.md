# designmd.live — CLAUDE.md

## Project Purpose
Browser sandbox that compiles a `DESIGN.md` file into a live UI component library ("Kitchen Sink"). Zero-install visual feedback loop for the DESIGN.md specification.

**Live URL:** `designmd.live`  
**Hosting:** Cloudflare Pages (static CDN)  
**Repo:** Public GitHub → auto-deploy on push via GitHub Actions

---

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (utility-first, zero runtime)
- **Accessible primitives:** Radix UI (only what's needed)
- **Editor:** CodeMirror 6 (YAML + Markdown syntax highlighting)
- **YAML parser:** js-yaml (browser-safe frontmatter extraction)
- **No SSR. 100% client-side.**

---

## Architecture

```
[ CodeMirror Raw Text ]
        │
        ▼
[ js-yaml ] ──► YAML frontmatter + prose
        │
        ▼
[ Token Resolver ] ──► resolves "{colors.primary}" cross-refs
        │
        ▼
[ CSS Injector ] ──► :root { --color-primary: #1A1C1E; }
        │
        ▼
[ Kitchen Sink Canvas ] ──► components styled by CSS vars
```

### Key Files
```
src/
  lib/
    parser.ts          # js-yaml wrapper, YAML extraction
    resolver.ts        # cross-reference resolution: {path.to.token}
    cssInjector.ts     # flattens token tree → CSS custom properties
    linter.ts          # schema validation, returns warnings[]
  components/
    Editor.tsx         # CodeMirror 6 panel
    Preview.tsx        # kitchen sink canvas wrapper
    kitchen/
      ColorSwatches.tsx
      TypographyLadder.tsx
      InteractionGallery.tsx  # buttons, inputs, cards, etc.
    ui/                # small reusable UI primitives
  App.tsx              # split-pane layout, state orchestration
  store.ts             # reactive state (useState/useReducer, no Redux)
```

---

## Layout

```
+-------------------------------------------------------+
| designmd.live                          [☕ Sponsor]   |
+-------------------------+-----------------------------+
| EDITOR (CodeMirror 6)   | VISUAL CANVAS PREVIEW       |
|                         |                             |
| Raw DESIGN.md text      | Brand Swatches              |
|                         | Typography Ladder           |
|                         | Interaction Gallery         |
|                         |                             |
|                         | [Linter Warnings — bottom]  |
+-------------------------+-----------------------------+
```

- Split pane, resizable
- Debounced parse: **≤150ms** from typing pause to re-render

---

## DESIGN.md Spec Summary
A `DESIGN.md` file is primarily **prose** — human-readable design rationale with inline token references. YAML frontmatter is supported as an optional enhancement for full machine-readable precision.

### Primary format (prose-only)
Tokens are extracted automatically from prose patterns:
- Colors: `{colors.primary} — #024ad8` anywhere in text
- Typography: table rows `| \`{typography.display-xl}\` | 56px | 500 | 1.0 | 0 |`
- Shapes: `{rounded.md} | 4px` in tables
- Components: `**\`button-primary\`**` bold-code blocks with property bullets
- Breakpoints: table rows in Responsive sections

### Optional frontmatter enhancement
YAML frontmatter can override or supplement prose extraction:
```yaml
---
colors:
  primary: "#1A1C1E"
typography:
  headline-display:
    fontSize: "32px"
    fontWeight: 700
---
```

Cross-references use `{path.to.token}` syntax, e.g. `{colors.primary}`.

**Sample DESIGN.md:** `src/sample.md` — full Apple design system tokens

---

## Performance Constraints
- Parse + render cycle: **≤150ms** debounce
- Bundle: keep small — no MUI/Chakra/Ant

---

## Dev Commands
```bash
yarn dev        # local dev server
yarn build      # production build (tsc + vite)
yarn preview    # preview production build locally
yarn lint       # eslint
```

---

## Key Decisions
- **No heavy component library** — custom components + Tailwind + Radix primitives only
- **js-yaml** for parsing (browser-safe, no Node.js deps)
- **No backend** — all parsing client-side
- **Minimalist design** — tool-first aesthetic, dark/light respects system preference
