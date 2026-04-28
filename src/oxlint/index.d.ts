import type { OxlintConfig } from 'oxlint'

export type OxcConfigFansDefineOxlintOptions = {
	ignorePatterns?: string[]
	categories?: NonNullable<OxlintConfig['categories']>
	options?: NonNullable<OxlintConfig['options']>
	typescript?: boolean
	unicorn?: boolean
	vue?: boolean | { a11y?: boolean }
	astro?: boolean
	query?: boolean
	test?: boolean
	e18e?: boolean
	perfectionist?: boolean
	opinionated?: boolean
	extends?: OxlintConfig[]
}

export function defineConfig(
	options?: OxcConfigFansDefineOxlintOptions,
): OxlintConfig
