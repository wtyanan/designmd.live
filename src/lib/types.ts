export interface TypographyToken {
  fontFamily?: string
  fontSize?: string | number
  fontWeight?: number | string
  lineHeight?: number | string
  letterSpacing?: string | number
  fontFeature?: string
  fontVariation?: string
}

export interface ComponentDef {
  backgroundColor?: string
  textColor?: string
  typography?: string
  rounded?: string
  padding?: string
  size?: string
  height?: string
  width?: string
  [key: string]: string | undefined
}

export interface Breakpoint {
  name: string
  value: string
  description?: string
}

export interface ColorGroup {
  name: string
  keys: string[]
}

export interface ParsedTokens {
  name?: string
  description?: string
  version?: string
  colors?: Record<string, string>
  colorGroups?: ColorGroup[]
  typography?: Record<string, TypographyToken>
  rounded?: Record<string, string>
  spacing?: Record<string, string>
  components?: Record<string, ComponentDef>
  breakpoints?: Breakpoint[]
}

export interface ParseResult {
  tokens: ParsedTokens | null
  prose: string
  error: string | null
  fromProse?: boolean
}

export type FindingSeverity = 'error' | 'warning' | 'info'

export interface Finding {
  severity: FindingSeverity
  path?: string
  message: string
  rule: string
}
