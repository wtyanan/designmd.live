import type { ParsedTokens, ComponentDef } from './types'

function getNestedPrimitive(obj: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  if (typeof current === 'string') return current
  if (typeof current === 'number') return String(current)
  return undefined
}

function resolveRef(value: string, raw: unknown): string {
  // Single complete ref: {path.to.token}
  const single = value.match(/^\{([^}]+)\}$/)
  if (single) {
    const r = getNestedPrimitive(raw, single[1]!)
    return r ?? value
  }
  // Composite: "{spacing.sm} {spacing.xl}" or "1px solid {colors.primary}"
  if (value.includes('{')) {
    return value.replace(/\{([^}]+)\}/g, (match, path) => getNestedPrimitive(raw, path) ?? match)
  }
  return value
}

// ── Semantic color inference ────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '')
  if (m.length !== 6) return null
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)]
}

function luminance(r: number, g: number, b: number): number {
  const w = [0.2126, 0.7152, 0.0722]
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255
    return acc + (s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)) * w[i]!
  }, 0)
}

function contrastText(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'
  return luminance(...rgb) > 0.179 ? '#000000' : '#ffffff'
}

function inferSemanticColors(colors: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...colors }

  // Compute on-{name} for every resolved hex color that doesn't have one
  for (const [name, hex] of Object.entries(colors)) {
    if (!name.startsWith('on-') && hex.startsWith('#') && !out[`on-${name}`]) {
      out[`on-${name}`] = contrastText(hex)
    }
  }

  // Canonical semantic aliases — if canonical missing, try common alternatives
  const aliases: Array<[string, string[]]> = [
    ['canvas',   ['background', 'bg', 'surface', 'base', 'white']],
    ['ink',      ['text', 'foreground', 'fg', 'black', 'dark', 'navy']],
    ['hairline', ['border', 'divider', 'separator', 'steel', 'line', 'fog']],
    // on-* surface-text aliases
    ['on-dark',  ['body-on-dark', 'on-surface-black', 'on-ink', 'on-black']],
    ['on-light', ['body-on-light', 'on-canvas', 'on-background', 'ink', 'body']],
  ]
  for (const [canonical, alts] of aliases) {
    if (!out[canonical]) {
      for (const alt of alts) {
        if (out[alt]) { out[canonical] = out[alt]!; break }
      }
    }
  }

  // Hard fallbacks for on-* tokens that didn't resolve through aliases
  if (!out['on-dark'])  out['on-dark']  = '#ffffff'
  if (!out['on-light']) out['on-light'] = '#000000'

  return out
}

// ── Main resolver ───────────────────────────────────────────────────────────

export function resolveTokens(tokens: ParsedTokens): ParsedTokens {
  const raw: unknown = tokens

  const colors: Record<string, string> = {}
  if (tokens.colors) {
    for (const [k, v] of Object.entries(tokens.colors)) {
      colors[k] = resolveRef(String(v), raw)
    }
  }

  const enrichedColors = tokens.colors ? inferSemanticColors(colors) : undefined

  const rounded: Record<string, string> = {}
  if (tokens.rounded) {
    for (const [k, v] of Object.entries(tokens.rounded)) {
      rounded[k] = resolveRef(String(v), raw)
    }
  }

  const spacing: Record<string, string> = {}
  if (tokens.spacing) {
    for (const [k, v] of Object.entries(tokens.spacing)) {
      spacing[k] = resolveRef(String(v), raw)
    }
  }

  // Re-resolve using enriched token tree so on-* refs in components resolve
  const enrichedRaw = { ...tokens, colors: enrichedColors }

  const components: Record<string, ComponentDef> = {}
  if (tokens.components) {
    for (const [compName, compDef] of Object.entries(tokens.components)) {
      const resolved: ComponentDef = {}
      for (const [prop, val] of Object.entries(compDef)) {
        if (val !== undefined) {
          resolved[prop] = resolveRef(String(val), enrichedRaw)
        }
      }
      components[compName] = resolved
    }
  }

  return {
    ...tokens,
    colors: enrichedColors,
    rounded: tokens.rounded ? rounded : undefined,
    spacing: tokens.spacing ? spacing : undefined,
    components: tokens.components ? components : undefined,
  }
}
