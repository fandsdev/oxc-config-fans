import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const plugin = require('eslint-plugin-react-hooks')
const recommended: Record<string, unknown> = plugin.configs.recommended.rules

// Classic hooks rules — supported natively by oxlint as react/rules-of-hooks and react/exhaustive-deps
const nativeInOxlint = new Set([
	'react-hooks/rules-of-hooks',
	'react-hooks/exhaustive-deps',
])
const compilerRules = Object.keys(recommended).filter(
	k => !nativeInOxlint.has(k),
)

const res = await fetch(
	'https://raw.githubusercontent.com/oxc-project/oxc/main/tasks/lint_rules/src/unsupported-rules.json',
)
const { unsupportedRules } = await res.json()
const oxlintUnsupported = new Set(
	Object.keys(unsupportedRules).map(k => k.replace('react/', 'react-hooks/')),
)

for (const rule of compilerRules) {
	const status = oxlintUnsupported.has(rule) ? 'unsupported' : 'UNKNOWN'
	console.log(status, rule, recommended[rule])
}
