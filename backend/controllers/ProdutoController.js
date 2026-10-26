export function criarProdutoController({ produtoService }) {
  function tratarErro(erro, res, next) {
    if (erro instanceof TypeError || erro instanceof RangeError) {
      return res.status(400).json({
        sucesso: false,
        erro: erro.message,
      });
    }

    if (erro.message.includes("não encontrado")) {
      return res.status(404).json({
        sucesso: false,
        erro: erro.message,
      });
    }

    next(erro);
  }

  async function listar(req, res, next) {
    try {
      const produtos = await produtoService.listar();

      res.status(200).json({
        sucesso: true,
        dados: produtos,
      });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const produto = await produtoService.buscarPorId(req.params.id);

      res.status(200).json({
        sucesso: true,
        dados: produto,
      });
    } catch (erro) {
      tratarErro(erro, res, next);
    }
  }

  async function criar(req, res, next) {
    try {
      const produtoNovo = await produtoService.criar(req.body);

      res.status(201).json({
        sucesso: true,
        dados: produtoNovo,
      });
    } catch (erro) {
      tratarErro(erro, res, next);
    }
  }

  async function atualizar(req, res, next) {
    try {
      const produtoAtualizado = await produtoService.atualizar(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        sucesso: true,
        dados: produtoAtualizado,
      });
    } catch (erro) {
      tratarErro(erro, res, next);
    }
  }

  async function excluir(req, res, next) {
    try {
      await produtoService.excluir(req.params.id);

      res.status(200).json({
        sucesso: true,
        mensagem: "Produto excluído com sucesso",
      });
    } catch (erro) {
      tratarErro(erro, res, next);
    }
  }

  return { listar, buscar, criar, atualizar, excluir };
}
