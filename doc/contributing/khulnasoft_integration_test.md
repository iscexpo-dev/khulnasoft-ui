# Testing KhulnaSoft UI changes in KhulnaSoft

When introducing major, or potentially breaking changes in KhulnaSoft UI, you might want to verify that
they properly integrate in KhulnaSoft before they are released in a new `@khulnasoft/ui` version.

This can be done either by building the `@khulnasoft/ui` package locally, or by using the package that
is built every time a pipeline runs against your branch.

See [Updating KhulnaSoft UI Packages](../updating-khulnasoft-ui-packages.md) for information on how the
`@khulnasoft/ui` package is kept up to date in various other projects.

## Testing your changes in a local KhulnaSoft instance

During development, you can use [yalc](https://github.com/wclr/yalc) to link your local
`@khulnasoft/ui` package changes to the KhulnaSoft project.
This means you don't need to update `package.json`, and can easily test changes.

1. Install `yalc` with `yarn global add yalc`
1. Navigate to the `@khulnasoft/ui` directory and publish the package with `yalc publish`.
1. Navigate to the `khulnasoft` project and add published package with `yalc add @khulnasoft/ui`.
1. Run `yarn install --check-files` to pull package updates.

To propagate changes in the `@khulnasoft/ui` project automatically to all installations use
the following command `yalc publish --push`.

## Testing your changes using a remote development package

To help with this process, KhulnaSoft UI exposes a `ui:create_integration_merge_request` manual CI job
that will create (or update) an integration merge request, with the `@khulnasoft/ui` development build
installed.

Your development flow will look like this:

1. Push your design system changes to KhulnaSoft UI
1. Start a manual CI job to create a merge request in KhulnaSoft that uses your development package
1. Do any required migration in your KhulnaSoft branch, push your branch and open an MR
1. Get your KhulnaSoft UI _and_ KhulnaSoft MRs reviewed
1. Get your KhulnaSoft UI MR merged

### Make your KhulnaSoft UI changes locally

KhulnaSoft UI is a dynamic design system. The current `@khulnasoft/ui` release is often ahead of the
version being used in KhulnaSoft. Follow these steps to ensure your local KhulnaSoft only includes
your `@khulnasoft/ui` changes on top of what is currently used in production:

1. Review your local KhulnaSoft `package.json` file for the `@khulnasoft/ui` version
1. Pull the latest `main` branch in KhulnaSoft UI to ensure you have access to the current tagged release
1. Create a new feature branch by typing the following in your terminal:

   ```bash
   # If you are creating a new branch
   # NEW_BRANCH_NAME should include an issue number when possible

   git checkout -b NEW_BRANCH_NAME v{CURRENT_RELEASE_NUMBER}

   # If you created a branch previously

   git checkout YOUR_BRANCH_NAME
   git rebase v{CURRENT_RELEASE_NUMBER}
   ```

1. Make your changes and push your feature branch
1. Create a KhulnaSoft UI merge request

### Creating a remote development package

Your KhulnaSoft UI merge request will kick off a number of automatic CI tasks. When those
tasks have finished running, start the manual `ui:create_integration_merge_request` CI job. This
will create a merge request in the KhulnaSoft project using the package built by the `ui:build_package`
job.

![Create integration merge request CI job location](../images/create_integration_merge_request.png 'Create integration merge request CI job location')

After the `ui:create_integration_merge_request` CI job is complete, it will try to automatically
add the integration merge request URL to the **Integrations** section of your KhulnaSoft UI merge
request description. If that fails, check the job log for a link to the created KhulnaSoft merge
request. This merge request will help you test your KhulnaSoft UI changes and fix any test failures.

![Integration merge request link location](../images/create_integration_merge_request_job_log.png 'Integration merge request link location')

The KhulnaSoft integration merge request will do a few things for you:

1. It will use the `@khulnasoft/ui` package built in your KhulnaSoft UI merge request.
1. It will provide a feature branch to update tests, snapshots, etc.
1. KhulnaSoft's own pipelines will run automatically and notify you of any test failures.

**Do not merge this integration MR directly.** Use it only to draft pipeline fixes that can be
cherry-picked into the dependency update MR that Renovate will create after the new `@khulnasoft/ui`
package is published to the npm registry. Once your KhulnaSoft UI MR merges, close the integration MR.

### After your KhulnaSoft UI changes merge

1. Close your integration MR if you created one.
1. A new version of `@khulnasoft/ui` will be released when your changes are merged.
1. Renovate will open a merge request to update to the latest version of
   `@khulnasoft/ui`, and it will be assigned to you. If in doubt, check the
   [dependency dashboard](https://github.com/khulnasoft/khulnasoft/-/issues/365044)
   for any existing `@khulnasoft/ui` MRs.
1. Cherry-pick your fixes from your integration MR, if any, into the Renovate update MR.
1. Get the Renovate MR reviewed and merged.

### Making changes to KhulnaSoft on your feature branch

You may find some tests failing after the CI finishes running on your merge request. Not to worry!

1. Open your terminal and navigate to the `gdk/khulnasoft` repository on your local machine
1. Run the `gdk update` command
1. Check out the feature branch and rebase onto the latest `master`

   ```bash
   git fetch
   git checkout YOUR_BRANCH_NAME
   git rebase origin/master
   ```

1. Make changes as needed to get tests and snapshots passing
1. Push your changes to your feature branch up to the remote

   ```bash
   git push --set-upstream origin YOUR_BRANCH_NAME
   ```
