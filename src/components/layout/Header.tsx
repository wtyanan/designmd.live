export function Header() {
  return (
    <header className="flex items-center justify-between px-4 h-11 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="text-zinc-100 font-semibold text-sm tracking-tight">designmd.live</span>
        <span className="hidden sm:block text-zinc-600 text-xs">DESIGN.md sandbox</span>
      </div>
      <nav className="flex items-center gap-4">
        <a
          href="https://github.com/google-labs-code/design.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          spec ↗
        </a>
        <a
          href="https://buymeacoffee.com/wtyanan"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <span aria-hidden>☕</span>
          <span>Support</span>
        </a>
      </nav>
    </header>
  )
}
