---
name: security-review
description: Security-focused review of a code change or module. Covers OWASP top-10 risks (injection, auth bypass, IDOR, SSRF, secrets in code, unsafe deserialization) plus language-specific footguns. Produce a prioritized list of findings with concrete fixes. Use when user says "security review", "is this safe?", "check for vulnerabilities", or before exposing new code to untrusted input.
argument-hint: "<file, directory, or PR>"
---

# /security-review — Security-Focused Code Review

A targeted pass on a code change for security vulnerabilities. Different from `/engineering:code-review` (general correctness) and `/engineering:careful-review` (fresh-eyes bug hunt): this skill has a specific threat lens.

## Process

**Phase 1 — Establish the trust boundary.**

Before reading any code, identify where untrusted input enters the system. Common entry points:

- HTTP request bodies, query params, headers, cookies
- Form uploads, file paths from the user
- WebSocket / gRPC messages
- Database fields that came from any of the above and weren't sanitized at insert time
- Third-party API responses
- LLM-generated content fed back into your system

Mark these as **untrusted**. Everything downstream that touches untrusted data is in scope.

**Phase 2 — Walk the OWASP checklist.**

For each category, look specifically:

- **Injection.** SQL via string concatenation, NoSQL via unsanitized queries, OS commands via `exec` / `system`, LDAP, XML, template injection. Look for any string interpolation into a query / command / template.
- **Auth bypass.** Endpoints without an auth check. Auth checks that compare strings non-constant-time. JWT verification with the wrong algorithm allowed. Session cookies without `HttpOnly` / `Secure` / `SameSite`.
- **Broken access control / IDOR.** Routes that take an entity ID as input and don't check the caller owns it. Lookups by primary key without a tenant filter.
- **SSRF.** Any code that fetches a URL constructed from user input. Outbound calls that can be redirected.
- **Unsafe deserialization.** `pickle.loads`, `yaml.load`, `eval`, JSON deserialization into typed objects that trigger code.
- **Secrets in code.** API keys, tokens, passwords in source, in `.env.example`, in test fixtures, in commit history.
- **XSS.** Reflected, stored, DOM-based. Look for any user-controlled string rendered without escaping. React's `dangerouslySetInnerHTML`, Vue's `v-html`, server-side template literals without `escape`.
- **CSRF.** State-changing endpoints without a CSRF token or `SameSite=Strict` cookies.
- **Sensitive data exposure.** PII in logs, secrets in error messages, stack traces returned to clients.
- **Crypto.** MD5/SHA-1 for passwords, ECB mode, hardcoded IVs, custom crypto, `Math.random()` for security tokens.

**Phase 3 — Language- / framework-specific footguns.**

A few high-yield patterns:

- **Node / TS:** `child_process.exec` vs `execFile`, prototype pollution via `Object.assign(...userInput)`, `vm.runInNewContext` with untrusted code.
- **Python:** `shell=True` in `subprocess`, `eval` / `exec`, `pickle`, `yaml.load` without `SafeLoader`.
- **Go:** SQL string concatenation, `html/template` vs `text/template`, missing context cancellation on outbound HTTP.
- **JavaScript / React:** `href={user_url}` (javascript: URLs), `target="_blank"` without `rel="noopener noreferrer"`.
- **Rust:** `unsafe` blocks, `unwrap` on user-derived input.

**Phase 4 — Produce a prioritized findings list.**

Group findings by severity. For each:

```markdown
### [P0 / P1 / P2] <one-line title>

**Where:** `path/to/file.ts:line`
**Category:** Injection / Auth / IDOR / …
**What's wrong:** explanation of the vulnerability in plain English
**How to exploit:** a concrete example of an attack input or sequence
**Fix:** the specific change to make
```

- **P0** — exploitable now by an external attacker, no auth required. Stop and fix before merge.
- **P1** — exploitable by an authenticated user, or requires a specific condition. Fix this sprint.
- **P2** — defense in depth, hardening, would not be exploitable without another bug first.

**Phase 5 — Offer to fix.**

For each P0 / P1, ask the user if they want the fix applied. Don't apply silently — security fixes are easy to get wrong, and the user should see the change.

## Pitfalls

- **Don't claim "no vulnerabilities found" lightly.** If you didn't check every entry point, say which ones you skipped.
- **Don't recommend custom crypto.** Always point at the platform's vetted primitive.
- **Don't escalate severity to feel useful.** A `TODO: parameterize this query` in code that's never called from the network is not P0.
- **Don't include payload fixes that break functionality.** A fix that escapes user input so aggressively that legitimate input breaks is its own bug.

## Pairs with

- `/engineering:code-review` — general correctness review on the same change.
- `/engineering:careful-review` — fresh-eyes bug hunt.
- `/engineering:codex-review` — second opinion from OpenAI Codex.
