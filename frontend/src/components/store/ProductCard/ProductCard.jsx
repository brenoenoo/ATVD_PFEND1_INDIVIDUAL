"use client";

import styles from "./ProductCard.module.css";

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) return "Preço sob consulta";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

export default function ProductCard({ produto, onAdicionar, onVerDetalhes }) {
  const estoque = Number(produto.estoque);
  const semEstoque = Number.isFinite(estoque) && estoque <= 0;

  return (
    <article className={`card h-100 ${styles.productCard}`}>
      <div className={styles.productImageWrap}>
        <span className={styles.imageFallback}>PINK ARENA</span>

        {produto.imagem && (
          <img
            className={styles.productImage}
            src={produto.imagem}
            alt={produto.nome || "Imagem do produto"}
            loading="lazy"
            onError={(evento) => {
              evento.currentTarget.style.display = "none";
            }}
          />
        )}

        <span className={styles.productBadge}>
          {produto.categoria || "ESPORTS"}
        </span>
      </div>

      <div className={`card-body ${styles.productInfo}`}>
        <p className={styles.productCategory}>
          {produto.categoria || "Outros produtos"}
        </p>

        <h3 className={styles.productName}>
          {produto.nome || "Produto sem nome"}
        </h3>

        <div className={styles.productBottom}>
          <p className={styles.productPrice}>{formatarPreco(produto.preco)}</p>

          <p
            className={`${styles.productStock} ${
              semEstoque ? styles.outOfStock : ""
            }`}
          >
            {semEstoque
              ? "Indisponível"
              : Number.isFinite(estoque)
                ? `${estoque} disponível(is)`
                : "Disponibilidade sob consulta"}
          </p>

          <button
            type="button"
            className={`btn ${styles.detailsButton}`}
            onClick={() => onVerDetalhes(produto)}
          >
            VER DETALHES
          </button>

          <button
            type="button"
            className={`btn ${styles.addButton}`}
            disabled={semEstoque}
            onClick={() => onAdicionar(produto)}
          >
            {semEstoque ? "SEM ESTOQUE" : "ADICIONAR À SACOLA +"}
          </button>
        </div>
      </div>
    </article>
  );
}
