import { test, expect } from "@playwright/test";
import { captureResponsiveScreens, auditPointerTargetsAndFocus } from "./helpers/web-a11y";

test("UI is responsive & meets basic WCAG 2.2 checks", async ({ page }: { page: any }) => {
  await page.goto(process.env["E2E_BASE_URL"] || "http://localhost:5173");

  await captureResponsiveScreens(page);

  const { sizeProblems, focusProblems } = await auditPointerTargetsAndFocus(page);
  if (sizeProblems.length) console.warn("Target size issues:\n" + sizeProblems.join("\n"));
  if (focusProblems.length) console.warn("Focus appearance issues:\n" + focusProblems.join("\n"));

  expect(sizeProblems, "All pointer targets should be >=24×24 or use spacing exception").toHaveLength(0);
  expect(focusProblems, "Focus appearance should change contrast ≥3:1").toHaveLength(0);
});
