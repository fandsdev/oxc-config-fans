import { defineConfig as defineOxlintConfig } from 'oxlint'
import astroConfig from './configs/astro.js'
import baseConfig from './configs/base.js'
import deMorganConfig from './configs/de-morgan.js'
import e18eConfig from './configs/e18e.js'
import importsConfig from './configs/imports.js'
import javascriptConfig from './configs/javascript.js'
import nextjsConfig from './configs/nextjs.js'
import nodeConfig from './configs/node.js'
import opinionatedConfig from './configs/opinionated.js'
import perfectionistConfig from './configs/perfectionist.js'
import promiseConfig from './configs/promise.js'
import queryConfig from './configs/query.js'
import reactConfig from './configs/react.js'
import typescriptConfig from './configs/typescript.js'
import unicornConfig from './configs/unicorn.js'
import vitestConfig from './configs/vitest.js'
import vueA11yConfig from './configs/vue-a11y.js'
import vueConfig from './configs/vue.js'

export function defineConfig(options = {}) {
	const {
		ignorePatterns = [],
		categories,
		options: oxlintOptions,
		typescript = false,
		vue = false,
		react = false,
		nextjs = false,
		astro = false,
		query = false,
		vitest = false,
		e18e = true,
		perfectionist = false,
		opinionated = false,
		extends: extendsOption = [],
	} = options

	const extendsList = [
		baseConfig,
		javascriptConfig,
		importsConfig,
		promiseConfig,
		nodeConfig,
		deMorganConfig,
		unicornConfig,
	]

	if (typescript !== false) {
		extendsList.push(typescriptConfig)
	}

	if (vue !== false) {
		extendsList.push(vueConfig)
		if (typeof vue === 'object' && vue.a11y) {
			extendsList.push(vueA11yConfig)
		}
	}

	if (react !== false) {
		extendsList.push(reactConfig)
	}

	if (nextjs !== false) {
		extendsList.push(reactConfig, nextjsConfig)
	}

	if (astro !== false) {
		extendsList.push(astroConfig)
	}

	if (query !== false) {
		extendsList.push(queryConfig)
	}

	if (vitest !== false) {
		extendsList.push(vitestConfig)
	}

	if (perfectionist !== false) {
		extendsList.push(perfectionistConfig)
	}

	if (e18e !== false) {
		extendsList.push(e18eConfig)
	}

	if (opinionated !== false) {
		extendsList.push(opinionatedConfig)
	}

	for (const ext of extendsOption) {
		extendsList.push(ext)
	}

	const mergedOptions = { ...oxlintOptions }

	return defineOxlintConfig({
		extends: extendsList,
		...(Object.keys(mergedOptions).length > 0
			? { options: mergedOptions }
			: {}),
		...(categories && Object.keys(categories).length > 0 ? { categories } : {}),
		...(ignorePatterns.length > 0 ? { ignorePatterns } : {}),
	})
}
