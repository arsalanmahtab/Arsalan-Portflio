/** True for copy written as a [placeholder] that still needs real content. */
export function isPlaceholder(text: string) {
  return text.startsWith("[") && text.endsWith("]");
}

/** Renders copy as-is, or highlighted when it is still a [placeholder]. */
export function MaybePlaceholder({ text }: { text: string }) {
  return isPlaceholder(text) ? <span className="ph">{text}</span> : <>{text}</>;
}
