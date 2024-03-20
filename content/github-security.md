---
title: "A few ways to hack stuff on GitHub"
slug: github-security
---

## `pull_request` vs `pull_request_target`

AKA "pwn request"

Insecure example: <https://securitylab.github.com/research/github-actions-preventing-pwn-requests/#:~:text=INSECURE>

<https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target>

```yaml
# Potentially insecure
on:
  pull_request_target:
    types: [assigned, opened, synchronize, reopened]
```

* * *

## Forks can attack self-hosted runners via modified `pull_request` workflows

<https://adnanthekhan.com/2023/12/20/one-supply-chain-attack-to-rule-them-all/>

Compromised <https://github.com/actions/runner-images> which builds GitHub.com hosted runner images

1. Submit a benign typo fix PR to a project to get past "Require approval for first-time contributors"

    * Typo fix: <https://github.com/actions/runner-images/pull/7931>

2. Send a second malicious PR that runs without manual approval

A PR can actually modify the workflow. Because the workflow users `pull_request` it still only gets read only tokens. But they can modify `runs_on` and select a self-hosted runner's tag. And they can attempt to break out of an insecure/non-ephemeral runner.

`pull_request_target` instead uses the workflow from the base branch instead of the PR's branch. But it's very risky as mentioned previously as it may read/write access to the forked repo.

**Fix:** use "Require approval for all outside collaborators"

**Alternate hard to use fix:** Use [worfkflow restrictions](https://github.blog/changelog/2022-03-21-github-actions-restrict-self-hosted-runner-groups-to-specific-workflows/)

![Require approval for all outside collaborators](/github-security/require-approval.png)

<https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security>

> We recommend that you only use self-hosted runners with private repositories. This is because forks of your public repository can potentially run dangerous code on your self-hosted runner machine by creating a pull request that executes the code in a workflow.

* * *

## Command injection through git branch name

* <https://securitylab.github.com/research/github-actions-untrusted-input/>

* Also, XSS via branch name! <https://github.com/bburky/xss>

  * <https://github.com/jupyter/nbviewer/issues/471>

* Reusable GitHub Actions _should_ be safe from command injection, but they can have vulnerabilities...

  * Vulnerable action: <https://adnanthekhan.com/2024/01/10/cve-2023-49291-and-more-a-potential-actions-nightmare/>

**Fix:** use an intermediate environment variable

<https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-an-intermediate-environment-variable>

```yaml
# INSECURE

- name: echo PR title insecurely
  run: |
    echo "${{ github.event.pull_request.title }}"

# Secured with an intermediate environment variable

- name: echo PR title securely
  env:
    TITLE: ${{ github.event.pull_request.title }}
  run: |
    echo "${TITLE}"
```

Also, this issue can show up with to Zarf variables or Helm values substituted into YAML. But the input is usually not considered _untrusted_, so no security risk. Just a risk of things breaking because they have quotes.

* * *

## Write access → steal repository secrets

DEMO: <https://github.com/praetorian-inc/gato/wiki/Usage>

Attacker can create unprotected branch and run actions, can delete logs of attack

```bash
gh auth login
export GH_TOKEN=$(gh auth token)
gato enumerate --target octocat

gato attack --target octocat/gato-demo-repo --secrets
```

**Fix:** use GitHub environment secrets

![Environment secrets](/github-security/environment-secrets.png)

Note: over privileged PATs (such as classic PATs) can be stolen. This gives the attacker access to _a user's identity_ on GitHub and gives them access to any repos accessible by the user, _including personal repos_.

**Recommendation:** Use a GitHub App with [`actions/create-github-app-token`](https://github.com/actions/create-github-app-token) to get a PAT-like token instead.

**Best fix:** Avoid secrets entirely, use `id-token` JWT. However... see next section for risks.

* * *

## Write access → `id-token` JWT → access AWS

```yaml
permissions:
  id-token: write
```

Any user with write access can create _unprotected_ branches and run workflows. They can create a JWT `id-token` in their workflow and attempt to access external systems like AWS.

**Fix:** AssumeRoleWithWebIdentity IAM policy should check JWT claims to ensure it's being run from a protected branch (check environment name or ref)

<https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#:~:text=AssumeRoleWithWebIdentity>

Claims: <https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#understanding-the-oidc-token>

Except... AWS only supports inspecting standard claims like `sub`, not custom claims.

**AWS Fix:** Use GitHub feature to customize the `sub` claim if needed:
<https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#customizing-the-subject-claims-for-an-organization-or-repository>

TODO: `sub` may contain `environment` by default?

* * *

## Write access → edit releases and packages

<https://github.com/orgs/community/discussions/51588>

Write access allows users to modify releases. Packages have the same issue, but can be restricted with manual hard to use config.

No easy fix: drop users below write access, require fork-and-PR

* * *

## GitHub Runner as C2

A fun trick that shows up in this attack:
<https://adnanthekhan.com/2023/12/20/one-supply-chain-attack-to-rule-them-all/>

Any firewall around a self hosted runner must allow internet access to GitHub.com. An attacker can register their own runner on their own org and use this as a C2 channel.

* * *

## Bonus: "Google OAuth is Broken (Sort Of)"

<https://trufflesecurity.com/blog/google-oauth-is-broken-sort-of>

You can register a personal non-gmail Google account on Workspace domains using a + email.

**Fix:** Use SAML with Google Workspace

**Related issue:** <https://www.descope.com/blog/post/noauth>

Similarly, beware of the security of the `email` JWT claim when integrating Keycloak. Many apps (such as GitLab) expect it to never change: a user claiming another's email address can lead to account takeover.

* * *

## Bonus: Alternate authenticators (e.g. PATs) work after disabling SSO

Some apps like GitLab support alternate authentication methods PATs and SSH keys. When you deactivate a user's access by only disabling their Keycloak account, this only blocks _browser_ login. They can still access GitLab APIs via PAT.

This is true for many apps other than GitLab if they have any kind of "API key" feature. Also, check if "API keys" are associated to a user or not, they may not even be deleted if they're not associated to a user.

**Fix:** deactivate user accounts inside each app, not just at Keycloak. SCIM can automate deprovisioning, but Keycloak doesn't support it natively.

**Fix for custom code:** consider using `offline` OIDC tokens which can query the IdP to check if the token is still valid.
