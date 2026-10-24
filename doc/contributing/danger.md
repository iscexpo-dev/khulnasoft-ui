# How is Danger used in KhulnaSoft UI?

We use [Danger](https://danger.systems/) in the KhulnaSoft UI codebase to streamline the review workflow
and catch mistakes that reviewers might miss or not be aware of.

## Reviewer roulette

The reviewer roulette randomly picks reviewers based on the type of changes and on the
reviewer's availability. You _can_ but don't _have to_ follow Danger's recommendations when putting
an MR out for review. Use your best judgement as to who is best fit to review your changes, or
whether some reviews can be skipped altogether.

Danger also picks a Product Designer to review MRs that have a `~"component:*"` label. Whenever
possible, Danger picks the expert Product Designer for a given component. Otherwise, any UX
Foundations designer can be assigned.
