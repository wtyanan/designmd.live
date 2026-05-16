import { useState, useRef } from 'react'
import { Header } from './components/layout/Header'
import { SplitPane } from './components/layout/SplitPane'
import { Editor } from './components/editor/Editor'
import { LinterPanel } from './components/editor/LinterPanel'
import { Preview } from './components/preview/Preview'
import { parseDesignMd } from './lib/parser'
import { resolveTokens } from './lib/resolver'
import { buildCssString, injectStyles } from './lib/cssInjector'
import { loadFontsFromTypography } from './lib/fontLoader'
import { lintTokens } from './lib/linter'
import type { ParsedTokens, Finding } from './lib/types'
import { SAMPLE_DESIGN } from './sampleDesign'

function processText(text: string) {
  const result = parseDesignMd(text)
  if (result.error || !result.tokens) {
    return { resolved: null, findings: [] as Finding[], error: result.error, fromProse: false }
  }
  const resolved = resolveTokens(result.tokens)
  const findings = lintTokens(result.tokens, resolved, result.fromProse)
  return { resolved, findings, error: null, fromProse: !!result.fromProse }
}

export default function App() {
  const [rawText, setRawText] = useState('')
  const [resolvedTokens, setResolvedTokens] = useState<ParsedTokens | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fromProse, setFromProse] = useState<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)

  function handleLoadSample() {
    handleChange(SAMPLE_DESIGN)
  }

  function handleCopy() {
    if (!rawText) return
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleChange(value: string) {
    setRawText(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const state = processText(value)
      if (state.error) {
        setParseError(state.error)
        return
      }
      setParseError(null)
      if (state.resolved) {
        injectStyles(buildCssString(state.resolved))
        if (state.resolved.typography) loadFontsFromTypography(state.resolved.typography)
        setResolvedTokens(state.resolved)
        setFindings(state.findings)
        setFromProse(state.fromProse)
      } else {
        injectStyles('')
        setResolvedTokens(null)
        setFindings([])
      }
    }, 150)
  }

  const editorPanel = (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2 flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
        <span className="text-[11px] text-zinc-500 font-mono">DESIGN.md</span>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          disabled={!rawText}
          title="Copy to clipboard"
          className={`cursor-pointer flex items-center gap-1.5 text-[11px] font-medium rounded px-2.5 py-1 transition-all duration-150 font-mono disabled:opacity-30 disabled:cursor-default ${
            copied
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-500'
          }`}
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 8 6 12 14 4" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="9" height="11" rx="1.5" />
              <path d="M5 4H3.5A1.5 1.5 0 0 0 2 5.5v8A1.5 1.5 0 0 0 3.5 15h6A1.5 1.5 0 0 0 11 13.5V13" />
            </svg>
          )}
          {copied ? 'copied!' : 'copy'}
        </button>
        <button
          onClick={handleLoadSample}
          className="cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded px-2 py-0.5 transition-colors font-mono"
        >
          use sample file
        </button>
      </div>
      {fromProse && (
        <div className="px-3 py-2 border-b border-amber-900/40 bg-amber-950/30 flex items-start gap-2 flex-shrink-0">
          <span className="text-amber-500 flex-shrink-0 text-[11px] mt-px">⚠</span>
          <p className="text-[11px] text-amber-400/80 leading-relaxed">
            No YAML frontmatter detected. Add{' '}
            <code className="text-amber-300 font-mono">---</code> frontmatter at the top for
            precise token control and cross-references.
          </p>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <Editor value={rawText} onChange={handleChange} />
      </div>
      <LinterPanel findings={findings} error={parseError} />
    </div>
  )

  const previewPanel = (
    <Preview tokens={resolvedTokens} parseError={parseError} />
  )

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <Header />
      <div className="flex-1 overflow-hidden">
        <SplitPane left={editorPanel} right={previewPanel} />
      </div>
    </div>
  )
}
