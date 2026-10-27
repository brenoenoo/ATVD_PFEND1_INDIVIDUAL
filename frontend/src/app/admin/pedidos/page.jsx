"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_URL = "http://localhost:3001/api/pedidos";

const STATUS = {
  recebido: "Recebido",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_OPTIONS = [
  { value: "recebido", label: "Recebido" },
  { value: "em_preparacao", label: "Em preparação" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

async function lerResposta(resposta) {
  const texto = await resposta.text();
  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    const mensagem =
      typeof dados === "object" && dados !== null
        ? dados.erro || dados.mensagem || dados.message
        : null;

    throw new Error(mensagem || `Erro na requisição (${resposta.status}).`);
  }

  return dados;
}

function extrairPedidos(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.pedidos)) return dados.pedidos;
  if (Array.isArray(dados?.data)) return dados.data;

  throw new Error("A API retornou uma lista de pedidos em formato inesperado.");
}

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

function formatarData(valor) {
  if (!valor) return "Data indisponível";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function quantidadeDeItens(pedido) {
  if (!Array.isArray(pedido.itens)) return 0;

  return pedido.itens.reduce(
    (total, item) => total + (Number(item.quantidade) || 0),
    0,
  );
}

function classeStatus(status) {
  const classes = {
    recebido: styles.statusRecebido,
    em_preparacao: styles.statusPreparacao,
    enviado: styles.statusEnviado,
    entregue: styles.statusEntregue,
    cancelado: styles.statusCancelado,
  };

  return classes[status] || "";
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [statusEmEdicao, setStatusEmEdicao] = useState({});
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(API_URL);
      const dados = await lerResposta(resposta);
      const lista = extrairPedidos(dados);

      lista.sort((a, b) => Number(b.id) - Number(a.id));

      setPedidos(lista);
      setStatusEmEdicao((atual) => {
        const proximo = { ...atual };

        for (const pedido of lista) {
          proximo[pedido.id] = pedido.status || "recebido";
        }

        return proximo;
      });

      setPedidoSelecionado((selecionado) => {
        if (!selecionado) return null;

        return (
          lista.find(
            (pedido) => String(pedido.id) === String(selecionado.id),
          ) || null
        );
      });
    } catch (erroConsulta) {
      setErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : "Não foi possível carregar os pedidos.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return pedidos.filter((pedido) => {
      const nome = String(pedido.cliente?.nome ?? "").toLocaleLowerCase(
        "pt-BR",
      );
      const email = String(pedido.cliente?.email ?? "").toLocaleLowerCase(
        "pt-BR",
      );
      const id = String(pedido.id ?? "");

      const correspondeBusca =
        !termo ||
        id.includes(termo) ||
        nome.includes(termo) ||
        email.includes(termo);

      const correspondeStatus =
        filtroStatus === "todos" || pedido.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [pedidos, busca, filtroStatus]);

  const resumo = useMemo(() => {
    return {
      total: pedidos.length,
      recebidos: pedidos.filter((pedido) => pedido.status === "recebido")
        .length,
      emPreparacao: pedidos.filter(
        (pedido) => pedido.status === "em_preparacao",
      ).length,
      enviados: pedidos.filter((pedido) => pedido.status === "enviado").length,
    };
  }, [pedidos]);

  function alterarStatusLocal(id, status) {
    setStatusEmEdicao((atual) => ({
      ...atual,
      [id]: status,
    }));

    setErro("");
    setSucesso("");
  }

  async function salvarStatus(pedido) {
    const novoStatus = statusEmEdicao[pedido.id] || pedido.status;

    if (!STATUS[novoStatus]) {
      setErro("Selecione um status válido.");
      return;
    }

    if (novoStatus === pedido.status) {
      setSucesso("O pedido já está com esse status.");
      setErro("");
      return;
    }

    setAtualizando(pedido.id);
    setErro("");
    setSucesso("");

    try {
      const resposta = await fetch(
        `${API_URL}/${encodeURIComponent(pedido.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: novoStatus }),
        },
      );

      const dados = await lerResposta(resposta);
      const pedidoAtualizado = dados?.dados;

      if (!pedidoAtualizado) {
        throw new Error("A API não retornou o pedido atualizado.");
      }

      setPedidos((atuais) =>
        atuais.map((item) =>
          String(item.id) === String(pedido.id) ? pedidoAtualizado : item,
        ),
      );

      setStatusEmEdicao((atuais) => ({
        ...atuais,
        [pedido.id]: pedidoAtualizado.status,
      }));

      setPedidoSelecionado((atual) =>
        atual && String(atual.id) === String(pedido.id)
          ? pedidoAtualizado
          : atual,
      );

      setSucesso(
        `Pedido #${pedido.id} atualizado para "${STATUS[novoStatus]}".`,
      );
    } catch (erroOperacao) {
      setErro(
        erroOperacao instanceof Error
          ? erroOperacao.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setAtualizando(null);
    }
  }

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("todos");
  }

  return (
    <div className={styles.adminPage}>
      <nav className={`navbar ${styles.navbar}`}>
        <div className="container-fluid px-3 px-lg-5">
          <a href="/" className={styles.brand} aria-label="Pink Arena - loja">
            <span className={styles.brandMark}>P</span>

            <span className={styles.brandName}>
              PINK<span>ARENA</span>
              <small>PAINEL ADMINISTRATIVO</small>
            </span>
          </a>

          <div className={styles.navActions}>
            <a href="/admin" className={`btn ${styles.navButton}`}>
              PAINEL DE PRODUTOS
            </a>

            <a href="/" className={`btn ${styles.navButtonSecondary}`}>
              VOLTAR À LOJA
            </a>
          </div>
        </div>
      </nav>

      <main className="container-fluid px-3 px-lg-5">
        <header className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>CONTROLE DA LOJA</p>
            <h1>
              PEDIDOS<span>.</span>
            </h1>
            <p className={styles.subtitle}>
              Acompanhe as compras e gerencie o andamento dos pedidos.
            </p>
          </div>

          <button
            type="button"
            className={`btn ${styles.refreshButton}`}
            onClick={carregarPedidos}
            disabled={carregando}
          >
            <span aria-hidden="true">↻</span>{" "}
            {carregando ? "CARREGANDO..." : "ATUALIZAR LISTA"}
          </button>
        </header>

        {erro && (
          <div
            className={`alert ${styles.errorAlert}`}
            role="alert"
            aria-live="polite"
          >
            <strong>Não foi possível concluir a operação.</strong>
            <p className="mb-0 mt-1">{erro}</p>

            <button
              type="button"
              className={styles.dismissButton}
              onClick={() => setErro("")}
              aria-label="Fechar mensagem de erro"
            >
              ×
            </button>
          </div>
        )}

        {sucesso && (
          <div
            className={`alert ${styles.successAlert}`}
            role="status"
            aria-live="polite"
          >
            {sucesso}

            <button
              type="button"
              className={styles.dismissButton}
              onClick={() => setSucesso("")}
              aria-label="Fechar mensagem de sucesso"
            >
              ×
            </button>
          </div>
        )}

        <section className={styles.summaryGrid} aria-label="Resumo dos pedidos">
          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>▤</span>
            <div>
              <p>TOTAL DE PEDIDOS</p>
              <strong>{resumo.total}</strong>
            </div>
          </article>

          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>◷</span>
            <div>
              <p>RECEBIDOS</p>
              <strong>{resumo.recebidos}</strong>
            </div>
          </article>

          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>⚙</span>
            <div>
              <p>EM PREPARAÇÃO</p>
              <strong>{resumo.emPreparacao}</strong>
            </div>
          </article>

          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>↗</span>
            <div>
              <p>ENVIADOS</p>
              <strong>{resumo.enviados}</strong>
            </div>
          </article>
        </section>

        <section className={styles.ordersPanel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.panelEyebrow}>OPERAÇÕES</p>
              <h2>Todos os pedidos</h2>
            </div>

            <span className={styles.totalBadge}>
              {pedidosFiltrados.length} RESULTADO(S)
            </span>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchField}>
              <label htmlFor="buscar-pedidos">Pesquisar pedidos</label>

              <div className={styles.searchInputWrap}>
                <span aria-hidden="true">⌕</span>

                <input
                  id="buscar-pedidos"
                  type="search"
                  className="form-control"
                  placeholder="Número, nome ou e-mail do cliente..."
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                />
              </div>
            </div>

            <div className={styles.statusFilter}>
              <label htmlFor="filtro-status">Filtrar por status</label>

              <select
                id="filtro-status"
                className="form-select"
                value={filtroStatus}
                onChange={(evento) => setFiltroStatus(evento.target.value)}
              >
                <option value="todos">Todos os status</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={`btn ${styles.clearButton}`}
              onClick={limparFiltros}
              disabled={!busca && filtroStatus === "todos"}
            >
              LIMPAR
            </button>
          </div>

          {carregando ? (
            <div className={styles.feedback}>
              <div
                className="spinner-border"
                role="status"
                aria-label="Carregando pedidos"
              />
              <p>Buscando pedidos na API...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>▤</span>

              <h3>
                {pedidos.length === 0
                  ? "Nenhum pedido cadastrado"
                  : "Nenhum pedido encontrado"}
              </h3>

              <p>
                {pedidos.length === 0
                  ? "Quando um cliente finalizar uma compra, o pedido aparecerá aqui."
                  : "Tente pesquisar por outro termo ou alterar o filtro de status."}
              </p>

              {(busca || filtroStatus !== "todos") && (
                <button
                  type="button"
                  className={`btn ${styles.clearButton}`}
                  onClick={limparFiltros}
                >
                  LIMPAR FILTROS
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={`table align-middle ${styles.ordersTable}`}>
                <thead>
                  <tr>
                    <th scope="col">PEDIDO</th>
                    <th scope="col">CLIENTE</th>
                    <th scope="col">DATA</th>
                    <th scope="col">ITENS</th>
                    <th scope="col">TOTAL</th>
                    <th scope="col">STATUS</th>
                    <th scope="col">AÇÕES</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const statusAtual =
                      statusEmEdicao[pedido.id] || pedido.status || "recebido";

                    return (
                      <tr key={pedido.id}>
                        <td>
                          <strong className={styles.orderNumber}>
                            #{pedido.id}
                          </strong>
                        </td>

                        <td>
                          <div className={styles.customerName}>
                            {pedido.cliente?.nome || "Cliente não informado"}
                          </div>

                          <div className={styles.customerEmail}>
                            {pedido.cliente?.email || "E-mail não informado"}
                          </div>
                        </td>

                        <td className={styles.dateCell}>
                          {formatarData(pedido.criadoEm)}
                        </td>

                        <td>
                          <span className={styles.itemCount}>
                            {quantidadeDeItens(pedido)}
                          </span>
                        </td>

                        <td className={styles.priceCell}>
                          {formatarPreco(pedido.total)}
                        </td>

                        <td>
                          <span
                            className={`${styles.statusBadge} ${classeStatus(pedido.status)}`}
                          >
                            {STATUS[pedido.status] ||
                              pedido.status ||
                              "Sem status"}
                          </span>
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={`btn ${styles.detailsButton}`}
                              onClick={() => setPedidoSelecionado(pedido)}
                            >
                              DETALHES
                            </button>

                            <div className={styles.statusEditor}>
                              <select
                                aria-label={`Novo status do pedido ${pedido.id}`}
                                className="form-select"
                                value={statusAtual}
                                onChange={(evento) =>
                                  alterarStatusLocal(
                                    pedido.id,
                                    evento.target.value,
                                  )
                                }
                                disabled={atualizando === pedido.id}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option
                                    key={status.value}
                                    value={status.value}
                                  >
                                    {status.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                className={`btn ${styles.saveStatusButton}`}
                                onClick={() => salvarStatus(pedido)}
                                disabled={
                                  atualizando === pedido.id ||
                                  statusAtual === pedido.status
                                }
                              >
                                {atualizando === pedido.id
                                  ? "SALVANDO..."
                                  : "SALVAR"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className={styles.pageNote}>
          Os pedidos são mantidos em memória pelo backend. Ao reiniciar o
          servidor, os pedidos e os produtos armazenados em memória são
          reiniciados.
        </p>
      </main>

      {pedidoSelecionado && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setPedidoSelecionado(null);
            }
          }}
        >
          <section
            className={styles.detailsModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhes-pedido"
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.panelEyebrow}>DETALHES DA COMPRA</p>

                <h2 id="titulo-detalhes-pedido">
                  Pedido #{pedidoSelecionado.id}
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setPedidoSelecionado(null)}
                aria-label="Fechar detalhes do pedido"
              >
                ×
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <span>CLIENTE</span>
                  <strong>
                    {pedidoSelecionado.cliente?.nome || "Não informado"}
                  </strong>
                </div>

                <div className={styles.detailCard}>
                  <span>DATA DO PEDIDO</span>
                  <strong>{formatarData(pedidoSelecionado.criadoEm)}</strong>
                </div>

                <div className={styles.detailCard}>
                  <span>E-MAIL</span>
                  <strong>
                    {pedidoSelecionado.cliente?.email || "Não informado"}
                  </strong>
                </div>

                <div className={styles.detailCard}>
                  <span>TELEFONE</span>
                  <strong>
                    {pedidoSelecionado.cliente?.telefone || "Não informado"}
                  </strong>
                </div>

                <div className={styles.detailCardFull}>
                  <span>ENDEREÇO DE ENTREGA</span>
                  <strong>
                    {pedidoSelecionado.cliente?.endereco || "Não informado"}
                  </strong>
                </div>
              </div>

              <div className={styles.modalSectionHeading}>
                <h3>Produtos do pedido</h3>

                <span>{quantidadeDeItens(pedidoSelecionado)} unidade(s)</span>
              </div>

              <div className={styles.detailItems}>
                {Array.isArray(pedidoSelecionado.itens) &&
                pedidoSelecionado.itens.length > 0 ? (
                  pedidoSelecionado.itens.map((item, indice) => (
                    <div
                      className={styles.detailItem}
                      key={`${item.produtoId ?? item.nome}-${indice}`}
                    >
                      <div>
                        <strong>{item.nome || "Produto sem nome"}</strong>
                        <span>
                          {item.quantidade} × {formatarPreco(item.preco)}
                        </span>
                      </div>

                      <strong>{formatarPreco(item.subtotal)}</strong>
                    </div>
                  ))
                ) : (
                  <p className={styles.noItems}>
                    Este pedido não possui itens disponíveis para exibição.
                  </p>
                )}
              </div>

              <div className={styles.modalTotal}>
                <span>TOTAL DO PEDIDO</span>
                <strong>{formatarPreco(pedidoSelecionado.total)}</strong>
              </div>

              <div className={styles.modalCurrentStatus}>
                <span>STATUS ATUAL</span>

                <span
                  className={`${styles.statusBadge} ${classeStatus(pedidoSelecionado.status)}`}
                >
                  {STATUS[pedidoSelecionado.status] ||
                    pedidoSelecionado.status ||
                    "Sem status"}
                </span>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={`btn ${styles.closeModalButton}`}
                onClick={() => setPedidoSelecionado(null)}
              >
                FECHAR DETALHES
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}