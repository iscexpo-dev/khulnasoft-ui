## Duo UI Integration

KhulnaSoft UI automatically tests compatibility with Duo UI through a downstream pipeline job called `duo_job`.

### How it works

- Runs automatically on all merge requests
- Tests your KhulnaSoft UI changes against Duo UI components
- Must pass by default for MR to be merged

#### If the job fails

1. Check if your changes introduce breaking changes to components used by Duo UI
2. Consider if the failure is expected (e.g., intentional breaking change)
3. If the failure is acceptable, add the `duo-ui-allowed-to-fail` label to your MR

#### When to allow failure

- Intentional breaking changes that require Duo UI updates
- Temporary issues that don't affect the actual integration
- Emergency fixes where Duo UI compatibility can be addressed separately
