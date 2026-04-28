import { defineConfig } from './src/oxlint/index.js'

export default defineConfig({
	typescript: { typeAware: true },
	perfectionist: true,
})
