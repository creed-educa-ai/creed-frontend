import type { ptBR } from './pt-BR';

// pt-BR é a fonte da verdade: tipar por ele faz o TypeScript acusar chave
// faltando ou sobrando nas demais traduções.
export const en: typeof ptBR = {
  comum: {
    carregando: 'Loading…',
    semDado: '—',
    tenteRecarregar: 'Try reloading the page.',
    erros: {
      obrigatorio: 'Field is required',
    },
    acoes: {
      tentarNovamente: 'Try again',
      cancelar: 'Cancel',
      salvar: 'Save',
    },
    idioma: {
      rotulo: 'Language',
      'pt-BR': 'Portuguese',
      en: 'English',
    },
  },
  respondentes: {
    titulo: 'Respondents',
    vazio: 'No respondents yet. Register the first one to start collecting.',
    contagem_zero: '{{count}} people registered',
    contagem_one: '{{count}} person registered',
    contagem_other: '{{count}} people registered',
    idade_zero: '{{count}} years old',
    idade_one: '{{count}} year old',
    idade_other: '{{count}} years old',

    escolher: 'Choose',
    semResultado: 'No option found',
    avancar: 'Continue',
    pular: 'Skip',
    demograficos2: {
      clear: 'Clear {{field}}',
      remove: 'Remove {{option}}',
      invalidOption: 'Choose a valid option.',
      options: {
        gender: {
          feminino: 'Female',
          masculino: 'Male',
          nao_binario: 'Non-binary',
          prefiro_nao_informar: 'Prefer not to disclose',
        },
        ageRange: {
          '18_25': '18–25 years',
          '26_35': '26–35 years',
          '36_45': '36–45 years',
          '46_55': '46–55 years',
          '56_65': '56–65 years',
          '65_mais': '65+ years',
          prefiro_nao_informar: 'Prefer not to disclose',
        },
        ethnicity: {
          africana_afrodescendente: 'African or Afro-descendant',
          indigena_amerindia: 'Indigenous / Amerindian',
          europeia: 'European (e.g. Portuguese, Italian, Spanish, German)',
          asiatica: 'Asian (e.g. Japanese, Chinese, Korean, Indian)',
          arabe_medio_oriente: 'Arab or Middle Eastern',
          latino_americana: 'Latin American (except Brazil)',
          romani_cigana: 'Romani / Gypsy',
          multipla_hibrida: 'Multiple / Mixed',
          prefiro_nao_responder: 'Prefer not to answer',
        },
        religion: {
          crista: 'Christian (any denomination)',
          judaica: 'Jewish',
          islamica: 'Islamic',
          matriz_africana:
            'African-derived religions (e.g. Candomblé, Umbanda)',
          espiritismo: 'Spiritism / Spirituality',
          budismo: 'Buddhism',
          sem_religiao: 'No religion / Non-practicing',
          outra: 'Other',
          prefiro_nao_responder: 'Prefer not to answer',
        },
        nationality: {
          brasileira: 'Brazilian',
          portuguesa: 'Portuguese',
          outra: 'Other',
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
          norte: 'North',
          centro: 'Centre',
          area_metropolitana_lisboa: 'Lisbon Metropolitan Area',
          alentejo: 'Alentejo',
          algarve: 'Algarve',
          acores: 'Azores',
          madeira: 'Madeira',
        },
      },
      titulo: 'Tell us more about you',
      subtitulo: 'All answers are optional!',
    },
    campos: {
      genero: 'Gender (optional)',
      faixaEtaria: 'Age range (optional)',
      origemEtnica: 'Ethnic background (optional)',
      religiao: 'Religion (optional)',
      nacionalidade: 'Nationality (optional)',
      nacionalidadeOutra: 'Which nationality?',
      estado: 'State',
      regiao: 'Region',
    },
    demograficos3: {
      titulo: 'Briefly share your perspective',
      subtitulo: 'Open question - optional',
      pergunta:
        'How did your family upbringing influence, or not, your entrepreneurial or innovative path? Briefly explain (optional)',
      placeholder: 'Your answer',
    },
  },
  boasVindas: {
    titulo: 'Welcome!',
    apresentacao:
      'CREED.ai Educa is a competency assessment platform for organizations in transformation, bringing together Human Plasticity and Neuroinnovative Intelligence for Education, Entrepreneurship and Organizations in Transformation.',
    entrar: {
      chamada: 'Already have access? Sign in to your account.',
      acao: 'Sign in',
    },
    criarConta: {
      chamada: 'Account creation is available to companies only.',
      acao: 'Create account',
    },
    saibaMais: 'Learn more about the platform',
    faleConosco: 'Contact us',
    tagline:
      'Competency assessment that shows your team clearly, with no spreadsheets and no guesswork.',
  },
  sobre: {
    titulo: 'About',
    subtitulo: 'More information about Creed.ai',
    // TODO placeholder: texto institucional definitivo ainda não definido com a cliente.
    texto:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    voltar: 'Back',
  },
  cadastro: {
    titulo: 'Create your account',
    subtitulo: 'Enter your details to continue',
    campos: {
      nomeEmpresa: {
        rotulo: 'Company Name',
        placeholder: 'Enter the company name',
      },
      documento: {
        rotulo: 'Document (CPF/CNPJ)',
        placeholder: 'Enter the company document',
      },
      email: {
        rotulo: 'Company Email',
        placeholder: 'Enter the company email',
      },
      nomeCompleto: {
        rotulo: 'Your Full Name',
        placeholder: 'Enter your full name',
      },
      telefone: {
        rotulo: 'Phone',
        placeholder: 'Enter your phone number',
      },
    },
    botaoAvancar: 'Continue',
    textoLogin: 'Already have an account?',
    linkLogin: 'Login',
    painelDescricao:
      'Competency assessment that shows your team clearly, without spreadsheets and without guesswork.',
  },

  autenticacao: {
    login: {
      titulo: 'Sign in to your account',
      subtitulo: 'Use the email registered by your company.',
      email: { rotulo: 'Email', placeholder: 'you@yourcompany.com' },
      senha: { rotulo: 'Password', placeholder: 'Enter your password' },
      lembrarDeMim: 'Remember me',
      esqueciSenha: 'Forgot my password',
      entrar: 'Sign in',
      semConta: 'Your company does not have an account yet?',
      criarConta: 'Create account',
      painelTitulo: 'Good to have you here.',
      painelDescricao:
        'Competency assessment that shows your team clearly, without spreadsheets and without guesswork.',
    },
    primeiroAcesso: {
      titulo: 'Change your password',
      subtitulo: 'Enter a new password for your account',
      campoNovaSenha: 'Enter a new password',
      campoConfirmarSenha: 'Confirm your new password',
      avancar: 'Continue',
      boasVindasTitulo: 'Welcome',
      boasVindasMensagem:
        'This is your first access. To continue, choose a new password.',
    },
    erros: {
      emailInvalido: 'Enter a valid email.',
      loginInvalido: 'Unable to sign in with these credentials.',
      servicoIndisponivel:
        'Sign-in is unavailable right now. Please try again.',
      senhaCurta: 'Password must be at least 8 characters long.',
      confirmacaoObrigatoria: 'Confirm the new password.',
      senhasDivergentes: 'Passwords do not match.',
    },
  },

  termo: {
    titulo: 'INFORMED, CLARIFIED AND FREE CONSENT FORM',
    corpo:
      'Investigação: Culturally Responsive Entrepreneurship Education (CREED) \nInstituição: Universidade Aberta (UAb) — Portugal \nInvestigadora responsável: Naira Libermann · 2406837@estudante.uab.pt \nOrientador: Doutor Manuel Jacinto de Ascensão Jardim · jacinto.jardim@uab.pt \nOBJETIVO: Compreender o impacto das abordagens multiculturais na educação empreendedora. \nPARTICIPAÇÃO: Instrumento de autorrelato com 49 itens Likert em 7 dimensões + 4 questões abertas (~15 min). \nCONFIDENCIALIDADE: Dados tratados de forma estritamente confidencial, analisados de forma agregada e anonimizados. \nVOLUNTARIEDADE: Participação inteiramente voluntária e gratuita. Pode retirar o consentimento a qualquer momento. \nBASE LEGAL: RGPD (UE) 2016/679 · Lei n.º 58/2019 (Portugal) · LGPD Lei nº 13.709/2018 (Brasil)',
    aceitar: 'Accept',
    recusar: 'Decline',
  },
  contato: {
    titulo: 'Contact us',
    email: 'Email',
    telefone: 'Phone',
  },

  aguardeConfirmacao: {
    titulo: 'Await confirmation',
    mensagem:
      'Your data has been submitted and is awaiting approval. After confirmation, try logging in again.',
    voltar: 'Back',
    ouSaibaMais: 'OR LEARN MORE',
    saibaMais: 'What is the CREED method?',
  },
};
