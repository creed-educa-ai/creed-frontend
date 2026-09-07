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

  autenticacao: {
    primeiroAcesso: {
      titulo: 'Troque sua senha',
      subtitulo: 'Insira uma nova senha para sua conta',
      campoNovaSenha: 'Insira uma nova senha',
      campoConfirmarSenha: 'Confirme sua nova senha',
      avancar: 'Avançar',
      boasVindasTitulo: 'Bem Vindo',
      boasVindasMensagem:
        'Este é seu primeiro acesso. Para continuar você deve escolher uma nova senha.',
    },
    erros: {
      senhaCurta: 'A senha precisa ter pelo menos 8 caracteres.',
      confirmacaoObrigatoria: 'Confirme a nova senha.',
      senhasDivergentes: 'As senhas não coincidem.',
    },
  },
};
