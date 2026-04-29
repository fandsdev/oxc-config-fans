import { defineConfig } from 'oxlint'

export default defineConfig({
	options: {
		typeAware: true,
		typeCheck: true,
	},
	overrides: [
		{
			files: ['**/*.ts', '**/*.vue'],
			plugins: ['typescript'],
			rules: {
				'init-declarations': 'off',
				'no-redeclare': 'off',
				'no-undef': 'off',
				'no-array-constructor': 'error',
				'no-unused-expressions': [
					'error',
					{
						allowTernary: true,
					},
				],
				'no-unused-vars': 'error',
				'no-empty-function': 'off',
				'no-shadow': 'off',
				'typescript/ban-ts-comment': 'error',
				'typescript/no-empty-object-type': 'error',
				'typescript/no-explicit-any': 'error',
				'typescript/no-namespace': 'error',
				'typescript/no-require-imports': 'error',
				'typescript/no-unnecessary-type-constraint': 'error',
				'typescript/no-unsafe-function-type': 'error',
				'typescript/adjacent-overload-signatures': 'error',
				'typescript/array-type': 'error',
				'typescript/ban-tslint-comment': 'error',
				'typescript/class-literal-property-style': 'error',
				'typescript/consistent-generic-constructors': 'error',
				'typescript/consistent-indexed-object-style': 'error',
				'typescript/consistent-type-assertions': 'error',
				'typescript/consistent-type-definitions': 'error',
				'typescript/no-inferrable-types': 'error',
				'typescript/prefer-for-of': 'error',
				'typescript/prefer-function-type': 'error',
				'typescript/no-misused-promises': [
					'error',
					{
						checksVoidReturn: false,
					},
				],
				'typescript/no-redundant-type-constituents': 'off',
			},
		},
		{
			files: [
				'**/__tests__/**/*.{js,ts}',
				'**/*.spec.{js,ts}',
				'**/*.test.{js,ts}',
			],
			plugins: ['typescript'],
			rules: {
				'typescript/no-explicit-any': 'off',
			},
		},
	],
	rules: {
		'typescript/no-extraneous-class': 'off',
		'typescript/no-meaningless-void-operator': 'off',
		'typescript/no-misused-spread': 'off',
		'typescript/no-unnecessary-parameter-property-assignment': 'off',
		'typescript/no-useless-default-assignment': 'off',
		'typescript/no-useless-empty-export': 'off',
		'typescript/require-array-sort-compare': 'off',
	},
})
