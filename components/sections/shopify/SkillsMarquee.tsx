import { skillRows } from "@/data/skills";
import { Marquee } from "@/components/ui/Marquee";

const rowText = "font-display text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-[-0.03em]";

/** Two rows of skills moving in opposite directions; they lean with scroll speed. */
export function SkillsMarquee() {
  return (
    <section aria-label="Skills" className="overflow-hidden border-y border-line py-10">
      <Marquee items={skillRows.filled} skew className={rowText} />
      <Marquee items={skillRows.outlined} reverse outline skew className={rowText} />
    </section>
  );
}
