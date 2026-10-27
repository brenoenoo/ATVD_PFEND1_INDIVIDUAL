"use client";

import styles from "./ProductDetailsModal.module.css";

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) {
    return "Preço sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

export default function ProductDetailsModal({
  produto,
  onFechar,
  onAdicionar,
}) {
  if (!produto) return null;

  const estoque = Number(produto.estoque);
  const semEstoque = Number.isFinite(estoque) && estoque <= 0;
  const descricao = produto.descricao || produto.descrição;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalhes-titulo"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onFechar}
          aria-label="Fechar detalhes"
        >
          ×
        </button>

        <div className={styles.imageArea}>
          {produto.imagem ? (
            <img
              src={produto.imagem}
              alt={produto.nome || "Imagem do produto"}
              className={styles.image}
            />
          ) : (
            <span className={styles.imageFallback}>
              PRO<span>DROP</span>
            </span>
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.category}>{produto.categoria || "ESPORTS"}</p>

          <h2 id="detalhes-titulo" className={styles.title}>
            {produto.nome || "Produto sem nome"}
          </h2>

          <p className={styles.description}>
            {descricao || "Nenhuma descrição foi cadastrada para este produto."}
          </p>

          <p className={styles.price}>{formatarPreco(produto.preco)}</p>

          <p
            className={`${styles.stock} ${semEstoque ? styles.unavailable : ""}`}
          >
            {semEstoque
              ? "Produto indisponível"
              : Number.isFinite(estoque)
                ? `${estoque} unidade(s) disponível(is)`
                : "Disponibilidade sob consulta"}
          </p>

          <button
            type="button"
            className={styles.addButton}
            disabled={semEstoque}
            onClick={() => onAdicionar(produto)}
          >
            {semEstoque ? "SEM ESTOQUE" : "ADICIONAR À SACOLA +"}
          </button>
        </div>
      </section>
    </div>
  );
}
