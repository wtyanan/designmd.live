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
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          spec ↗
        </a>
        <a
          href="https://github.com/wtyanan/designmd.live/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          feedback ↗
        </a>
        <a href="https://www.buymeacoffee.com/wtyanan" target="_blank" rel="noopener noreferrer">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me a Coffee"
            style={{ height: 28, width: 'auto' }}
          />
        </a>
      </nav>
    </header>
  )
}
