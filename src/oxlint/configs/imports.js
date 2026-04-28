import { defineConfig } from 'oxlint'

export default defineConfig({
	env: {
		builtin: true,
	},
	plugins: ['import'],
	rules: {
		'import/default': 'off',
		'import/namespace': 'off',
		'import/no-absolute-path': 'off',
		'import/no-empty-named-blocks': 'off',
		'import/no-named-as-default': 'off',
		'import/no-named-as-default-member': 'off',
		'import/no-unassigned-import': 'off',
		'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
		'import/first': 'error',
		'import/no-duplicates': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-named-default': 'error',
		'import/no-webpack-loader-syntax': 'error',
	},
})
