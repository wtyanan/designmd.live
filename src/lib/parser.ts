import yaml from 'js-yaml'
import type { ParsedTokens, ParseResult, TypographyToken, ComponentDef, Breakpoint, ColorGroup } from './types'

// ── Prose extraction (primary path — no frontmatter required) ────────────

function normalizeHex(h: string): string {
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  return `#${h}`
}

function extractColorsFromProse(text: string): Record<string, string> | undefined {
  const colors: Record<string, string> = {}
  const re = /\{colors\.([a-zA-Z0-9_-]+)\}[^#\n]{0,30}#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (!colors[m[1]!]) colors[m[1]!] = normalizeHex(m[2]!)
  }
  return Object.keys(colors).length > 0 ? colors : undefined
}

function extractColorGroupsFromProse(text: string): ColorGroup[] | undefined {
  // Find the Colors section (## Colors or ### Colors)
  const sectionRe = /^(#{1,3})\s+[Cc]olors?\s*$/m
  const sectionMatch = sectionRe.exec(text)
  if (!sectionMatch) return undefined

  const level = sectionMatch[1]!.length
  const sectionStart = sectionMatch.index
  // End at next heading of same or higher level
  const nextRe = new RegExp(`^#{1,${level}}\\s+`, 'gm')
  nextRe.lastIndex = sectionStart + 1
  const nextMatch = nextRe.exec(text)
  const colorSection = text.slice(sectionStart, nextMatch?.index ?? text.length)

  // Find sub-headings within the colors section
  const subRe = /^#{3,4}\s+(.+)$/gm
  const subHeadings: Array<{ name: string; pos: number }> = []
  let hm: RegExpExecArray | null
  while ((hm = subRe.exec(colorSection)) !== null) {
    subHeadings.push({ name: hm[1]!.trim(), pos: hm.index })
  }
  if (subHeadings.length === 0) return undefined

  function buildGroups(re: RegExp): ColorGroup[] {
    const groups: ColorGroup[] = []
    const seen = new Set<string>()
    let cm: RegExpExecArray | null
    while ((cm = re.exec(colorSection)) !== null) {
      const key = cm[1]!
      if (seen.has(key)) continue
      seen.add(key)
      let groupName = subHeadings[0]!.name
      for (const sh of subHeadings) {
        if (sh.pos <= cm.index) groupName = sh.name
        else break
      }
      let group = groups.find(g => g.name === groupName)
      if (!group) { group = { name: groupName, keys: [] }; groups.push(group) }
      group.keys.push(key)
    }
    return groups
  }

  // Try with inline hex first (prose-only style); fall back to bare refs (frontmatter-backed style)
  const withHex = buildGroups(/\{colors\.([a-zA-Z0-9_-]+)\}[^#\n]{0,30}#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)
  const groups = withHex.length > 0 ? withHex : buildGroups(/\{colors\.([a-zA-Z0-9_-]+)\}/g)

  return groups.length > 0 ? groups : undefined
}

function extractTypographyFromProse(text: string): Record<string, TypographyToken> | undefined {
  const typography: Record<string, TypographyToken> = {}
  // | `{typography.name}` | Xpx | weight | lineHeight | letterSpacing |
  const re = /\|\s*`\{typography\.([a-zA-Z0-9_-]+)\}`\s*\|\s*(\d+)px\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*([\d.]+)\s*\|\s*([-\d.]+(?:px|em|rem)?)\s*\|/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (!typography[m[1]!]) {
      const ls = m[5]!
      typography[m[1]!] = {
        fontSize: `${m[2]}px`,
        fontWeight: parseFloat(m[3]!),
        lineHeight: parseFloat(m[4]!),
        letterSpacing: ls === '0' ? 0 : ls,
      }
    }
  }
  return Object.keys(typography).length > 0 ? typography : undefined
}

function extractSpacingFromProse(text: string): Record<string, string> | undefined {
  const spacing: Record<string, string> = {}
  // {spacing.name} (Xpx) or {spacing.name}` Xpx
  const re = /\{spacing\.([a-zA-Z0-9_-]+)\}[^(\d\n]{0,5}\(?(\d+)px[)·\s\b]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (!spacing[m[1]!]) spacing[m[1]!] = `${m[2]!}px`
  }
  return Object.keys(spacing).length > 0 ? spacing : undefined
}

function extractRoundedFromProse(text: string): Record<string, string> | undefined {
  const rounded: Record<string, string> = {}
  // | `{rounded.name}` | Xpx  (from shapes table)
  const re = /\{rounded\.([a-zA-Z0-9_-]+)\}[^|\n]{0,5}\|\s*(\d+)px/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const v = m[2]! === '9999' ? '9999px' : `${m[2]!}px`
    if (!rounded[m[1]!]) rounded[m[1]!] = v
  }
  return Object.keys(rounded).length > 0 ? rounded : undefined
}

function extractBreakpointsFromProse(text: string): Breakpoint[] | undefined {
  const breakpoints: Breakpoint[] = []

  // Collect heading positions to slice sections
  const headingRe = /^#{1,4}\s+(.+)$/gm
  const sections: Array<{ title: string; start: number }> = []
  let hm: RegExpExecArray | null
  while ((hm = headingRe.exec(text)) !== null) {
    sections.push({ title: hm[1]!.toLowerCase(), start: hm.index })
  }

  // Only scan sections whose title mentions responsive/breakpoint concepts
  const keywords = ['responsive', 'breakpoint', 'viewport', 'screen size', 'grid', 'layout']
  const relevantChunks: string[] = []
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]!
    if (keywords.some(k => s.title.includes(k))) {
      const end = sections[i + 1]?.start ?? text.length
      relevantChunks.push(text.slice(s.start, end))
    }
  }
  if (relevantChunks.length === 0) return undefined

  // Value pattern handles: < 480px, 480–767px, 480-767px, ≥ 1280px
  const rowRe = /^\|[ \t]*([^|`{]+?)[ \t]*\|[ \t]*([<>≤≥]?\s*\d+(?:[–\-]\d+)?(?:px|em|rem))[ \t]*\|([^|\n]*)\|?/gm
  const skipNames = new Set(['breakpoint', 'name', 'screen', 'size', 'width', 'min', 'max'])

  for (const chunk of relevantChunks) {
    rowRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = rowRe.exec(chunk)) !== null) {
      const name = m[1]!.trim()
      const value = m[2]!.trim().replace(/\s+/g, '')
      const desc = m[3]!.trim()
      if (name && !skipNames.has(name.toLowerCase()) && !/^[-:]+$/.test(name)) {
        breakpoints.push({ name, value, description: desc || undefined })
      }
    }
  }

  return breakpoints.length > 0 ? breakpoints : undefined
}

function extractComponentsFromProse(text: string): Record<string, ComponentDef> | undefined {
  const components: Record<string, ComponentDef> = {}

  // Match **`component-name`** — description blocks in prose
  const compRe = /\*\*`([a-zA-Z0-9_-]+)`\*\*/g
  let m: RegExpExecArray | null

  while ((m = compRe.exec(text)) !== null) {
    const name = m[1]!
    // Cap snippet at the next component definition so we don't bleed properties across components
    const afterName = m.index + m[0].length
    const nextComp = text.indexOf('**`', afterName)
    const snippetEnd = nextComp !== -1 ? Math.min(nextComp, afterName + 600) : afterName + 600
    const snippet = text.slice(afterName, snippetEnd)

    const def: ComponentDef = {}

    const bgMatch = snippet.match(/[Bb]ackground\s+`(\{[^}]+\}|#[0-9a-fA-F]{3,6})`/)
    if (bgMatch) def.backgroundColor = bgMatch[1]!

    const textMatch = snippet.match(/\btext\s+`(\{[^}]+\}|#[0-9a-fA-F]{3,6})`/)
    if (textMatch) def.textColor = textMatch[1]!

    const roundedMatch = snippet.match(/\brounded\s+`(\{[^}]+\}|\d+px)`/)
    if (roundedMatch) def.rounded = roundedMatch[1]!

    const heightMatch = snippet.match(/\bheight\s+(\d+)px/)
    if (heightMatch) def.height = `${heightMatch[1]}px`

    // Capture single or double spacing token padding
    const padMatch = snippet.match(/\bpadding\s+`(\{[^}]+\}(?:\s+\{[^}]+\})?)`/)
    if (padMatch) def.padding = padMatch[1]!

    const typographyMatch = snippet.match(/\btype\s+`(\{[^}]+\})`/)
    if (typographyMatch) def.typography = typographyMatch[1]!

    if (Object.keys(def).length > 0) {
      components[name] = def
    }
  }

  return Object.keys(components).length > 0 ? components : undefined
}

