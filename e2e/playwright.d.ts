declare module '@playwright/test' {
  export interface Page {
    goto(url: string): Promise<void>;
    setViewportSize(size: { width: number; height: number }): Promise<void>;
    waitForTimeout(timeout: number): Promise<void>;
    screenshot(options: { path: string; fullPage?: boolean }): Promise<Buffer>;
    $$eval<R>(selector: string, pageFunction: (elements: Element[]) => R): Promise<R>;
    getByRole(role: string, options?: { name: string }): {
      click(): Promise<void>;
    };
  }

  export function test(name: string, fn: (options: { page: Page }) => Promise<void>): void;
  export function expect(actual: any, message?: string): {
    toHaveLength(expected: number): void;
    toHaveTitle(expected: RegExp): Promise<void>;
    toHaveURL(expected: RegExp): Promise<void>;
  };
}
