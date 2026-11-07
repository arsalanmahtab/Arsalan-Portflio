/**
 * Stores I've designed or built. The all-stores slider and the name rows read
 * this list; the featured panels read `featuredWork` below.
 *
 * Text in [square brackets] is a placeholder and shows highlighted on the site.
 */

export type Project = {
  name: string;
  url: string;
  /** PLACEHOLDER: a screenshot in /public, e.g. "/stores/wisecoms.jpg". Without one, the card shows a styled preview. */
  image?: string;
  role?: string;
  result?: string;
  /** PLACEHOLDER: still a .myshopify.com address; check whether the store has a live domain. */
  checkDomain?: boolean;
};

export const projects: Project[] = [
  { name: "Wisecoms", url: "https://wisecoms.com" },
  { name: "Xinix World", url: "https://xinixworld.co.uk" },
  { name: "BrüMate", url: "https://www.brumate.com/" },
  { name: "Bocabella", url: "https://bocabella.com/" },
  { name: "MR Joias", url: "https://mrjoias.pt/" },
  { name: "Efendina", url: "https://efendina.com/en-gl" },
  { name: "Loosid", url: "https://getloosid.com/" },
  { name: "Kidikit", url: "https://kidikit.com/" },
  { name: "Total Salon Supplies", url: "https://totalsalonsupplies.com/" },
  { name: "Bodycare 360", url: "https://bodycare360.co.uk/" },
  { name: "Fitness 360", url: "https://fitness360.co.uk/" },
  { name: "Option 4WD", url: "https://www.option4wd.com/" },
  { name: "LetsBuild", url: "https://www.letsbuild.com/" },
  { name: "Meat So Horny", url: "https://meatsohorny.myshopify.com", checkDomain: true },
  { name: "Ergo Outlet", url: "https://ergooutlet.co.uk/" },
  { name: "Markhor", url: "https://markhor.com/" },
  { name: "Brilliant Acrylic Designs", url: "https://brilliantacrylicdesigns.com" },
  { name: "Vinay Fashion", url: "https://vinayfashion.ae/" },
  { name: "Motivinci", url: "https://motivinci.co/" },
  { name: "The It List", url: "https://theitlist.nl/" },
  { name: "Minvoir", url: "https://www.minvoir.com/" },
  { name: "Yoga Hero", url: "https://yoga-hero.com/" },
  {
    name: "American Standard Supplements",
    url: "https://american-standard-supplements.myshopify.com/",
    checkDomain: true,
  },
  { name: "Monocloth", url: "https://www.monocloth.com/" },
  { name: "Cajuu", url: "https://cajuu.co.uk/" },
  { name: "Retro Pug", url: "https://retropug.net/" },
  { name: "JLux Label", url: "https://jluxlabel.co" },
  { name: "Ala Couture", url: "https://www.alacouture.com/" },
  { name: "Quilted Joy", url: "https://quiltedjoy.com" },
  { name: "BK Ranchwear", url: "https://bkranchwear.com" },
  { name: "Grateful Threads", url: "https://gratefulthreads.com" },
  { name: "Farmhouse Pottery", url: "https://www.farmhousepottery.com/" },
];

export type FeaturedProject = {
  name: string;
  url: string;
  /** PLACEHOLDER: what you built for this store. */
  role: string;
  /** PLACEHOLDER: a real result, like a PageSpeed score or load time. */
  result: string;
  /** Colours of the mock store preview. */
  preview: { background: string; color: string; layout: readonly ("row" | "strip")[] };
};

export const featuredWork: FeaturedProject[] = [
  {
    name: "Wisecoms",
    url: "https://wisecoms.com",
    role: "[Theme, sections, integrations]",
    result: "[A real number, like PageSpeed score or load time]",
    preview: { background: "#5440EE", color: "#ffffff", layout: ["row", "strip", "row"] },
  },
  {
    name: "Xinix World",
    url: "https://xinixworld.co.uk",
    role: "[Theme, sections, integrations]",
    result: "[A real number, like PageSpeed score or load time]",
    preview: { background: "#141029", color: "#FFB547", layout: ["strip", "row", "row"] },
  },
];

/** Colour pairs for store previews that have no screenshot. */
const STORE_GRADIENTS = [
  ["#5440EE", "#8A7CFF"],
  ["#1F7A5C", "#47C79A"],
  ["#B5446E", "#F28AB2"],
  ["#C2611F", "#F2A04E"],
  ["#1E4FA8", "#5B8DEF"],
  ["#5B2C83", "#A06CD5"],
  ["#2B2D42", "#6C7293"],
  ["#8C2F39", "#D9595F"],
  ["#0F6E7A", "#3BB7C4"],
  ["#14141C", "#3A3A55"],
] as const;

const hashOf = (text: string) => Array.from(text).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

/** The same [from, to] colours for a store everywhere it's previewed (the slider cards, the work map). */
export function storeGradient(name: string) {
  return STORE_GRADIENTS[hashOf(name) % STORE_GRADIENTS.length];
}

/** "https://www.brumate.com/" → "brumate.com" */
export function domainOf(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}
