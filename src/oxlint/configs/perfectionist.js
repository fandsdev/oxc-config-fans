import { defineConfig } from 'oxlint'

export default defineConfig({
	jsPlugins: ['eslint-plugin-perfectionist'],
	env: {
		builtin: true,
	},
	rules: {
		'perfectionist/sort-exports': [
			'error',
			{
				order: 'asc',
				type: 'natural',
			},
		],
		'perfectionist/sort-named-exports': [
			'error',
			{
				order: 'asc',
				type: 'natural',
			},
		],
		'perfectionist/sort-named-imports': [
			'error',
			{
				order: 'asc',
				type: 'natural',
			},
		],
	},
})
