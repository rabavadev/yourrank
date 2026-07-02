# Branch Protection Rules (CICD-102)

This document describes the recommended branch protection settings for the
GroupsMix repository. These cannot be set via code — a maintainer must
configure them in GitHub → Settings → Branches → Branch protection rules.

## Rules for `main`

### 1. Require pull request reviews before merging

- **Required approving reviews:** 1
- **Dismiss stale reviews when new commits are pushed:** Yes
- **Require review from code owners:** Optional (no CODEOWNERS file yet)

### 2. Require status checks to pass before merging

Required checks:
- `deploy-leaderboard` (typecheck + build)
- `deploy-bot` (typecheck + build)
- `migrate` (if db/ paths changed)

- **Require branches to be up to date before merging:** Yes

### 3. Require conversation resolution before merging

Yes — ensures all review comments are addressed.

### 4. Do not allow force pushes

Restrict force push to `main` for everyone, including admins.

### 5. Do not allow deletions

Prevent accidental branch deletion of `main`.

### 6. Allow squash merging only (recommended)

Set the repository merge button settings to allow only squash merges.
This keeps the main branch history linear and clean.

## How to configure

1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Set the branch name pattern to `main`
3. Check the boxes listed above
4. Click **Create** / **Save changes**

> **Note:** Admins can still bypass protections if "Include administrators"
> is unchecked. For maximum safety, enable it for all rules.
