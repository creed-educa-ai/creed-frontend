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

    escolher: 'Choose',
    semResultado: 'No option found',
    avancar: 'Continue',
    pular: 'Skip',
    demograficos2: {
      etapa: 'Demographic data 2',
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
  },
};
