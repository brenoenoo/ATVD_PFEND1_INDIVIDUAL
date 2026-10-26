import Produto from "../models/Produto.js";

export function criarProdutoService({ produtoModel }) {
  async function listar() {
    return produtoModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);

    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um numero inteiro positivo");
    }

    const produto = await produtoModel.buscarPorId(id);

    if (!produto) {
      throw new Error(`Produto ${id} não encontrado`);
    }

    return produto;
  }

  async function criar(dados) {
    const produto = new Produto({
      id: 1,
      ...dados,
      preco: Number(dados.preco),
      estoque: Number(dados.estoque ?? 0),
    });

    return produtoModel.criar({
      nome: produto.nome,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: produto.categoria,
    });
  }

  async function atualizar(idRecebido, dados) {
    const produtoAtual = await buscarPorId(idRecebido);

    const produtoAtualizado = new Produto({
      ...produtoAtual,
      ...dados,
      id: produtoAtual.id,
      preco: Number(dados.preco ?? produtoAtual.preco),
      estoque: Number(dados.estoque ?? produtoAtual.estoque),
    });

    return produtoModel.atualizar(produtoAtualizado.id, {
      nome: produtoAtualizado.nome,
      preco: produtoAtualizado.preco,
      estoque: produtoAtualizado.estoque,
      categoria: produtoAtualizado.categoria,
    });
  }

  async function excluir(idRecebido) {
    await buscarPorId(idRecebido);
    return produtoModel.excluir(Number(idRecebido));
  }

  return { listar, buscarPorId, criar, atualizar, excluir };
}
