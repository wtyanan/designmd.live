import { useState, useEffect, useRef } from 'react'
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

const _initial = processText(SAMPLE_DESIGN)

export default function App() {
  const [rawText, setRawText] = useState(SAMPLE_DESIGN)
  const [resolvedTokens, setResolvedTokens] = useState<ParsedTokens | null>(_initial.resolved)
  const [findings, setFindings] = useState<Finding[]>(_initial.findings)
  const [parseError, setParseError] = useState<string | null>(null)
  const [fromProse, setFromProse] = useState<boolean>(_initial.fromProse)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (_initial.resolved) {
      injectStyles(buildCssString(_initial.resolved))
      if (_initial.resolved.typography) loadFontsFromTypography(_initial.resolved.typography)
    }
  }, [])

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
