import express from "express";

export function criarPedidoRoutes({ pedidoController }) {
  const router = express.Router();

  router.post("/", pedidoController.criar);
  router.get("/", pedidoController.listar);

  router.patch("/:id/status", pedidoController.atualizarStatus);

  router.get("/:id", pedidoController.buscar);

  return router;
}