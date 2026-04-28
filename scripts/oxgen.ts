#!/usr/bin/env node

import type { Linter } from 'eslint'
import type { OxlintConfig } from 'oxlint'
import migrate from '@oxlint/migrate'
import { deMorgan } from 'eslint-config-fans/src/configs/de-morgan'
import { e18e } from 'eslint-config-fans/src/configs/e18e'
import { imports } from 'eslint-config-fans/src/configs/imports'
import { javascript } from 'eslint-config-fans/src/configs/javascript'
import { node } from 'eslint-config-fans/src/configs/node'
import { perfectionist } from 'eslint-config-fans/src/configs/perfectionist'
import { promise } from 'eslint-config-fans/src/configs/promise'
import { typescript } from 'eslint-config-fans/src/configs/typescript'
import { unicorn } from 'eslint-config-fans/src/configs/unicorn'
import { vue } from 'eslint-config-fans/src/configs/vue'
import {
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { format } from 'oxfmt'
// @ts-ignore — tsx resolves .ts imports at runtime
import oxfmtConfig from '../oxfmt.config.ts'

type OxlintOverride = NonNullable<OxlintConfig['overrides']>[number]

// ─── rules.json ──────────────────────────────────────────────────────────────

type RuleMeta = {
	scope: string
	value: string
	category: string
}

const RULES_JSON_URL =
	'https://raw.githubusercontent.com/oxc-project/website/refs/heads/main/.vitepress/data/rules.json'

// Fetch the official oxlint rule registry. Each entry describes one rule:
// its plugin scope (e.g. "eslint", "unicorn"), its name, and which lint
// category it belongs to (correctness, suspicious, pedantic, style, …).
const rulesJson: RuleMeta[] = await fetch(RULES_JSON_URL).then(r => r.json())

// Build a fast lookup keyed by "<scope>/<value>" with hyphens normalized to
// underscores, matching the normalization applied to rule names at query time.
const ruleMetaByKey = new Map<string, RuleMeta>()
for (const rule of rulesJson) {
	ruleMetaByKey.set(`${rule.scope}/${rule.value}`.replaceAll('-', '_'), rule)
}

// These two categories are enabled globally in javascript.js. Any rule that
// belongs to them is already "on" and does not need to be listed explicitly.
const COVERED_CATEGORIES = new Set(['correctness', 'suspicious'])

// ─── helpers ─────────────────────────────────────────────────────────────────

// Collect rules that are explicitly 'off' in the ESLint configs, grouped by
// whether they are global (no files pattern) or file-scoped. Used to restore
// 'off' rules that @oxlint/migrate silently drops from its output.
//
// Rules prefixed with "@" (e.g. @typescript-eslint/*) are skipped — they are
// plugin-specific aliases that have no direct oxlint equivalent.
function collectOffRules(configs: Linter.Config[]): {
	global: Record<string, 'off'>
	overrides: Array<{ files: string[]; rules: Record<string, 'off'> }>
} {
	const global: Record<string, 'off'> = {}
	const overridesMap = new Map<string, Record<string, 'off'>>()

	for (const config of configs) {
		for (const [key, value] of Object.entries(config.rules ?? {})) {
			if (value !== 'off' && !(Array.isArray(value) && value[0] === 'off')) {
				continue
			}
			if (key.startsWith('@')) continue

			if (!config.files) {
				global[key] = 'off'
			} else {
				const files = (
					Array.isArray(config.files) ? config.files : [config.files]
				) as string[]
				const filesKey = [...files].sort().join('|')
				if (!overridesMap.has(filesKey)) overridesMap.set(filesKey, {})
				overridesMap.get(filesKey)![key] = 'off'
			}
		}
	}

	return {
		global,
		overrides: [...overridesMap.entries()].map(([filesKey, rules]) => ({
			files: filesKey.split('|'),
			rules,
		})),
	}
}

// Merge 'off' rules back into the oxlint config after migration.
// Global off rules are merged into config.rules (migrated rules take priority).
// File-scoped off rules are merged into the best-matching existing override —
// matched by checking if any oxlint override files overlaps the ESLint files.
function filterToValidRules(
	rules: Record<string, 'off'>,
): Record<string, 'off'> {
	return Object.fromEntries(
		Object.entries(rules).filter(([key]) => {
			const norm = (key.includes('/') ? key : `eslint/${key}`).replaceAll(
				'-',
				'_',
			)
			return ruleMetaByKey.has(norm)
		}),
	)
}

function restoreOffRules(
	config: OxlintConfig,
	offRules: ReturnType<typeof collectOffRules>,
): void {
	const globalRules = filterToValidRules(offRules.global)
	if (Object.keys(globalRules).length > 0) {
		config.rules = {
			...globalRules,
			...config.rules,
		} as OxlintConfig['rules']
	}

	for (const { files: eslintFiles, rules } of offRules.overrides) {
		const validRules = filterToValidRules(rules)
		if (Object.keys(validRules).length === 0) continue
		const override = config.overrides?.find(o => {
			const oFiles = (Array.isArray(o.files) ? o.files : [o.files]) as string[]
			return oFiles.some(of =>
				eslintFiles.some(
					ef => of && ef && of.includes('.ts') && ef.includes('.ts'),
				),
			)
		})
		if (override) {
			override.rules = {
				...validRules,
				...override.rules,
			} as OxlintOverride['rules']
		}
	}
}

// Collect every rule name mentioned across all flat-config entries.
// Used to determine which rules eslint-config-fans actually configures for a
// given theme, so we can later detect rules that are "new" in oxlint.
function collectRuleNames(configs: Linter.Config[]): Set<string> {
	const names = new Set<string>()
	for (const config of configs) {
		for (const key of Object.keys(config.rules ?? {})) {
			names.add(key)
		}
	}
	return names
}

// Narrow a flat-config array to only the rules relevant for one theme.
//
// Strategy:
// 1. Keep any rule whose name starts with one of the given prefixes
//    (e.g. "unicorn/" for the unicorn theme).
// 2. Also keep any rule explicitly set to "off", regardless of prefix.
//    This preserves intentional base-config overrides such as
//    `'init-declarations': 'off'` inside typescript.js, which disables
//    an eslint core rule for .ts files — losing it would re-enable the
//    rule unexpectedly after migration.
// Config entries that end up with no rules are dropped entirely.
function filterByPrefixes(
	configs: Linter.Config[],
	prefixes: string[],
): Linter.Config[] {
	return configs.flatMap(config => {
		if (!config.rules) {
			return []
		}
		const filtered = Object.fromEntries(
			Object.entries(config.rules).filter(
				([k, v]) =>
					prefixes.some(p => k.startsWith(p)) ||
					v === 'off' ||
					(Array.isArray(v) && v[0] === 'off'),
			),
		)
		if (Object.keys(filtered).length === 0) {
			return []
		}
		return [{ ...config, rules: filtered }]
	})
}

// Remove rules from a generated oxlint config that are already covered by the
// globally-enabled "correctness" and "suspicious" categories, keeping the
// output as small as possible.
//
// A rule is kept when ANY of the following is true:
// 1. It has custom options beyond just the severity (e.g. ["error", {...}]) —
//    the category enables the rule but cannot configure its options, so the
//    explicit entry is still required.
// 2. Its severity is not "error" (i.e. "off" or "warn") — explicit overrides
//    of the category's default must be preserved.
// 3. It does not appear in rules.json at all — unknown or JS-plugin rules that
//    oxlint cannot activate via categories.
// 4. It belongs to a category other than correctness / suspicious — it would
//    not be enabled by the global category setting and needs an explicit entry.
function pruneRules(rules: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(rules)) {
		// 1. Custom options — category alone cannot replicate them.
		if (Array.isArray(value) && value.length > 1) {
			result[key] = value
			continue
		}
		// 2. Non-error severity — explicit override, must be kept.
		if (typeof value === 'string' && value !== 'error') {
			result[key] = value
			continue
		}
		// Normalize "no-unused-vars" → "eslint/no_unused_vars" for lookup.
		const norm = (key.includes('/') ? key : `eslint/${key}`).replaceAll(
			'-',
			'_',
		)
		const meta = ruleMetaByKey.get(norm)
		// 3 & 4. Not in registry or not in a covered category — keep explicitly.
		if (!meta || !COVERED_CATEGORIES.has(meta.category)) {
			result[key] = value
		}
	}
	return result
}

