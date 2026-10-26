const nomesObrigatorios = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
// DB_PASS: Deixaremos de fora, pois ele não aceitará senha vazia (""), que é o padrão do XAMPP, por exemplo.

export function carregarAmbiente(arquivoDeConfiguracao) {
  if (arquivoDeConfiguracao) {
    try {
      process.loadEnvFile(arquivoDeConfiguracao);
    } catch {
      throw new Error(`Arquivo de configuração não encontrado: ${arquivoDeConfiguracao}`);
    }
  }

  const ausentes = nomesObrigatorios.filter((nome) => {
    const valor = process.env[nome];
    return typeof valor !== 'string' || valor.trim() === '';
  });

  if (ausentes.length > 0) {
    throw new Error(`Configure no .env: ${ausentes.join(', ')}`);
  }

  return {
    nomeAluno: process.env.NOME_ALUNO,
    turma: process.env.TURMA,
    porta: process.env.PORT,
    ambiente: process.env.NODE_ENV || 'development'
  };
}

export function exibirDiagnostico(configuracao) {
  console.table({
    estudante: configuracao.nomeAluno,
    turma: configuracao.turma,
    projeto: 'api-produtos',
    ambiente: configuracao.ambiente,
    node: process.version,
    sistema: `${process.platform} ${process.arch}`,
    diretorio: process.cwd(),
    portaConfigurada: configuracao.porta
  });
}
