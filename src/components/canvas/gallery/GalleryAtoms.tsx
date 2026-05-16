export function SubLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h4 className={`text-[10px] font-semibold uppercase tracking-widest mb-3 mt-7 first:mt-0 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
      {children}
    </h4>
  )
}

export function StateLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] text-zinc-400 mt-1.5 block text-center">{children}</span>
}
