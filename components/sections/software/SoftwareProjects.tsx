import { projectsSection as copy } from "@/data/software";
import { MaybePlaceholder } from "@/components/ui/MaybePlaceholder";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";

/** "Software projects": three cards waiting for real projects; the [placeholders] stay visible. */
export function SoftwareProjects() {
  return (
    <section id="projects" className={sectionClass}>
      <div className="wrap">
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <SectionReveal className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4.5">
          {copy.projects.map((project, index) => (
            <article
              key={index}
              className="glass flex flex-col gap-2.5 rounded-[22px] p-3.5 transition-[translate] duration-450 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2"
            >
              <div
                aria-hidden="true"
                className="flex h-42.5 items-end rounded-[14px] p-3.5 font-display text-[1.2rem] font-extrabold text-white"
                style={{ background: project.gradient }}
              >
                {project.name}
              </div>
              <h3 className="px-1.5 text-[1.25rem]">
                <MaybePlaceholder text={project.title} />
              </h3>
              <p className="m-0 px-1.5 text-fg-2">
                <MaybePlaceholder text={project.description} />
              </p>
              <ul aria-label={copy.tagsLabel} className="m-0 flex list-none flex-wrap gap-1.5 px-1.5 pt-0 pb-1.5">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-line px-2.5 py-1 text-[0.8rem] font-bold">
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
