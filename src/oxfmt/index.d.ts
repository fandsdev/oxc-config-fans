import type { OxfmtConfig } from 'oxfmt'

// Re-export OxfmtConfig to support composite
export type { OxfmtConfig }

interface DefineConfigOptions {
	/**
	 * Glob patterns for files and directories to ignore.
	 *
	 * @link https://oxc.rs/docs/guide/usage/formatter/ignore-files.html#ignorepatterns
	 * @default []
	 */
	ignorePatterns?: OxfmtConfig['ignorePatterns']

	/**
	 * Sort Tailwind CSS classes like `prettier-plugin-tailwindcss`.
	 *
	 * - `true` — enable with this package’s defaults.
	 * - object — shallow-merged with those defaults.
	 * - `false` — disable.
	 *
	 * @link https://oxc.rs/docs/guide/usage/formatter/sorting.html#sort-tailwind-css-classes
	 * @default false
	 */
	sortTailwindcss?: OxfmtConfig['sortTailwindcss']

	/**
	 * Sort imports like `eslint-plugin-perfectionist` sort-imports.
	 *
	 * - `true` — enable with this package’s defaults.
	 * - object — shallow-merged with those defaults.
	 * - `false` — disable.
	 *
	 * @link https://oxc.rs/docs/guide/usage/formatter/sorting.html#sort-imports
	 * @default true
	 */
	sortImports?: OxfmtConfig['sortImports']
}

/**
 * Builds oxfmt config.
 *
 * @param options - {@link DefineConfigOptions}
 * @param overrides - {@link OxfmtConfig} fields to override any defaults
 */
export function defineConfig(
	options?: DefineConfigOptions,
	overrides?: Partial<OxfmtConfig>,
): OxfmtConfig