// Find oxlint rules that belong to the covered categories for a given plugin
// scope but are absent from eslint-config-fans, and mark them "off".
//
// When we enable "correctness" and "suspicious" globally, oxlint activates
// every rule in those categories for every loaded plugin. Some of those rules
// did not exist in eslint-config-fans, so users migrating from ESLint would
// see brand-new errors. To prevent that, we explicitly disable them.
//
// Parameters:
//   scope       — oxlint plugin scope, e.g. "unicorn" or "eslint"
//   eslintPrefix — the ESLint rule prefix that maps to this scope,
//                  e.g. "unicorn/" or "" (empty = core eslint rules)
//   eslintRuleNames — all rule names present in the eslint-config-fans theme
function findNewRules(
	scope: string,
	eslintPrefix: string,
	eslintRuleNames: Set<string>,
): Record<string, 'off'> {
	const result: Record<string, 'off'> = {}
	for (const rule of rulesJson) {
		if (rule.scope !== scope) {
			continue
		}
		if (!COVERED_CATEGORIES.has(rule.category)) {
			continue
		}
		// Reconstruct the ESLint name used in eslint-config-fans
		// e.g. scope="unicorn", value="no-for-loop" → "unicorn/no-for-loop"
		const eslintName = eslintPrefix
			? `${eslintPrefix}${rule.value}`
			: rule.value
		if (!eslintRuleNames.has(eslintName)) {
			const oxlintName =
				scope === 'eslint' ? rule.value : `${scope}/${rule.value}`
			result[oxlintName] = 'off'
		}
	}
	return result
}

