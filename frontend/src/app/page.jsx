"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_URL = "http://localhost:3001/api/produtos";

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

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [itensCarrinho, setItensCarrinho] = useState(0);

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

  return (
    <div className={styles.page} id="inicio">
      <div className={styles.topbar}>
        EQUIPAMENTO DE GAMER. ATITUDE DE COMPETIDOR.
      </div>

      <nav className={`navbar ${styles.navbar}`}>
        <div className="container-fluid px-3 px-lg-5">
          <a className={`navbar-brand ${styles.brand}`} href="#inicio">
            <span className={styles.brandMark}>P</span>
            <span className={styles.brandName}>
              PINK<span>ARENA</span>
              <small>ESPORTS STORE</small>
            </span>
          </a>

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

            <button
              type="button"
              className={styles.cartButton}
              aria-label={`Carrinho com ${itensCarrinho} itens`}
            >
              Sacola
              <span className={styles.cartCount}>{itensCarrinho}</span>
            </button>
          </div>
        </div>
      </nav>

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
                  aria-label="Arte visual da Pink Arena"
                  role="img"
                >
                  <div className={styles.heroRing} />
                  <div className={styles.heroMonogram}>PA</div>

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
              <div className={styles.feedback}>
                <div
                  className="spinner-border"
                  role="status"
                  aria-label="Carregando produtos"
                />
                <p>Buscando produtos na API...</p>
              </div>
            ) : erro ? (
              <div className={styles.feedback}>
                <h3>Não foi possível carregar a vitrine.</h3>
                <p>{erro}</p>
                <p>Confira se o backend está rodando na porta 3001.</p>
                <button
                  type="button"
                  className={`btn ${styles.heroPrimary}`}
                  onClick={carregarProdutos}
                >
                  TENTAR NOVAMENTE
                </button>
              </div>
            ) : produtosFiltrados.length > 0 ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                {produtosFiltrados.map((produto, indice) => {
                  const estoque = Number(produto.estoque);

                  const semEstoque = Number.isFinite(estoque) && estoque <= 0;

                  return (
                    <div
                      className="col"
                      key={produto.id ?? `${produto.nome}-${indice}`}
                    >
                      <article className={`card h-100 ${styles.productCard}`}>
                        <div className={styles.productImageWrap}>
                          <span className={styles.imageFallback}>
                            PINK ARENA
                          </span>

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
                            <p className={styles.productPrice}>
                              {formatarPreco(produto.preco)}
                            </p>

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
                              className={`btn ${styles.addButton}`}
                              disabled={semEstoque}
                              onClick={() =>
                                setItensCarrinho((quantidade) => quantidade + 1)
                              }
                            >
                              {semEstoque
                                ? "SEM ESTOQUE"
                                : "ADICIONAR À SACOLA +"}
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptySymbol}>＋</div>

                <h3>
                  {produtos.length === 0
                    ? "A vitrine está esperando por você."
                    : "Nenhum produto encontrado."}
                </h3>

                <p>
                  {produtos.length === 0
                    ? "Ainda não há produtos cadastrados na API. Quando você cadastrar produtos, eles aparecerão aqui automaticamente."
                    : "Tente outro nome ou selecione uma categoria diferente."}
                </p>

                {busca && (
                  <button
                    type="button"
                    className={`btn ${styles.heroPrimary}`}
                    onClick={() => {
                      setBusca("");
                      setCategoriaSelecionada("Todas");
                    }}
                  >
                    LIMPAR FILTROS
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className={styles.footer} id="sobre">
        <div className="container-fluid px-3 px-md-4 px-xl-5">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <strong className={styles.footerBrand}>
                PINK<span>ARENA</span>
              </strong>
              <p>Seu jogo. Seu estilo. Seu próximo nível.</p>
            </div>

            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} Pink Arena — Projeto acadêmico.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
