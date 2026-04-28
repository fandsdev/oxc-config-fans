import { defineConfig } from 'oxlint'

export default defineConfig({
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
})
