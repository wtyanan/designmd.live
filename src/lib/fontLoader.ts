import type { TypographyToken } from './types'

// Fonts available on Google Fonts that design systems commonly reference
const GOOGLE_FONTS = new Set([
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Nunito', 'Source Sans Pro', 'Source Sans 3', 'Manrope', 'Playfair Display',
  'Merriweather', 'Ubuntu', 'Noto Sans', 'Fira Sans', 'Work Sans', 'DM Sans',
  'Plus Jakarta Sans', 'Outfit', 'Figtree', 'Space Grotesk', 'Syne',
  'Bricolage Grotesque', 'Red Hat Display', 'Red Hat Text', 'IBM Plex Sans',
  'IBM Plex Serif', 'IBM Plex Mono', 'Geist', 'Geist Mono', 'Lexend',
  'Instrument Sans', 'Instrument Serif', 'Fraunces', 'Cabinet Grotesk',
])

function primaryFontName(family: string): string | null {
  const first = family.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '') ?? ''
  if (!first || /^(system-ui|-apple-system|BlinkMacSystemFont|sans-serif|serif|monospace|inherit|initial|unset)$/i.test(first)) return null
  return first
}

export function loadFontsFromTypography(typography: Record<string, TypographyToken>): void {
  const toLoad = new Set<string>()
  for (const t of Object.values(typography)) {
    if (!t.fontFamily) continue
    const name = primaryFontName(t.fontFamily)
    if (name && GOOGLE_FONTS.has(name)) toLoad.add(name)
  }

  for (const font of toLoad) {
    const id = `gf-${font.replace(/ /g, '-').toLowerCase()}`
    if (document.getElementById(id)) continue
    const slug = encodeURIComponent(font).replace(/%20/g, '+')
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${slug}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
    document.head.appendChild(link)
  }
}

export function getFontDisplayName(fontFamily: string): string {
  return primaryFontName(fontFamily) ?? fontFamily.split(',')[0]?.trim() ?? fontFamily
}