// Identify ESLint rules in a theme that have no oxlint equivalent.
// A rule is considered unsupported when it cannot be matched to any entry
// in rules.json after applying the theme's scope-to-prefix mapping.
//
// Used only for generating UNSUPPORTED-RULES.md — has no effect on the
// generated oxlint configs themselves.
function findUnsupportedRules(
	eslintRuleNames: Set<string>,
	scopes: Array<{ scope: string; eslintPrefix: string }>,
): string[] {
	const unsupported: string[] = []
	for (const ruleName of eslintRuleNames) {
		let found = false
		for (const { scope, eslintPrefix } of scopes) {
			if (eslintPrefix && ruleName.startsWith(eslintPrefix)) {
				// Plugin rule: strip the ESLint prefix, map to oxlint scope.
				const ruleValue = ruleName.slice(eslintPrefix.length)
				const norm = `${scope}/${ruleValue}`.replaceAll('-', '_')
				if (ruleMetaByKey.has(norm)) {
					found = true
					break
				}
			} else if (!eslintPrefix && !ruleName.includes('/')) {
				// Core eslint rule (no prefix): look up under "eslint/" scope.
				const norm = `eslint/${ruleName}`.replaceAll('-', '_')
				if (ruleMetaByKey.has(norm)) {
					found = true
					break
				}
			}
		}
		if (!found) {
			unsupported.push(ruleName)
		}
	}
	return unsupported.toSorted()
}

// ─── vue splitting ────────────────────────────────────────────────────────────

// The vue() eslint-config-fans theme mixes two separate plugin namespaces:
//   - "vue/*"                 → native oxlint "vue" plugin
//   - "vuejs-accessibility/*" → external JS plugin (not native to oxlint)
//
// oxlint requires them in separate config files with different plugin fields
// (plugins vs jsPlugins), so we split the migrate output into two configs:
//   vue.js      — native vue rules via plugins: ["vue"]
//   vue-a11y.js — accessibility rules via jsPlugins: ["eslint-plugin-vuejs-accessibility"]
function splitVue(config: OxlintConfig): [OxlintConfig, OxlintConfig] {
	const vueOverrides: OxlintOverride[] = []
	const a11yOverrides: OxlintOverride[] = []

	for (const override of config.overrides ?? []) {
		const a11yRules = Object.fromEntries(
			Object.entries(override.rules ?? {}).filter(([r]) =>
				r.startsWith('vuejs-accessibility/'),
			),
		)
		const vueRules = Object.fromEntries(
			Object.entries(override.rules ?? {}).filter(
				([r]) => !r.startsWith('vuejs-accessibility/'),
			),
		)

		if (override.plugins?.includes('vue') || Object.keys(vueRules).length > 0) {
			vueOverrides.push({
				files: override.files,
				plugins: (override.plugins as string[] | undefined)?.filter(
					p => p !== 'vuejs-accessibility',
				) as OxlintOverride['plugins'],
				rules: vueRules,
			})
		}

		if (Object.keys(a11yRules).length > 0) {
			a11yOverrides.push({
				files: override.files,
				jsPlugins: ['eslint-plugin-vuejs-accessibility'],
				rules: a11yRules,
			})
		}
	}

	return [{ overrides: vueOverrides }, { overrides: a11yOverrides }]
}

