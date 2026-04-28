import { defineConfig } from 'oxlint'

export default defineConfig({
	env: {
		builtin: true,
	},
	overrides: [
		{
			files: [
				'**/__tests__/**/*.{js,ts}',
				'**/*.spec.{js,ts}',
				'**/*.test.{js,ts}',
			],
			plugins: ['vitest'],
		},
	],
})
