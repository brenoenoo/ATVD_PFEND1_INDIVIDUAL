export default class Produto {
  constructor({
    id,
    nome,
    descricao = "",
    preco,
    estoque = 0,
    categoria,
    imagem = "",
  }) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um inteiro positivo.");
    }

    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("Nome é obrigatório.");
    }

    if (!Number.isFinite(preco) || preco < 0) {
      throw new TypeError("Preço deve ser um número maior ou igual a zero.");
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      throw new TypeError("Estoque deve ser um inteiro maior ou igual a zero.");
    }

    if (typeof categoria !== "string" || categoria.trim() === "") {
      throw new TypeError("Categoria é obrigatória.");
    }

    if (typeof imagem !== "string") {
      throw new TypeError("A imagem deve ser uma URL em texto.");
    }

    if (typeof descricao !== "string") {
      throw new TypeError("A descrição deve ser um texto.");
    }

    this.id = id;
    this.nome = nome.trim();
    this.descricao = descricao.trim();
    this.preco = preco;
    this.estoque = estoque;
    this.categoria = categoria.trim();
    this.imagem = imagem.trim();
  }

  calcularValorEmEstoque() {
    return this.preco * this.estoque;
  }

  calcularPrecoComDesconto(percentual) {
    if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
      throw new RangeError("Desconto deve estar entre 0 e 100.");
    }

    return this.preco * (1 - percentual / 100);
  }
}
