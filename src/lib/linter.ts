import type { ParsedTokens, Finding } from './types'

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '')
  if (m.length !== 6) return null
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)]
}

function luminance(r: number, g: number, b: number): number {
  const weights = [0.2126, 0.7152, 0.0722]
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255
    const v = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    return acc + v * weights[i]!
  }, 0)
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  if (!c1 || !c2) return null
  const l1 = luminance(...c1)
  const l2 = luminance(...c2)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

function isRef(v: string): boolean {
  return /^\{[^}]+\}$/.test(v)
}

export function lintTokens(raw: ParsedTokens, resolved: ParsedTokens, fromProse?: boolean): Finding[] {
  const findings: Finding[] = []

  if (!fromProse && !resolved.colors?.['primary']) {
    findings.push({
      severity: 'warning',
      rule: 'missing-primary',
      message: 'No primary color defined. Add colors.primary.',
    })
  }

  if (resolved.colors && Object.keys(resolved.colors).length > 0 && !resolved.typography) {
    findings.push({
      severity: 'warning',
      rule: 'missing-typography',
      message: 'Colors defined but no typography tokens found.',
    })
  }

  if (raw.components) {
    for (const [comp, def] of Object.entries(raw.components)) {
      for (const [prop, val] of Object.entries(def)) {
        if (val && isRef(val)) {
          const resolvedVal = resolved.components?.[comp]?.[prop]
          if (!resolvedVal || isRef(resolvedVal)) {
            const path = val.slice(1, -1)
            // Composite refs (typography objects) are allowed in components
            const parts = path.split('.')
            const section = parts[0]
            if (section !== 'typography') {
              findings.push({
                severity: 'error',
                rule: 'broken-ref',
                path: `components.${comp}.${prop}`,
                message: `Unresolved reference: ${val}`,
              })
            }
          }
        }
      }
    }
  }

  if (resolved.components) {
    for (const [comp, def] of Object.entries(resolved.components)) {
      const bg = def['backgroundColor']
      const text = def['textColor']
      if (bg?.startsWith('#') && text?.startsWith('#')) {
        const ratio = contrastRatio(bg, text)
        if (ratio !== null && ratio < 3) {
          findings.push({
            severity: 'warning',
            rule: 'contrast-ratio',
            path: `components.${comp}`,
            message: `Low contrast ${ratio.toFixed(1)}:1 (WCAG AA requires 4.5:1)`,
          })
        }
      }
    }
  }

  const counts: string[] = []
  if (resolved.colors) counts.push(`${Object.keys(resolved.colors).length} colors`)
  if (resolved.typography) counts.push(`${Object.keys(resolved.typography).length} typography`)
  if (resolved.rounded) counts.push(`${Object.keys(resolved.rounded).length} rounded`)
  if (resolved.spacing) counts.push(`${Object.keys(resolved.spacing).length} spacing`)
  if (resolved.components) counts.push(`${Object.keys(resolved.components).length} components`)

  if (counts.length > 0) {
    findings.push({ severity: 'info', rule: 'token-summary', message: counts.join(' · ') })
  }

  return findings
}
