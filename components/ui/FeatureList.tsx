import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionReveal } from "@/components/ui/SectionReveal";

type Feature = { icon: IconName; title: string; text: string };

/** Ruled list of features with lime line icons; items slide in one after another. */
export function FeatureList({ items }: { items: readonly Feature[] }) {
  return (
    <SectionReveal as="ul" className="m-0 list-none p-0" stagger={0.12}>
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-4 border-t border-line py-4.5">
          <Icon name={item.icon} className="mt-0.75 flex-none text-lime-text" />
          <div>
            <b className="block">{item.title}</b>
            <span className="text-fg-2">{item.text}</span>
          </div>
        </li>
      ))}
    </SectionReveal>
  );
}
