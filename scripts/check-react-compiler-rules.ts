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
const data: unknown = JSON.parse(await res.text())
if (
	typeof data !== 'object' ||
	data === null ||
	!('unsupportedRules' in data)
) {
	throw new Error('Unexpected response shape')
}
const { unsupportedRules } = data as { unsupportedRules: unknown }
if (typeof unsupportedRules !== 'object' || unsupportedRules === null) {
	throw new Error('Unexpected unsupportedRules shape')
}
const oxlintUnsupported = new Set(
	Object.keys(unsupportedRules).map(k => k.replace('react/', 'react-hooks/')),
)

for (const rule of compilerRules) {
	const status = oxlintUnsupported.has(rule) ? 'unsupported' : 'UNKNOWN'
	// oxlint-disable-next-line no-console
	console.log(status, rule, recommended[rule])
}
