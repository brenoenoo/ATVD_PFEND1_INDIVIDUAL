import express from "express";
import cors from "cors";

import { criarProdutoModel } from "./models/ProdutoModels.js";
import { criarProdutoService } from "./services/ProdutoService.js";
import { criarProdutoController } from "./controllers/ProdutoController.js";
import { criarProdutoRoutes } from "./routes/produtoRoutes.js";

export const app = express();

// Permite requisições do frontend Next.js
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

const produtoModel = criarProdutoModel();
const produtoService = criarProdutoService({ produtoModel });
const produtoController = criarProdutoController({ produtoService });
const produtoRoutes = criarProdutoRoutes({ produtoController });

app.get("/api/check", (req, res) => {
  res.status(200).json({
    status: "ok",
    mensagem: "Servidor funcionando!",
  });
});

app.use("/api/produtos", produtoRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: `A rota ${req.method} ${req.originalUrl} não existe`,
  });
});

app.use((erro, req, res, next) => {
  console.error("Erro de sistema:", erro.message);

  res.status(500).json({
    erro: "Falha interna do servidor",
  });
});