// ─── rule options patches ─────────────────────────────────────────────────────

// @oxlint/migrate sometimes drops rule options that oxlint does support.
// This map overrides the migrated value for known cases.
const RULE_OPTIONS_PATCHES: Record<string, unknown> = {
	// migrate() loses { functions: [] } — without it oxlint flags cloneDeep etc.,
	// but eslint-config-fans intentionally uses functions: [] to skip them.
	'unicorn/prefer-structured-clone': ['error', { functions: [] }],
}

function patchRuleOptions(
	rules: Record<string, unknown>,
): Record<string, unknown> {
	const result = { ...rules }
	for (const [key, value] of Object.entries(RULE_OPTIONS_PATCHES)) {
		if (key in result) {
			result[key] = value
		}
	}
	return result
}

// ─── js plugin name patch ─────────────────────────────────────────────────────

// @oxlint/migrate derives JS plugin package names from ESLint plugin aliases
// using the "eslint-plugin-{alias}" convention. Some packages use scoped names
// that break this pattern. This map corrects the mismatch after migration.
const JS_PLUGIN_NAME_MAP: Record<string, string> = {
	'eslint-plugin-e18e': '@e18e/eslint-plugin',
}

function patchJsPluginNames(config: OxlintConfig): OxlintConfig {
	const patched = Object.entries(JS_PLUGIN_NAME_MAP).reduce(
		(acc, [from, to]) => acc.replaceAll(`"${from}"`, `"${to}"`),
		JSON.stringify(config),
	)
	return JSON.parse(patched) as OxlintConfig
}

// ─── config writing ───────────────────────────────────────────────────────────

// Strip fields that are empty or that should not appear in sub-configs:
// - $schema is CWD-relative from the migration tool, wrong for installed files
// - empty arrays/objects add noise without affecting behavior
function cleanConfig(config: OxlintConfig): OxlintConfig {
	const cleaned = { ...config } as Record<string, unknown>
	delete cleaned.$schema
	if ((cleaned.plugins as unknown[])?.length === 0) {
		delete cleaned.plugins
	}
	if ((cleaned.jsPlugins as unknown[])?.length === 0) {
		delete cleaned.jsPlugins
	}
	if (cleaned.rules && Object.keys(cleaned.rules as object).length === 0) {
		delete cleaned.rules
	}
	if ((cleaned.overrides as unknown[])?.length === 0) {
		delete cleaned.overrides
	}
	return cleaned as OxlintConfig
}

async function writeConfig(name: string, config: OxlintConfig): Promise<void> {
	const configsDir = path.join(process.cwd(), 'src/oxlint/configs')
	if (!existsSync(configsDir)) {
		mkdirSync(configsDir, { recursive: true })
	}

	const filePath = path.join(configsDir, `${name}.js`)
	const raw = `
import { defineConfig } from 'oxlint'

export default defineConfig(${JSON.stringify(cleanConfig(config), null, '\t')})
`
	const { code } = await format(filePath, raw, oxfmtConfig)
	writeFileSync(filePath, code, 'utf8')
}

// ─── theme definitions ────────────────────────────────────────────────────────

interface ScopeMapping {
	// The oxlint plugin scope as it appears in rules.json (e.g. "typescript").
	scope: string
	// The ESLint rule prefix used in eslint-config-fans for the same plugin
	// (e.g. "@typescript-eslint/"). Empty string for core eslint rules.
	eslintPrefix: string
}

