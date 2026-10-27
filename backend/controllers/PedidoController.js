export function criarPedidoController({ pedidoService }) {
  function tratarErro(erro, res, next) {
    if (erro instanceof TypeError || erro instanceof RangeError) {
      return res.status(400).json({
        sucesso: false,
        erro: erro.message,
      });
    }

    if (erro.statusCode === 404) {
      return res.status(404).json({
        sucesso: false,
        erro: erro.message,
      });
    }

    if (erro.statusCode === 409) {
      return res.status(409).json({
        sucesso: false,
        erro: erro.message,
      });
    }

    next(erro);
  }

  async function criar(req, res, next) {
    try {
      const pedido = await pedidoService.criar(req.body);

      return res.status(201).json({
        sucesso: true,
        mensagem: "Pedido recebido com sucesso!",
        dados: pedido,
      });
    } catch (erro) {
      return tratarErro(erro, res, next);
    }
  }

  async function listar(req, res, next) {
    try {
      const pedidos = await pedidoService.listar();

      return res.status(200).json({
        sucesso: true,
        dados: pedidos,
      });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const pedido = await pedidoService.buscarPorId(req.params.id);

      return res.status(200).json({
        sucesso: true,
        dados: pedido,
      });
    } catch (erro) {
      return tratarErro(erro, res, next);
    }
  }

  async function atualizarStatus(req, res, next) {
    try {
      const pedido = await pedidoService.atualizarStatus(
        req.params.id,
        req.body?.status,
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Status do pedido atualizado com sucesso!",
        dados: pedido,
      });
    } catch (erro) {
      return tratarErro(erro, res, next);
    }
  }

  return {
    criar,
    listar,
    buscar,
    atualizarStatus,
  };
}