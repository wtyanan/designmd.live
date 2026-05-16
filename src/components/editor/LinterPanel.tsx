import type { Finding } from '../../lib/types'

interface Props {
  findings: Finding[]
  error: string | null
}

const ICONS: Record<string, string> = { error: '✖', warning: '⚠', info: '●' }
const COLORS: Record<string, string> = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-sky-400',
}

export function LinterPanel({ findings, error }: Props) {
  if (error) {
    return (
      <div className="px-3 py-2 text-xs text-red-400 border-t border-zinc-800 bg-zinc-950 flex items-start gap-2">
        <span className="flex-shrink-0">✖</span>
        <span className="text-zinc-500 flex-shrink-0">parse-error</span>
        <span className="break-all">{error}</span>
      </div>
    )
  }

  if (findings.length === 0) return null

  const sorted = [
    ...findings.filter(f => f.severity === 'error'),
    ...findings.filter(f => f.severity === 'warning'),
    ...findings.filter(f => f.severity === 'info'),
  ]

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 text-xs max-h-32 overflow-y-auto">
      {sorted.map((f, i) => (
        <div key={i} className="flex items-start gap-2 px-3 py-1.5 hover:bg-zinc-900/60">
          <span className={`${COLORS[f.severity] ?? 'text-zinc-400'} flex-shrink-0 mt-px`}>
            {ICONS[f.severity] ?? '·'}
          </span>
          <span className="text-zinc-600 flex-shrink-0">{f.rule}</span>
          {f.path && <span className="text-zinc-700 flex-shrink-0 font-mono">{f.path}</span>}
          <span className="text-zinc-400">{f.message}</span>
        </div>
      ))}
    </div>
  )
}
