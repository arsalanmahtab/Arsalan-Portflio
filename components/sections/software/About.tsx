import { aboutSection as copy } from "@/data/software";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import { DevAndroid } from "./DevAndroid";

/** "Clean code. Calm delivery." Three values with lime check tiles, beside the 3D developer android. */
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

        <DevAndroid />
      </div>
    </section>
  );
}
