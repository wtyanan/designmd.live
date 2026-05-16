import type { ComponentDef } from '../../../lib/types'
import { C, R, F, resolved, resolvedPadding } from './helpers'
import { SubLabel, StateLabel } from './GalleryAtoms'

interface Props {
  dark?: boolean
  inputComp: ComponentDef | undefined
}

export function InputSection({ dark, inputComp }: Props) {
  const inputBase: React.CSSProperties = {
    backgroundColor: resolved(inputComp?.backgroundColor, C.canvas),
    color: resolved(inputComp?.textColor, C.ink),
    borderRadius: resolved(inputComp?.rounded, R.btn),
    padding: resolvedPadding(inputComp, 'var(--input-pad-y, 9px) var(--input-pad-x, 14px)'),
    border: `1px solid ${C.hairline}`,
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    fontFamily: F.base,
  }

  return (
    <>
      <SubLabel dark={dark}>Inputs</SubLabel>
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div>
          <input type="text" placeholder="Email address" style={inputBase} readOnly />
          <StateLabel>Default</StateLabel>
        </div>
        <div>
          <input type="text" placeholder="Email address" style={{ ...inputBase, border: `1.5px solid ${C.coral}` }} readOnly />
          <p className="text-[11px] mt-1" style={{ color: C.coral, fontFamily: F.base }}>Please enter a valid email</p>
          <StateLabel>Error</StateLabel>
        </div>
      </div>
    </>
  )
}
