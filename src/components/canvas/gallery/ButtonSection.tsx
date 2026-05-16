import { useState } from 'react'
import type { ComponentDef } from '../../../lib/types'
import { C, R, F, resolved, resolvedPadding, buildPrimaryBtn } from './helpers'
import { SubLabel, StateLabel } from './GalleryAtoms'

interface Props {
  dark?: boolean
  primaryComp: ComponentDef | undefined
  secondaryComp: ComponentDef | undefined
  inkComp: ComponentDef | undefined
}

export function ButtonSection({ dark, primaryComp, secondaryComp, inkComp }: Props) {
  const [hovPrimary, setHovPrimary] = useState(false)
  const [hovSecondary, setHovSecondary] = useState(false)

  const primaryBtn = buildPrimaryBtn(primaryComp)
  const primaryRadius = primaryBtn.borderRadius as string

  const secondaryText   = resolved(secondaryComp?.textColor, C.primary)
  const secondaryRadius = resolved(secondaryComp?.rounded, primaryRadius)
  const secondaryPad    = resolvedPadding(secondaryComp, '10px 22px')

  const inkBtn = {
    ...primaryBtn,
    backgroundColor: resolved(inkComp?.backgroundColor, C.ink),
    color: resolved(inkComp?.textColor, C.onInk),
    borderRadius: resolved(inkComp?.rounded, primaryRadius),
  }
  const secondaryBtn = {
    ...primaryBtn,
    backgroundColor: 'transparent',
    color: secondaryText,
    borderRadius: secondaryRadius,
    padding: secondaryPad,
    border: `1.5px solid ${secondaryText}`,
  }

  return (
    <>
      <SubLabel dark={dark}>Buttons</SubLabel>
      <div className="flex flex-wrap gap-6 items-start">
        <div>
          <button style={{ ...primaryBtn, filter: hovPrimary ? 'brightness(1.12)' : undefined }} onMouseEnter={() => setHovPrimary(true)} onMouseLeave={() => setHovPrimary(false)}>Primary</button>
          <StateLabel>Default</StateLabel>
        </div>
        <div>
          <button style={{ ...primaryBtn, filter: 'brightness(1.12)' }}>Primary</button>
          <StateLabel>Hover</StateLabel>
        </div>
        <div>
          <button style={{ ...secondaryBtn, filter: hovSecondary ? 'brightness(0.88)' : undefined }} onMouseEnter={() => setHovSecondary(true)} onMouseLeave={() => setHovSecondary(false)}>Secondary</button>
          <StateLabel>Default</StateLabel>
        </div>
        <div>
          <button style={{ ...secondaryBtn, filter: 'brightness(0.88)' }}>Secondary</button>
          <StateLabel>Hover</StateLabel>
        </div>
        <div>
          <button style={inkBtn}>Ink</button>
          <StateLabel>Filled Dark</StateLabel>
        </div>
        <div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontFamily: F.base, fontSize: '13px', padding: '10px 4px', textDecoration: 'underline', textTransform: 'none', letterSpacing: 0 }}>
            Text link
          </button>
          <StateLabel>Link</StateLabel>
        </div>
      </div>

      <SubLabel dark={dark}>Badges & Tags</SubLabel>
      <div className="flex flex-wrap gap-2 items-center">
        <span style={{ background: C.primary, color: C.onPrimary, borderRadius: R.chip, padding: '4px 12px', fontSize: '11px', fontWeight: 600, fontFamily: F.base }}>New</span>
        <span style={{ background: C.ink, color: C.onInk, borderRadius: R.chip, padding: '4px 12px', fontSize: '11px', fontWeight: 500, fontFamily: F.base }}>Featured</span>
        <span style={{ background: 'transparent', color: C.ink, border: `1px solid ${C.ink}`, borderRadius: R.chip, padding: '3px 11px', fontSize: '11px', fontFamily: F.base }}>Outlined</span>
        <span style={{ background: 'transparent', color: C.primary, border: `1px solid ${C.primary}`, borderRadius: R.chip, padding: '3px 11px', fontSize: '11px', fontFamily: F.base }}>Category</span>
        <span style={{ background: C.coral, color: '#ffffff', borderRadius: R.sm, padding: '2px 8px', fontSize: '10px', fontWeight: 700, fontFamily: F.base, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sale</span>
        <span style={{ background: 'transparent', color: C.charcoal, border: `1px solid ${C.hairline}`, borderRadius: R.chip, padding: '3px 11px', fontSize: '11px', fontFamily: F.base, opacity: 0.5 }}>Disabled</span>
      </div>
    </>
  )
}
