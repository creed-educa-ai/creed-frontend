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
};
