import type { ParsedTokens } from '../../lib/types'
import { findComp, buildPrimaryBtn, detectSections } from './gallery/helpers'
import { NavigationSection, SectionBands, FooterSection } from './gallery/LayoutSection'
import { ButtonSection } from './gallery/ButtonSection'
import { InputSection } from './gallery/InputSection'
import { CardSection } from './gallery/CardSection'
import { ScalesSection } from './gallery/ScalesSection'

interface Props {
  tokens: ParsedTokens
  dark?: boolean
}

export function ComponentGallery({ tokens, dark }: Props) {
  const comps = tokens.components
  const sections = detectSections(tokens)

  const primaryComp   = findComp(comps, 'button-primary', 'btn-primary', 'primary-button')
  const secondaryComp = findComp(comps, 'button-outline', 'button-secondary-pill', 'button-secondary', 'outline')
  const inkComp       = findComp(comps, 'button-ink', 'button-dark', 'btn-ink')
  const cardComp      = findComp(comps, 'card-product', 'store-utility-card', 'card')
  const inputComp     = findComp(comps, 'text-input', 'search-input', 'input')
  const footerComp    = findComp(comps, 'footer')

  const primaryBtnStyle = buildPrimaryBtn(primaryComp)

  const hasColors  = !!(tokens.colors && Object.keys(tokens.colors).length > 0)
  const hasScales  = !!(tokens.rounded && Object.keys(tokens.rounded).length > 0) ||
                     !!(tokens.spacing && Object.keys(tokens.spacing).length > 0)
  const hasAnySect = Object.values(sections).some(Boolean) || hasColors || hasScales

  if (!hasAnySect) {
    return (
      <p className={`text-xs italic ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>
        No components defined. Add <code className="font-mono">**`button-primary`**</code> style blocks to populate this section.
      </p>
    )
  }

  return (
    <div>
      {sections.navigation && <NavigationSection dark={dark} primaryBtnStyle={primaryBtnStyle} />}
      {sections.buttons && <ButtonSection dark={dark} primaryComp={primaryComp} secondaryComp={secondaryComp} inkComp={inkComp} />}
      {sections.inputs && <InputSection dark={dark} inputComp={inputComp} />}
      {sections.cards && <CardSection dark={dark} cardComp={cardComp} primaryBtnStyle={primaryBtnStyle} showPricing={sections.pricing} />}
      {sections.footer && <FooterSection dark={dark} footerComp={footerComp} />}
      {hasColors && <SectionBands dark={dark} />}
      <ScalesSection dark={dark} tokens={tokens} />
    </div>
  )
}
