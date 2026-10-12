import { saasSection as copy } from "@/data/software";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import { Dashboard } from "./Dashboard";
import { LaunchTimeline } from "./LaunchTimeline";

/** "Next.js SaaS, idea to launch": five steps beside an example dashboard. */
export function SaasLaunch() {
  return (
    <section id="saas" className={sectionClass}>
      <div className="wrap grid items-center gap-12 min-[960px]:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SplitText reveal lines={copy.title} className={sectionTitleClass} />
          <div className="mt-9">
            <LaunchTimeline />
          </div>
        </div>
        <SectionReveal distance={80}>
          <Dashboard />
        </SectionReveal>
      </div>
    </section>
  );
}
