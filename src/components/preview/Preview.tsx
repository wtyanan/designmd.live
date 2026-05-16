import { useState } from 'react'
import type { ParsedTokens } from '../../lib/types'
import { ColorPalette } from '../canvas/ColorPalette'
import { TypeScale } from '../canvas/TypeScale'
import { ComponentGallery } from '../canvas/ComponentGallery'
import { Breakpoints } from '../canvas/Breakpoints'

interface Props {
  tokens: ParsedTokens | null
  parseError: string | null
}

function Section({
  title, count, children, dark,
}: {
  title: string
  count?: number
  children: React.ReactNode
  dark?: boolean
}) {
  const dividerColor = dark ? 'bg-zinc-800' : 'bg-zinc-200'
  const textColor = dark ? 'text-zinc-400' : 'text-zinc-800'
  const countColor = dark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-500'
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-5">
        <h3 className={`text-[11px] font-bold uppercase tracking-[0.14em] ${textColor}`}>{title}</h3>
        {count !== undefined && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none ${countColor}`}>
            {count}
          </span>
        )}
        <div className={`flex-1 h-px ${dividerColor}`} />
      </div>
      {children}
    </section>
  )
}

export function Preview({ tokens, parseError }: Props) {
  const [dark, setDark] = useState(false)

  if (parseError) {
    return (
      <div className="flex flex-col h-full">
        <Toolbar dark={dark} onToggle={setDark} />
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="text-center max-w-sm">
            <div className="text-3xl mb-3 text-red-400">✖</div>
            <div className="text-sm font-medium text-zinc-700 mb-1">Parse Error</div>
            <div className="text-xs text-zinc-400 font-mono bg-zinc-50 rounded p-3 text-left break-all">
              {parseError}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tokens) {
    return (
      <div className="flex flex-col h-full">
        <Toolbar dark={dark} onToggle={setDark} />
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="text-center text-zinc-400">
            <div className="text-2xl mb-2">←</div>
            <div className="text-sm">Paste your DESIGN.md to preview</div>
          </div>
        </div>
      </div>
    )
  }

  const brandName = dark ? 'text-zinc-400' : 'text-zinc-400'
  const brandDesc = dark ? 'text-zinc-600' : 'text-zinc-400'

  return (
    <div className="flex flex-col h-full">
      <Toolbar dark={dark} onToggle={setDark} />
      <div className={`preview-root flex-1 overflow-y-auto ${dark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="px-6 py-6 max-w-3xl">
          {/* Brand identity — subtle label */}
          {(tokens.name || tokens.description) && (
            <div className="mb-7">
              {tokens.name && (
                <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${brandName}`}>
                  {tokens.name}
                  {tokens.version && (
                    <span className={`ml-2 font-normal ${dark ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      v{tokens.version}
                    </span>
                  )}
                </span>
              )}
              {tokens.description && (
                <p className={`mt-1 text-xs max-w-xl leading-relaxed ${brandDesc}`}>
                  {tokens.description}
                </p>
              )}
            </div>
          )}

          {tokens.colors && Object.keys(tokens.colors).length > 0 && (
            <Section title="Color Palette" count={Object.keys(tokens.colors).length} dark={dark}>
              <ColorPalette colors={tokens.colors} colorGroups={tokens.colorGroups} dark={dark} />
            </Section>
          )}

          {tokens.typography && Object.keys(tokens.typography).length > 0 && (
            <Section title="Typography Scale" count={Object.keys(tokens.typography).length} dark={dark}>
              <TypeScale typography={tokens.typography} dark={dark} />
            </Section>
          )}

          {tokens.breakpoints && tokens.breakpoints.length > 0 && (
            <Section title="Breakpoints" count={tokens.breakpoints.length} dark={dark}>
              <Breakpoints breakpoints={tokens.breakpoints} dark={dark} />
            </Section>
          )}

          <Section title="Components & Interaction" dark={dark}>
            <ComponentGallery tokens={tokens} dark={dark} />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Toolbar({ dark, onToggle }: { dark: boolean; onToggle: (v: boolean) => void }) {
  const barBg = dark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
  return (
    <div className={`flex items-center justify-end px-4 py-2 border-b flex-shrink-0 ${barBg}`}>
      <div className={`flex items-center gap-0.5 rounded-full p-0.5 ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
        <button
          onClick={() => onToggle(false)}
          className={`px-3 py-1 text-[11px] rounded-full transition-colors ${
            !dark ? 'bg-white shadow-sm text-zinc-800 font-medium' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`px-3 py-1 text-[11px] rounded-full transition-colors ${
            dark ? 'bg-zinc-700 shadow-sm text-zinc-100 font-medium' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Dark
        </button>
      </div>
    </div>
  )
}
