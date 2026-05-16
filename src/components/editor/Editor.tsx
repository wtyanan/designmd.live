import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'

interface Props {
  value: string
  onChange: (value: string) => void
}

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, Menlo, Monaco, "Cascadia Code", "Courier New", monospace',
    lineHeight: '1.65',
  },
  '.cm-content': { padding: '16px 0', minHeight: '100%' },
  '.cm-gutters': { borderRight: '1px solid #2a2a2a', backgroundColor: '#1a1b26' },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '40px', paddingRight: '8px' },
})

export function Editor({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          markdown({ codeLanguages: (info) => /^ya?ml$/i.test(info) ? yaml().language : null }),
          oneDark,
          editorTheme,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
        ],
      }),
      parent: containerRef.current,
    })

    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="h-full overflow-hidden" />
}
