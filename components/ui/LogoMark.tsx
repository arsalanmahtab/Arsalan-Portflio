import clsx from "clsx";
import styles from "./LogoMark.module.css";

/**
 * The logo mark, a shopping-bag robot (components/logo/mark-on-dark.svg and
 * mark-on-light.svg). Inline so it follows the theme: white bag with lime
 * handle on dark, dark bag with lime face on light. Decorative; pair it with the
 * name as text.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="18 8 64 80" aria-hidden="true" focusable="false" className={clsx(styles.mark, className)}>
      <path className={styles.handle} d="M35 40 V31 a15 13 0 0 1 30 0 V40" fill="none" strokeWidth="4.2" strokeLinecap="round" />
      <circle className={styles.antenna} cx="50" cy="12.5" r="3.6" />
      <path className={styles.bag} d="M30 34 H70 Q75 34 75.6 39 L79.6 80 Q80.2 87 73 87 H27 Q19.8 87 20.4 80 L24.4 39 Q25 34 30 34Z" />
      <circle className={styles.face} cx="35" cy="39.5" r="2" />
      <circle className={styles.face} cx="65" cy="39.5" r="2" />
      <rect className={styles.face} x="28" y="47" width="44" height="27" rx="11" />
      <ellipse className={styles.eyes} cx="41" cy="58" rx="3.6" ry="5" />
      <ellipse className={styles.eyes} cx="59" cy="58" rx="3.6" ry="5" />
      <path className={styles.smile} d="M45.5 65.5 Q50 69.5 54.5 65.5" fill="none" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
