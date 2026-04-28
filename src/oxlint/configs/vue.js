import { defineConfig } from 'oxlint'

export default defineConfig({
	env: {
		builtin: true,
	},
	overrides: [
		{
			files: ['**/*.vue'],
			plugins: ['vue', 'typescript'],
			rules: {
				'vue/no-multiple-slot-args': 'warn',
				'vue/no-required-prop-with-default': 'warn',
				'vue/define-props-declaration': ['error', 'type-based'],
				'vue/no-import-compiler-macros': 'error',
				'typescript/prefer-function-type': 'off',
			},
		},
	],
	rules: {
		'vue/no-this-in-before-route-enter': 'off',
		'vue/require-default-export': 'off',
	},
})
