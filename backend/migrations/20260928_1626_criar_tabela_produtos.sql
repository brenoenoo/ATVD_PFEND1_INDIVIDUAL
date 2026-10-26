CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50) NOT NULL
);

INSERT INTO produtos (nome, preco, estoque, categoria) VALUES
('Produto A', 10.99, 100, 'Categoria 1'),
('Produto B', 15.49, 50, 'Categoria 2'),
('Produto C', 7.99, 200, 'Categoria 1'),
('Produto D', 20.00, 30, 'Categoria 3');
