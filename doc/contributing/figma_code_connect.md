# Figma Code Connect

[Code Connect](https://www.figma.com/code-connect-docs/) links our `@khulnasoft/ui`
Vue components to the components in the Figma
[📙 Component library](https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library)
and the
[KhulnaSoft Product Icons](https://www.figma.com/design/h4YjjttHL5YI0mXZfQ4uuU/KhulnaSoft-Product-Icons)
file. When a component is connected, Figma Dev Mode shows a real Vue snippet
(`<gl-alert variant="info">…</gl-alert>`) instead of a list of CSS properties
and magic numbers.

## Why we do this

- **Help for humans.** A designer or engineer
  inspecting a component gets the correct, copy-pasteable Vue implementation
  with the right props, imports, and slot structure.
- **Guardrails for AI.** Prototyping with agents is increasingly common. A
  published Code Connect mapping keeps AI-generated scaffolding within the
  bounds of the real component API rather than inventing markup.

Tracking issue:
[Map Figma components to khulnasoft-ui components through code connect](https://github.com/khulnasoft/khulnasoft-ui/-/work_items/3407).

## .figma.ts files

Mapping files live **in the code package, next to the component they describe** —
not next to the Figma component — and go through normal `@khulnasoft/ui` code
review. When reviewing, the snippet's accuracy in Figma Dev Mode matters most,
but the mapping file still has to be maintainable since it needs to stay in sync
as the component's API changes.

There are two Code Connect formats in this repo: template and parser. Template is
the going-forward format. Parser files predate it and cannot branch on live
instance properties or resolve a nested icon's name, so migrate them to template
format when touched.

### Template files (`*.figma.ts`) — the going-forward format

A template file is a TypeScript file that imports `figma`, reads properties off
the selected instance (`figma.selectedInstance`, `getString`, `getEnum`,
`getBoolean`, `getInstanceSwap`, …), and builds the Dev Mode snippet explicitly
with `` figma.code`…` ``.

```ts
// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/…?node-id=XXXXX-XXXXX
import figma from 'figma';

const instance = figma.selectedInstance;
const label = instance.getString('Label');

export default {
  id: 'gl-component',
  imports: ["import { GlComponent } from '@khulnasoft/ui'"],
  example: figma.code`<gl-component>${label}</gl-component>`,
  metadata: { nestable: true },
};
```

Use template files for **all new work.** They are more capable than the legacy
format — they can branch on live instance properties, resolve a nested icon's
name, and read raw text layers — and they are what the icon library and the
most recent component mappings use.

### Parser-based files (`figma.connect(...)`) — legacy

The older files use the declarative parser API
(`import figma, { html } from '@figma/code-connect/html'` +
`figma.connect(url, { props, example })`). These still work and are still
published, but **do not model new work on them.** Only touch a parser-based file
when editing one that hasn't been migrated yet.

The `parser: "html"` setting in `figma.config.json` covers both formats — the
CLI treats a `.figma.ts` as a template when its leading comment contains
`// url=` (or `// component=` / `// source=`), and as a parser file otherwise.

### Batch files (`*.figma.batch.ts` + `*.figma.batch.json`) — many-of-a-kind

A batch file maps many nodes that share **one identical code shape** to a single
shared template, with per-node data supplied by a JSON file. The **icon library**
is the canonical (and currently only) case:
[`src/components/base/icon/`](../../src/components/base/icon/). Regular
components have distinct APIs and get individual template files, not batch
entries.

## Using AI to create a code connect mapping

Most of the existing mappings were authored with an AI agent driving the
figma-console MCP, guided by the `create-code-connect-template` skill. This is
the fastest way to produce a new mapping.

Prerequisites:

- Edit access on the Figma library file (publishing writes to the live `Vue`
  label).
- The [figma-console MCP](https://github.com/southleft/figma-console-mcp) set up
  through `npx` and connected to the open Figma file.
  - The Figma official MCP plugin did not work for this workflow when last tested.
- The
  [`create-code-connect-template`](../../../../.claude/skills/create-code-connect-template/SKILL.md)
  skill available to the agent — it carries the full, validated authoring
  reference.
- `packages/khulnasoft-ui/.figma.env` populated with a `FIGMA_ACCESS_TOKEN` for
  publishing.

Give the agent the component's Figma URL (Assets panel → right-click → **Copy
link to selection**, not a Dev Mode doc frame) and let the skill drive.

## Publishing

Run from `packages/khulnasoft-ui` (credentials load from `.figma.env`):

```shell
# Validate the file parses and binds to the node, without publishing:
yarn figma:connect publish --dry-run

# Publish to the live `Vue` label (`--force` overwrites UI-created mappings):
yarn figma:connect publish --force
```

Publishing writes the mapping to Figma; it does not commit the `.figma.ts`. The
source file is added to the repo through a normal `@khulnasoft/ui` MR.

Publishing requires edit access to the Figma library file. If you have edit access,
publish the mapping while the MR is in progress so the Dev Mode snippet can be
verified before the MR merges. For contributors without edit access, a member of the Design
System team publishes the mapping after the MR merges.

Code Connect mappings publish directly to the main library (the live `Vue`
label), rather than a Figma branch. Take care to leave it in a clean state.

No changeset is needed: Code Connect artifacts are excluded from the
published `@khulnasoft/ui` package.

## Failures are silent

A wrong property name, type, or accessor produces empty output or a literal
`undefined` in the snippet rather than an error. This is why verifying in Figma
Dev Mode is the acceptance check, not an optional step. The
[`create-code-connect-template`](../../../../.claude/skills/create-code-connect-template/SKILL.md)
skill documents the specific traps.

## Detailed reference

The full, validated, gotcha-by-gotcha reference for authoring these files lives
in the agent skills:

- **`create-code-connect-template`** —
  [`.claude/skills/create-code-connect-template/SKILL.md`](../../../../.claude/skills/create-code-connect-template/SKILL.md).
  The going-forward template-file workflow: every accessor, the container /
  repeated-children patterns, nested icon name resolution, style-only and
  inherited-colour axes, the icon batch, and publishing.
