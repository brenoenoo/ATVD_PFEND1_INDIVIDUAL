"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

import StoreHeader from "../components/store/StoreHeader/StoreHeader";
import ProductList from "../components/store/ProductList/ProductList";
import StoreFeedback from "../components/store/StoreFeedback/StoreFeedback";
import ProductDetailsModal from "../components/store/ProductDetailsModal/ProductDetailsModal";
import CartModal from "../components/store/CartModal/CartModal";
import CheckoutModal from "../components/store/CheckoutModal/CheckoutModal";

const API_URL = "http://localhost:3001/api/produtos";

function mesmoProduto(produtoA, produtoB) {
  if (produtoA.id != null && produtoB.id != null) {
    return String(produtoA.id) === String(produtoB.id);
  }

  return produtoA.nome === produtoB.nome;
}

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");

  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Não foi possível consultar a API.");
      }

      let lista;

      if (Array.isArray(dados)) {
        lista = dados;
      } else if (Array.isArray(dados?.dados)) {
        lista = dados.dados;
      } else if (Array.isArray(dados?.produtos)) {
        lista = dados.produtos;
      } else if (Array.isArray(dados?.data)) {
        lista = dados.data;
      } else {
        throw new Error("A API retornou um formato inesperado.");
      }

      setProdutos(lista);
    } catch (erroConsulta) {
      setErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : "Ocorreu um erro ao carregar os produtos.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const categorias = useMemo(() => {
    const existentes = produtos
      .map((produto) => produto.categoria)
      .filter(Boolean);

    return ["Todas", ...new Set(existentes)];
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return produtos.filter((produto) => {
      const nome = String(produto.nome || "").toLocaleLowerCase("pt-BR");

      const categoria = String(produto.categoria || "").toLocaleLowerCase(
        "pt-BR",
      );

      const correspondeBusca =
        nome.includes(termo) || categoria.includes(termo);

      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        produto.categoria === categoriaSelecionada;

      return correspondeBusca && correspondeCategoria;
    });
  }, [produtos, busca, categoriaSelecionada]);

  const quantidadeTotal = useMemo(
    () => itensCarrinho.reduce((total, item) => total + item.quantidade, 0),
    [itensCarrinho],
  );

  const adicionarAoCarrinho = useCallback((produto) => {
    const estoque = Number(produto.estoque);

    if (Number.isFinite(estoque) && estoque <= 0) {
      return;
    }

    setItensCarrinho((itensAtuais) => {
      const itemExistente = itensAtuais.find((item) =>
        mesmoProduto(item.produto, produto),
      );

      if (itemExistente) {
        if (Number.isFinite(estoque) && itemExistente.quantidade >= estoque) {
          return itensAtuais;
        }

        return itensAtuais.map((item) =>
          mesmoProduto(item.produto, produto)
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }

      return [...itensAtuais, { produto, quantidade: 1 }];
    });
  }, []);

  const alterarQuantidade = useCallback((produto, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      setItensCarrinho((itensAtuais) =>
        itensAtuais.filter((item) => !mesmoProduto(item.produto, produto)),
      );

      return;
    }

    const estoque = Number(produto.estoque);

    if (Number.isFinite(estoque) && novaQuantidade > estoque) {
      return;
    }

    setItensCarrinho((itensAtuais) =>
      itensAtuais.map((item) =>
        mesmoProduto(item.produto, produto)
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );
  }, []);

  const removerDoCarrinho = useCallback((produto) => {
    setItensCarrinho((itensAtuais) =>
      itensAtuais.filter((item) => !mesmoProduto(item.produto, produto)),
    );
  }, []);

  const abrirCheckout = useCallback(() => {
    if (itensCarrinho.length === 0) {
      return;
    }

    setCarrinhoAberto(false);
    setCheckoutAberto(true);
  }, [itensCarrinho]);

  const fecharCheckout = useCallback(() => {
    setCheckoutAberto(false);
  }, []);

  const pedidoConcluido = useCallback(() => {
    setItensCarrinho([]);
    carregarProdutos();
  }, [carregarProdutos]);

  function limparFiltros() {
    setBusca("");
    setCategoriaSelecionada("Todas");
  }

  return (
    <div className={styles.page} id="inicio">
      <StoreHeader
        busca={busca}
        setBusca={setBusca}
        itensCarrinho={quantidadeTotal}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <main>
        <div className="container-fluid px-3 px-md-4 px-xl-5">
          <section className={styles.hero}>
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <div className={styles.heroContent}>
                  <p className={styles.eyebrow}>
                    <span /> SUA PRÓXIMA FASE COMEÇA AQUI
                  </p>

                  <h1 className={styles.heroTitle}>
                    JOGUE NO
                    <br />
                    SEU <span>NÍVEL.</span>
                  </h1>

                  <p className={styles.heroText}>
                    Seu setup, seu estilo e sua partida. Descubra produtos para
                    quem vive o universo dos esports dentro e fora do jogo.
                  </p>

                  <div className={styles.heroActions}>
                    <a href="#produtos" className={`btn ${styles.heroPrimary}`}>
                      EXPLORAR PRODUTOS <span>↗</span>
                    </a>

                    <span className={styles.heroNote}>GEAR UP. GAME ON.</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div
                  className={styles.heroVisual}
                  aria-label="Arte visual da ProDrop"
                  role="img"
                >
                  <div className={styles.heroRing} />
                  <div className={styles.heroMonogram}>PD</div>

                  <span className={`${styles.heroPill} ${styles.heroPillTop}`}>
                    ESPORTS GEAR
                  </span>

                  <span
                    className={`${styles.heroPill} ${styles.heroPillBottom}`}
                  >
                    LEVEL UP +
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section} id="produtos">
            <div
              className={`${styles.sectionHeading} d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3`}
            >
              <div>
                <p className={styles.sectionEyebrow}>ESCOLHA SEU EQUIPAMENTO</p>

                <h2 className={styles.sectionTitle}>
                  VITRINE<span>.</span>
                </h2>

                <p className={styles.sectionSubtitle}>
                  Confira os produtos disponíveis na nossa loja.
                </p>
              </div>

              <span className={styles.productCount}>
                {produtos.length} PRODUTO(S)
              </span>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.categoryFilters}>
                {categorias.map((categoria) => (
                  <button
                    type="button"
                    key={categoria}
                    onClick={() => setCategoriaSelecionada(categoria)}
                    className={`${styles.filterButton} ${
                      categoriaSelecionada === categoria
                        ? styles.filterActive
                        : ""
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>

              <span className={styles.resultsText}>
                {busca ? "RESULTADO DA BUSCA" : "COLEÇÃO DISPONÍVEL"}
              </span>
            </div>

            {carregando ? (
              <StoreFeedback
                tipo="loading"
                mensagem="Buscando produtos na API..."
              />
            ) : erro ? (
              <StoreFeedback
                tipo="error"
                mensagem="Não foi possível carregar a vitrine."
                detalhe={`${erro} Confira se o backend está rodando na porta 3001.`}
                onTentarNovamente={carregarProdutos}
              />
            ) : (
              <ProductList
                produtos={produtosFiltrados}
                totalProdutos={produtos.length}
                busca={busca.trim()}
                onAdicionar={adicionarAoCarrinho}
                onVerDetalhes={setProdutoSelecionado}
                onLimparFiltros={limparFiltros}
              />
            )}
          </section>
        </div>
      </main>

      <footer className={styles.footer} id="sobre">
        <div className="container-fluid px-3 px-md-4 px-xl-5">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <strong className={styles.footerBrand}>
                PRO<span>DROP</span>
              </strong>

              <p>Seu jogo. Seu estilo. Seu próximo nível.</p>
            </div>

            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} ProDrop — Projeto acadêmico.
            </p>
          </div>
        </div>
      </footer>

      <ProductDetailsModal
        produto={produtoSelecionado}
        onFechar={() => setProdutoSelecionado(null)}
        onAdicionar={adicionarAoCarrinho}
      />

      <CartModal
        aberto={carrinhoAberto}
        itens={itensCarrinho}
        onFechar={() => setCarrinhoAberto(false)}
        onAlterarQuantidade={alterarQuantidade}
        onRemover={removerDoCarrinho}
        onFinalizarCompra={abrirCheckout}
      />

      <CheckoutModal
        aberto={checkoutAberto}
        itens={itensCarrinho}
        onFechar={fecharCheckout}
        onPedidoConcluido={pedidoConcluido}
      />
    </div>
  );
}
