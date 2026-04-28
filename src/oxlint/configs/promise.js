import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['promise'],
	env: {
		builtin: true,
	},
	rules: {
		'promise/always-return': 'off',
		'promise/no-multiple-resolved': 'off',
		'promise/avoid-new': 'off',
		'promise/no-return-wrap': 'error',
		'promise/param-names': 'error',
		'promise/catch-or-return': 'error',
		'promise/no-nesting': 'warn',
		'promise/no-promise-in-callback': 'warn',
		'promise/no-callback-in-promise': 'warn',
		'promise/valid-params': 'warn',
	},
})
