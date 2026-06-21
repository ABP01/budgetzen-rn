Contributing Guide
Welcome, and thanks for contributing. This guide explains how we work together on code — the goal is consistency and quality without unnecessary friction.

Getting Started
Clone the repo and follow the setup instructions in README.md
Check open issues or the project board before starting new work
If you're tackling something significant, open an issue or mention it in Teams first — avoid duplicating effort

Branching
Use short, descriptive branch names with a prefix that signals intent:
Prefix
Use for
feat/
New features
fix/
Bug fixes
chore/
Maintenance, dependency updates, tooling
docs/
Documentation only
refactor/
Code restructuring without behavior change

Example: feat/user-auth-oauth, fix/login-redirect-loop
Branch off main (or develop if the project uses it). Keep branches focused — one concern per branch makes reviews faster and rollbacks cleaner.

Commits
Write commit messages in the imperative mood and keep the subject line under 72 characters.
Add rate limiting to the auth endpoint
Fix null pointer in user profile loader
Refactor payment service to use new SDK
If more context is needed, add a body after a blank line. Reference issues where relevant (Closes #42).
We loosely follow Conventional Commits — don't stress the format, but be descriptive.

Pull Requests
Before Opening a PR
[ ] Code works locally and passes tests
[ ] New functionality has test coverage
[ ] No leftover debug logs, commented-out code, or TODOs you don't intend to address
[ ] Self-reviewed your own diff
Writing a Good PR Description
You don't need an essay, but give reviewers enough context:
What does this change? One or two sentences.
Why? Link to an issue, a Slack thread, or a brief explanation.
Anything to watch out for? Edge cases, known tradeoffs, areas you're uncertain about.
Screenshots or recordings are helpful for UI changes.
PR Size
Prefer smaller PRs. A 200-line change is easier to review well than a 2000-line one. If a feature is big, break it into reviewable chunks.

Code Review
For Authors
Don't take feedback personally — reviewers are looking at the code, not judging you
Respond to all comments, even if just to say "done" or "disagree, here's why"
If you disagree with feedback, make the case — reviewers aren't always right
For Reviewers
Be specific and actionable. "This could be cleaner" isn't useful; "This could be extracted into a helper to reduce duplication" is
Distinguish blocking issues from suggestions. Use prefixes if it helps: nit:, question:, blocker:
Approve when it's good enough — perfect is the enemy of shipped
Turnaround
Aim to review open PRs within one business day. If you're blocked or swamped, say so.

Tests
Write tests for new features and bug fixes
Tests should be readable — a failing test should tell you what broke and why
Don't leave flaky tests unaddressed; they erode trust in the whole suite
Coverage isn't a target in itself — favor meaningful tests over padding numbers

Code Style
Follow the linter and formatter configs in the repo. If you think a rule should change, open a discussion rather than disabling it locally.
When in doubt: prefer clarity over cleverness. Code is read far more than it's written.

Documentation
Update docs when you change behavior. This includes:
Inline comments for non-obvious logic
README.md for setup or usage changes
API docs if you add or change endpoints
Changelogs if the project maintains one

Raising Issues
Found a bug? Have an idea? Open an issue. Include:
What you expected vs. what happened (for bugs)
Steps to reproduce or a minimal example
Relevant logs, screenshots, or error messages
Check if an issue already exists before opening a new one.

Questions
Not sure where to start? Ask in the teams channel or tag someone in a draft PR. There are no stupid questions — getting unstuck quickly is better for everyone than spinning in silence.

This guide should evolve as the team does. If something here slows you down or doesn't make sense, bring it up.

