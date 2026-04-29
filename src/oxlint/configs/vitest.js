import { defineConfig } from 'oxlint'

export default defineConfig({
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
