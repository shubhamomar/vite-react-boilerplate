import type { Page } from "@playwright/test";

// WCAG 2.2 Focus Appearance (Minimum): 3:1 contrast change
const MIN_FOCUS_RATIO = 3.0;

export const BREAKPOINTS = [
  { label: "mobile-375", w: 375, h: 812 },
  { label: "tablet-768", w: 768, h: 1024 },
  { label: "laptop-1024", w: 1024, h: 768 },
  { label: "desktop-1440", w: 1440, h: 900 },
  { label: "hd-1600", w: 1600, h: 900 },
  { label: "fhd-1920", w: 1920, h: 1080 },
  { label: "qhd-2560", w: 2560, h: 1440 }
];

export async function screenshotAt(page: Page, label: string, w: number, h: number) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(100);
  await page.screenshot({ path: `e2e-artifacts/${label}.png`, fullPage: true });
}

export async function captureResponsiveScreens(page: Page) {
  for (const bp of BREAKPOINTS) {
    await screenshotAt(page, bp.label, bp.w, bp.h);
  }
  // Reflow check at 320px width per WCAG 1.4.10
  await screenshotAt(page, "reflow-320", 320, 900);
}

function srgbToLin(c: number) { const cs = c / 255; return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4); }
function luminance(rgb: [number, number, number]) { const [r,g,b] = rgb.map(srgbToLin) as [number, number, number]; return 0.2126*r + 0.7152*g + 0.0722*b; }
function contrastRatio(a: [number, number, number], b: [number, number, number]) { const L1 = luminance(a), L2 = luminance(b); const hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + 0.05) / (lo + 0.05); }

export async function auditPointerTargetsAndFocus(page: Page) {
  const selector = [
    '[role="button"]','button','a[href]','input','select','textarea','[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const issues = await page.$$eval(selector, (nodes: Element[]) => {
    function css(el: Element, prop: string) { return getComputedStyle(el as HTMLElement)[prop as any] as string; }
    function bbox(el: Element) { const r = (el as HTMLElement).getBoundingClientRect(); return { w: r.width, h: r.height }; }
    function toTriplet(c: string): [number, number, number] { const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i); return m ? [parseInt(m[1]!), parseInt(m[2]!), parseInt(m[3]!)] : [0,0,0]; }

    const results: any[] = [];
    for (const el of nodes) {
      const { w, h } = bbox(el);
      const tooSmall = w < 24 || h < 24;

      const prevOutline = css(el, 'outlineColor');
      const prevBorder  = css(el, 'borderTopColor');
      (el as HTMLElement).focus({ preventScroll: true });
      const postOutline = css(el, 'outlineColor');
      const postBorder  = css(el, 'borderTopColor');

      const prev = toTriplet(prevOutline !== 'rgba(0, 0, 0, 0)' ? prevOutline : prevBorder);
      const post = toTriplet(postOutline !== 'rgba(0, 0, 0, 0)' ? postOutline : postBorder);

      results.push({ tag: el.tagName.toLowerCase(), tooSmall, size: { w, h }, focusColors: { prev, post } });
      (el as HTMLElement).blur();
    }
    return results;
  });

  type Issue = { tag: string; tooSmall: boolean; size: { w: number; h: number }; focusColors: { prev: [number,number,number]; post: [number,number,number] } };
  const sized: Issue[] = issues;

  const sizeProblems = sized
    .filter((i) => i.tooSmall)
    .map((i) => `Target <${i.tag}> ${Math.round(i.size.w)}×${Math.round(i.size.h)}px (min 24×24)`);

  const focusProblems = sized
    .map((i) => ({ tag: i.tag, ratio: contrastRatio(i.focusColors.prev, i.focusColors.post) }))
    .filter((x) => !(x.ratio >= MIN_FOCUS_RATIO))
    .map((x) => `Focus contrast change on <${x.tag}> is ${x.ratio.toFixed(2)}:1 (min 3:1)`);

  return { sizeProblems, focusProblems };
}
