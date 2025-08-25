---
title: "AI Agent Playwright Debugging Workflow"
type: internal-procedure
version: 2.0
---

# AI Agent Standard Operating Procedure: Playwright Test Failures

## 0) Mandate

This document outlines the standard procedure for an AI agent to follow when a Playwright test suite (`npm run test:e2e`) fails. The goal is to autonomously diagnose and resolve common configuration and test script issues before escalating to the user.

## 1) Step: Analyze the Error

The first step is to carefully read the terminal output from the failed test run and classify the error.

-   **Is it a `SecurityError` related to `localStorage`?**
    -   *Likely Cause*: The test is running against a `file://` URL, not a web server. The `webServer` is likely misconfigured.
-   **Is it a `Cannot navigate to invalid URL` error?**
    -   *Likely Cause*: The test is using `baseURL`, but it is not defined in the Playwright config.
-   **Is it a `TimeoutError` (e.g., `waiting for selector`)?**
    -   *Likely Cause*: A UI element did not appear in time. The selector could be wrong, the page might not have loaded, or there's a legitimate bug in the application.
-   **Is it a failed `expect()` assertion for DOM attributes (e.g., `data-theme`, `data-density`)?**
    -   *Likely Cause*: State management race condition. The store hasn't hydrated yet, or the DOM attributes aren't being set correctly.
-   **Is it a failed `expect()` assertion for other values?**
    -   *Likely Cause*: The application's behavior does not match the test's expectation. This could be a bug in the application code or an incorrect assertion in the test.

## 2) Step: Configuration Audit (`playwright.config.ts`)

Based on the error, audit the `playwright.config.ts` file for the most common issues.

1.  **Check `webServer` Block**:
    -   Is it uncommented and enabled?
    -   Does the `command` correctly point to the script that starts the dev server (e.g., `npm run dev`)?
    -   Does the `url` match the port the dev server runs on (e.g., `http://localhost:5173`)?
2.  **Check `use.baseURL` Property**:
    -   Is the `baseURL` property defined inside the `use` object?
    -   Does its value exactly match the `webServer.url`?

## 3) Step: Test Script Audit (`*.spec.ts`)

If the configuration appears correct, audit the failing test script itself.

1.  **For `SecurityError` / `NavigationError`**:
    -   Is the test correctly using `baseURL` for navigation (e.g., `await page.goto(baseURL || '/')`) before interacting with origin-bound APIs like `localStorage`?
2.  **For `TimeoutError`**:
    -   Double-check the selector string. Is it correct and unique?
    -   Add `await page.pause()` before the failing line to stop the test and allow for manual inspection. (Note: This requires an interactive session and should be used as a last resort before escalating).
3.  **For DOM Attribute Assertion Errors**:
    -   **CRITICAL**: This is likely a state hydration issue. Add a wait for the attribute to exist before checking its value:
    ```typescript
    // Wait for the attribute to be set
    await page.waitForFunction(() => {
      return document.documentElement.hasAttribute('data-theme');
    }, { timeout: 10000 });

    // Then check the value
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    ```
4.  **For Other Assertion Errors**:
    -   Review the application logic. Is the test asserting the correct state?
    -   Log values to the console (`console.log`) inside `page.evaluate()` to see the state of the DOM from the browser's perspective.

## 4) Step: Background Development Server

**ALWAYS** start the development server in the background before running tests to ensure a stable environment:

```bash
# Start dev server in background
npm run dev &
# Wait a moment for server to start
sleep 5
# Run tests
npm run test:e2e
# Kill background server when done
kill %1
```

## 5) Step: Formulate & Apply Fix

Based on the audit, form a hypothesis and apply a single, targeted fix.

-   If the config is wrong, edit `playwright.config.ts`.
-   If the test script is wrong, edit the `*.spec.ts` file.
-   If it's a state hydration issue, add appropriate `waitForFunction` calls.

## 6) Step: Re-run and Verify

Execute the test suite again using the background server approach:

```bash
npm run dev &
sleep 5
npm run test:e2e
kill %1
```

-   **If tests pass**: The problem is solved. Proceed with the main workflow (e.g., move to "Capture Learnings" or the next implementation phase).
-   **If tests fail again**: Repeat the analysis with the new error message. Do not attempt the same fix more than once. If the error persists after 2-3 distinct attempts, it's time to escalate.

## 7) Step: Escalate to User

If the issue cannot be resolved after a few attempts, present a summary of the problem to the user. The summary must include:

1.  The original error message.
2.  The hypotheses that were tested.
3.  The specific changes that were attempted (with file names).
4.  The final error message.
5.  A clear question asking for guidance.

## 8) Step: Capture Learnings

After resolving any issue (successfully or through escalation), update `designs/coding-guidelines.md` with:

1.  The specific error encountered.
2.  The root cause identified.
3.  The solution applied.
4.  Code examples for future reference.
5.  Prevention strategies.

This ensures the knowledge base improves with each debugging session.
