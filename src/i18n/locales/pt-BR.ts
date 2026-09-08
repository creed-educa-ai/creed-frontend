// Namespaces espelham as features (ADR-003): `comum` guarda o que é
// compartilhado; cada feature ganha o seu.
export const ptBR = {
  comum: {
    carregando: 'Carregando…',
    semDado: '—',
    tenteRecarregar: 'Tente recarregar a página.',
    acoes: {
      tentarNovamente: 'Tentar novamente',
      cancelar: 'Cancelar',
      salvar: 'Salvar',
    },
    idioma: {
      rotulo: 'Idioma',
      'pt-BR': 'Português',
      en: 'Inglês',
    },
  },
  respondentes: {
    titulo: 'Respondentes',
    vazio:
      'Nenhum respondente ainda. Cadastre o primeiro para começar a coleta.',
    // O plural fica no dicionário: cada idioma tem as suas regras.
    contagem_zero: '{{count}} pessoas cadastradas',
    contagem_one: '{{count}} pessoa cadastrada',
    contagem_other: '{{count}} pessoas cadastradas',
    idade_zero: '{{count}} anos',
    idade_one: '{{count}} ano',
    idade_other: '{{count}} anos',
  },
  boasVindas: {
    titulo: 'Bem vindo!',
    apresentacao:
      'O CREED.ai Educa é uma plataforma de avaliação de competências para organizações em transformação. Envolvendo Plasticidade Humana e Inteligência Neuroinovadora para Educação, Empreendedorismo e Organizações em Transformação.',
    entrar: {
      chamada: 'Já tem acesso? Entre na sua conta.',
      acao: 'Entrar',
    },
    criarConta: {
      chamada: 'Criar conta disponível apenas para empresas.',
      acao: 'Criar Conta',
    },
    saibaMais: 'Saiba mais sobre a plataforma',
    faleConosco: 'Fale conosco',
    // `creed.ai` não entra aqui: nome de marca não se traduz.
    tagline:
      'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
  },
};
