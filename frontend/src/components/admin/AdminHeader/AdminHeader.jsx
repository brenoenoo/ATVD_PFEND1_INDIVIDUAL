import Brand from "../../shared/Brand/Brand";
import styles from "./AdminHeader.module.css";

export default function AdminHeader() {
  return (
    <nav className={`navbar ${styles.adminNavbar}`}>
      <div className="container-fluid px-3 px-lg-5">
        <Brand subtitle="PAINEL ADMINISTRATIVO" href="/" />

        <a href="/" className={`btn ${styles.backButton}`}>
          ← VOLTAR À VITRINE
        </a>
      </div>
    </nav>
  );
}
