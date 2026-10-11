import styles from "./Grain.module.css";

/** Fixed film-grain texture over everything (5.5% in dark mode, 3.5% in light). */
export function Grain() {
  return <div aria-hidden="true" className={styles.grain} />;
}
