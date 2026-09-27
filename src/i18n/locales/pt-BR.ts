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
    navegacao: {
      voltar: 'Voltar',
      irParaBoasVindas: 'Ir para a tela de boas-vindas',
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
    subtitulo: 'Mais informações sobre o Creed.ai',
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
    painelDescricao:
      'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
  },

  autenticacao: {
    login: {
      titulo: 'Entre na sua conta',
      subtitulo: 'Acesse com o e-mail cadastrado pela sua empresa.',
      email: { rotulo: 'E-mail', placeholder: 'voce@suaempresa.com.br' },
      senha: { rotulo: 'Senha', placeholder: 'Digite sua senha' },
      lembrarDeMim: 'Lembrar de mim',
      esqueciSenha: 'Esqueci minha senha',
      entrar: 'Entrar',
      semConta: 'Sua empresa ainda não tem conta?',
      criarConta: 'Criar conta',
      painelTitulo: 'Que bom ter você aqui.',
      painelDescricao:
        'Avaliação de competências que mostra o seu time com clareza, sem planilha e sem achismo.',
    },
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
      emailInvalido: 'Digite um e-mail válido.',
      loginInvalido: 'Não foi possível entrar com esses dados.',
      servicoIndisponivel: 'Não foi possível entrar agora. Tente novamente.',
      senhaCurta: 'A senha precisa ter pelo menos 8 caracteres.',
      confirmacaoObrigatoria: 'Confirme a nova senha.',
      senhasDivergentes: 'As senhas não coincidem.',
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
      'Seus dados foram enviados e aguardam aprovação. Após a confirmação, tente realizar o login novamente.',
    voltar: 'Voltar',
    ouSaibaMais: 'OU SAIBA MAIS',
    saibaMais: 'O que é o método CREED?',
  },
  formulario: {
    titulo: 'Formulário',
    secao: 'Seção',
    pergunta: 'Pergunta',
    de: 'de',
    quantitativa:
      'Avalie cada afirmação de acordo com a sua experiência real:\n 1 = Discordo totalmente e 5 = Concordo totalmente',
    dissertativa:
      'Responda de forma breve e objetiva, com no máximo 200 palavras.',
    objetiva: 'Escolha a alternativa que melhor descreve a sua experiência.',
    textbox: 'Digite sua resposta aqui...',
    pergunta1:
      'Tenho ou já tive experiência como fundador(a) ou sócio(a) de um negócio.',
    pergunta2:
      'Atuo ou já atuei como intraempreendedor(a), propondo e liderando iniciativas inovadoras dentro de organizações.',
    pergunta3:
      'Participo ou já participei ativamente do desenvolvimento de novos produtos, serviços ou modelos de negócio.',
    pergunta4:
      'Valorizo e promovo a diversidade cultural nas práticas do meu contexto institucional.',
    pergunta5:
      'Qual das seguintes opções melhor descreve sua atuação em relação ao multiculturalismo na educação?',
    pergunta5o1:
      'Reconheço a importância da diversidade cultural, mas ainda estou desenvolvendo práticas inclusivas',
    pergunta5o2:
      'Integro perspectivas culturais diversas regularmente em minhas atividades educacionais',
    pergunta5o3:
      'Promovo ativamente diálogos interculturais e valorizo diferentes visões de mundo em meu contexto',
    pergunta5o4:
      'Lidero iniciativas que transformam a instituição para ser verdadeiramente multicultural e inclusiva',
    pergunta5o5:
      'Trabalho para eliminar barreiras culturais e promover equidade entre diferentes grupos na educação',
    pergunta6:
      'Descreva uma experiência em que você promoveu a diversidade cultural ou inclusão em um contexto educacional, explicando como isso impactou os envolvidos e que aprendizados você obteve.',
    avancar: 'Avançar',
    voltar: 'Voltar',
    restante: '~15 minutos restantes',
    finalizado: 'Formulário finalizado!',
    obrigado:
      'Obrigado pela sua participação! Suas respostas foram enviadas com sucesso.',
  },
};
