import type { ParsedTokens } from './types'

export function buildCssString(tokens: ParsedTokens, scope = '.preview-root'): string {
  const vars: string[] = []

  if (tokens.colors) {
    for (const [name, value] of Object.entries(tokens.colors)) {
      if (typeof value === 'string' && value.startsWith('#')) {
        vars.push(`  --color-${name}: ${value};`)
      }
    }
  }

  if (tokens.rounded) {
    for (const [name, value] of Object.entries(tokens.rounded)) {
      vars.push(`  --rounded-${name}: ${value};`)
    }
  }

  if (tokens.spacing) {
    for (const [name, value] of Object.entries(tokens.spacing)) {
      vars.push(`  --spacing-${name}: ${value};`)
    }
  }

  if (tokens.typography) {
    for (const [name, t] of Object.entries(tokens.typography)) {
      if (!t || typeof t !== 'object') continue
      if (t.fontFamily) vars.push(`  --typography-${name}-font-family: ${t.fontFamily};`)
      if (t.fontSize)   vars.push(`  --typography-${name}-font-size: ${t.fontSize};`)
      if (t.fontWeight !== undefined) vars.push(`  --typography-${name}-font-weight: ${t.fontWeight};`)
      if (t.lineHeight !== undefined) vars.push(`  --typography-${name}-line-height: ${t.lineHeight};`)
      if (t.letterSpacing !== undefined) vars.push(`  --typography-${name}-letter-spacing: ${t.letterSpacing};`)
    }
  }

  if (vars.length === 0) return ''

  // ── Semantic alias vars ────────────────────────────────────────────────────
  // These let InteractionGallery use short names that work across any design system.
  const semantic = [
    // Surface
    `  --canvas: var(--color-canvas, var(--color-background, var(--color-surface, #ffffff)));`,
    `  --cloud:  var(--color-cloud, var(--color-fog, var(--color-muted, #f5f5f5)));`,
    // Text
    `  --ink:    var(--color-ink, var(--color-foreground, var(--color-dark, var(--color-navy, #1a1a1a))));`,
    // Brand
    `  --primary:    var(--color-primary, var(--color-brand, var(--color-accent, #6366f1)));`,
    `  --on-primary: var(--color-on-primary, var(--color-on-ink, #ffffff));`,
    // Borders
    `  --hairline: var(--color-hairline, var(--color-steel, var(--color-fog, var(--color-border, #e8e8e8))));`,
    // Shape
    `  --btn-radius:  var(--rounded-md, var(--rounded-sm, 6px));`,
    `  --card-radius: var(--rounded-xl, var(--rounded-lg, var(--rounded-md, 12px)));`,
    `  --chip-radius: var(--rounded-pill, var(--rounded-lg, 9999px));`,
    // Typography — broad fallback chains cover hero-display, display-*, heading, headline, title, body variants
    `  --font-base:    var(--typography-body-md-font-family, var(--typography-body-font-family, var(--typography-body-base-font-family, var(--typography-base-font-family, var(--typography-text-font-family, system-ui, -apple-system, sans-serif)))));`,
    `  --font-display: var(--typography-hero-display-font-family, var(--typography-display-xxl-font-family, var(--typography-display-xl-font-family, var(--typography-display-lg-font-family, var(--typography-display-md-font-family, var(--typography-heading-xl-font-family, var(--typography-heading-font-family, var(--typography-headline-font-family, var(--typography-title-font-family, var(--font-base))))))))));`,
    `  --size-body:    var(--typography-body-md-font-size, var(--typography-body-font-size, var(--typography-body-base-font-size, 15px)));`,
    `  --weight-body:  var(--typography-body-md-font-weight, var(--typography-body-font-weight, 400));`,
    // Spacing — component-specific aliases consume spacing scale tokens
    `  --btn-pad-y:   var(--spacing-btn-y, var(--spacing-button-y, var(--spacing-sm, var(--spacing-2, 10px))));`,
    `  --btn-pad-x:   var(--spacing-btn-x, var(--spacing-button-x, var(--spacing-md, var(--spacing-4, 22px))));`,
    `  --card-pad:    var(--spacing-card, var(--spacing-lg, var(--spacing-6, 20px)));`,
    `  --input-pad-y: var(--spacing-input-y, var(--spacing-sm, var(--spacing-2, 9px)));`,
    `  --input-pad-x: var(--spacing-input-x, var(--spacing-md, var(--spacing-4, 14px)));`,
  ]

  return `${scope} {\n${vars.join('\n')}\n\n${semantic.join('\n')}\n}`
}

export function injectStyles(css: string, id = 'design-md-tokens'): void {
  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = css
}
