import { defineConfig } from 'oxlint'

export default defineConfig({
	extends: [
		{
			jsPlugins: [
				{
					name: 'react-compiler-hooks',
					specifier: 'eslint-plugin-react-hooks',
				},
			],
			rules: {
				'react-compiler-hooks/refs': 'error',
				'react-compiler-hooks/set-state-in-effect': 'error',
				'react-compiler-hooks/set-state-in-render': 'error',
				'react-compiler-hooks/static-components': 'error',
				'react-compiler-hooks/use-memo': 'error',
				'react-compiler-hooks/preserve-manual-memoization': 'error',
				'react-compiler-hooks/immutability': 'error',
				'react-compiler-hooks/globals': 'error',
				'react-compiler-hooks/error-boundaries': 'error',
				'react-compiler-hooks/purity': 'error',
				'react-compiler-hooks/unsupported-syntax': 'warn',
				'react-compiler-hooks/incompatible-library': 'warn',
				'react-compiler-hooks/config': 'error',
				'react-compiler-hooks/gating': 'error',
			},
		},
	],
})
