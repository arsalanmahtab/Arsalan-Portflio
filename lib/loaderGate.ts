/** Remembered after the first-visit loader has played once. */
export const LOADER_SEEN_KEY = "am-visited";

/**
 * Inline script for <head> (app/layout.tsx): decides before first paint whether
 * the loader plays (first visit, motion allowed). It flags <html data-loader>
 * so the panel shows immediately, with no flash of the page underneath.
 */
export const loaderGateScript = `(function(){try{if(!localStorage.getItem("${LOADER_SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){window.__amLoader=true;document.documentElement.setAttribute("data-loader","")}}catch(e){}})()`;
