# OXC Config Fans

Opinionated shareable [oxlint][oxlint] and [oxfmt][oxfmt] configs by [FANS][fans].

## oxfmt

Install:

```bash
pnpm add -D oxc-config-fans oxfmt
```

Create `oxfmt.config.ts`:

```typescript
import { defineConfig } from 'oxc-config-fans/oxfmt'

export default defineConfig({
	sortImports: true, // default: true
	sortTailwindcss: false, // default: false
})
```

## oxlint

Install:

```bash
pnpm add -D oxc-config-fans oxlint @e18e/eslint-plugin
```

Create `oxlint.config.ts`:

```typescript
import { defineConfig } from 'oxc-config-fans/oxlint'

export default defineConfig({
	typescript: true,
	vue: true,
})
```

**Options:**

| Option          | Default | Description                                                                     |
| --------------- | ------- | ------------------------------------------------------------------------------- |
| `typescript`    | `false` | Enable TypeScript rules                                                         |
| `vue`           | `false` | Enable Vue rules (`{ a11y: true }`)                                             |
| `react`         | `false` | Enable React rules (`{ compiler: false }` to opt out of React Compiler rules)   |
| `nextjs`        | `false` | Enable Next.js rules (`{ compiler: false }` to opt out of React Compiler rules) |
| `query`         | `false` | Enable TanStack Query rules                                                     |
| `vitest`        | `false` | Enable Vitest rules                                                             |
| `e18e`          | `true`  | Enable e18e modernization rules                                                 |
| `perfectionist` | `false` | Enable import sorting rules                                                     |
| `opinionated`   | `false` | Enable opinionated style rules                                                  |

[fans]: https://fans.dev/
[oxlint]: https://oxc.rs/docs/guide/usage/linter.html
[oxfmt]: https://oxc.rs/docs/guide/usage/formatter.html
