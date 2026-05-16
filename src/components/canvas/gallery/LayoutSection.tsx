import type { CSSProperties } from 'react'
import { C, R, F, resolved } from './helpers'
import type { ComponentDef } from '../../../lib/types'
import { SubLabel } from './GalleryAtoms'

interface Props {
  dark?: boolean
  primaryBtnStyle: CSSProperties
}

export function NavigationSection({ dark, primaryBtnStyle }: Props) {
  return (
    <>
      <SubLabel dark={dark}>Navigation</SubLabel>
      <div style={{ borderRadius: R.card, overflow: 'hidden', border: `1px solid ${C.hairline}` }}>
        <div style={{ backgroundColor: C.ink, color: C.onInk, height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontFamily: F.base, fontSize: '11px' }}>
          <span style={{ opacity: 0.7 }}>For Business · For Home</span>
          <div style={{ display: 'flex', gap: '16px', opacity: 0.85 }}>
            {['Sign in', 'Cart'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
          </div>
        </div>
        <div style={{ backgroundColor: C.canvas, borderBottom: `1px solid ${C.hairline}`, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.ink }}>Brand</div>
          <nav style={{ display: 'flex', gap: '20px' }}>
            {['Products', 'Solutions', 'Support'].map(l => (
              <span key={l} style={{ fontFamily: F.base, color: C.ink, fontSize: '13px', cursor: 'pointer' }}>{l}</span>
            ))}
          </nav>
          <button style={{ ...primaryBtnStyle, fontSize: '11px', padding: '7px 14px', height: undefined }}>Get Started</button>
        </div>
      </div>
    </>
  )
}

export function FooterSection({ dark, footerComp }: { dark?: boolean; footerComp?: ComponentDef }) {
  const bg   = resolved(footerComp?.backgroundColor, C.cloud)
  const text = resolved(footerComp?.textColor, C.charcoal)

  const cols = ['Products', 'Company', 'Support', 'Legal']
  const links = ['Overview', 'Details', 'Contact', 'FAQ']

  return (
    <>
      <SubLabel dark={dark}>Footer</SubLabel>
      <div style={{ backgroundColor: bg, borderRadius: R.card, border: `1px solid ${C.hairline}`, padding: '24px 24px 16px', fontFamily: F.base }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {cols.map(col => (
            <div key={col} style={{ minWidth: '80px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: C.ink, marginBottom: '8px' }}>{col}</div>
              {links.map(link => (
                <div key={link} style={{ fontSize: '11px', color: text, marginBottom: '5px', cursor: 'pointer', lineHeight: 1.6 }}>{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: '12px', fontSize: '10px', color: text, opacity: 0.6 }}>
          Copyright © 2025 Brand Inc. All rights reserved. · Privacy Policy · Terms of Use
        </div>
      </div>
    </>
  )
}

export function SectionBands({ dark }: { dark?: boolean }) {
  return (
    <>
      <SubLabel dark={dark}>Section Bands</SubLabel>
      <div style={{ borderRadius: R.card, overflow: 'hidden', border: `1px solid ${C.hairline}` }}>
        {[
          { bg: C.canvas, label: 'Canvas — white body band',                text: C.ink   },
          { bg: C.cloud,  label: 'Cloud — alternate section band',           text: C.ink   },
          { bg: C.ink,    label: 'Ink — dark slab (testimonial / footer)',   text: C.onInk },
        ].map(({ bg, label, text }) => (
          <div key={label} style={{ background: bg, padding: '14px 20px', color: text, fontFamily: F.base, fontSize: '12px', borderBottom: `1px solid ${C.hairline}` }}>
            <span style={{ fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  )
}
