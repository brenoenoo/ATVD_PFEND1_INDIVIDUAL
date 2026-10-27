import styles from "./StoreFeedback.module.css";

export default function StoreFeedback({
  tipo,
  mensagem,
  detalhe,
  onTentarNovamente,
  onLimparFiltros,
  mostrarBotaoLimpar = false,
}) {
  if (tipo === "loading") {
    return (
      <div className={styles.feedback} role="status" aria-live="polite">
        <div
          className={`spinner-border ${styles.spinner}`}
          aria-hidden="true"
        />
        <h3>Preparando a vitrine...</h3>
        <p>{mensagem || "Buscando produtos na API..."}</p>
      </div>
    );
  }

  if (tipo === "error") {
    return (
      <div className={styles.feedback} role="alert">
        <div className={styles.symbol}>!</div>
        <h3>{mensagem || "Não foi possível carregar a vitrine."}</h3>
        <p>{detalhe || "Confira se o backend está rodando na porta 3001."}</p>

        <button
          type="button"
          className={styles.actionButton}
          onClick={onTentarNovamente}
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    );
  }

  return (
    <div className={styles.feedback}>
      <div className={styles.symbol}>＋</div>
      <h3>{mensagem || "Nenhum produto encontrado."}</h3>
      <p>
        {detalhe || "Tente outro nome ou selecione uma categoria diferente."}
      </p>

      {mostrarBotaoLimpar && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={onLimparFiltros}
        >
          LIMPAR FILTROS
        </button>
      )}
    </div>
  );
}
