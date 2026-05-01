import { defineConfig } from 'oxlint'

export default defineConfig({
	overrides: [
		{
			files: ['**/*.vue'],
			rules: {
				'unicorn/filename-case': [
					'error',
					{
						case: 'pascalCase',
					},
				],
			},
		},
		{
			files: ['**/*.stories.{js,ts}'],
			rules: {
				'unicorn/filename-case': [
					'error',
					{
						case: 'pascalCase',
					},
				],
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
			files: ['**/*.ts', '**/*.vue'],
			plugins: ['typescript'],
			rules: {
				'typescript/consistent-type-definitions': 'off',
				'typescript/array-type': [
					'error',
					{
						default: 'array-simple',
					},
				],
			},
		},
	],
	plugins: ['unicorn'],
	rules: {
		'unicorn/no-useless-undefined': [
			'error',
			{
				checkArguments: false,
			},
		],
		'unicorn/no-array-for-each': 'error',
	},
})
