# Design tokens

See
[Pajamas](https://design.khulnasoft.com/product-foundations/design-tokens) for an overview on design
tokens.

## Syncing tokens to Figma

`yarn sync-tokens` performs a one-way sync of design tokens authored in
[Design Token Format Module](https://design-tokens.github.io/community-group/format/) JSON files to
Figma Variables via the [Figma REST API](https://developers.figma.com/docs/rest-api/variables/).

This should be run from the `main` **Git branch** whenever non-deprecated tokens are updated in code.

**note:** deprecated design tokens are not synced with Figma. When you deprecate a token that already
exists as a variable, the sync leaves it untouched, so move it to the ⚠️ deprecated group in Figma by
hand before requesting review.

### Requirements

1. Figma API token added to `.figma.env` as `FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN`
   with permissions for:
   1. `file_content:read`
   1. `file_variables:read`
   1. `file_variables:write`
1. Figma file with 2 [Collections](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes#h_01H9V3QSVH2T1EYNXP7RNXZ8MV)
   1. "Constants"
   2. "Mode" with "default" and "dark" modes

See also [`packages/khulnasoft-ui/.figma.env.example`](../../.figma.env.example)
for figma env setup help.

### Usage

1. Ensure you are on the `main` **Git branch** locally.
1. Create a **Figma branch** in the
   [Design Tokens Figma File](https://www.figma.com/design/tiAetVi1j5MGP8WA5FswcD/Design-tokens?node-id=0-1&p=f&t=IiRLO8BFTbDEJr12-0)
   — this is where variable changes will be previewed before review.
1. Add the **Figma branch ID** from the share URL `https://www.figma.com/design/{FILE_ID}/branch/{BRANCH_ID}`
   to `FIGMA_DESIGN_TOKEN_FILE_ID` in `.figma.env`
1. From the `packages/khulnasoft-ui` directory run `yarn sync-tokens`
1. Tag a Design System team member in Figma to review Figma Variable changes.
   A member of the Design System team publishes the library updates after the Figma branch is merged.
