import { Fragment } from "react";

/** Renders copy where **double asterisks** mark bold phrases. */
export function RichText({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? <b key={index}>{part}</b> : <Fragment key={index}>{part}</Fragment>,
  );
}
