import express from "express";

export function criarProdutoRoutes({ produtoController }) {
  const router = express.Router();

  router.get("/", produtoController.listar);
  router.get("/:id", produtoController.buscar);
  router.post("/", produtoController.criar);
  router.put("/:id", produtoController.atualizar);
  router.delete("/:id", produtoController.excluir);

  return router;
}
