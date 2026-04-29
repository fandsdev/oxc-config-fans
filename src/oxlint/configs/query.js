import { defineConfig } from 'oxlint'

export default defineConfig({
	jsPlugins: ['@tanstack/eslint-plugin-query'],
	rules: {
		'@tanstack/query/exhaustive-deps': 'error',
		'@tanstack/query/infinite-query-property-order': 'error',
		'@tanstack/query/mutation-property-order': 'error',
		'@tanstack/query/no-rest-destructuring': 'warn',
		'@tanstack/query/no-unstable-deps': 'error',
		'@tanstack/query/no-void-query-fn': 'error',
		'@tanstack/query/stable-query-client': 'error',
	},
})
