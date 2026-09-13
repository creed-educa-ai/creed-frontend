// Namespaces espelham as features (ADR-003): `comum` guarda o que é
// compartilhado; cada feature ganha o seu.
export const ptBR = {
  comum: {
    carregando: 'Carregando…',
    semDado: '—',
    tenteRecarregar: 'Tente recarregar a página.',
    erros: {
      obrigatorio: 'Campo obrigatório',
    },
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
  cadastro: {
    titulo: 'Crie sua conta',
    subtitulo: 'Informe seus dados para continuar',
    campos: {
      nomeEmpresa: {
        rotulo: 'Nome da empresa',
        placeholder: 'Digite o nome da empresa',
      },
      documento: {
        rotulo: 'Documento (CPF/CNPJ)',
        placeholder: 'Digite o documento da empresa',
      },
      email: {
        rotulo: 'E-mail da empresa',
        placeholder: 'Digite o e-mail da empresa',
      },
      nomeCompleto: {
        rotulo: 'Seu nome completo',
        placeholder: 'Digite seu nome completo',
      },
      telefone: {
        rotulo: 'Telefone',
        placeholder: 'Digite seu telefone',
      },
    },
    botaoAvancar: 'Avançar',
    textoLogin: 'Já tem uma conta?',
    linkLogin: 'Login',
    painelDescricao:
      'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
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

  contato: {
    titulo: 'Entre em contato',
    email: 'Email',
    telefone: 'Telefone',
  },

  aguardeConfirmacao: {
    titulo: 'Aguarde confirmação',
    mensagem:
      'Seus dados foram enviados e aguardam aprovação. Após a confirmação, tente realizar o login novamente.',
    voltar: 'Voltar',
    ouSaibaMais: 'OU SAIBA MAIS',
    saibaMais: 'O que é o método CREED?',
  },
};
