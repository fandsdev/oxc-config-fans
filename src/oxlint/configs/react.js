import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['react', 'react-perf'],
	rules: {
		'react/react-in-jsx-scope': 'off',
	},
})
