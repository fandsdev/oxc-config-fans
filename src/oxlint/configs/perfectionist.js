import { defineConfig } from 'oxlint'

export default defineConfig({
	env: {
		builtin: true,
	},
	jsPlugins: ['eslint-plugin-perfectionist'],
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
