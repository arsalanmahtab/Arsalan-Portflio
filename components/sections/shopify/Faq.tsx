import { faq } from "@/data/faq";
import { faqSection as copy } from "@/data/shopify";
import { FaqList } from "@/components/sections/shopify/FaqList";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";

/** "Questions, answered." */
export function Faq() {
  return (
    <section id="faq" className={sectionClass}>
      <div className="wrap">
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <FaqList items={faq} />
      </div>
    </section>
  );
}
