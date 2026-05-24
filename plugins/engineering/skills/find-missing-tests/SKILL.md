---
name: find-missing-tests
description: Survey a module, file, or PR for missing test coverage. Produce a specific, non-hallucinated list of test cases that should exist, with enough detail that another developer (or agent) can implement them. Optionally open GitHub issues for each gap. Use when user says "find missing tests", "what's not tested?", or wants a test backlog for a piece of code.
argument-hint: "<file, directory, or PR>"
---

# /find-missing-tests — Coverage Gap Survey

A disciplined sweep of code for missing test cases. You are acting as a senior reviewer: be specific, be honest, do not hallucinate. The output is a backlog another developer can pick up and execute.

## Process

**Phase 1 — Read the code.**

Read the target (file, module, or PR diff) end to end before listing anything. Understand:

- The public interface and what it promises.
- The branches inside each public function.
- Side effects: writes, network calls, state mutations.
- Error paths: thrown exceptions, returned errors, swallowed failures.
- Concurrency: anything async, anything that touches shared state.

If you can't tell what something does, say so. Don't invent a test for behavior you can't verify exists.

**Phase 2 — Enumerate the gaps.**

For each public function or behavior, list the test cases that should exist:

- **Happy path.** Does the obvious successful case have a test? It often doesn't.
- **Boundary conditions.** Empty input, single-element input, max-size input, zero, negative numbers, the wrap-around in pagination.
- **Error paths.** Each `throw` / `return Err` / rejected promise. If the code catches an error and re-throws, the catch deserves its own test.
- **State transitions.** If the code moves something through states (issue triage, order lifecycle, build pipeline), each transition is a test.
- **Concurrency.** Two callers racing, retry after partial failure, idempotency.
- **Integration seams.** If the code touches an external system (DB, API, FS), test the failure mode of that system (timeout, 500, malformed response).
- **Regression.** Any bug that's been fixed and doesn't yet have a test pinning the fix.

For each gap, write:

```markdown
### Missing: <one-line test name>

**File / function:** path/to/file.ts → `functionName`
**Why it matters:** what breaks in prod if this case isn't covered
**Test outline:**
- Arrange: …
- Act: …
- Assert: …
```

Be specific. "Test the error path" is useless. "Test that `updateContract` throws `ContractLocked` when status is `FINALIZED`" is useful.

**Phase 3 — Decide on output format.**

Two paths depending on the user's flow:

- **List in chat.** Useful when the user wants to triage before creating tickets.
- **GitHub issues.** One issue per missing test, using the body format above. Apply a label like `tests` or `testing-debt`. Pair with `/engineering:to-issues` if the user wants the issues opened in bulk.

Confirm the output format with the user before creating any issues.

## Pitfalls

- **Don't pad the list.** Five real gaps beat fifty plausible-sounding ones. A test backlog full of "test that this returns a value" wastes the next developer's day.
- **Don't list tests that already exist.** Read the existing test file first. Missing means actually missing.
- **Don't propose tests for private helpers.** Test through the public interface; if the helper has uncovered logic, the public interface that calls it is missing a test.
- **Don't write the test.** This skill produces the backlog. The implementation happens in `/engineering:tdd` or a normal coding session.

## Pairs with

- `/engineering:tdd` — implement each test on the backlog using red-green-refactor.
- `/engineering:testing-strategy` — decide upfront which test layers a feature needs.
- `/engineering:to-issues` — bulk-create the GitHub issues from this backlog.
