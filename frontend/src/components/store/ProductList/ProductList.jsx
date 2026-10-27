import ProductCard from "../ProductCard/ProductCard";
import StoreFeedback from "../StoreFeedback/StoreFeedback";
import styles from "./ProductList.module.css";

export default function ProductList({
  produtos,
  totalProdutos,
  busca,
  onAdicionar,
  onVerDetalhes,
  onLimparFiltros,
}) {
  if (produtos.length === 0) {
    const vitrineVazia = totalProdutos === 0 && !busca;

    return (
      <StoreFeedback
        tipo="empty"
        mensagem={
          vitrineVazia
            ? "A vitrine está esperando por você."
            : "Nenhum produto encontrado."
        }
        detalhe={
          vitrineVazia
            ? "Ainda não há produtos cadastrados na API. Quando você cadastrar produtos, eles aparecerão aqui automaticamente."
            : "Tente outro nome ou selecione uma categoria diferente."
        }
        mostrarBotaoLimpar={!vitrineVazia}
        onLimparFiltros={onLimparFiltros}
      />
    );
  }

  return (
    <div
      className={`row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 ${styles.productGrid}`}
    >
      {produtos.map((produto, indice) => (
        <div className="col" key={produto.id ?? `${produto.nome}-${indice}`}>
          <ProductCard
            produto={produto}
            onAdicionar={onAdicionar}
            onVerDetalhes={onVerDetalhes}
          />
        </div>
      ))}
    </div>
  );
}
