import { defineConfig } from 'oxlint'

export default defineConfig({
	categories: {
		correctness: 'error',
		suspicious: 'error',
	},
	env: {
		builtin: true,
		browser: true,
		es2024: true,
	},
})
