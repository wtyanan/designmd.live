import type { Breakpoint } from '../../lib/types'

interface Props {
  breakpoints?: Breakpoint[]
  dark?: boolean
}

function parsePx(value: string): number {
  // handles: "375px", "< 480px", "480–767px", "≥ 1280px" — take first number
  const m = value.match(/\d+/)
  return m ? parseInt(m[0]!, 10) : 0
}

function deviceRatio(px: number): number {
  // height / width visual ratio for each device class
  if (px <= 430)  return 2.16   // portrait phone
  if (px <= 600)  return 1.25   // phablet / small portrait
  if (px <= 900)  return 1.0    // tablet portrait (roughly square)
  if (px <= 1100) return 0.88   // laptop
  return 0.70                    // desktop / wide monitor
}

export function Breakpoints({ breakpoints, dark }: Props) {
  if (!breakpoints || breakpoints.length === 0) {
    return <p className="text-sm text-zinc-400 italic">No breakpoints defined</p>
  }

  const parsed = breakpoints
    .map(bp => ({ ...bp, px: parsePx(bp.value) }))
    .filter(bp => bp.px > 0)
    .sort((a, b) => a.px - b.px)

  if (parsed.length === 0) {
    return <p className="text-sm text-zinc-400 italic">No breakpoints defined</p>
  }

  const maxPx = Math.max(...parsed.map(b => b.px))
  const MAX_W = 230
  const MIN_W = 52

  const boxBg     = dark ? '#27272a' : '#f4f4f5'
  const boxBorder = dark ? '#3f3f46' : '#e4e4e7'
  const numColor  = dark ? '#a1a1aa' : '#71717a'
  const nameColor = dark ? '#71717a' : '#a1a1aa'

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {parsed.map(bp => {
        const w = Math.max(MIN_W, Math.round((bp.px / maxPx) * MAX_W))
        const h = Math.round(w * deviceRatio(bp.px))

        return (
          <div
            key={bp.name}
            title={bp.description ?? bp.value}
            style={{
              width: w,
              height: h,
              borderRadius: 10,
              backgroundColor: boxBg,
              border: `1px solid ${boxBorder}`,
              padding: '10px 12px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: numColor, fontWeight: 500, lineHeight: 1.3 }}>
              {bp.px}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: nameColor, lineHeight: 1.3 }}>
              {bp.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
