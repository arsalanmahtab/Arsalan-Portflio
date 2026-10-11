export {};

declare global {
  interface Window {
    /** Set by the inline script in app/layout.tsx when the first-visit loader should play. */
    __amLoader?: boolean;
  }
}