interface Theme {
	name: string
	getConfigs: () => Linter.Config[]
	// ESLint rule prefixes used to narrow the flat config before migration.
	// Empty = pass the entire config (javascript theme, no plugin prefix).
	pluginPrefixes: string[]
	// Scope mappings used for "new rule" detection and unsupported-rule reporting.
	// Empty = no native oxlint support (de-morgan, perfectionist, e18e, test).
	oxlintScopes: ScopeMapping[]
	// Pass typeAware: true to migrate() for themes that include type-aware rules
	// (e.g. @typescript-eslint/recommended-type-checked). Without it, migrate()
	// silently skips those rules into the "type-aware" skip category.
	typeAware?: boolean
	splitVue?: boolean
	patchJsPlugins?: boolean
	// Base ESLint rules to force 'off' in the first TypeScript-scoped override.
	// Used for rules that @typescript-eslint replaces with TS-aware versions —
	// oxlint has no such equivalents, so the base rule must be silenced.
	overrideOffRules?: string[]
}

const THEMES: Theme[] = [
	{
		name: 'javascript',
		getConfigs: () => javascript(),
		pluginPrefixes: [],
		oxlintScopes: [{ scope: 'eslint', eslintPrefix: '' }],
	},
	{
		name: 'imports',
		getConfigs: () => imports(),
		pluginPrefixes: ['import-x/'],
		oxlintScopes: [{ scope: 'import', eslintPrefix: 'import-x/' }],
	},
	{
		name: 'promise',
		getConfigs: () => promise(),
		pluginPrefixes: ['promise/'],
		oxlintScopes: [{ scope: 'promise', eslintPrefix: 'promise/' }],
	},
	{
		name: 'node',
		getConfigs: () => node(),
		pluginPrefixes: ['n/'],
		oxlintScopes: [{ scope: 'node', eslintPrefix: 'n/' }],
	},
	{
		name: 'de-morgan',
		getConfigs: () => deMorgan(),
		pluginPrefixes: ['de-morgan/'],
		oxlintScopes: [],
	},
	{
		name: 'unicorn',
		getConfigs: () => unicorn({ opinionated: false }),
		pluginPrefixes: ['unicorn/'],
		oxlintScopes: [{ scope: 'unicorn', eslintPrefix: 'unicorn/' }],
	},
	{
		name: 'typescript',
		getConfigs: () =>
			typescript({ opinionated: false, extraFileExtensions: ['.vue'] }),
		pluginPrefixes: ['@typescript-eslint/'],
		oxlintScopes: [
			{ scope: 'typescript', eslintPrefix: '@typescript-eslint/' },
		],
		typeAware: true,
		// @typescript-eslint replaces no-shadow with a TS-aware version that
		// ignores type/value shadowing. oxlint has no equivalent, so disable.
		overrideOffRules: ['no-shadow'],
	},
	{
		name: 'vue',
		getConfigs: () => vue(),
		pluginPrefixes: ['vue/', 'vuejs-accessibility/'],
		oxlintScopes: [{ scope: 'vue', eslintPrefix: 'vue/' }],
		splitVue: true,
	},
	{
		name: 'perfectionist',
		getConfigs: () => perfectionist(),
		pluginPrefixes: ['perfectionist/'],
		oxlintScopes: [],
	},
	{
		name: 'e18e',
		getConfigs: () => e18e(),
		pluginPrefixes: ['e18e/'],
		oxlintScopes: [],
		patchJsPlugins: true,
	},
	// TODO
	// {
	// 	name: 'test',
	// 	getConfigs: () => test(),
	// 	pluginPrefixes: ['vitest/'],
	// 	oxlintScopes: [],
	// },
]

// ─── main ─────────────────────────────────────────────────────────────────────

