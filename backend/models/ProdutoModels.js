import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const caminhoProdutos = fileURLToPath(
  new URL("../data/produtos.json", import.meta.url),
);

export function criarProdutoModel() {
  let produtos = [];
  let proximoId = 1;

  // Carrega os produtos iniciais do JSON.
  const inicializacao = (async () => {
    const conteudo = await readFile(caminhoProdutos, "utf-8");
    const produtosIniciais = JSON.parse(conteudo);

    if (!Array.isArray(produtosIniciais)) {
      throw new TypeError(
        "O arquivo produtos.json deve conter uma lista de produtos.",
      );
    }

    produtos = produtosIniciais.map((produto) => ({
      id: Number(produto.id),
      nome: String(produto.nome ?? ""),
      descricao: String(produto.descricao ?? ""),
      preco: Number(produto.preco),
      estoque: Number(produto.estoque ?? 0),
      categoria: String(produto.categoria ?? ""),
      imagem: String(produto.imagem ?? ""),
    }));

    proximoId =
      produtos.reduce((maiorId, produto) => Math.max(maiorId, produto.id), 0) +
      1;
  })();

  async function listarTodos() {
    await inicializacao;

    return produtos.map((produto) => ({ ...produto }));
  }

  async function buscarPorId(id) {
    await inicializacao;

    return produtos.find((produto) => produto.id === id) ?? null;
  }

  async function criar(produto) {
    await inicializacao;

    const novoProduto = {
      id: proximoId++,
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: produto.categoria,
      imagem: produto.imagem ?? "",
    };

    produtos.push(novoProduto);

    return { ...novoProduto };
  }

  async function atualizar(id, dados) {
    await inicializacao;

    const indice = produtos.findIndex((produto) => produto.id === id);

    if (indice === -1) {
      return null;
    }

    produtos[indice] = {
      ...produtos[indice],
      ...dados,
      id,
    };

    return { ...produtos[indice] };
  }

  async function excluir(id) {
    await inicializacao;

    const indice = produtos.findIndex((produto) => produto.id === id);

    if (indice === -1) {
      return false;
    }

    produtos.splice(indice, 1);

    return true;
  }

  return {
    listarTodos,
    buscarPorId,
    criar,
    atualizar,
    excluir,
  };
}
