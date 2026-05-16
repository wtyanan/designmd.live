import type { CSSProperties } from 'react'
import type { ComponentDef, ParsedTokens } from '../../../lib/types'

export interface SectionPresence {
  navigation: boolean
  buttons: boolean
  inputs: boolean
  cards: boolean
  pricing: boolean
  footer: boolean
}

export function detectSections(tokens: ParsedTokens): SectionPresence {
  const keys = Object.keys(tokens.components ?? {}).map(k => k.toLowerCase())
  const has = (...terms: string[]) => keys.some(k => terms.some(t => k.includes(t)))
  return {
    navigation: has('nav', 'header', 'topbar', 'menu'),
    buttons: has('button', 'btn', 'cta', 'link'),
    inputs: has('input', 'search', 'form', 'field', 'select', 'checkbox'),
    cards: has('card', 'tile', 'panel', 'configurator', 'chip', 'product', 'store-utility', 'floating'),
    pricing: has('pricing', 'tier', 'plan', 'subscription', 'price-card'),
    footer: has('footer'),
  }
}

export const C = {
  primary:   'var(--primary, #6366f1)',
  onPrimary: 'var(--on-primary, #ffffff)',
  ink:       'var(--ink, #1a1a1a)',
  onInk:     'var(--color-on-ink, var(--on-primary, #ffffff))',
  canvas:    'var(--canvas, #ffffff)',
  cloud:     'var(--cloud, #f5f5f5)',
  hairline:  'var(--hairline, #e8e8e8)',
  charcoal:  'var(--color-charcoal, var(--color-graphite, #636363))',
  coral:     'var(--color-bloom-coral, var(--color-destructive, var(--color-error, #ef4444)))',
} as const

export const R = {
  btn:  'var(--btn-radius, 6px)',
  card: 'var(--card-radius, 12px)',
  chip: 'var(--chip-radius, 9999px)',
  sm:   'var(--rounded-sm, var(--rounded-xs, 4px))',
  lg:   'var(--rounded-lg, 8px)',
} as const

export const F = {
  base:    'var(--font-base, system-ui)',
  display: 'var(--font-display, var(--font-base, system-ui))',
  sizeBody: 'var(--size-body, 15px)',
} as const

export function resolved(v: string | undefined, fallback: string): string {
  return v && !v.startsWith('{') ? v : fallback
}

export function resolvedPadding(comp: ComponentDef | undefined, fallback: string): string {
  const p = comp?.padding
  return p && !p.startsWith('{') ? p : fallback
}

export function findComp(
  comps: Record<string, ComponentDef> | undefined,
  ...keys: string[]
): ComponentDef | undefined {
  if (!comps) return undefined
  for (const k of keys) {
    if (comps[k]) return comps[k]
  }
  for (const k of keys) {
    const found = Object.entries(comps).find(([name]) => name.includes(k))
    if (found) return found[1]
  }
  return undefined
}

export function buildPrimaryBtn(comp: ComponentDef | undefined): CSSProperties {
  const radius = resolved(comp?.rounded, R.btn)
  return {
    backgroundColor: resolved(comp?.backgroundColor, C.primary),
    color: resolved(comp?.textColor, C.onPrimary),
    borderRadius: radius,
    padding: resolvedPadding(comp, 'var(--btn-pad-y, 10px) var(--btn-pad-x, 22px)'),
    height: comp?.height,
    border: 'none',
    cursor: 'pointer',
    fontFamily: F.base,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transition: 'filter 0.1s',
    whiteSpace: 'nowrap',
  }
}
