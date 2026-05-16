import type { CSSProperties } from 'react'
import type { ComponentDef } from '../../../lib/types'
import { C, R, F, resolved, resolvedPadding } from './helpers'
import { SubLabel } from './GalleryAtoms'

interface Props {
  dark?: boolean
  cardComp: ComponentDef | undefined
  primaryBtnStyle: CSSProperties
  showPricing?: boolean
}

export function CardSection({ dark, cardComp, primaryBtnStyle, showPricing }: Props) {
  const cardText   = resolved(cardComp?.textColor, C.ink)
  const cardRadius = resolved(cardComp?.rounded, R.card)
  const cardRadiusPx = parseFloat(cardRadius)
  const imageRadius = !isNaN(cardRadiusPx)
    ? (cardRadiusPx <= 4 ? '0px' : `${cardRadiusPx - 4}px`)
    : `calc(${cardRadius} - 4px)`

  const cardStyle: CSSProperties = {
    backgroundColor: resolved(cardComp?.backgroundColor, C.canvas),
    color: cardText,
    borderRadius: cardRadius,
    padding: resolvedPadding(cardComp, 'var(--card-pad, 20px)'),
    border: `1px solid ${C.hairline}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const smallBtn: CSSProperties = { ...primaryBtnStyle, fontSize: '11px', padding: '7px 10px', height: undefined }

  return (
    <>
      <SubLabel dark={dark}>Cards</SubLabel>
      <div className="flex flex-wrap gap-4">
        <div style={{ ...cardStyle, maxWidth: '200px', flex: '1 1 160px' }}>
          <div style={{ height: '80px', borderRadius: imageRadius, background: C.cloud, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: '14px', color: cardText, marginBottom: '4px' }}>Product Name</div>
          <div style={{ fontFamily: F.base, fontSize: '11px', color: C.charcoal, lineHeight: 1.4, marginBottom: '10px' }}>Model · Spec row · Details</div>
          <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: '18px', color: cardText, marginBottom: '10px' }}>$299</div>
          <button style={{ ...smallBtn, width: '100%' }}>Buy now</button>
        </div>
        <div style={{ ...cardStyle, maxWidth: '200px', flex: '1 1 160px' }}>
          <div style={{ height: '80px', borderRadius: imageRadius, background: C.cloud, marginBottom: '12px' }} />
          <div style={{ fontFamily: F.base, fontSize: '10px', color: C.charcoal, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>May 2025</div>
          <div style={{ fontFamily: F.base, fontWeight: 500, fontSize: '13px', color: cardText, lineHeight: 1.4, marginBottom: '8px' }}>Article headline worth reading</div>
          <span style={{ fontFamily: F.base, fontSize: '12px', color: C.primary, cursor: 'pointer', textDecoration: 'underline' }}>Read more →</span>
        </div>
      </div>

      {showPricing && (
        <>
          <SubLabel dark={dark}>Pricing Tiers</SubLabel>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Essentials',   price: '$9',  unit: '/mo', desc: '100 pages/mo', featured: false },
              { name: 'Professional', price: '$29', unit: '/mo', desc: '500 pages/mo', featured: true  },
              { name: 'Enterprise',   price: '$99', unit: '/mo', desc: 'Unlimited',    featured: false },
            ].map(({ name, price, unit, desc, featured }) => (
              <div
                key={name}
                style={{
                  backgroundColor: C.canvas,
                  borderRadius: R.card,
                  padding: 'var(--card-pad, 18px)',
                  border: featured ? `2px solid ${C.primary}` : `1px solid ${C.hairline}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  flex: '1 1 110px',
                  minWidth: '110px',
                }}
              >
                <div style={{ fontFamily: F.base, fontSize: '11px', fontWeight: 600, color: featured ? C.primary : C.ink, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</div>
                <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: '24px', color: C.ink, lineHeight: 1 }}>
                  {price}<span style={{ fontSize: '12px', fontWeight: 400, color: C.charcoal }}>{unit}</span>
                </div>
                <div style={{ fontFamily: F.base, fontSize: '10px', color: C.charcoal, margin: '4px 0 12px' }}>{desc}</div>
                <button style={{ ...primaryBtnStyle, width: '100%', fontSize: '10px', padding: '7px 6px', height: undefined }}>
                  {featured ? 'Get Started' : 'Choose'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
