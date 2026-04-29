import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['promise'],
	rules: {
		'promise/always-return': 'off',
		'promise/catch-or-return': 'error',
		'promise/param-names': 'error',
		'promise/valid-params': 'error',
		'promise/no-multiple-resolved': 'error',
		'promise/no-return-wrap': 'error',
		'promise/no-nesting': 'warn',
		'promise/no-promise-in-callback': 'error',
		'promise/no-return-in-finally': 'warn',
		'promise/no-callback-in-promise': 'error',
		'promise/no-new-statics': 'error',
	},
})
