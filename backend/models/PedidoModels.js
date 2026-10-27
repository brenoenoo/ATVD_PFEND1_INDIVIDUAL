let pedidos = [];
let proximoId = 1;

export function criarPedidoModel() {
  async function criar(dados) {
    const pedido = {
      id: proximoId++,
      ...dados,
    };

    pedidos.push(pedido);

    return pedido;
  }

  async function listarTodos() {
    return [...pedidos];
  }

  async function buscarPorId(id) {
    return pedidos.find((pedido) => pedido.id === id) || null;
  }

  async function atualizarStatus(id, status) {
    const pedido = pedidos.find((item) => item.id === id);

    if (!pedido) {
      return null;
    }

    pedido.status = status;

    return pedido;
  }

  return {
    criar,
    listarTodos,
    buscarPorId,
    atualizarStatus,
  };
}
