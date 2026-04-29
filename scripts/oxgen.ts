#!/usr/bin/env node

import migrate from '@oxlint/migrate'
import { deMorgan } from 'eslint-config-fans/configs/de-morgan'
import { e18e } from 'eslint-config-fans/configs/e18e'
import { imports } from 'eslint-config-fans/configs/imports'
import { javascript } from 'eslint-config-fans/configs/javascript'
import { node } from 'eslint-config-fans/configs/node'
import { opinionated } from 'eslint-config-fans/configs/opinionated'
import { perfectionist } from 'eslint-config-fans/configs/perfectionist'
import { promise } from 'eslint-config-fans/configs/promise'
import { typescript } from 'eslint-config-fans/configs/typescript'
import { unicorn } from 'eslint-config-fans/configs/unicorn'
import { vue } from 'eslint-config-fans/configs/vue'
import { vueA11y } from 'eslint-config-fans/configs/vue-a11y'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

type RuleSkippedCategory =
	| 'nursery'
	| 'type-aware'
	| 'not-implemented'
	| 'unsupported'
	| 'js-plugins'
type SkippedGroup = Record<RuleSkippedCategory, string[]>

function createReporter() {
	const warnings: string[] = []
	const skipped: SkippedGroup = {
		'nursery': [],
		'type-aware': [],
		'not-implemented': [],
		'unsupported': [],
		'js-plugins': [],
	}
	return {
		addWarning: (msg: string) => warnings.push(msg),
		getWarnings: () => warnings,
		markSkipped: (rule: string, cat: RuleSkippedCategory) =>
			skipped[cat].push(rule),
		removeSkipped: (rule: string, cat: RuleSkippedCategory) => {
			const i = skipped[cat].indexOf(rule)
			if (i !== -1) skipped[cat].splice(i, 1)
		},
		getSkippedRulesByCategory: () => skipped,
	}
}

const allConfigs = [
	...javascript(),
	...imports(),
	...promise(),
	...node(),
	...deMorgan(),
	...unicorn(),
	...typescript({ extraFileExtensions: ['.vue'] }),
	...vue(),
	...vueA11y(),
	...e18e(),
	...perfectionist(),
	...opinionated({
		enableTypescript: true,
		enableUnicorn: true,
		extraFileExtensions: ['.vue'],
	}),
]

const reporter = createReporter()
await migrate(allConfigs, undefined, {
	reporter,
	typeAware: true,
	jsPlugins: true,
})

// not-implemented = migrate knows the rule but has no oxlint equivalent to output.
// These are effectively unsupported from the user's perspective.
const {
	'not-implemented': notImplemented,
	unsupported,
	nursery,
} = reporter.getSkippedRulesByCategory()
unsupported.push(...notImplemented)

const sorted = (arr: string[]) => [...new Set(arr)].toSorted()

const u = sorted(unsupported)
const n = sorted(nursery)

const markdown = `# Oxlint Unsupported Rules

Rules from eslint-config-fans with no oxlint equivalent.

## Summary

- **Unsupported:** ${u.length} rules
- **Nursery (in development):** ${n.length} rules

## Unsupported

${u.map(r => `- \`${r}\``).join('\n')}

## Nursery

${n.map(r => `- \`${r}\``).join('\n')}
`

writeFileSync(
	path.join(process.cwd(), 'UNSUPPORTED-RULES.md'),
	markdown,
	'utf8',
)
console.log(
	`✅ Generated UNSUPPORTED-RULES.md (${u.length} unsupported, ${n.length} nursery)`,
)
