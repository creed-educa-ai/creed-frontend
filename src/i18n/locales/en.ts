import type { ptBR } from './pt-BR';

// pt-BR é a fonte da verdade: tipar por ele faz o TypeScript acusar chave
// faltando ou sobrando nas demais traduções.
export const en: typeof ptBR = {
  comum: {
    carregando: 'Loading…',
    semDado: '—',
    tenteRecarregar: 'Try reloading the page.',
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
};
