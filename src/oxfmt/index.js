import { defineConfig as defineOxfmtConfig } from 'oxfmt'

export function defineConfig(options = {}, overrides = {}) {
	const { sortImports = false, ignorePatterns = [] } = options

	return defineOxfmtConfig({
		ignorePatterns: ['*.md', '.pnpm-store/**', ...ignorePatterns],
		arrowParens: 'avoid',
		printWidth: 80,
		quoteProps: 'consistent',
		semi: false,
		singleQuote: true,
		sortTailwindcss: {
			functions: ['clsx'],
		},

		...(sortImports
			? {
					sortImports: {
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
					},
				}
			: false),

		...overrides,
	})
}
