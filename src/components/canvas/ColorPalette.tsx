import type { ColorGroup } from '../../lib/types'

interface Props {
  colors?: Record<string, string>
  colorGroups?: ColorGroup[]
  dark?: boolean
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '')
  if (m.length !== 6) return null
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)]
}

function luminance(r: number, g: number, b: number): number {
  const w = [0.2126, 0.7152, 0.0722]
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255
    return acc + (s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)) * w[i]!
  }, 0)
}

function contrast(hex: string, against: string): number | null {
  const c1 = hexToRgb(hex)
  const c2 = hexToRgb(against)
  if (!c1 || !c2) return null
  const [l1, l2] = [luminance(...c1), luminance(...c2)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function wcagGrade(ratio: number | null): string {
  if (ratio === null) return '—'
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA lg'
  return 'Fail'
}

function gradeColor(grade: string): string {
  if (grade === 'AAA' || grade === 'AA') return 'text-emerald-600'
  if (grade === 'AA lg') return 'text-yellow-600'
  if (grade === 'Fail') return 'text-red-500'
  return 'text-zinc-400'
}

function ColorSwatch({ name, hex, dark }: { name: string; hex: string; dark?: boolean }) {
  if (!hex.startsWith('#')) return null
  const wRatio = contrast(hex, '#ffffff')
  const bRatio = contrast(hex, '#000000')
  const wGrade = wcagGrade(wRatio)
  const bGrade = wcagGrade(bRatio)
  const nameCls = dark ? 'text-xs font-medium text-zinc-300 truncate' : 'text-xs font-medium text-zinc-700 truncate'

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 w-full rounded-lg border border-black/10 overflow-hidden"
        style={{ backgroundColor: hex }}
        title={`${name}: ${hex}`}
      >
      </div>
      <div>
        <div className={nameCls} title={name}>{name}</div>
        <div className="text-[11px] text-zinc-500 font-mono">{hex}</div>
        <div className="text-[10px] flex gap-2 mt-0.5">
          <span className={gradeColor(wGrade)} title={`On white: ${wRatio?.toFixed(1) ?? '?'}:1`}>⬜ {wGrade}</span>
          <span className={gradeColor(bGrade)} title={`On black: ${bRatio?.toFixed(1) ?? '?'}:1`}>⬛ {bGrade}</span>
        </div>
      </div>
    </div>
  )
}

function SwatchGrid({ keys, colors, dark }: { keys: string[]; colors: Record<string, string>; dark?: boolean }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
      {keys.map(name => {
        const hex = colors[name]
        if (!hex) return null
        return <ColorSwatch key={name} name={name} hex={hex} dark={dark} />
      })}
    </div>
  )
}

export function ColorPalette({ colors, colorGroups, dark }: Props) {
  if (!colors || Object.keys(colors).length === 0) {
    return <p className="text-sm text-zinc-400 italic">No colors defined</p>
  }

  const groupLabelCls = dark
    ? 'text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 mt-6 first:mt-0'
    : 'text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3 mt-6 first:mt-0'
  const dividerCls = dark ? 'bg-zinc-800' : 'bg-zinc-200'

  const legend = (
    <p className="text-[10px] text-zinc-400 mb-4">
      Each swatch shows WCAG contrast ratio against <strong>⬜ white</strong> and <strong>⬛ black</strong> backgrounds — <span className="text-emerald-600 font-medium">AA</span> (4.5:1, normal text) · <span className="text-emerald-600 font-medium">AAA</span> (7:1, enhanced) · <span className="text-yellow-600 font-medium">AA&nbsp;lg</span> (3:1, large text only)
    </p>
  )

  if (colorGroups && colorGroups.length > 0) {
    const groupedKeys = new Set(colorGroups.flatMap(g => g.keys))
    const ungrouped = Object.keys(colors).filter(k => !groupedKeys.has(k))
    const allGroups = ungrouped.length > 0
      ? [...colorGroups, { name: 'Additional', keys: ungrouped }]
      : colorGroups

    return (
      <div>
        {legend}
        {allGroups.map((group, i) => (
          <div key={group.name}>
            <div className="flex items-center gap-2.5 mb-3" style={{ marginTop: i === 0 ? 0 : '24px' }}>
              <h4 className={groupLabelCls} style={{ margin: 0 }}>{group.name}</h4>
              <div className={`flex-1 h-px ${dividerCls}`} />
            </div>
            <SwatchGrid keys={group.keys} colors={colors} dark={dark} />
          </div>
        ))}
      </div>
    )
  }

  // Flat fallback (YAML path or no sub-headings)
  return (
    <div>
      {legend}
      <SwatchGrid keys={Object.keys(colors)} colors={colors} dark={dark} />
    </div>
  )
}
