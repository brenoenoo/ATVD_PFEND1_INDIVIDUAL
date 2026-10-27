let produtos = [];
let proximoId = 1;

export function criarProdutoModel() {
  async function listarTodos() {
    return [...produtos];
  }

  async function buscarPorId(id) {
    return produtos.find((produto) => produto.id === id) || null;
  }

  async function criar(produto) {
    const novoProduto = {
      id: proximoId++,
      nome: produto.nome,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: produto.categoria,
      imagem: produto.imagem ?? "",
    };

    produtos.push(novoProduto);
    return novoProduto;
  }

  async function atualizar(id, dados) {
    const indice = produtos.findIndex((produto) => produto.id === id);

    if (indice === -1) {
      return null;
    }

    produtos[indice] = {
      ...produtos[indice],
      ...dados,
      id,
    };

    return produtos[indice];
  }

  async function excluir(id) {
    const indice = produtos.findIndex((produto) => produto.id === id);

    if (indice === -1) {
      return false;
    }

    produtos.splice(indice, 1);
    return true;
  }

  return { listarTodos, buscarPorId, criar, atualizar, excluir };
}
