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

export function defineConfig(options = {}, overrides = {}) {
	const {
		ignorePatterns = [],
		sortTailwindcss = false,
		sortImports = true,
	} = options

	const sortTailwindcssConfig =
		sortTailwindcss === true
			? DEFAULT_SORT_TAILWINDCSS_CONFIG
			: sortTailwindcss === false
				? false
				: { ...DEFAULT_SORT_TAILWINDCSS_CONFIG, ...sortTailwindcss }

	const sortImportsConfig =
		sortImports === true
			? DEFAULT_SORT_IMPORTS_CONFIG
			: sortImports === false
				? false
				: { ...DEFAULT_SORT_IMPORTS_CONFIG, ...sortImports }

	return defineOxfmtConfig({
		ignorePatterns: [...ignorePatterns],
		arrowParens: 'avoid',
		printWidth: 80,
		quoteProps: 'consistent',
		semi: false,
		singleQuote: true,
		sortTailwindcss: sortTailwindcssConfig,
		sortImports: sortImportsConfig,
		...overrides,
	})
}
