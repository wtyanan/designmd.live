import type { ParsedTokens } from '../../../lib/types'
import { C } from './helpers'
import { SubLabel } from './GalleryAtoms'

interface Props {
  dark?: boolean
  tokens: ParsedTokens
}

export function ScalesSection({ dark, tokens }: Props) {
  return (
    <>
      {tokens.rounded && Object.keys(tokens.rounded).length > 0 && (
        <>
          <SubLabel dark={dark}>Radius Scale</SubLabel>
          <div className="flex flex-wrap gap-5 items-end">
            {Object.entries(tokens.rounded)
              .filter(([, v]) => !v.startsWith('{'))
              .slice(0, 8)
              .map(([name, val]) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <div style={{
                    width: '44px', height: '44px', borderRadius: val,
                    backgroundColor: C.primary,
                    boxShadow: dark ? '0 0 0 1px rgba(255,255,255,0.18)' : '0 0 0 1px rgba(0,0,0,0.06)',
                  }} />
                  <span className="text-[10px] font-mono text-zinc-500">{name}</span>
                  <span className="text-[10px] text-zinc-400">{val === '9999px' ? 'pill' : val}</span>
                </div>
              ))}
          </div>
        </>
      )}

      {tokens.spacing && Object.keys(tokens.spacing).length > 0 && (
        <>
          <SubLabel dark={dark}>Spacing Scale</SubLabel>
          <div className="flex flex-col gap-2">
            {Object.entries(tokens.spacing)
              .filter(([, v]) => !v.startsWith('{'))
              .slice(0, 10)
              .map(([name, val]) => {
                const px = Math.min(parseFloat(val), 240)
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-zinc-500 w-14 flex-shrink-0 text-right">{name}</span>
                    <div style={{ width: `${px}px`, height: '16px', backgroundColor: C.primary, opacity: dark ? 0.65 : 0.35, borderRadius: '3px', flexShrink: 0, boxShadow: dark ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none' }} />
                    <span className="text-[11px] text-zinc-400">{val}</span>
                  </div>
                )
              })}
          </div>
        </>
      )}
    </>
  )
}
