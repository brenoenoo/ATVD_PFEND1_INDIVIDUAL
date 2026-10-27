"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import AdminHeader from "../../components/admin/AdminHeader/AdminHeader";

const API_URL = "http://localhost:3001/api/produtos";

const formularioInicial = {
  nome: "",
  preco: "",
  estoque: "",
  categoria: "",
  imagem: "",
};

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

function extrairProdutos(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.produtos)) return dados.produtos;
  if (Array.isArray(dados?.data)) return dados.data;

  throw new Error("A API retornou uma lista em formato inesperado.");
}

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) {
    return "Preço não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

export default function AdminPage() {
  const [produtos, setProdutos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [idExcluindo, setIdExcluindo] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(API_URL);
      const dados = await lerResposta(resposta);

      setProdutos(extrairProdutos(dados));
    } catch (erroConsulta) {
      setErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : "Não foi possível carregar os produtos.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function limparFormulario() {
    setFormulario({ ...formularioInicial });
    setIdEmEdicao(null);
  }

  function editarProduto(produto) {
    if (produto.id === undefined || produto.id === null) {
      setErro("Este produto não possui um ID válido para edição.");
      return;
    }

    setFormulario({
      nome: produto.nome ?? "",
      preco: String(produto.preco ?? ""),
      estoque: String(produto.estoque ?? ""),
      categoria: produto.categoria ?? "",
      imagem: produto.imagem ?? "",
    });

    setIdEmEdicao(produto.id);
    setErro("");
    setSucesso("");

    document.getElementById("form-produto")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function salvarProduto(evento) {
    evento.preventDefault();

    setErro("");
    setSucesso("");

    const preco = Number(formulario.preco);
    const estoque = Number(formulario.estoque);

    if (!formulario.nome.trim() || !formulario.categoria.trim()) {
      setErro("Preencha o nome e a categoria do produto.");
      return;
    }

    if (
      formulario.preco.trim() === "" ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      setErro("Informe um preço válido, igual ou superior a zero.");
      return;
    }

    if (
      formulario.estoque.trim() === "" ||
      !Number.isInteger(estoque) ||
      estoque < 0
    ) {
      setErro(
        "Informe uma quantidade inteira de estoque, igual ou superior a zero.",
      );
      return;
    }

    const payload = {
      nome: formulario.nome.trim(),
      preco,
      estoque,
      categoria: formulario.categoria.trim(),
      imagem: formulario.imagem.trim(),
    };

    setSalvando(true);

    try {
      const editando = idEmEdicao !== null;
      const url = editando
        ? `${API_URL}/${encodeURIComponent(idEmEdicao)}`
        : API_URL;

      const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await lerResposta(resposta);

      limparFormulario();

      setSucesso(
        editando
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!",
      );

      await carregarProdutos();
    } catch (erroOperacao) {
      setErro(
        erroOperacao instanceof Error
          ? erroOperacao.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto) {
    if (produto.id === undefined || produto.id === null) {
      setErro("Este produto não possui um ID válido para exclusão.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir "${produto.nome}"?`,
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");
    setIdExcluindo(String(produto.id));

    try {
      const resposta = await fetch(
        `${API_URL}/${encodeURIComponent(produto.id)}`,
        { method: "DELETE" },
      );

      await lerResposta(resposta);

      if (String(idEmEdicao) === String(produto.id)) {
        limparFormulario();
      }

      setSucesso("Produto excluído com sucesso!");

      await carregarProdutos();
    } catch (erroOperacao) {
      setErro(
        erroOperacao instanceof Error
          ? erroOperacao.message
          : "Não foi possível excluir o produto.",
      );
    } finally {
      setIdExcluindo(null);
    }
  }

  return (
    <div className={styles.adminPage}>
      <AdminHeader />

      <main className="container-fluid px-3 px-lg-5">
        <header className={styles.pageHeading}>
          <p className={styles.eyebrow}>CONTROLE DA LOJA</p>

          <h1>
            PAINEL<span>.</span>
          </h1>

          <p className={styles.subtitle}>
            Gerencie os produtos que aparecem na vitrine da Pink Arena.
          </p>

          <div className={styles.pageActions}>
            <Link
              href="/admin/pedidos"
              className={`btn ${styles.ordersButton}`}
            >
              <i className="bi bi-receipt me-2" aria-hidden="true"></i>
              GERENCIAR PEDIDOS
            </Link>
          </div>
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

        <div className="row g-4 align-items-start pb-5">
          <div className="col-12 col-xl-4" id="form-produto">
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p className={styles.panelEyebrow}>
                    {idEmEdicao !== null ? "MODO DE EDIÇÃO" : "NOVO ITEM"}
                  </p>

                  <h2>
                    {idEmEdicao !== null
                      ? "Editar produto"
                      : "Cadastrar produto"}
                  </h2>
                </div>

                <span className={styles.panelIcon}>
                  {idEmEdicao !== null ? "✎" : "+"}
                </span>
              </div>

              <form onSubmit={salvarProduto}>
                <div className={styles.formField}>
                  <label htmlFor="nome" className="form-label">
                    Nome do produto *
                  </label>

                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    className={`form-control ${styles.input}`}
                    placeholder="Ex.: Camisa gamer"
                    value={formulario.nome}
                    onChange={atualizarCampo}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className={styles.formField}>
                      <label htmlFor="preco" className="form-label">
                        Preço (R$) *
                      </label>

                      <input
                        id="preco"
                        name="preco"
                        type="number"
                        className={`form-control ${styles.input}`}
                        placeholder="149.90"
                        min="0"
                        step="0.01"
                        value={formulario.preco}
                        onChange={atualizarCampo}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div className={styles.formField}>
                      <label htmlFor="estoque" className="form-label">
                        Estoque *
                      </label>

                      <input
                        id="estoque"
                        name="estoque"
                        type="number"
                        className={`form-control ${styles.input}`}
                        placeholder="10"
                        min="0"
                        step="1"
                        value={formulario.estoque}
                        onChange={atualizarCampo}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="categoria" className="form-label">
                    Categoria *
                  </label>

                  <input
                    id="categoria"
                    name="categoria"
                    type="text"
                    className={`form-control ${styles.input}`}
                    placeholder="Ex.: Periféricos"
                    value={formulario.categoria}
                    onChange={atualizarCampo}
                    maxLength={100}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="imagem" className="form-label">
                    URL da imagem
                  </label>

                  <input
                    id="imagem"
                    name="imagem"
                    type="url"
                    className={`form-control ${styles.input}`}
                    placeholder="https://site.com/imagem.jpg"
                    value={formulario.imagem}
                    onChange={atualizarCampo}
                  />

                  <small className={styles.fieldHelp}>
                    Opcional. Use um endereço de imagem acessível pela internet.
                  </small>
                </div>

                <button
                  type="submit"
                  className={`btn ${styles.submitButton}`}
                  disabled={salvando}
                >
                  {salvando
                    ? "SALVANDO..."
                    : idEmEdicao !== null
                      ? "SALVAR ALTERAÇÕES"
                      : "CADASTRAR PRODUTO"}
                </button>

                {idEmEdicao !== null && (
                  <button
                    type="button"
                    className={`btn ${styles.cancelButton}`}
                    onClick={limparFormulario}
                    disabled={salvando}
                  >
                    CANCELAR EDIÇÃO
                  </button>
                )}
              </form>

              <p className={styles.formNote}>
                Os campos com * são obrigatórios.
              </p>
            </section>
          </div>

          <div className="col-12 col-xl-8">
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p className={styles.panelEyebrow}>CATÁLOGO</p>
                  <h2>Produtos cadastrados</h2>
                </div>

                <span className={styles.totalBadge}>
                  {produtos.length} ITEM(NS)
                </span>
              </div>

              <div className={styles.listToolbar}>
                <p>
                  Os produtos cadastrados são carregados diretamente da API.
                </p>

                <button
                  type="button"
                  className={`btn ${styles.refreshButton}`}
                  onClick={carregarProdutos}
                  disabled={carregando}
                >
                  ↻ ATUALIZAR
                </button>
              </div>

              {carregando ? (
                <div className={styles.listFeedback}>
                  <div
                    className={`spinner-border ${styles.spinner}`}
                    role="status"
                    aria-label="Carregando produtos"
                  />
                  <p>Carregando catálogo...</p>
                </div>
              ) : produtos.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>＋</span>
                  <h3>Nenhum produto cadastrado</h3>
                  <p>
                    Preencha o formulário ao lado para adicionar o primeiro
                    produto à loja.
                  </p>
                </div>
              ) : (
                <div className={styles.productList}>
                  {produtos.map((produto, indice) => (
                    <article
                      className={styles.productRow}
                      key={produto.id ?? `${produto.nome}-${indice}`}
                    >
                      <div className={styles.thumbnail}>
                        <span>PA</span>

                        {produto.imagem && (
                          <img
                            src={produto.imagem}
                            alt={produto.nome || "Imagem do produto"}
                            loading="lazy"
                            onError={(evento) => {
                              evento.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>

                      <div className={styles.productDetails}>
                        <span className={styles.productCategory}>
                          {produto.categoria || "Sem categoria"}
                        </span>

                        <h3>{produto.nome || "Produto sem nome"}</h3>

                        <p className={styles.productMeta}>
                          ID: {produto.id ?? "não informado"}
                          {" · "}
                          Estoque: {produto.estoque ?? "não informado"}
                        </p>

                        <p className={styles.productPrice}>
                          {formatarPreco(produto.preco)}
                        </p>
                      </div>

                      <div className={styles.productActions}>
                        <button
                          type="button"
                          className={`btn ${styles.editButton}`}
                          onClick={() => editarProduto(produto)}
                          disabled={
                            produto.id === undefined || produto.id === null
                          }
                        >
                          EDITAR
                        </button>

                        <button
                          type="button"
                          className={`btn ${styles.deleteButton}`}
                          onClick={() => excluirProduto(produto)}
                          disabled={
                            idExcluindo !== null ||
                            produto.id === undefined ||
                            produto.id === null
                          }
                        >
                          {idExcluindo === String(produto.id)
                            ? "EXCLUINDO..."
                            : "EXCLUIR"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        PINKARENA <span>·</span> PAINEL DE GERENCIAMENTO
      </footer>
    </div>
  );
}
