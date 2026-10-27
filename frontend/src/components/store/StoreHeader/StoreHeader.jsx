"use client";

import Brand from "../../shared/Brand/Brand";
import styles from "./StoreHeader.module.css";

export default function StoreHeader({
  busca,
  setBusca,
  itensCarrinho,
  onAbrirCarrinho,
}) {
  return (
    <>
      <div className={styles.topbar}>
        EQUIPAMENTO DE GAMER. ATITUDE DE COMPETIDOR.
      </div>

      <nav className={`navbar ${styles.navbar}`}>
        <div className="container-fluid px-3 px-lg-5">
          <Brand href="/" />

          <div className={styles.headerTools}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                className={`form-control ${styles.searchInput}`}
                placeholder="Buscar produtos..."
                aria-label="Buscar produtos"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <a href="/admin" className={styles.adminLink}>
              ADMIN
            </a>

            <button
              type="button"
              className={styles.cartButton}
              aria-label={`Abrir sacola com ${itensCarrinho} itens`}
              onClick={onAbrirCarrinho}
            >
              Sacola
              <span className={styles.cartCount}>{itensCarrinho}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
