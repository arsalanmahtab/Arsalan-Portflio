/*
 * TEMPORARY: stands in for a section that a later phase builds, so navbar
 * links, scrolling and the cursor labels can be tested now. Delete once every
 * section exists.
 */

type Props = {
  id: string;
  title: string;
  phase: number;
  /** Cursor label the real section will use, for testing. */
  cursor?: string;
};

export function SectionStub({ id, title, phase, cursor }: Props) {
  return (
    <section id={id} className="border-t border-line">
      <div className="wrap flex min-h-[70vh] flex-col justify-center py-24">
        <p className="mb-3 text-sm font-semibold text-fg-2">Placeholder · built in phase {phase}</p>
        <h2 className="mb-8 text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95] font-extrabold">{title}</h2>
        {cursor && (
          <div
            data-cursor={cursor}
            className="glass glass-sheen grid h-40 max-w-md place-items-center rounded-3xl text-fg-2"
          >
            Hover: &ldquo;{cursor}&rdquo; cursor label
          </div>
        )}
      </div>
    </section>
  );
}
