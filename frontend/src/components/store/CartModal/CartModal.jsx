"use client";

import styles from "./CartModal.module.css";

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) return "Preço sob consulta";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

export default function CartModal({
  aberto,
  itens,
  onFechar,
  onAlterarQuantidade,
  onRemover,
  onFinalizarCompra,
}) {
  if (!aberto) return null;

  const quantidadeTotal = itens.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  const subtotal = itens.reduce((total, item) => {
    const preco = Number(item.produto.preco);
    return total + (Number.isFinite(preco) ? preco * item.quantidade : 0);
  }, 0);

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
        aria-labelledby="carrinho-titulo"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>SUA SELEÇÃO</p>
            <h2 id="carrinho-titulo">
              MINHA SACOLA<span>.</span>
            </h2>
            <p className={styles.headerSubtitle}>
              {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onFechar}
            aria-label="Fechar sacola"
          >
            ×
          </button>
        </header>

        {itens.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptySymbol}>＋</span>
            <h3>Sua sacola está vazia.</h3>
            <p>Explore a vitrine e adicione seus equipamentos favoritos.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onFechar}
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {itens.map((item) => {
                const { produto, quantidade } = item;
                const estoque = Number(produto.estoque);
                const temLimite = Number.isFinite(estoque) && estoque >= 0;
                const atingiuLimite = temLimite && quantidade >= estoque;

                return (
                  <article
                    className={styles.item}
                    key={produto.id ?? produto.nome}
                  >
                    <div className={styles.itemImage}>
                      {produto.imagem ? (
                        <img
                          src={produto.imagem}
                          alt={produto.nome || "Produto"}
                        />
                      ) : (
                        <span>PA</span>
                      )}
                    </div>

                    <div className={styles.itemInfo}>
                      <h3>{produto.nome || "Produto sem nome"}</h3>
                      <p className={styles.itemCategory}>
                        {produto.categoria || "ESPORTS"}
                      </p>
                      <p className={styles.itemPrice}>
                        {formatarPreco(produto.preco)}
                      </p>

                      <div className={styles.itemActions}>
                        <div
                          className={styles.quantityControl}
                          aria-label={`Quantidade de ${produto.nome}`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onAlterarQuantidade(produto, quantidade - 1)
                            }
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>

                          <span>{quantidade}</span>

                          <button
                            type="button"
                            disabled={atingiuLimite}
                            onClick={() =>
                              onAlterarQuantidade(produto, quantidade + 1)
                            }
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => onRemover(produto)}
                        >
                          REMOVER
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <strong>{formatarPreco(subtotal)}</strong>
              </div>

              <p className={styles.disclaimer}>
                Frete e pagamento não estão incluídos. Esta sacola é
                demonstrativa e ainda não finaliza pedidos.
              </p>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={onFinalizarCompra}
              >
                FINALIZAR COMPRA
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
