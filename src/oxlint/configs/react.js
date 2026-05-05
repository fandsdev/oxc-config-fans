import { defineConfig } from 'oxlint'

export default defineConfig({
	plugins: ['react', 'react-perf'],
	rules: {
		'react/react-in-jsx-scope': 'off',

		// From eslint-plugin-react recommended
		'react/display-name': 'error',
		'react/no-unescaped-entities': 'error',
		'react/require-render-return': 'error',

		// From eslint-plugin-react-hooks recommended
		'react/rules-of-hooks': 'error',
	},
})
