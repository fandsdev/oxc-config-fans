import type { OxlintConfig } from 'oxlint'

export interface DefineConfigOptions {
	/**
	 * Glob patterns for files and directories to ignore.
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/ignore-files.html#ignorepatterns
	 * @default []
	 */
	ignorePatterns?: string[]

	/**
	 * Enable or configure lint rule categories.
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/config.html#enable-groups-of-rules-with-categories
	 * @default { correctness: 'error', suspicious: 'error' }
	 */
	categories?: NonNullable<OxlintConfig['categories']>

	/**
	 * Global linter options (e.g. `typeAware`, `typeCheck`).
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/config-file-reference.html#options
	 * @default { typeAware: true, typeCheck: true }
	 */
	options?: NonNullable<OxlintConfig['options']>

	/**
	 * Enable TypeScript-specific lint rules.
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/plugins#typescript
	 * @default false
	 */
	typescript?: boolean

	/**
	 * Enable Vue-specific lint rules. Pass `{ a11y: true }` to also enable accessibility rules.
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/plugins#vue
	 * @default false
	 */
	vue?: boolean | { a11y?: boolean }

	/**
	 * Enable React-specific lint rules.
	 * React Compiler rules (enabled by default when react is active).
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/plugins#react
	 * @default false
	 */
	react?: boolean | { compiler?: boolean }

	/**
	 * Enable Next.js-specific lint rules.
	 * React Compiler rules (enabled by default when nextjs is active).
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/plugins#nextjs
	 * @default false
	 */
	nextjs?: boolean | { compiler?: boolean }

	/**
	 * Enable TanStack Query lint rules.
	 *
	 * @link https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query
	 * @default false
	 */
	query?: boolean

	/**
	 * Enable Vitest lint rules.
	 *
	 * @link https://oxc.rs/docs/guide/usage/linter/plugins#vitest
	 * @default false
	 */
	vitest?: boolean

	/**
	 * Enable e18e (ecosystem performance) lint rules.
	 *
	 * @link https://github.com/e18e/eslint-plugin
	 * @default true
	 */
	e18e?: boolean

	/**
	 * Enable Perfectionist import/member sorting rules.
	 *
	 * @link https://perfectionist.dev
	 * @default false
	 */
	perfectionist?: boolean

	/**
	 * Enable opinionated style rules.
	 *
	 * @default false
	 */
	opinionated?: boolean

	/**
	 * Merge additional raw `OxlintConfig` objects into the final config.
	 */
	extends?: OxlintConfig[]
}

/**
 * Define an oxlint configuration.
 *
 * @param options - Plugin toggles and config overrides.
 */
export function defineConfig(options?: DefineConfigOptions): OxlintConfig
