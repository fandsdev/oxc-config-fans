import { defineConfig as defineOxlintConfig } from 'oxlint'
import astroConfig from './configs/astro.js'
import deMorganConfig from './configs/de-morgan.js'
import e18eConfig from './configs/e18e.js'
import importsConfig from './configs/imports.js'
import javascriptConfig from './configs/javascript.js'
import nodeConfig from './configs/node.js'
import opinionatedConfig from './configs/opinionated.js'
import perfectionistConfig from './configs/perfectionist.js'
import promiseConfig from './configs/promise.js'
import queryConfig from './configs/query.js'
import testConfig from './configs/test.js'
import typescriptConfig from './configs/typescript.js'
import unicornConfig from './configs/unicorn.js'
import vueA11yConfig from './configs/vue-a11y.js'
import vueConfig from './configs/vue.js'

export function defineConfig(options = {}) {
	const {
		ignorePatterns = [],
		categories,
		options: oxlintOptions,
		typescript = false,
		unicorn = true,
		vue = false,
		astro = false,
		query = false,
		test = false,
		e18e = true,
		perfectionist = false,
		opinionated = true,
		extends: extendsOption = [],
	} = options

	const extendsList = [
		javascriptConfig,
		importsConfig,
		promiseConfig,
		nodeConfig,
		deMorganConfig,
	]

	if (unicorn !== false) {
		extendsList.push(unicornConfig)
	}

	if (typescript !== false) {
		extendsList.push(typescriptConfig)
	}

	if (vue !== false) {
		extendsList.push(vueConfig)
		if (typeof vue === 'object' && vue.a11y) {
			extendsList.push(vueA11yConfig)
		}
	}

	if (astro !== false) {
		extendsList.push(astroConfig)
	}

	if (query !== false) {
		extendsList.push(queryConfig)
	}

	if (test !== false) {
		extendsList.push(testConfig)
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
