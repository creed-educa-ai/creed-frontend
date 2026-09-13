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

    escolher: 'Escolher',
    semResultado: 'Nenhuma opção encontrada',
    avancar: 'Avançar',
    pular: 'Pular',
    demograficos2: {
      etapa: 'Dados demográficos 2',
      titulo: 'Fale mais sobre você',
      subtitulo: 'Todas as respostas são opcionais!',
    },
    campos: {
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
};
