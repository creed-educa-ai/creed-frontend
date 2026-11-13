// Namespaces espelham as features (ADR-003): `comum` guarda o que é
// compartilhado; cada feature ganha o seu.
export const ptBR = {
  comum: {
    tenteNovamenteEmInstantes: 'Tente novamente em alguns instantes.',
    // Região dos toasts (src/components/ui/sonner.tsx).
    notificacoes: 'Notificações',
    // Setores (`DepartmentType` do back): tags, filtros e o mapa.
    setores: {
      Marketing: 'Marketing',
      Financeiro: 'Financeiro',
      Administrativo: 'Administrativo',
      RecursosHumanos: 'RH',
      TecnologiaInformacao: 'TI',
    },
    // Textos que as tabelas compartilham (src/components/table).
    tabela: {
      ordenarPorNome: 'Ordenar por nome',
      ordenarPorStatus: 'Ordenar por status',
      paginacao: 'Paginação',
      pagina: 'Página {{current}} de {{total}}',
      anterior: 'Anterior',
      proximo: 'Próximo',
      selecionadas: '{{count}} de {{total}} linha(s) selecionada(s).',
      excluir: 'Excluir',
      excluindo: 'Excluindo…',
      erroExcluir: 'Não foi possível excluir. Tente novamente.',
    },
    carregando: 'Carregando…',
    semDado: '—',
    tenteRecarregar: 'Tente recarregar a página.',
    erros: {
      obrigatorio: 'Campo obrigatório',
    },
    acoes: {
      fechar: 'Fechar',
      tentarNovamente: 'Tentar novamente',
      cancelar: 'Cancelar',
      salvar: 'Salvar',
    },
    navegacao: {
      voltar: 'Voltar',
      irParaBoasVindas: 'Ir para a tela de boas-vindas',
    },
    idioma: {
      rotulo: 'Idioma',
      'pt-BR': 'Português',
      en: 'Inglês',
      es: 'Espanhol',
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

    escolher: 'Escolher',
    semResultado: 'Nenhuma opção encontrada',
    avancar: 'Avançar',
    pular: 'Pular',

    demograficos1: {
      titulo: 'Vamos começar! Qual o seu nome?',
      descricaoNome: 'Este será o nome que será exibido para outros usuários',
      nomeObrigatorio: 'Informe seu nome para continuar.',
    },
    demograficos2: {
      clear: 'Limpar {{field}}',
      remove: 'Remover {{option}}',
      invalidOption: 'Escolha uma opção válida.',
      options: {
        gender: {
          feminino: 'Feminino',
          masculino: 'Masculino',
          nao_binario: 'Não-binário',
          prefiro_nao_informar: 'Prefiro não informar',
        },
        ageRange: {
          '18_25': '18-25 anos',
          '26_35': '26-35 anos',
          '36_45': '36-45 anos',
          '46_55': '46-55 anos',
          '56_65': '56-65 anos',
          '65_mais': '65+ anos',
          prefiro_nao_informar: 'Prefiro não informar',
        },
        ethnicity: {
          africana_afrodescendente: 'Africana ou Afrodescendente',
          indigena_amerindia: 'Indígena / Ameríndia',
          europeia: 'Europeia (ex.: portuguesa, italiana, espanhola, alemã)',
          asiatica: 'Asiática (ex.: japonesa, chinesa, coreana, indiana)',
          arabe_medio_oriente: 'Árabe ou do Médio Oriente',
          latino_americana: 'Latino-americana (exceto Brasil)',
          romani_cigana: 'Romani / Cigana',
          multipla_hibrida: 'Múltipla / Híbrida',
          prefiro_nao_responder: 'Prefiro não responder',
        },
        religion: {
          crista: 'Cristã (em qualquer denominação)',
          judaica: 'Judaica',
          islamica: 'Islâmica',
          matriz_africana:
            'Religiões de matriz africana (ex.: Candomblé, Umbanda)',
          espiritismo: 'Espiritismo / Espiritualidade',
          budismo: 'Budismo',
          sem_religiao: 'Sem religião / Não praticante',
          outra: 'Outra',
          prefiro_nao_responder: 'Prefiro não responder',
        },
        nationality: {
          brasileira: 'Brasileira',
          portuguesa: 'Portuguesa',
          outra: 'Outra',
        },
        brazilState: {
          AC: 'Acre',
          AL: 'Alagoas',
          AP: 'Amapá',
          AM: 'Amazonas',
          BA: 'Bahia',
          CE: 'Ceará',
          DF: 'Distrito Federal',
          ES: 'Espírito Santo',
          GO: 'Goiás',
          MA: 'Maranhão',
          MT: 'Mato Grosso',
          MS: 'Mato Grosso do Sul',
          MG: 'Minas Gerais',
          PA: 'Pará',
          PB: 'Paraíba',
          PR: 'Paraná',
          PE: 'Pernambuco',
          PI: 'Piauí',
          RJ: 'Rio de Janeiro',
          RN: 'Rio Grande do Norte',
          RS: 'Rio Grande do Sul',
          RO: 'Rondônia',
          RR: 'Roraima',
          SC: 'Santa Catarina',
          SP: 'São Paulo',
          SE: 'Sergipe',
          TO: 'Tocantins',
        },
        portugalRegion: {
          norte: 'Norte',
          centro: 'Centro',
          area_metropolitana_lisboa: 'Área Metropolitana de Lisboa',
          alentejo: 'Alentejo',
          algarve: 'Algarve',
          acores: 'Açores',
          madeira: 'Madeira',
        },
      },
      titulo: 'Fale mais sobre você',
      subtitulo: 'Todas as respostas são opcionais!',
    },
    campos: {
      nome: 'Nome',
      nomePlaceholder: 'Seu nome completo',
      genero: 'Gênero (opcional)',
      faixaEtaria: 'Faixa etária (opcional)',
      origemEtnica: 'Origem Étnica (opcional)',
      religiao: 'Religião (opcional)',
      nacionalidade: 'Nacionalidade (opcional)',
      nacionalidadeOutra: 'Qual nacionalidade?',
      estado: 'Estado',
      regiao: 'Região',
    },
    // O mockup está em português europeu; aqui vai a versão pt-BR (P-008).
    demograficos3: {
      titulo: 'Compartilhe brevemente a sua perspectiva',
      subtitulo: 'Questão aberta - opcional',
      pergunta:
        'De que forma a sua educação familiar influenciou, ou não, a sua trajetória empreendedora ou inovadora? Justifique brevemente (opcional)',
      placeholder: 'Sua resposta',
      erroAoSalvar: 'Não foi possível salvar seus dados',
    },
  },
  questionarioRevisao: {
    titulo: 'Revise e envie suas respostas',
    descricao: 'Confira suas respostas antes de concluir o questionário.',
    semPerguntas: 'Não há respostas para revisar.',
    pergunta: 'Pergunta',
    resposta: 'Resposta',
    acoes: 'Ações',
    revisar: 'Revisar',
    revisarPergunta: 'Revisar pergunta {{numero}}',
    respostaEscala: '{{valor}} (em escala 1 a 5)',
    gerarPdf: 'Gerar PDF',
    modalTitulo: 'Revisar pergunta {{numero}}',
    selecioneResposta: 'Selecione sua resposta',
    escalaMinima: 'Discordo totalmente',
    escalaMaxima: 'Concordo totalmente',
    cancelar: 'Cancelar',
    salvarResposta: 'Salvar resposta',
    enviar: 'Enviar respostas',
    confirmarEnvioTitulo: 'Enviar suas respostas?',
    confirmarEnvioDescricao:
      'Depois do envio, suas respostas serão registradas para avaliação.',
    confirmarEnvio: 'Confirmar envio',
    enviado: 'Respostas enviadas.',
    enviando: 'Enviando…',
    erros: {
      jaRespondido: 'Você já respondeu este questionário.',
      envioFalhou: 'Não foi possível enviar. Tente de novo.',
    },
    obrigatoria: 'Obrigatória',
    respostaObrigatoria: 'Esta pergunta é obrigatória.',
    semResposta: 'Sem resposta',
    obrigatoriasPendentes_one: '{{count}} pergunta obrigatória sem resposta.',
    obrigatoriasPendentes_other:
      '{{count}} perguntas obrigatórias sem resposta.',
    respostaDissertativaPlaceholder: 'Escreva sua resposta',
  },
  dashboardPrisma: {
    titulo: 'Prisma de competências',
    prisma: 'Prisma',
    periodoAtual: 'Período atual',
    periodoComparado: 'Período comparado',
    descricaoComComparacao:
      'Resultados de {{atual}} comparados com {{comparado}}.',
    descricaoSemComparacao: 'Resultados do período {{atual}}.',
    compararCom: 'Comparar com',
    semComparacao: 'Sem comparação',
    prismas: {
      seguranca_psicologica: 'Segurança Psicológica',
      lideranca_adaptativa: 'Liderança Adaptativa',
      cultura_empreendedora: 'Cultura Empreendedora',
      adaptabilidade_cognitiva: 'Adaptabilidade Cognitiva',
      neuroinovacao_prisma: 'Neuroinovação',
    },
    // As sete dimensões da Matriz CREED (`Dimension` do back).
    dimensoes: {
      titulo: 'Desempenho por dimensão',
      nomes: {
        S2: 'Vivência e Competências Empreendedoras',
        S4: 'Multiculturalismo na Educação',
        S5A: 'Metodologias de Inovação',
        S5B: 'Aprendizagem e Metacognição',
        S6: 'Ensino Culturalmente Responsivo',
        S7: 'Competências Culturais, Responsivas e Empreendedoras',
        S8: 'Inovação e Impacto Social',
      },
    },
    mapa: {
      semSetores: 'Esta organização ainda não tem setores cadastrados.',
      titulo: 'Setores × prismas',
      subtitulo: '{{periodo}} · diferença em relação à empresa',
      diferenca: 'diferença em relação à empresa',
      acima: 'Acima da empresa',
      abaixo: 'Abaixo da empresa',
      neutro: 'Sem cor: diferença menor que 3 pontos',
      respostas: '{{total}} respostas',
    },
    alinhamento: {
      titulo: 'Alinhamento da equipe',
      respostas: '{{exibido}} · {{total}} respostas',
      total: '{{total}} respostas',
      semRespostas: 'Ainda não há respostas neste recorte.',
      faixas: {
        baixa: 'Baixa (até 40)',
        media: 'Média (40 a 70)',
        alta: 'Alta (acima de 70)',
      },
      niveis: {
        alinhado: 'Alinhado',
        moderado: 'Moderado',
        dividido: 'Dividido',
      },
      leitor: '{{baixa}} com nota baixa, {{media}} média e {{alta}} alta.',
    },
    variacao: {
      titulo: 'Variação por prisma',
      comparadoCom: '{{exibido}} em relação a {{referencia}}',
      semComparacao: '{{exibido}}, sem comparação.',
      emRelacaoA: 'em relação a',
      semReferencia: 'sem comparação',
      aumentou: 'aumentou {{valor}}',
      diminuiu: 'diminuiu {{valor}}',
      estavel: 'sem variação',
    },
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
  sobre: {
    titulo: 'Sobre',
    // TODO placeholder: texto institucional definitivo ainda não definido com a cliente.
    texto:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    voltar: 'Voltar',
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
    erros: {
      ate200Caracteres: 'Use no máximo 200 caracteres.',
      ate30Caracteres: 'Use no máximo 30 caracteres.',
      nomeCompletoInvalido: 'Digite um nome de 2 a 200 caracteres.',
      documentoInvalido: 'Digite um CPF (11 dígitos) ou um CNPJ (14 dígitos).',
      documentoJaCadastrado: 'Já existe um cadastro com este documento.',
      envioIndisponivel:
        'Não foi possível enviar o cadastro agora. Tente novamente.',
    },
    painelDescricao:
      'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
  },

  autenticacao: {
    login: {
      titulo: 'Entre na sua conta',
      subtitulo: 'Acesse com o e-mail cadastrado pela sua empresa.',
      email: { rotulo: 'E-mail', placeholder: 'voce@suaempresa.com.br' },
      senha: {
        rotulo: 'Senha',
        placeholder: 'Digite sua senha',
        mostrar: 'Mostrar senha',
        ocultar: 'Ocultar senha',
      },
      lembrarDeMim: 'Lembrar de mim',
      esqueciSenha: 'Esqueci minha senha',
      entrar: 'Entrar',
      semConta: 'Sua empresa ainda não tem conta?',
      criarConta: 'Criar conta',
      painelTitulo: 'Que bom ter você aqui.',
      painelDescricao:
        'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
    },
    recuperarSenha: {
      titulo: 'Esqueceu sua senha?',
      subtitulo:
        'Informe o e-mail da sua conta para receber um link de nova senha.',
      email: { rotulo: 'E-mail', placeholder: 'voce@suaempresa.com.br' },
      enviar: 'Enviar link',
      enviado:
        'Se este e-mail tiver acesso, enviamos um link para definir uma nova senha.',
      painelTitulo: 'Vamos recuperar seu acesso.',
      painelDescricao:
        'O link chega por e-mail e abre a página onde você define a nova senha.',
    },
    erros: {
      emailInvalido: 'Digite um e-mail válido.',
      loginInvalido: 'Não foi possível entrar com esses dados.',
      servicoIndisponivel: 'Não foi possível entrar agora. Tente novamente.',
      envioIndisponivel:
        'Não foi possível enviar o link agora. Tente novamente.',
    },
  },

  mentees: {
    questionnaireDialog: {
      title: 'Questionário de {{name}}',
      description:
        'Defina o período em que {{name}} pode responder ao questionário.',
    },
    toasts: {
      questionnaireSaved: '{{name}} já pode responder no período definido.',
      deleted: 'Mentorando excluído',
      deletedDescription: '{{nome}} não tem mais acesso à plataforma.',
    },
    title: 'Mentorandos',
    loadError: 'Não foi possível carregar os mentorandos.',
    search: {
      name: {
        label: 'Pesquisar mentorandos por nome',
        placeholder: 'Pesquise por nome',
      },
      email: {
        label: 'Pesquisar mentorandos por email',
        placeholder: 'Pesquise por email',
      },
    },
    columnsMenu: 'Colunas',
    select: { all: 'Selecionar todos', row: 'Selecionar {{name}}' },
    columns: {
      name: 'Nome',
      email: 'Email',
      questionnaire: 'Questionário',
      results: 'Resultados',
      delete: 'Excluir',
    },
    actions: {
      edit: 'Editar',
      viewResults: 'Ver Resultados',
      delete: 'Excluir',
      editFor: 'Editar questionário de {{name}}',
      viewResultsFor: 'Ver resultados de {{name}}',
      deleteFor: 'Excluir {{name}}',
    },
    empty: 'Nenhum mentorando cadastrado ainda.',
    noResults: 'Nenhum mentorando encontrado para essa pesquisa.',
    confirmDelete: {
      title: 'Excluir mentorando?',
      description:
        '{{name}} e todos os seus resultados serão apagados para sempre. Esta ação não pode ser desfeita.',
      confirm: 'Excluir',
    },
    errors: {
      deleteUnavailable: 'Não foi possível excluir agora. Tente de novo.',
    },
  },
  termo: {
    titulo: 'TERMO DE CONSENTIMENTO INFORMADO, ESCLARECIDO E LIVRE',
    corpo:
      'Investigação: Culturally Responsive Entrepreneurship Education (CREED) \nInstituição: Universidade Aberta (UAb) — Portugal \nInvestigadora responsável: Naira Libermann · 2406837@estudante.uab.pt \nOrientador: Doutor Manuel Jacinto de Ascensão Jardim · jacinto.jardim@uab.pt \nOBJETIVO: Compreender o impacto das abordagens multiculturais na educação empreendedora. \nPARTICIPAÇÃO: Instrumento de autorrelato com 49 itens Likert em 7 dimensões + 4 questões abertas (~15 min). \nCONFIDENCIALIDADE: Dados tratados de forma estritamente confidencial, analisados de forma agregada e anonimizados. \nVOLUNTARIEDADE: Participação inteiramente voluntária e gratuita. Pode retirar o consentimento a qualquer momento. \nBASE LEGAL: RGPD (UE) 2016/679 · Lei n.º 58/2019 (Portugal) · LGPD Lei nº 13.709/2018 (Brasil)',
    aceitar: 'Aceitar',
    recusar: 'Recusar',
  },
  contato: {
    titulo: 'Entre em contato',
    email: 'Email',
    telefone: 'Telefone',
  },

  aguardeConfirmacao: {
    titulo: 'Aguarde confirmação',
    mensagem:
      'Recebemos o cadastro da sua empresa. Quando ele for aprovado, você vai receber no e-mail informado um link para definir sua senha. Se o e-mail não chegar, use "Esqueci minha senha" na tela de login.',
    voltar: 'Voltar',
    ouSaibaMais: 'OU SAIBA MAIS',
    saibaMais: 'O que é o método CREED?',
  },
  respostasEnviadas: {
    titulo: 'Obrigado por responder',
    mensagem: 'Suas respostas foram enviadas.',
    voltar: 'Voltar',
  },
  formulario: {
    titulo: 'Formulário',
    secao: 'Seção',
    pergunta: 'Pergunta',
    de: 'de',
    quantitativa: 'Avalie cada afirmação de acordo com a sua experiência real.',
    escalaMinima: 'Discordo totalmente',
    escalaMaxima: 'Concordo totalmente',
    dissertativa:
      'Responda de forma breve e objetiva, com no máximo 200 palavras.',
    objetiva: 'Escolha a alternativa que melhor descreve a sua experiência.',
    textbox: 'Digite sua resposta aqui...',
    avancar: 'Avançar',
    voltar: 'Voltar',
    responderTudoAviso:
      'Responda as perguntas obrigatórias da seção para avançar.',
    semPerguntas: 'Este questionário ainda não tem perguntas.',
    jaRespondido: 'Você já respondeu este questionário.',
    concluido: 'Concluído',
    perguntasRespondidas: '{{respondidas}} de {{total}} respondidas',
    concluidoTitulo: 'Todas as perguntas respondidas',
    fimDasPerguntasTitulo: 'Você chegou ao fim das perguntas',
    concluidoMensagem: 'Revise suas respostas antes de enviar.',
    revisarEEnviar: 'Revisar e enviar',
    menuNavegacao: 'Navegação',
    menuPainel: 'Dashboard',
    menuPainelControle: 'Painel de controle',
    menuFormulario: 'Questionário',
    menuInformacoes: 'Sobre',
    menuSair: 'Sair',
    erros: {
      semQuestionarioAberto: 'Nenhum questionário aberto para você no momento.',
      semAcesso: 'Você não tem acesso a este questionário.',
      servicoIndisponivel:
        'Não foi possível falar com o servidor. Tente de novo.',
    },
  },
  onboardQuestionario: {
    titulo: 'Formulário',
    start: 'Vamos começar?',
    subtitulo: 'Você tem um questionário disponível',
    // TODO: "seu progresso ficará salvo" não é verdade hoje. As respostas só
    // vão para o back no envio, e recarregar a página perde o que foi digitado
    // (🟡 Premissa P-034, CREED-48). Trocar o texto ou salvar o progresso.
    mensagem:
      'Suas respostas ajudam a mapear o panorama da sua organização.\n É rápido e você pode pausar quando quiser, seu progresso ficará salvo',
    tempo: '~15 minutos',
    secao: '4 seções',
    iniciar: 'Iniciar',
  },
  onboardQuestionarioInfo: {
    titulo: 'Atualizar Informações',
    mensagem: 'Você gostaria de revisar seus dados pessoais?',
    revisarDados: 'Revisar dados',
    iniciarQuestionario: 'Iniciar questionário',
  },
  resultado: {
    // Nome de marca: igual em todo idioma.
    creedAi: 'Creed.ai',
    destaque: 'Destaque',
    oportunidade: 'Oportunidade',
    analise: 'Análise do Creed.ai',
    // Os textos do Creed.ai vêm vazios até a esteira de IA existir.
    analiseIndisponivel: 'Análise ainda não disponível.',
    recomendacao: 'Recomendação',
    resumoEmpresa: 'Resumo de {{empresa}}',
    taxaConclusao: 'Taxa de Conclusão',
    maisComum: 'Mais comum',
    metricas: 'Métricas',
  },
  dashboard: {
    titulo: 'Dashboard',
    erroAoCarregar: 'Não foi possível carregar o dashboard.',
    semResultado:
      'Você ainda não tem resultado. Ele aparece aqui depois que você enviar um questionário.',
    irParaQuestionario: 'Ir para o questionário',
    semResultadoMentorando:
      'Este mentorando ainda não tem resultado. Ele aparece aqui depois que o mentorando enviar um questionário.',
    voltarParaEmpresa: 'Voltar ao dashboard da empresa',
    // O seletor e o retrato atual da administradora.
    todasEmpresas: 'Todas as empresas',
    todosMentorandos: 'Todos os mentorandos',
    Empresa: 'Empresa',
    Mentorando: 'Mentorando',
    respostasEntre: 'Respostas de {{inicio}} a {{fim}}',
    mapaEmpresas: 'Empresas × prismas',
    mapaMentorandos: 'Mentorandos × prismas',
    semResultadoEmpresa:
      'Ainda não há resultados. Eles aparecem aqui depois que alguém responder um questionário.',
    // A descrição de cada prisma nos cards do resumo executivo.
    descricaoPrisma: {
      seguranca_psicologica:
        'A equipe demonstra abertura e confiança para compartilhar opiniões e experimentar.',
      lideranca_adaptativa:
        'Capacidade dos líderes e equipes de se adaptarem a mudanças rápidas de contexto.',
      cultura_empreendedora:
        'Estímulo à proatividade, senso de dono e busca contínua por inovação.',
      adaptabilidade_cognitiva:
        'Flexibilidade cognitiva para solucionar problemas e aprender com novas situações.',
      neuroinovacao_prisma:
        'Potencial de inteligência coletiva e geração de impacto relevante no mercado.',
    },
    Funcionario: 'Funcionário',
    Baixar: 'Baixar',
    erroAoExportarPdf: 'Não foi possível gerar o PDF do dashboard.',
    Periodo: 'Período',
    Setor: 'Setor',
    // Texto do ícone de informação ao lado do título de cada card.
    info: {
      sobre: 'Sobre: {{titulo}}',
      taxaConclusao:
        'Quantas das pessoas convidadas já terminaram o questionário.',
      destaque: 'O prisma com a maior nota.',
      oportunidade:
        'O prisma com a menor nota: onde há mais espaço para crescer.',
      maisComum:
        'O prisma que mais vezes é o ponto forte de cada pessoa do recorte.',
      variacao:
        'Quanto cada prisma subiu (▲) ou caiu (▼) em relação ao que está escolhido em "Comparar com".',
      prisma:
        'As notas dos cinco prismas, de 0 a 100. A linha cheia é o que está sendo exibido; a tracejada, a comparação.',
      dimensoes:
        'A média das respostas às afirmações de cada tema do questionário. Os prismas são calculados a partir delas.',
      alinhamento:
        'Se as pessoas do grupo deram notas parecidas em cada prisma (alinhado) ou se dividiram entre notas baixas e altas (dividido).',
      mapa: 'A nota de cada setor em cada prisma. A cor mostra se o setor está acima (verde) ou abaixo (amarelo) da empresa toda. Mostra sempre a empresa inteira no período escolhido.',
      creedPrisma: 'O que o Creed.ai leu sobre este prisma nas respostas.',
      creedRecomendacao: 'Um próximo passo sugerido pelo Creed.ai.',
      creedAnalise: 'A leitura geral dos resultados, escrita pelo Creed.ai.',
    },
  },
  organizations: {
    toasts: {
      tagAtualizada: 'Tag atualizada',
      tagAtualizadaDescricao: '{{nome}} agora está em {{tag}}.',
      tagRemovidaDescricao: '{{nome}} ficou sem tag.',
      erroTag: 'Não foi possível alterar a tag',
      membroExcluido: 'Membro excluído',
      membroExcluidoDescricao: '{{nome}} não tem mais acesso à plataforma.',
    },
    addMember: {
      name: {
        label: 'Nome',
        placeholder: 'Insira um nome',
      },
      email: {
        label: 'E-mail',
        placeholder: 'Insira um e-mail',
      },
      submit: 'Adicionar',
      role: {
        label: 'Função',
        options: { respondente: 'Respondente', gestor: 'Gestor' },
      },
    },
    members: {
      title: 'Membros',
      tags: {
        none: 'Sem tag',
        // Começa pelo texto visível, para quem aciona o botão pela voz.
        change: '{{tag}}: alterar a tag de {{name}}',
      },
      search: {
        name: {
          label: 'Pesquisar membros por nome',
          placeholder: 'Pesquise por nome',
        },
        email: {
          label: 'Pesquisar membros por email',
          placeholder: 'Pesquise por email',
        },
      },
      columns: 'Colunas',
      columnsMenu: 'Exibir colunas',
      table: 'Membros da empresa',
      selectPage: 'Selecionar todos os membros desta página',
      pagination: 'Paginação de membros',
      page: 'Página {{current}} de {{total}}',
      deleting: 'Excluindo…',
      deleteError: 'Não foi possível excluir o membro. Tente novamente.',
      loadError: 'Não foi possível carregar os membros da empresa.',
      selected_zero: '{{count}} de {{total}} linha(s) selecionada(s).',
      selected_one: '{{count}} de {{total}} linha(s) selecionada(s).',
      selected_other: '{{count}} de {{total}} linha(s) selecionada(s).',
      previous: 'Anterior',
      next: 'Próximo',
      empty: 'Nenhum membro associado à empresa.',
      emptySearch: 'Nenhum membro encontrado para essa pesquisa.',
      confirmDeleteTitle: 'Excluir membro',
      confirmDeleteDescription:
        'Remover {{name}} da lista de membros da empresa? Esta ação não pode ser desfeita.',
      delete: 'Excluir',
      sortByDate: 'Ordenar por data recente',
      sortByTag: 'Ordenar por tag',
      columnNames: {
        name: 'Nome',
        email: 'Email',
        status: 'Status',
        tag: 'Tag',
        updatedAt: 'Data recente',
        delete: 'Excluir',
      },
      // A resposta do período atual do membro, não o status do convite.
      status: {
        respondeu: 'Respondeu',
        pendente: 'Pendente',
        semPeriodo: 'Sem período',
      },
    },
    errors: {
      invalidName: 'Digite um nome de 2 a 200 caracteres.',
      invalidEmail: 'Digite um e-mail válido.',
      emailTaken: 'Este e-mail já tem acesso à plataforma.',
      inviteFailed: 'Não foi possível enviar o convite. Tente de novo.',
    },
  },
  aceite: {
    titulo: 'Solicitação de cadastro',
    responsavel: 'Responsável pelo cadastro',
    aceitar: 'Aceitar',
    rejeitar: 'Rejeitar',
    rejeitarConfirmacao: {
      titulo: 'Rejeitar empresa?',
      descricao:
        'Você vai rejeitar {{nome}}. A empresa não terá acesso à plataforma.',
      rejeitando: 'Rejeitando…',
    },
  },
  empresas: {
    toasts: {
      aprovada: 'Empresa aprovada',
      // 🟡 Premissa P-053 — aprovar manda o convite de gestor ao e-mail do
      // cadastro: o acesso só existe depois que a pessoa define a senha.
      aprovadaDescricao:
        'O convite de acesso de {{nome}} foi enviado ao e-mail do cadastro.',
      rejeitada: 'Empresa rejeitada',
      rejeitadaDescricao: '{{nome}} não terá acesso à plataforma.',
      erroAprovar: 'Não foi possível aprovar a empresa',
      naoAprovadaDescricao:
        'Ela pode já ter sido aprovada, ou o e-mail informado já tem acesso à plataforma. Se for o e-mail, rejeite o cadastro.',
      erroRejeitar: 'Não foi possível rejeitar a empresa',
      erroExcluir: 'Não foi possível excluir a empresa',
      excluida: 'Empresa excluída',
      excluidaDescricao: '{{nome}} foi removida da plataforma.',
    },
    titulo: 'Empresas',
    erroAoCarregar: 'Não foi possível carregar as empresas.',
    pesquisarNome: {
      label: 'Pesquisar empresas por nome',
      placeholder: 'Pesquise por nome',
    },
    pesquisarEmail: {
      label: 'Pesquisar empresas por email',
      placeholder: 'Pesquise por email',
    },
    colunas: {
      titulo: 'Colunas',
      aprovar: 'Aprovar',
      nome: 'Nome',
      email: 'Email',
      resultados: 'Resultados',
      status: 'Status',
      excluir: 'Excluir',
    },
    verResultados: 'Ver Resultados',
    status: { ativo: 'Ativo', pendente: 'Pendente', inativo: 'Inativo' },
    aprovar: 'Aprovar',
    anterior: 'Anterior',
    proxima: 'Próxima',
    selecionadas: '{{selecionadas}} de {{total}} linha(s) selecionada(s).',
    selecionarLinha: 'Selecionar {{nome}}',
    excluirEmpresa: 'Excluir {{nome}}',
    analisarCadastro: 'Pendente: analisar o cadastro de {{nome}}',
    confirmarExclusao: {
      titulo: 'Excluir empresa',
      descricao:
        'Excluir {{nome}} apaga a empresa, todos os membros dela, as respostas e os questionários. Não dá para desfazer.',
    },
    vazio: 'Nenhuma empresa encontrada.',
  },
  painelControle: {
    toasts: {
      conviteEnviado: 'Convite enviado',
      conviteEnviadoDescricao: '{{email}} vai receber o convite por e-mail.',
      questionarioNoAr: 'O questionário está no ar',
      questionarioNoArDescricao:
        'As respostas ficam abertas no período definido.',
    },
    controles: 'Controles',
    administradora: 'Administradora',
    titulo: 'Painel de Controle',
    membros: 'Membros',
    gerenciar: 'Gerenciar Questionário',
    adicionarMembro: 'Adicionar Membro',
    inicio: 'Início',
    termino: 'Término',
    confirmar: 'Confirmar',
    selecionarData: 'Data',
    selecionarHora: 'Hora',
    seletorHora: {
      hora: 'Hora',
      minuto: 'Min',
      opcaoHora: '{{hora}}h',
      valor: '{{hora}}h{{minuto}}',
    },
    erros: {
      inicioObrigatorio: 'Selecione a data de início.',
      horaInicioObrigatoria: 'Selecione o horário de início.',
      terminoObrigatorio: 'Selecione a data de término.',
      horaTerminoObrigatoria: 'Selecione o horário de término.',
      inicioNoPassado: 'A data de início não pode ser anterior a hoje.',
      horaInicioNoPassado:
        'O horário de início não pode ser anterior ao horário atual.',
      terminoAntesInicio:
        'A data de término não pode ser anterior à data de início.',
      horaTerminoAntesInicio:
        'O horário de término deve ser posterior ao horário de início.',
      periodoConflito:
        'Já existe um período nessas datas. Escolha datas que não cruzem com ele.',
      periodoFalhou: 'Não foi possível abrir o período. Tente de novo.',
      carregarPeriodo: 'Não foi possível carregar o período atual.',
    },
    periodo: {
      aberto: 'Período aberto',
      agendado: 'Período agendado',
      somenteLeitura:
        'Um período novo só pode ser marcado depois que este terminar.',
    },
  },
  adicionarMentorando: {
    titulo: 'Adicionar mentorando',
  },
};
