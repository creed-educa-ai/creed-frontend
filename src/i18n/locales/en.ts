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
};
