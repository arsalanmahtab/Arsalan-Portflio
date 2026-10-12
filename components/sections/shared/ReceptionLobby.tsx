import type { Mode } from "@/config/modes";
import { lobbyCopy as copy } from "@/data/lobbyServices";
import { Pill } from "@/components/ui/Pill";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import { LobbyStory } from "./LobbyStory";

/**
 * "Step inside. Reception will help." Right after the hero on both homes: the
 * visitor's walk through the studio, then the menu of services for this `set`.
 */
export function ReceptionLobby({ set }: { set: Mode }) {
  return (
    <section id="reception" className={sectionClass}>
      <div className="wrap">
        <Pill>{copy.pill}</Pill>
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <p className="mb-7.5 max-w-[34em] text-[1.15rem] text-fg-2">{copy.lead}</p>
        <LobbyStory set={set} />
      </div>
    </section>
  );
}
