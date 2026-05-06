import { defineConfig as defineOxfmtConfig } from 'oxfmt'

const DEFAULT_SORT_TAILWINDCSS_CONFIG = {
	functions: ['clsx'],
}

const DEFAULT_SORT_IMPORTS_CONFIG = {
	groups: [
		'side_effect',
		'side_effect_style',
		'style',
		['type-builtin', 'type-external'],
		['type-internal', 'type-parent', 'type-sibling', 'type-index'],
		['builtin', 'external', 'unknown'],
		['internal', 'parent', 'sibling', 'index'],
	],
	newlinesBetween: false,
	order: 'asc',
}

function resolveOptionalMergedConfig(defaultConfig, value) {
	if (value === true) {
		return defaultConfig
	}
	if (value === false) {
		return false
	}
	return { ...defaultConfig, ...value }
}

export function defineConfig(options = {}, overrides = {}) {
	const {
		ignorePatterns = [],
		sortTailwindcss = false,
		sortImports = true,
	} = options

	const sortTailwindcssConfig = resolveOptionalMergedConfig(
		DEFAULT_SORT_TAILWINDCSS_CONFIG,
		sortTailwindcss,
	)
	const sortImportsConfig = resolveOptionalMergedConfig(
		DEFAULT_SORT_IMPORTS_CONFIG,
		sortImports,
	)

	const config = {
		ignorePatterns: [...ignorePatterns],
		arrowParens: 'avoid',
		printWidth: 80,
		quoteProps: 'consistent',
		semi: false,
		singleQuote: true,
		sortTailwindcss: sortTailwindcssConfig,
		sortImports: sortImportsConfig,
		...overrides,
	}

	return defineOxfmtConfig(config)
}
