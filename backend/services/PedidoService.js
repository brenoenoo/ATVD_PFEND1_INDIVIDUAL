const STATUS_PERMITIDOS = [
  "recebido",
  "em_preparacao",
  "enviado",
  "entregue",
  "cancelado",
];

export function criarPedidoService({ pedidoModel, produtoModel }) {
  async function criar(dados) {
    const cliente = dados?.cliente;
    const itensRecebidos = dados?.itens;

    if (!cliente || typeof cliente !== "object" || Array.isArray(cliente)) {
      throw new TypeError("Informe os dados do cliente.");
    }

    const nome = String(cliente.nome ?? "").trim();
    const email = String(cliente.email ?? "").trim();
    const telefone = String(cliente.telefone ?? "").trim();
    const endereco = String(cliente.endereco ?? "").trim();

    if (nome.length < 2 || nome.length > 100) {
      throw new TypeError("Informe um nome válido.");
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new TypeError("Informe um e-mail válido.");
    }

    if (telefone.replace(/\D/g, "").length < 10 || telefone.length > 30) {
      throw new TypeError("Informe um telefone válido.");
    }

    if (endereco.length < 5 || endereco.length > 250) {
      throw new TypeError("Informe um endereço válido.");
    }

    if (!Array.isArray(itensRecebidos) || itensRecebidos.length === 0) {
      throw new TypeError("O pedido precisa conter pelo menos um produto.");
    }

    if (itensRecebidos.length > 50) {
      throw new TypeError("O pedido excede o limite de itens diferentes.");
    }

    // Agrupa produtos repetidos para evitar contagens inconsistentes.
    const quantidades = new Map();

    for (const item of itensRecebidos) {
      const produtoId = Number(item?.produtoId);
      const quantidade = Number(item?.quantidade);

      if (!Number.isSafeInteger(produtoId) || produtoId <= 0) {
        throw new TypeError("Um dos produtos possui ID inválido.");
      }

      if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
        throw new TypeError("As quantidades devem ser inteiros positivos.");
      }

      const totalAtual = (quantidades.get(produtoId) || 0) + quantidade;

      if (!Number.isSafeInteger(totalAtual)) {
        throw new TypeError("Quantidade de produtos inválida.");
      }

      quantidades.set(produtoId, totalAtual);
    }

    // Consulta e valida todos os produtos antes de alterar o estoque.
    const itensValidados = [];

    for (const [produtoId, quantidade] of quantidades) {
      const produto = await produtoModel.buscarPorId(produtoId);

      if (!produto) {
        const erro = new Error(`Produto ${produtoId} não encontrado.`);
        erro.statusCode = 404;
        throw erro;
      }

      const preco = Number(produto.preco);
      const estoque = Number(produto.estoque);

      if (!Number.isFinite(preco) || preco < 0) {
        throw new Error(`O preço do produto ${produto.nome} é inválido.`);
      }

      if (!Number.isSafeInteger(estoque) || estoque < 0) {
        throw new Error(`O estoque do produto ${produto.nome} é inválido.`);
      }

      if (quantidade > estoque) {
        const erro = new Error(
          `Estoque insuficiente para o produto ${produto.nome}. Disponível: ${estoque}.`,
        );

        erro.statusCode = 409;
        throw erro;
      }

      const subtotalCentavos = Math.round(preco * 100) * quantidade;

      if (!Number.isSafeInteger(subtotalCentavos) || subtotalCentavos < 0) {
        throw new Error("Não foi possível calcular o valor do pedido.");
      }

      itensValidados.push({
        produtoId,
        nome: produto.nome,
        preco: Math.round(preco * 100) / 100,
        quantidade,
        subtotal: subtotalCentavos,
        estoqueAnterior: estoque,
      });
    }

    const totalCentavos = itensValidados.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    if (!Number.isSafeInteger(totalCentavos)) {
      throw new Error("O valor total do pedido é inválido.");
    }

    // Reserva o estoque. Se alguma atualização falhar,
    // tenta restaurar as quantidades já alteradas.
    const atualizados = [];

    try {
      for (const item of itensValidados) {
        const resultado = await produtoModel.atualizar(item.produtoId, {
          estoque: item.estoqueAnterior - item.quantidade,
        });

        if (!resultado) {
          throw new Error("Não foi possível atualizar o estoque.");
        }

        atualizados.push(item);
      }

      const pedido = await pedidoModel.criar({
        cliente: {
          nome,
          email,
          telefone,
          endereco,
        },

        itens: itensValidados.map((item) => ({
          produtoId: item.produtoId,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          subtotal: item.subtotal / 100,
        })),

        total: totalCentavos / 100,
        status: "recebido",
        criadoEm: new Date().toISOString(),
      });

      return pedido;
    } catch (erro) {
      for (const item of atualizados.reverse()) {
        try {
          await produtoModel.atualizar(item.produtoId, {
            estoque: item.estoqueAnterior,
          });
        } catch (erroRestauracao) {
          console.error("Falha ao restaurar estoque:", erroRestauracao.message);
        }
      }

      throw erro;
    }
  }

  async function listar() {
    return pedidoModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo.");
    }

    const pedido = await pedidoModel.buscarPorId(id);

    if (!pedido) {
      const erro = new Error(`Pedido ${id} não encontrado.`);
      erro.statusCode = 404;
      throw erro;
    }

    return pedido;
  }

  async function atualizarStatus(idRecebido, statusRecebido) {
    const id = Number(idRecebido);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo.");
    }

    const status = String(statusRecebido ?? "").trim();

    if (!STATUS_PERMITIDOS.includes(status)) {
      throw new TypeError(
        `Status inválido. Utilize: ${STATUS_PERMITIDOS.join(", ")}.`,
      );
    }

    const pedido = await pedidoModel.atualizarStatus(id, status);

    if (!pedido) {
      const erro = new Error(`Pedido ${id} não encontrado.`);
      erro.statusCode = 404;
      throw erro;
    }

    return pedido;
  }

  return {
    criar,
    listar,
    buscarPorId,
    atualizarStatus,
  };
}
