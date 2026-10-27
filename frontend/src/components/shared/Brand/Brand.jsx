import styles from "./Brand.module.css";

export default function Brand({ subtitle = "ESPORTS STORE", href = "/" }) {
  return (
    <a
      className={styles.brandLink}
      href={href}
      aria-label="Pink Arena - Início"
    >
      <span className={styles.brandMark} aria-hidden="true">
        P
      </span>

      <span className={styles.brandName}>
        PINK<span>ARENA</span>
        <small>{subtitle}</small>
      </span>
    </a>
  );
}
