# designmd.live

Browser sandbox that compiles a `DESIGN.md` file into a live UI component library. Write your design tokens and rationale in plain Markdown — see them rendered as a live Kitchen Sink instantly.

**Live:** [designmd.live](https://designmd.live)

---

## What it does

Paste or write a `DESIGN.md` file in the editor. The preview panel renders:

- **Brand color swatches** — with WCAG contrast labels
- **Typography ladder** — sorted largest → smallest
- **Interaction gallery** — buttons, inputs, cards, radius scale, spacing scale

No install. No build step. No backend. Runs entirely in the browser.

---

## DESIGN.md format

Tokens are extracted from prose automatically:

```markdown
The primary brand color is {colors.primary} — #024ad8.

| Token | Size | Weight | Line Height | Tracking |
|-------|------|--------|-------------|----------|
| `{typography.display-xl}` | 56px | 500 | 1.0 | 0 |

| Token | Value |
|-------|-------|
| `{rounded.md}` | 4px |
```

Optional YAML frontmatter for precise overrides:

```yaml
---
colors:
  primary: "#024ad8"
  surface: "#F5F5F7"
typography:
  body:
    fontSize: "17px"
    fontWeight: 400
---
```

Cross-references resolve with `{path.to.token}` syntax.

---

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- CodeMirror 6 (editor)
- js-yaml (parser)
- Radix UI (accessible primitives)
- 100% client-side, no SSR

---

## Dev

```bash
yarn dev        # local dev server
yarn build      # production build
yarn preview    # preview production build
yarn lint       # eslint
```
