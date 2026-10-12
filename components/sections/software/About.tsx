import { aboutSection as copy } from "@/data/software";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";

/**
 * "Clean code. Calm delivery." Three values with lime check tiles, beside the
 * stage where the 3D developer android stands.
 */
export function About() {
  return (
    <section id="about" className={sectionClass}>
      <div className="wrap grid items-center gap-10 min-[960px]:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Pill>{copy.pill}</Pill>
          <SplitText reveal lines={copy.title} className={sectionTitleClass} />
          <p className="mb-8 max-w-[34em] text-[1.15rem] text-fg-2">{copy.lead}</p>
          <SectionReveal as="ul" className="m-0 grid list-none gap-4 p-0">
            {copy.values.map((value) => (
              <li key={value.title} className="flex items-start gap-3.5">
                <span className="grid size-9 flex-none place-items-center rounded-[11px] bg-lime text-on-lime">
                  <Icon name="check" size={18} strokeWidth={3} />
                </span>
                <div>
                  <b className="block">{value.title}</b>
                  <span className="text-fg-2">{value.text}</span>
                </div>
              </li>
            ))}
          </SectionReveal>
        </div>

        {/*
          TEMPORARY (phase 8 puts the 3D developer android here): the stage keeps
          its final size and glow so the layout doesn't move when the android arrives.
        */}
        <div
          data-cursor="Say hi"
          className="relative grid h-[clamp(400px,48vw,580px)] place-items-center rounded-[32px] before:pointer-events-none before:absolute before:inset-[6%_8%] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--violet)_38%,transparent),transparent_66%)]"
        >
          <p className="relative m-0 rounded-full border border-dashed border-line px-4 py-2 text-sm font-semibold text-fg-2">
            Placeholder · 3D developer android, phase 8
          </p>
        </div>
      </div>
    </section>
  );
}
