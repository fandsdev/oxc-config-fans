import { defineConfig } from './src/oxlint/index.js'

export default defineConfig({
	typescript: true,
	options: { typeAware: true },
	perfectionist: true,
	ignorePatterns: ['scripts/**'],
})
