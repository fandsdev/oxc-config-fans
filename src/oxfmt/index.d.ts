import type { OxfmtConfig } from 'oxfmt'

interface DefineConfigOptions {
	ignorePatterns?: OxfmtConfig['ignorePatterns']
	sortImports?: boolean
}

export function defineConfig(
	options?: DefineConfigOptions,
	overrides?: Partial<OxfmtConfig>,
): OxfmtConfig
