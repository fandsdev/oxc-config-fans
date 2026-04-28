import type { OxlintConfig } from 'oxlint'

export type OxcConfigFansDefineOxlintOptions = {
	unicorn?: boolean
	typescript?: boolean
	vue?: boolean | { a11y?: boolean }
	perfectionist?: boolean
	e18e?: boolean
	opinionated?: boolean
	categories?: NonNullable<OxlintConfig['categories']>
	options?: NonNullable<OxlintConfig['options']>
	ignorePatterns?: string[]
	extends?: OxlintConfig[]
}

export function defineConfig(
	options?: OxcConfigFansDefineOxlintOptions,
): OxlintConfig
