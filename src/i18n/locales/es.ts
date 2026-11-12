import type { ptBR } from './pt-BR';

// pt-BR é a fonte da verdade: tipar por ele faz o TypeScript acusar chave
// faltando ou sobrando nas demais traduções.
export const es: typeof ptBR = {
  comum: {
    tenteNovamenteEmInstantes: 'Inténtalo de nuevo en unos instantes.',
    // Região dos toasts (src/components/ui/sonner.tsx).
    notificacoes: 'Notificaciones',
    // Setores (`DepartmentType` do back): tags, filtros e o mapa.
    setores: {
      Marketing: 'Marketing',
      Financeiro: 'Finanzas',
      Administrativo: 'Administración',
      RecursosHumanos: 'RR. HH.',
      TecnologiaInformacao: 'TI',
    },
    // Textos que as tabelas compartilham (src/components/table).
    tabela: {
      ordenarPorNome: 'Ordenar por nombre',
      ordenarPorStatus: 'Ordenar por estado',
      paginacao: 'Paginación',
      pagina: 'Página {{current}} de {{total}}',
      anterior: 'Anterior',
      proximo: 'Siguiente',
      selecionadas: '{{count}} de {{total}} fila(s) seleccionada(s).',
      excluir: 'Eliminar',
      excluindo: 'Eliminando…',
      erroExcluir: 'No se pudo eliminar. Inténtalo de nuevo.',
    },
    carregando: 'Cargando…',
    semDado: '—',
    tenteRecarregar: 'Intenta recargar la página.',
    erros: {
      obrigatorio: 'El campo es obligatorio',
    },
    acoes: {
      fechar: 'Cerrar',
      tentarNovamente: 'Intentar de nuevo',
      cancelar: 'Cancelar',
      salvar: 'Guardar',
    },
    navegacao: {
      voltar: 'Volver',
      irParaBoasVindas: 'Ir a la página de bienvenido',
    },
    idioma: {
      rotulo: 'Idioma',
      'pt-BR': 'Portugués',
      en: 'Inglés',
      es: 'Español',
    },
  },
  respondentes: {
    titulo: 'Encuestados',
    vazio:
      'Aún no hay encuestados. Registra al primero para comenzar a recopilar.',
    contagem_zero: '{{count}} personas registradas',
    contagem_one: '{{count}} persona registrada',
    contagem_other: '{{count}} personas registradas',
    idade_zero: '{{count}} años',
    idade_one: '{{count}} año',
    idade_other: '{{count}} años',

    escolher: 'Elegir',
    semResultado: 'No se encontró ninguna opción',
    avancar: 'Continuar',
    pular: 'Omitir',

    demograficos1: {
      titulo: '¡Comencemos! ¿Cuál es tu nombre?',
      descricaoNome: 'Este es el nombre que verán los demás usuarios',
      nomeObrigatorio: 'Ingresa tu nombre para continuar.',
    },

    demograficos2: {
      clear: 'Borrar {{field}}',
      remove: 'Quitar {{option}}',
      invalidOption: 'Elige una opción válida.',
      options: {
        gender: {
          feminino: 'Femenino',
          masculino: 'Masculino',
          nao_binario: 'No binario',
          prefiro_nao_informar: 'Prefiero no informar',
        },
        ageRange: {
          '18_25': '18–25 años',
          '26_35': '26–35 años',
          '36_45': '36–45 años',
          '46_55': '46–55 años',
          '56_65': '56–65 años',
          '65_mais': 'Más de 65 años',
          prefiro_nao_informar: 'Prefiero no informar',
        },
        ethnicity: {
          africana_afrodescendente: 'Africana o afrodescendiente',
          indigena_amerindia: 'Indígena / Amerindia',
          europeia: 'Europea (p. ej., portuguesa, italiana, española, alemana)',
          asiatica: 'Asiática (p. ej., japonesa, china, coreana, india)',
          arabe_medio_oriente: 'Árabe o de Oriente Medio',
          latino_americana: 'Latinoamericana (excepto Brasil)',
          romani_cigana: 'Romaní / Gitana',
          multipla_hibrida: 'Múltiple / Mixta',
          prefiro_nao_responder: 'Prefiero no responder',
        },
        religion: {
          crista: 'Cristiana (cualquier denominación)',
          judaica: 'Judía',
          islamica: 'Islámica',
          matriz_africana:
            'Religiones de matriz africana (p. ej., Candomblé, Umbanda)',
          espiritismo: 'Espiritismo / Espiritualidad',
          budismo: 'Budismo',
          sem_religiao: 'Sin religión / No practicante',
          outra: 'Otra',
          prefiro_nao_responder: 'Prefiero no responder',
        },
        nationality: {
          brasileira: 'Brasileña',
          portuguesa: 'Portuguesa',
          outra: 'Otra',
        },
        brazilState: {
          AC: 'Acre',
          AL: 'Alagoas',
          AP: 'Amapá',
          AM: 'Amazonas',
          BA: 'Bahía',
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
          RJ: 'Río de Janeiro',
          RN: 'Río Grande del Norte',
          RS: 'Río Grande del Sur',
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
          acores: 'Azores',
          madeira: 'Madeira',
        },
      },
      titulo: 'Cuéntanos más sobre ti',
      subtitulo: '¡Todas las respuestas son opcionales!',
    },
    campos: {
      nome: 'Nombre',
      nomePlaceholder: 'Tu nombre completo',
      genero: 'Género (opcional)',
      faixaEtaria: 'Rango de edad (opcional)',
      origemEtnica: 'Origen étnico (opcional)',
      religiao: 'Religión (opcional)',
      nacionalidade: 'Nacionalidad (opcional)',
      nacionalidadeOutra: '¿Cuál nacionalidad?',
      estado: 'Estado',
      regiao: 'Región',
    },
    demograficos3: {
      titulo: 'Comparte brevemente tu perspectiva',
      subtitulo: 'Pregunta abierta - opcional',
      pergunta:
        '¿Cómo influyó, o no, tu crianza familiar en tu trayectoria emprendedora o innovadora? Explica brevemente (opcional)',
      placeholder: 'Tu respuesta',
    },
  },
  questionarioRevisao: {
    titulo: 'Revisa y envía tus respuestas',
    descricao: 'Verifica tus respuestas antes de finalizar el cuestionario.',
    semPerguntas: 'No hay respuestas para revisar.',
    pergunta: 'Pregunta',
    resposta: 'Respuesta',
    acoes: 'Acciones',
    revisar: 'Revisar',
    revisarPergunta: 'Revisar pregunta {{numero}}',
    respostaEscala: '{{valor}} (en una escala del 1 al 5)',
    gerarPdf: 'Generar PDF',
    modalTitulo: 'Revisar pregunta {{numero}}',
    selecioneResposta: 'Selecciona tu respuesta',
    escalaMinima: 'Totalmente en desacuerdo',
    escalaMaxima: 'Totalmente de acuerdo',
    cancelar: 'Cancelar',
    salvarResposta: 'Guardar respuesta',
    enviar: 'Enviar respuestas',
    confirmarEnvioTitulo: '¿Enviar tus respuestas?',
    confirmarEnvioDescricao:
      'Después del envío, tus respuestas quedarán registradas para su evaluación.',
    confirmarEnvio: 'Confirmar envío',
    enviado: 'Respuestas enviadas.',
    enviando: 'Enviando…',
    erros: {
      jaRespondido: 'Ya has respondido este cuestionario.',
      envioFalhou: 'No se pudo enviar. Inténtalo de nuevo.',
    },
    obrigatoria: 'Obligatoria',
    respostaObrigatoria: 'Esta pregunta es obligatoria.',
    semResposta: 'Sin respuesta',
    obrigatoriasPendentes_one: '{{count}} pregunta obligatoria sin responder.',
    obrigatoriasPendentes_other:
      '{{count}} preguntas obligatorias sin responder.',
    respostaDissertativaPlaceholder: 'Escribe tu respuesta',
  },
  dashboardPrisma: {
    titulo: 'Prisma de competencias',
    prisma: 'Prisma',
    periodoAtual: 'Período actual',
    periodoComparado: 'Período comparado',
    descricaoComComparacao:
      'Resultados de {{atual}} comparados con {{comparado}}.',
    descricaoSemComparacao: 'Resultados del período {{atual}}.',
    compararCom: 'Comparar con',
    semComparacao: 'Sin comparación',
    prismas: {
      seguranca_psicologica: 'Seguridad Psicológica',
      lideranca_adaptativa: 'Liderazgo Adaptativo',
      cultura_empreendedora: 'Cultura Emprendedora',
      adaptabilidade_cognitiva: 'Adaptabilidad Cognitiva',
      neuroinovacao_prisma: 'Neuroinnovación',
    },
    // As sete dimensões da Matriz CREED (`Dimension` do back).
    dimensoes: {
      titulo: 'Desempeño por dimensión',
      nomes: {
        S2: 'Vivencia y Competencias Emprendedoras',
        S4: 'Multiculturalismo en la Educación',
        S5A: 'Metodologías de Innovación',
        S5B: 'Aprendizaje y Metacognición',
        S6: 'Enseñanza Culturalmente Receptiva',
        S7: 'Competencias Culturales, Receptivas y Emprendedoras',
        S8: 'Innovación e Impacto Social',
      },
    },
    mapa: {
      semSetores: 'Esta organización todavía no tiene sectores registrados.',
      titulo: 'Sectores × prismas',
      subtitulo: '{{periodo}} · diferencia con la empresa',
      diferenca: 'diferencia con la empresa',
      acima: 'Por encima de la empresa',
      abaixo: 'Por debajo de la empresa',
      neutro: 'Sin color: diferencia menor que 3 puntos',
      respostas: '{{total}} respuestas',
    },
    alinhamento: {
      titulo: 'Alineación del equipo',
      respostas: '{{exibido}} · {{total}} respuestas',
      total: '{{total}} respuestas',
      semRespostas: 'Todavía no hay respuestas en este recorte.',
      faixas: {
        baixa: 'Baja (hasta 40)',
        media: 'Media (40 a 70)',
        alta: 'Alta (más de 70)',
      },
      niveis: {
        alinhado: 'Alineado',
        moderado: 'Moderado',
        dividido: 'Dividido',
      },
      leitor: '{{baixa}} con nota baja, {{media}} media y {{alta}} alta.',
    },
    variacao: {
      titulo: 'Variación por prisma',
      comparadoCom: '{{exibido}} en relación con {{referencia}}',
      semComparacao: '{{exibido}}, sin comparación.',
      emRelacaoA: 'en relación con',
      semReferencia: 'sin comparación',
      aumentou: 'subió {{valor}}',
      diminuiu: 'bajó {{valor}}',
      estavel: 'sin variación',
    },
  },
  boasVindas: {
    titulo: '¡Bienvenido!',
    apresentacao:
      'CREED.ai Educa es una plataforma de evaluación de competencias para organizaciones en transformación, que reúne la Plasticidad Humana y la Inteligencia Neuroinnovadora para la Educación, el Emprendimiento y las Organizaciones en Transformación.',
    entrar: {
      chamada: '¿Ya tienes acceso? Inicia sesión en tu cuenta.',
      acao: 'Iniciar sesión',
    },
    criarConta: {
      chamada: 'La creación de cuentas está disponible solo para empresas.',
      acao: 'Crear cuenta',
    },
    saibaMais: 'Conoce más sobre la plataforma',
    faleConosco: 'Contáctanos',
    tagline:
      'Evaluación de competencias que muestra a tu equipo con claridad, sin hojas de cálculo y sin conjeturas.',
  },
  sobre: {
    titulo: 'Acerca de',
    // TODO placeholder: texto institucional definitivo ainda não definido com a cliente.
    texto:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    voltar: 'Volver',
  },
  cadastro: {
    titulo: 'Crea tu cuenta',
    subtitulo: 'Ingresa tus datos para continuar',
    campos: {
      nomeEmpresa: {
        rotulo: 'Nombre de la empresa',
        placeholder: 'Ingresa el nombre de la empresa',
      },
      documento: {
        rotulo: 'Documento (CPF/CNPJ)',
        placeholder: 'Ingresa el documento de la empresa',
      },
      email: {
        rotulo: 'Correo electrónico de la empresa',
        placeholder: 'Ingresa el correo electrónico de la empresa',
      },
      nomeCompleto: {
        rotulo: 'Tu nombre completo',
        placeholder: 'Ingresa tu nombre completo',
      },
      telefone: {
        rotulo: 'Teléfono',
        placeholder: 'Ingresa tu número de teléfono',
      },
    },
    botaoAvancar: 'Continuar',
    textoLogin: '¿Ya tienes una cuenta?',
    linkLogin: 'Iniciar sesión',
    painelDescricao:
      'Evaluación de competencias que muestra a tu equipo con claridad, sin hojas de cálculo y sin conjeturas.',
  },

  autenticacao: {
    login: {
      titulo: 'Inicia sesión en tu cuenta',
      subtitulo: 'Usa el correo electrónico registrado por tu empresa.',
      email: { rotulo: 'Correo electrónico', placeholder: 'tu@tuempresa.com' },
      senha: {
        rotulo: 'Contraseña',
        placeholder: 'Ingresa tu contraseña',
        mostrar: 'Mostrar contraseña',
        ocultar: 'Ocultar contraseña',
      },
      lembrarDeMim: 'Recordarme',
      esqueciSenha: 'Olvidé mi contraseña',
      entrar: 'Iniciar sesión',
      semConta: '¿Tu empresa aún no tiene una cuenta?',
      criarConta: 'Crear cuenta',
      painelTitulo: 'Qué bueno tenerte aquí.',
      painelDescricao:
        'Evaluación de competencias que muestra a tu equipo con claridad, sin hojas de cálculo y sin conjeturas.',
    },
    recuperarSenha: {
      titulo: '¿Olvidaste tu contraseña?',
      subtitulo:
        'Ingresa el correo electrónico de tu cuenta para recibir un enlace de nueva contraseña.',
      email: { rotulo: 'Correo electrónico', placeholder: 'tu@tuempresa.com' },
      enviar: 'Enviar enlace',
      enviado:
        'Si este correo electrónico tiene acceso, enviamos un enlace para definir una nueva contraseña.',
      painelTitulo: 'Recuperemos tu acceso.',
      painelDescricao:
        'El enlace llega por correo electrónico y abre la página donde defines tu nueva contraseña.',
    },
    erros: {
      emailInvalido: 'Ingresa un correo electrónico válido.',
      loginInvalido: 'No fue posible iniciar sesión con estas credenciales.',
      servicoIndisponivel:
        'El inicio de sesión no está disponible en este momento. Inténtalo de nuevo.',
      envioIndisponivel:
        'No fue posible enviar el enlace en este momento. Inténtalo de nuevo.',
    },
  },

  mentees: {
    questionnaireDialog: {
      title: 'Cuestionario de {{name}}',
      description:
        'Define el período en que {{name}} puede responder el cuestionario.',
    },
    toasts: {
      questionnaireSaved: '{{name}} ya puede responder en el período definido.',
      deleted: 'Mentoreado eliminado',
      deletedDescription: '{{nome}} ya no tiene acceso a la plataforma.',
    },
    title: 'Mentorados',
    loadError: 'No se pudieron cargar los mentorados.',
    search: {
      name: {
        label: 'Buscar mentorados por nombre',
        placeholder: 'Buscar por nombre',
      },
      email: {
        label: 'Buscar mentorados por correo',
        placeholder: 'Buscar por correo',
      },
    },
    columnsMenu: 'Columnas',
    select: { all: 'Seleccionar todos', row: 'Seleccionar {{name}}' },
    columns: {
      name: 'Nombre',
      email: 'Correo',
      questionnaire: 'Cuestionario',
      results: 'Resultados',
      status: 'Estado',
      delete: 'Eliminar',
    },
    actions: {
      edit: 'Editar',
      viewResults: 'Ver resultados',
      delete: 'Eliminar',
      editFor: 'Editar cuestionario de {{name}}',
      viewResultsFor: 'Ver resultados de {{name}}',
      deleteFor: 'Eliminar a {{name}}',
    },
    status: { active: 'Activo', inactive: 'Inactivo' },
    empty: 'Aún no hay mentorados registrados.',
    noResults: 'Ningún mentorado coincide con la búsqueda.',
    confirmDelete: {
      title: '¿Eliminar mentorado?',
      description: '¿Seguro que quieres eliminar a {{name}}?',
      confirm: 'Eliminar',
    },
  },
  termo: {
    titulo: 'FORMULARIO DE CONSENTIMIENTO LIBRE, INFORMADO Y ACLARADO',
    corpo:
      'Investigação: Culturally Responsive Entrepreneurship Education (CREED) \nInstituição: Universidade Aberta (UAb) — Portugal \nInvestigadora responsável: Naira Libermann · 2406837@estudante.uab.pt \nOrientador: Doutor Manuel Jacinto de Ascensão Jardim · jacinto.jardim@uab.pt \nOBJETIVO: Compreender o impacto das abordagens multiculturais na educação empreendedora. \nPARTICIPAÇÃO: Instrumento de autorrelato com 49 itens Likert em 7 dimensões + 4 questões abertas (~15 min). \nCONFIDENCIALIDADE: Dados tratados de forma estritamente confidencial, analisados de forma agregada e anonimizados. \nVOLUNTARIEDADE: Participação inteiramente voluntária e gratuita. Pode retirar o consentimento a qualquer momento. \nBASE LEGAL: RGPD (UE) 2016/679 · Lei n.º 58/2019 (Portugal) · LGPD Lei nº 13.709/2018 (Brasil)',
    aceitar: 'Aceptar',
    recusar: 'Rechazar',
  },
  contato: {
    titulo: 'Contáctanos',
    email: 'Correo electrónico',
    telefone: 'Teléfono',
  },

  aguardeConfirmacao: {
    titulo: 'Espera la confirmación',
    mensagem:
      'Tus datos fueron enviados y están pendientes de aprobación. Después de la confirmación, intenta iniciar sesión de nuevo.',
    voltar: 'Volver',
    ouSaibaMais: 'O CONOCE MÁS',
    saibaMais: '¿Qué es el método CREED?',
  },
  respostasEnviadas: {
    titulo: 'Gracias por responder',
    mensagem: 'Tus respuestas han sido enviadas.',
    voltar: 'Volver',
  },
  formulario: {
    titulo: 'Formulario',
    secao: 'Sección',
    pergunta: 'Pregunta',
    de: 'de',
    quantitativa: 'Evalúa cada afirmación según tu experiencia real.',
    escalaMinima: 'Totalmente en desacuerdo',
    escalaMaxima: 'Totalmente de acuerdo',
    dissertativa:
      'Responde de forma breve y objetiva, con un máximo de 200 palabras.',
    objetiva: 'Elige la alternativa que mejor describa tu experiencia.',
    textbox: 'Escribe tu respuesta aquí...',
    avancar: 'Siguiente',
    voltar: 'Volver',
    responderTudoAviso:
      'Responde las preguntas obligatorias de la sección para continuar.',
    semPerguntas: 'Este cuestionario aún no tiene preguntas.',
    concluido: 'Completado',
    perguntasRespondidas: '{{respondidas}} de {{total}} respondidas',
    concluidoTitulo: 'Todas las preguntas respondidas',
    fimDasPerguntasTitulo: 'Has llegado al final de las preguntas',
    concluidoMensagem: 'Revisa tus respuestas antes de enviarlas.',
    revisarEEnviar: 'Revisar y enviar',
    menuNavegacao: 'Navegación',
    menuPainel: 'Dashboard',
    menuPainelControle: 'Panel de control',
    menuFormulario: 'Cuestionario',
    menuInformacoes: 'Acerca de',
    menuSair: 'Cerrar sesión',
    erros: {
      naoEncontrado: 'Cuestionario no encontrado.',
      semAcesso: 'No tienes acceso a este cuestionario.',
      servicoIndisponivel:
        'No se pudo establecer conexión con el servidor. Inténtalo de nuevo.',
    },
  },
  onboardQuestionario: {
    titulo: 'Formulario',
    start: '¿Comenzamos?',
    subtitulo: 'Tienes un cuestionario disponible',
    mensagem:
      'Tus respuestas nos ayudan a mapear el panorama de tu organización.\n Es rápido y puedes pausar cuando quieras, tu progreso quedará guardado',
    tempo: '~15 minutos',
    secao: '4 secciones',
    iniciar: 'Comenzar',
  },
  onboardQuestionarioInfo: {
    titulo: 'Actualizar información',
    mensagem: '¿Quieres revisar tus datos personales?',
    revisarDados: 'Revisar datos',
    iniciarQuestionario: 'Comenzar cuestionario',
  },
  resultado: {
    // Nome de marca: igual em todo idioma.
    creedAi: 'Creed.ai',
    destaque: 'Destacado',
    oportunidade: 'Oportunidad',
    analise: 'Análisis de Creed.ai',
    recomendacao: 'Recomendación',
    resumoEmpresa: 'Resumen de {{empresa}}',
    taxaConclusao: 'Tasa de Finalización',
    maisComum: 'Más común',
    metricas: 'Métricas',
  },
  dashboard: {
    titulo: 'Dashboard',
    erroAoCarregar: 'No se pudo cargar el dashboard.',
    Funcionario: 'Empleado',
    Baixar: 'Descargar',
    erroAoExportarPdf: 'No se pudo generar el PDF del dashboard.',
    Periodo: 'Período',
    Setor: 'Sector',
    // Texto do ícone de informação ao lado do título de cada card.
    info: {
      sobre: 'Sobre: {{titulo}}',
      taxaConclusao:
        'Cuántas de las personas invitadas ya terminaron el cuestionario.',
      destaque: 'El prisma con la nota más alta.',
      oportunidade:
        'El prisma con la nota más baja: donde hay más espacio para crecer.',
      maisComum: 'El prisma con la nota más cercana al promedio.',
      variacao:
        'Cuánto subió (▲) o bajó (▼) cada prisma en relación con lo elegido en "Comparar con".',
      prisma:
        'Las notas de los cinco prismas, de 0 a 100. La línea continua es lo que se muestra; la discontinua, la comparación.',
      dimensoes:
        'El promedio de las respuestas a cada tema del cuestionario. Los prismas se calculan a partir de ellas.',
      alinhamento:
        'Si las personas del grupo dieron notas parecidas en cada prisma (alineado) o se dividieron entre notas bajas y altas (dividido).',
      mapa: 'La nota de cada sector en cada prisma. El color muestra si el sector está por encima (verde) o por debajo (amarillo) de toda la empresa. Muestra siempre toda la empresa en el período elegido.',
      creedPrisma: 'Lo que Creed.ai leyó sobre este prisma en las respuestas.',
      creedRecomendacao: 'Un próximo paso sugerido por Creed.ai.',
      creedAnalise:
        'La lectura general de los resultados, escrita por Creed.ai.',
    },
  },
  organizations: {
    toasts: {
      tagAtualizada: 'Etiqueta actualizada',
      tagAtualizadaDescricao: '{{nome}} ahora está en {{tag}}.',
      tagRemovidaDescricao: '{{nome}} se quedó sin etiqueta.',
      erroTag: 'No se pudo cambiar la etiqueta',
      membroExcluido: 'Miembro eliminado',
      membroExcluidoDescricao: '{{nome}} ya no tiene acceso a la plataforma.',
    },
    addMember: {
      name: {
        label: 'Nombre',
        placeholder: 'Ingresa un nombre',
      },
      email: {
        label: 'Correo',
        placeholder: 'Ingresa un correo',
      },
      submit: 'Agregar',
      role: {
        label: 'Función',
        options: { respondente: 'Encuestado', gestor: 'Gestor' },
      },
    },
    members: {
      title: 'Miembros',
      tags: {
        none: 'Sin etiqueta',
        change: '{{tag}}: cambiar la etiqueta de {{name}}',
      },
      search: {
        name: {
          label: 'Buscar miembros por nombre',
          placeholder: 'Buscar por nombre',
        },
        email: {
          label: 'Buscar miembros por correo',
          placeholder: 'Buscar por correo',
        },
      },
      columns: 'Columnas',
      columnsMenu: 'Mostrar columnas',
      table: 'Miembros de la empresa',
      selectPage: 'Seleccionar todos los miembros de esta página',
      pagination: 'Paginación de miembros',
      page: 'Página {{current}} de {{total}}',
      deleting: 'Eliminando…',
      deleteError: 'No se pudo eliminar al miembro. Inténtalo de nuevo.',
      loadError: 'No se pudieron cargar los miembros de la empresa.',
      selected_zero: '{{count}} de {{total}} filas seleccionadas.',
      selected_one: '{{count}} de {{total}} filas seleccionadas.',
      selected_other: '{{count}} de {{total}} filas seleccionadas.',
      previous: 'Anterior',
      next: 'Siguiente',
      empty: 'No hay miembros asociados a la empresa.',
      emptySearch: 'No se encontraron miembros para esta búsqueda.',
      confirmDeleteTitle: 'Eliminar miembro',
      confirmDeleteDescription:
        '¿Quieres eliminar a {{name}} de la lista de miembros de la empresa? Esta acción no se puede deshacer.',
      delete: 'Eliminar',
      sortByDate: 'Ordenar por fecha reciente',
      sortByTag: 'Ordenar por etiqueta',
      columnNames: {
        name: 'Nombre',
        email: 'Correo electrónico',
        status: 'Estado',
        tag: 'Etiqueta',
        updatedAt: 'Fecha reciente',
        delete: 'Eliminar',
      },
      status: {
        ativo: 'Activo',
        pendente: 'Pendiente',
      },
    },
    errors: {
      invalidName: 'Ingresa un nombre de 2 a 200 caracteres.',
      invalidEmail: 'Ingresa un correo válido.',
    },
  },
  aceite: {
    titulo: 'Solicitud de registro',
    responsavel: 'Responsable del registro',
    aceitar: 'Aceptar',
    rejeitar: 'Rechazar',
    rejeitarConfirmacao: {
      titulo: '¿Rechazar empresa?',
      descricao:
        'Vas a rechazar a {{nome}}. La empresa no tendrá acceso a la plataforma.',
      rejeitando: 'Rechazando…',
    },
  },
  empresas: {
    toasts: {
      aprovada: 'Empresa aprobada',
      aprovadaDescricao: '{{nome}} ya tiene acceso a la plataforma.',
      rejeitada: 'Empresa rechazada',
      rejeitadaDescricao: '{{nome}} no tendrá acceso a la plataforma.',
      erroAprovar: 'No se pudo aprobar la empresa',
      erroRejeitar: 'No se pudo rechazar la empresa',
      excluida: 'Empresa eliminada',
      excluidaDescricao: '{{nome}} fue eliminada de la plataforma.',
    },
    titulo: 'Empresas',
    erroAoCarregar: 'No se pudieron cargar las empresas.',
    pesquisarNome: {
      label: 'Buscar empresas por nombre',
      placeholder: 'Buscar por nombre',
    },
    pesquisarEmail: {
      label: 'Buscar empresas por correo',
      placeholder: 'Buscar por correo',
    },
    colunas: {
      titulo: 'Columnas',
      aprovar: 'Aprobar',
      nome: 'Nombre',
      email: 'Correo',
      resultados: 'Resultados',
      status: 'Estado',
      excluir: 'Eliminar',
    },
    verResultados: 'Ver Resultados',
    status: { ativo: 'Activo', pendente: 'Pendiente' },
    aprovar: 'Aprobar',
    anterior: 'Anterior',
    proxima: 'Siguiente',
    selecionadas: '{{selecionadas}} de {{total}} fila(s) seleccionada(s).',
    selecionarLinha: 'Seleccionar {{nome}}',
    excluirEmpresa: 'Eliminar {{nome}}',
    analisarCadastro: 'Pendiente: revisar el registro de {{nome}}',
    confirmarExclusao: {
      titulo: 'Eliminar empresa',
      descricao: '¿Seguro que deseas eliminar {{nome}}?',
    },
    vazio: 'No se encontraron empresas.',
  },
  painelControle: {
    toasts: {
      conviteEnviado: 'Invitación enviada',
      conviteEnviadoDescricao:
        '{{email}} recibirá la invitación por correo electrónico.',
      erroEnvio: 'Error al enviar la invitación',
      questionarioNoAr: 'El cuestionario está activo',
      questionarioNoArDescricao:
        'Las respuestas están abiertas durante el período definido.',
    },
    controles: 'Controles',
    administradora: 'Administradora',
    titulo: 'Panel de control',
    membros: 'Miembros',
    gerenciar: 'Gestionar cuestionario',
    adicionarMembro: 'Agregar Miembro',
    inicio: 'Inicio',
    termino: 'Finalización',
    confirmar: 'Confirmar',
    selecionarData: 'Fecha',
    selecionarHora: 'Hora',
    seletorHora: {
      hora: 'Hora',
      minuto: 'Min',
      opcaoHora: '{{hora}} h',
      valor: '{{hora}}:{{minuto}}',
    },
    erros: {
      inicioObrigatorio: 'Selecciona la fecha de inicio.',
      horaInicioObrigatoria: 'Selecciona la hora de inicio.',
      terminoObrigatorio: 'Selecciona la fecha de finalización.',
      horaTerminoObrigatoria: 'Selecciona la hora de finalización.',
      inicioNoPassado: 'La fecha de inicio no puede ser anterior a hoy.',
      horaInicioNoPassado:
        'La hora de inicio no puede ser anterior a la hora actual.',
      terminoAntesInicio:
        'La fecha de finalización no puede ser anterior a la fecha de inicio.',
      horaTerminoAntesInicio:
        'La hora de finalización debe ser posterior a la hora de inicio.',
    },
  },
  adicionarMentorando: {
    titulo: 'Agregar mentoreado',
  },
};