async function generateAll(): Promise<void> {
	const configsDir = path.join(process.cwd(), 'src/oxlint/configs')
	// Files that are manually maintained and must not be deleted on regeneration.
	const MANUAL_FILES = new Set(['opinionated.js'])

	if (existsSync(configsDir)) {
		for (const file of readdirSync(configsDir)) {
			if (!MANUAL_FILES.has(file)) {
				rmSync(path.join(configsDir, file))
			}
		}
	}

	const allUnsupported = new Set<string>()

	for (const theme of THEMES) {
		const eslintConfigs = theme.getConfigs()
		const eslintRuleNames = collectRuleNames(eslintConfigs)

		const configsToMigrate =
			theme.pluginPrefixes.length > 0
				? filterByPrefixes(eslintConfigs, theme.pluginPrefixes)
				: eslintConfigs

		const offRules = collectOffRules(configsToMigrate)

		let oxlintConfig: OxlintConfig =
			configsToMigrate.length > 0
				? await migrate(
						configsToMigrate as Parameters<typeof migrate>[0],
						undefined,
						{ jsPlugins: true, typeAware: theme.typeAware },
					)
				: {}

		if (theme.patchJsPlugins) {
			oxlintConfig = patchJsPluginNames(oxlintConfig)
		}

		// Strip migrate-generated categories — javascript.js sets them explicitly
		delete oxlintConfig.categories

		// Prune rules already covered by correctness/suspicious categories,
		// then restore known options lost by @oxlint/migrate.
		if (oxlintConfig.rules) {
			oxlintConfig.rules = patchRuleOptions(
				pruneRules(oxlintConfig.rules as Record<string, unknown>),
			) as OxlintConfig['rules']
		}
		for (const override of oxlintConfig.overrides ?? []) {
			if (override.rules) {
				override.rules = patchRuleOptions(
					pruneRules(override.rules as Record<string, unknown>),
				) as OxlintOverride['rules']
			}
		}

		// Restore 'off' rules dropped by @oxlint/migrate
		restoreOffRules(oxlintConfig, offRules)

		// Force 'off' in the TypeScript override for rules @typescript-eslint
		// replaces with TS-aware versions that oxlint doesn't have.
		if (theme.overrideOffRules?.length) {
			const tsOverride = oxlintConfig.overrides?.find(o => {
				const files = (Array.isArray(o.files) ? o.files : [o.files]) as string[]
				return files.some(f => f?.includes('.ts'))
			})
			if (tsOverride) {
				for (const rule of theme.overrideOffRules) {
					if (!(tsOverride.rules as Record<string, unknown>)?.[rule]) {
						tsOverride.rules = {
							...tsOverride.rules,
							[rule]: 'off',
						} as OxlintOverride['rules']
					}
				}
			}
		}

		// Add "off" for correctness/suspicious rules not in eslint-config-fans
		const newRules: Record<string, 'off'> = {}
		for (const scopeMapping of theme.oxlintScopes) {
			Object.assign(
				newRules,
				findNewRules(
					scopeMapping.scope,
					scopeMapping.eslintPrefix,
					eslintRuleNames,
				),
			)
		}
		if (Object.keys(newRules).length > 0) {
			oxlintConfig.rules = {
				...newRules,
				...oxlintConfig.rules,
			} as OxlintConfig['rules']
		}

		// Base config gets categories
		if (theme.name === 'javascript') {
			oxlintConfig.categories = { correctness: 'error', suspicious: 'error' }
		}

		// Track unsupported rules
		const unsupported = findUnsupportedRules(
			eslintRuleNames,
			theme.oxlintScopes,
		)
		for (const rule of unsupported) {
			allUnsupported.add(rule)
		}

		if (theme.splitVue) {
			const [vueConfig, a11yConfig] = splitVue(oxlintConfig)
			await writeConfig('vue', vueConfig)
			await writeConfig('vue-a11y', a11yConfig)
			console.warn('✅ Generated configs/vue.js and configs/vue-a11y.js')
		} else {
			await writeConfig(theme.name, oxlintConfig)
			console.warn(`✅ Generated configs/${theme.name}.js`)
		}
	}

	const sorted = [...allUnsupported].toSorted()
	const markdown = `# Oxlint Unsupported Rules

Rules from eslint-config-fans with no oxlint equivalent.

${sorted.map(r => `- \`${r}\``).join('\n')}
`
	writeFileSync(
		path.join(process.cwd(), 'UNSUPPORTED-RULES.md'),
		markdown,
		'utf8',
	)
	console.warn(`✅ Generated UNSUPPORTED-RULES.md (${sorted.length} rules)`)
}

await generateAll()
