import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['unicorn'],
	rules: {
		'unicorn/filename-case': 'error',
		'unicorn/no-array-for-each': 'error',
		'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
	},
	overrides: [
		{
			files: ['**/*.vue', '**/*.astro'],
			rules: {
				'unicorn/filename-case': ['error', { case: 'pascalCase' }],
			},
		},
		{
			files: ['**/pages/**/*.astro'],
			rules: {
				'unicorn/filename-case': ['error', { case: 'camelCase' }],
			},
		},
		{
			files: ['**/*.stories.{js,ts}'],
			rules: {
				'unicorn/filename-case': ['error', { case: 'pascalCase' }],
			},
		},
		{
			files: [
				'**/__tests__/**/*.{js,ts}',
				'**/*.spec.{js,ts}',
				'**/*.test.{js,ts}',
			],
			rules: {
				'unicorn/filename-case': 'off',
			},
		},
		{
			files: ['**/*.ts'],
			plugins: ['typescript'],
			rules: {
				'typescript/array-type': ['error', { default: 'array-simple' }],
				'typescript/consistent-type-definitions': 'off',
			},
		},
	],
})
