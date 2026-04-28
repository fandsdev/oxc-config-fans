import { defineConfig } from 'oxlint'

export default defineConfig({
	jsPlugins: ['eslint-plugin-de-morgan'],
	env: {
		builtin: true,
	},
	rules: {
		'de-morgan/no-negated-conjunction': 'error',
		'de-morgan/no-negated-disjunction': 'error',
	},
})
