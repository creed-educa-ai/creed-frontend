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
      senhaCurta: 'Password must be at least 8 characters long.',
      confirmacaoObrigatoria: 'Confirm the new password.',
      senhasDivergentes: 'Passwords do not match.',
    },
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
