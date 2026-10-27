"use client";

import { useState } from "react";
import styles from "./CheckoutModal.module.css";

const API_PEDIDOS_URL = "http://localhost:3001/api/pedidos";

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco)) {
    return "Preço indisponível";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}

export default function CheckoutModal({
  aberto,
  itens = [],
  onFechar,
  onPedidoConcluido,
}) {
  const [cliente, setCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedido, setPedido] = useState(null);

  const subtotal = itens.reduce((total, item) => {
    const preco = Number(item.produto.preco);

    return total + (Number.isFinite(preco) ? preco * item.quantidade : 0);
  }, 0);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setCliente((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function finalizarCompra(evento) {
    evento.preventDefault();

    if (itens.length === 0) {
      setErro("Sua sacola está vazia.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const resposta = await fetch(API_PEDIDOS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: {
            nome: cliente.nome.trim(),
            email: cliente.email.trim(),
            telefone: cliente.telefone.trim(),
            endereco: cliente.endereco.trim(),
          },
          itens: itens.map((item) => ({
            produtoId: item.produto.id,
            quantidade: item.quantidade,
          })),
        }),
      });

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          resultado.erro ||
            resultado.mensagem ||
            "Não foi possível registrar o pedido.",
        );
      }

      const pedidoRecebido = resultado.dados ?? resultado;

      setPedido(pedidoRecebido);
      onPedidoConcluido?.(pedidoRecebido);
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.message ||
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function fecharModal() {
    if (enviando) return;

    onFechar?.();

    // Prepara o formulário para uma próxima compra.
    setCliente({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
    });
    setErro("");
    setPedido(null);
  }

  if (!aberto) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          fecharModal();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-titulo"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <span>PRO</span>
              <span>DROP</span>
            </p>

            <h2 id="checkout-titulo">
              {pedido ? "PEDIDO RECEBIDO" : "FINALIZAR COMPRA"}
              <span>.</span>
            </h2>

            <p className={styles.subtitle}>
              {pedido
                ? "Sua compra foi registrada."
                : "Preencha seus dados para continuar."}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={fecharModal}
            disabled={enviando}
            aria-label="Fechar checkout"
          >
            ×
          </button>
        </header>

        {pedido ? (
          <div className={styles.confirmacao}>
            <div className={styles.successIcon}>✓</div>

            <h3>Compra registrada com sucesso!</h3>

            <p>Seu pedido foi recebido pelo sistema.</p>

            {pedido.id != null && (
              <p className={styles.numeroPedido}>Pedido nº {pedido.id}</p>
            )}

            <div className={styles.totalConfirmacao}>
              <span>Total do pedido</span>
              <strong>{formatarPreco(pedido.total ?? subtotal)}</strong>
            </div>

            <p className={styles.aviso}>
              Esta é uma compra demonstrativa. Nenhum pagamento foi processado.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={fecharModal}
            >
              VOLTAR À VITRINE
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={finalizarCompra}>
            <div className={styles.formContent}>
              <section className={styles.section}>
                <h3>Dados do cliente</h3>

                <div className={styles.field}>
                  <label htmlFor="checkout-nome">Nome completo</label>

                  <input
                    id="checkout-nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    placeholder="Digite seu nome"
                    value={cliente.nome}
                    onChange={atualizarCampo}
                    maxLength={120}
                    required
                    disabled={enviando}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="checkout-email">E-mail</label>

                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={cliente.email}
                    onChange={atualizarCampo}
                    maxLength={254}
                    required
                    disabled={enviando}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="checkout-telefone">Telefone</label>

                  <input
                    id="checkout-telefone"
                    name="telefone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    value={cliente.telefone}
                    onChange={atualizarCampo}
                    maxLength={25}
                    required
                    disabled={enviando}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="checkout-endereco">Endereço de entrega</label>

                  <input
                    id="checkout-endereco"
                    name="endereco"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Rua, número, bairro e cidade"
                    value={cliente.endereco}
                    onChange={atualizarCampo}
                    maxLength={250}
                    required
                    disabled={enviando}
                  />
                </div>
              </section>

              <section className={styles.section}>
                <h3>Resumo do pedido</h3>

                <div className={styles.resumoItens}>
                  {itens.map((item) => (
                    <div
                      className={styles.resumoItem}
                      key={item.produto.id ?? item.produto.nome}
                    >
                      <div>
                        <p className={styles.nomeProduto}>
                          {item.produto.nome || "Produto"}
                        </p>

                        <span className={styles.quantidade}>
                          Quantidade: {item.quantidade}
                        </span>
                      </div>

                      <strong>
                        {formatarPreco(
                          Number(item.produto.preco) * item.quantidade,
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className={styles.total}>
                  <span>Subtotal</span>
                  <strong>{formatarPreco(subtotal)}</strong>
                </div>

                <p className={styles.aviso}>
                  O valor e o estoque serão verificados pelo servidor. Frete e
                  pagamento não estão incluídos.
                </p>
              </section>
            </div>

            {erro && (
              <p className={styles.error} role="alert">
                {erro}
              </p>
            )}

            <footer className={styles.footer}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={fecharModal}
                disabled={enviando}
              >
                CANCELAR
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={enviando || itens.length === 0}
              >
                {enviando ? "PROCESSANDO..." : "CONFIRMAR PEDIDO"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