function extractFontFamilyFromProse(text: string): string | undefined {
  const patterns: RegExp[] = [
    // **single-family**: Font Name  or  **single family**: Font Name
    /\*?\*?single[- ]family\*?\*?[^:\n]*:\s*\*?\*?([A-Z][a-zA-Z0-9 -]+?)(?:\s*[,(]|\*|\n|$)/,
    // ### Font Family section → first bold name
    /#{1,4}\s+Font Family[\s\S]{0,400}?\*\*([A-Z][a-zA-Z0-9 -]+)\*\*/,
    // typeface: Name  or  font family: Name
    /(?:typeface|font\s*family)[^:\n]*:\s*\*?\*?([A-Z][a-zA-Z0-9 -]+?)(?:\s*[,(]|\*|\n|$)/i,
    // "set in Inter" or "uses Manrope"
    /(?:set in|uses?|using)\s+\*?\*?([A-Z][a-zA-Z0-9 -]{2,30})(?:\s+at weights|\s*[,.(]|\*|\n)/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const name = m[1]!.trim()
      if (name.length >= 2 && name.length <= 50 && /^[A-Z]/.test(name)) return name
    }
  }
  return undefined
}

function extractNameFromProse(text: string): string | undefined {
  const h1 = text.match(/^#\s+(.+)$/m)
  if (h1) return h1[1]!.trim()
  return undefined
}

function extractDescriptionFromProse(text: string): string | undefined {
  // First non-empty paragraph (not a heading)
  const lines = text.split('\n')
  for (const line of lines) {
    const t = line.trim()
    if (t && !t.startsWith('#') && !t.startsWith('|') && !t.startsWith('-') && t.length > 40) {
      // Strip markdown inline code and bold for cleaner description
      return t.replace(/`[^`]*`/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').slice(0, 280)
    }
  }
  return undefined
}

function extractTokensFromProse(text: string): ParsedTokens | null {
  const colors = extractColorsFromProse(text)
  let typography = extractTypographyFromProse(text)
  const spacing = extractSpacingFromProse(text)
  const rounded = extractRoundedFromProse(text)
  const breakpoints = extractBreakpointsFromProse(text)
  const components = extractComponentsFromProse(text)

  if (!colors && !typography) return null

  // Apply global font family to any typography token missing one
  if (typography) {
    const globalFont = extractFontFamilyFromProse(text)
    if (globalFont) {
      typography = Object.fromEntries(
        Object.entries(typography).map(([k, t]) => [k, t.fontFamily ? t : { ...t, fontFamily: globalFont }])
      )
    }
  }

  return {
    name: extractNameFromProse(text),
    description: extractDescriptionFromProse(text),
    colors,
    colorGroups: colors ? extractColorGroupsFromProse(text) : undefined,
    typography,
    spacing,
    rounded,
    breakpoints,
    components,
  }
}

// ── Main parser ───────────────────────────────────────────────────────────

export function parseDesignMd(raw: string): ParseResult {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)

  if (!fmMatch) {
    const extracted = extractTokensFromProse(raw)
    return { tokens: extracted, prose: raw, error: null, fromProse: !!extracted }
  }

  const yamlStr = fmMatch[1]!
  const prose = raw.slice(fmMatch[0].length).trim()

  try {
    const parsed = yaml.load(yamlStr)
    if (!parsed || typeof parsed !== 'object') {
      return { tokens: null, prose, error: 'Invalid YAML: expected an object' }
    }

    const p = parsed as Record<string, unknown>

    const fmColors = p['colors'] as Record<string, string> | undefined
    const fmTypography = p['typography'] as Record<string, TypographyToken> | undefined

    // Prose supplements frontmatter: grouping, font family, and gap-filling
    const proseTokens = extractTokensFromProse(prose)

    // Merge colors: frontmatter values win, prose fills gaps
    const mergedColors: Record<string, string> | undefined =
      fmColors
        ? { ...(proseTokens?.colors ?? {}), ...fmColors }
        : proseTokens?.colors

    // Apply prose font family to typography tokens missing one
    let mergedTypography = fmTypography ?? proseTokens?.typography
    if (mergedTypography) {
      const globalFont = extractFontFamilyFromProse(prose)
      if (globalFont) {
        mergedTypography = Object.fromEntries(
          Object.entries(mergedTypography).map(([k, t]) => [k, t.fontFamily ? t : { ...t, fontFamily: globalFont }])
        )
      }
    }

    // Color groups: prefer prose-derived groups (they carry semantic names from headings)
    const colorGroups = mergedColors
      ? (proseTokens?.colorGroups ?? extractColorGroupsFromProse(prose))
      : undefined

    const tokens: ParsedTokens = {
      name: typeof p['name'] === 'string' ? p['name'] : proseTokens?.name,
      description: typeof p['description'] === 'string' ? p['description'] : proseTokens?.description,
      version: typeof p['version'] === 'string' ? p['version'] : undefined,
      colors: mergedColors,
      colorGroups,
      typography: mergedTypography,
      rounded: (p['rounded'] as Record<string, string> | undefined) ?? proseTokens?.rounded,
      spacing: (p['spacing'] as Record<string, string> | undefined) ?? proseTokens?.spacing,
      components: (p['components'] as Record<string, ComponentDef> | undefined) ?? proseTokens?.components,
      breakpoints: proseTokens?.breakpoints ?? extractBreakpointsFromProse(prose),
    }

    return { tokens, prose, error: null }
  } catch (err) {
    return { tokens: null, prose, error: (err as Error).message }
  }
}
