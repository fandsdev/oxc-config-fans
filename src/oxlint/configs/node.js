import { defineConfig } from 'oxlint'

export default defineConfig({
	env: {
		node: true,
	},
	plugins: ['node'],
	rules: {
		'node/global-require': 'error',
		'node/handle-callback-err': ['error', '^(err|error)$'],
		'node/no-exports-assign': 'error',
		'node/no-new-require': 'error',
		'node/no-path-concat': 'error',
	},
})
