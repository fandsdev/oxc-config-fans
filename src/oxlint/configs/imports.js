import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['import'],
	rules: {
		'import/no-unassigned-import': 'off',
		'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
		'import/first': 'error',
		'import/no-duplicates': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-named-default': 'error',
		'import/no-webpack-loader-syntax': 'error',
	},
})
