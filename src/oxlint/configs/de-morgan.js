import { defineConfig } from 'oxlint'

export default defineConfig({
	jsPlugins: ['eslint-plugin-de-morgan'],
	rules: {
		'de-morgan/no-negated-conjunction': 'error',
		'de-morgan/no-negated-disjunction': 'error',
	},
})
