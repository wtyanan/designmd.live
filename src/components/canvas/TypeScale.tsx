import type { TypographyToken } from '../../lib/types'
import { getFontDisplayName } from '../../lib/fontLoader'

interface Props {
  typography?: Record<string, TypographyToken>
  dark?: boolean
}

function parseSize(v: string | number | undefined): number {
  if (!v) return 0
  return parseFloat(String(v))
}

const PREVIEW_TEXT = 'The quick brown fox jumps over the lazy dog'

export function TypeScale({ typography, dark }: Props) {
  if (!typography || Object.keys(typography).length === 0) {
    return <p className="text-sm text-zinc-400 italic">No typography defined</p>
  }

  const sorted = Object.entries(typography).sort(
    (a, b) => parseSize(b[1].fontSize) - parseSize(a[1].fontSize)
  )

  // Group by font family (null key = no family specified)
  const familyMap = new Map<string, typeof sorted>()
  for (const entry of sorted) {
    const raw = entry[1].fontFamily
    const key = raw ? getFontDisplayName(raw) : '(system)'
    const group = familyMap.get(key) ?? []
    group.push(entry)
    familyMap.set(key, group)
  }

  const tagCls = dark
    ? 'inline-block text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded leading-none'
    : 'inline-block text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded leading-none'
  const dividerCls = dark ? 'divide-zinc-800' : 'divide-zinc-100'
  const textColor = dark ? '#f4f4f5' : '#27272a'
  return (
    <div className="space-y-8">
      {[...familyMap.entries()].map(([familyName, entries]) => (
        <div key={familyName}>
          <div className="flex items-center gap-3 mb-4">
            <p
              className="text-sm font-semibold"
              style={{
                fontFamily: entries[0]![1].fontFamily ?? 'inherit',
                color: textColor,
              }}
            >
              {familyName}
            </p>
            <div className={`flex-1 h-px ${dark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          </div>

          <div className={`flex flex-col divide-y ${dividerCls}`}>
            {entries.map(([name, t]) => (
              <div key={name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className={tagCls}>{name}</span>
                  {t.fontSize && <span className={tagCls}>{String(t.fontSize)}</span>}
                  {t.fontWeight !== undefined && <span className={tagCls}>{t.fontWeight}</span>}
                  {t.lineHeight !== undefined && <span className={tagCls}>lh {t.lineHeight}</span>}
                  {t.letterSpacing !== undefined && String(t.letterSpacing) !== '0' && (
                    <span className={tagCls}>ls {t.letterSpacing}</span>
                  )}
                </div>

                <p
                  className="whitespace-nowrap overflow-hidden"
                  style={{
                    fontFamily: t.fontFamily ?? 'inherit',
                    fontSize: t.fontSize ? String(t.fontSize) : 'inherit',
                    fontWeight: t.fontWeight ?? 'inherit',
                    lineHeight: t.lineHeight !== undefined ? String(t.lineHeight) : 1.2,
                    letterSpacing: t.letterSpacing !== undefined ? String(t.letterSpacing) : 'inherit',
                    color: textColor,
                  }}
                >
                  {PREVIEW_TEXT}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
