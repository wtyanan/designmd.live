import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  left: React.ReactNode
  right: React.ReactNode
  defaultSplit?: number
}

export function SplitPane({ left, right, defaultSplit = 38 }: Props) {
  const [split, setSplit] = useState(defaultSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setSplit(Math.max(20, Math.min(80, pct)))
  }, [])

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      <div style={{ width: `${split}%` }} className="h-full overflow-hidden flex flex-col min-w-0">
        {left}
      </div>
      <div
        className="w-px cursor-col-resize bg-zinc-800 hover:bg-zinc-600 transition-colors flex-shrink-0 relative"
        style={{ width: '5px' }}
        onMouseDown={() => {
          dragging.current = true
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
        }}
      />
      <div className="h-full overflow-hidden flex flex-col flex-1 min-w-0">
        {right}
      </div>
    </div>
  )
}
