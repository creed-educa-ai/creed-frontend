import type { ptBR } from './pt-BR';

// pt-BR é a fonte da verdade: tipar por ele faz o TypeScript acusar chave
// faltando ou sobrando nas demais traduções.
export const es: typeof ptBR = {
  comum: {
    carregando: 'Cargando…',
    semDado: '—',
    tenteRecarregar: 'Intenta recargar la página.',
    erros: {
      obrigatorio: 'El campo es obligatorio',
    },
    acoes: {
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
    obrigatoria: 'Obligatoria',
    respostaObrigatoria: 'Esta pregunta es obligatoria.',
    semResposta: 'Sin respuesta',
    obrigatoriasPendentes_one: '{{count}} pregunta obligatoria sin responder.',
    obrigatoriasPendentes_other:
      '{{count}} preguntas obligatorias sin responder.',
    respostaDissertativaPlaceholder: 'Escribe tu respuesta',
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
    subtitulo: 'Más información sobre Creed.ai',
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
      senha: { rotulo: 'Contraseña', placeholder: 'Ingresa tu contraseña' },
      lembrarDeMim: 'Recordarme',
      esqueciSenha: 'Olvidé mi contraseña',
      entrar: 'Iniciar sesión',
      semConta: '¿Tu empresa aún no tiene una cuenta?',
      criarConta: 'Crear cuenta',
      painelTitulo: 'Qué bueno tenerte aquí.',
      painelDescricao:
        'Evaluación de competencias que muestra a tu equipo con claridad, sin hojas de cálculo y sin conjeturas.',
    },
    primeiroAcesso: {
      titulo: 'Cambia tu contraseña',
      subtitulo: 'Ingresa una nueva contraseña para tu cuenta',
      campoNovaSenha: 'Ingresa una nueva contraseña',
      campoConfirmarSenha: 'Confirma tu nueva contraseña',
      avancar: 'Continuar',
      boasVindasTitulo: 'Bienvenido',
      boasVindasMensagem:
        'Este es tu primer acceso. Para continuar, elige una nueva contraseña.',
    },
    erros: {
      emailInvalido: 'Ingresa un correo electrónico válido.',
      loginInvalido: 'No fue posible iniciar sesión con estas credenciales.',
      servicoIndisponivel:
        'El inicio de sesión no está disponible en este momento. Inténtalo de nuevo.',
      senhaCurta: 'La contraseña debe tener al menos 8 caracteres.',
      confirmacaoObrigatoria: 'Confirma la nueva contraseña.',
      senhasDivergentes: 'Las contraseñas no coinciden.',
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
  formulario: {
    titulo: 'Formulario',
    secao: 'Sección',
    pergunta: 'Pregunta',
    de: 'de',
    quantitativa:
      'Evalúa cada afirmación según tu experiencia real:\n 1 = Totalmente en desacuerdo  y 5 = Totalmente de acuerdo',
    dissertativa:
      'Responde de forma breve y objetiva, con un máximo de 200 palabras.',
    objetiva: 'Elige la alternativa que mejor describa tu experiencia.',
    textbox: 'Escribe tu respuesta aquí...',
    pergunta1:
      'Tengo o he tenido experiencia como fundador o socio de un negocio.',
    pergunta2:
      'Trabajo o he trabajado como intraemprendedor, proponiendo y liderando iniciativas innovadoras dentro de organizaciones.',
    pergunta3:
      'Participo o he participado activamente en el desarrollo de nuevos productos, servicios o modelos de negocio.',
    pergunta4:
      'Valoro y promuevo la diversidad cultural en las prácticas de mi contexto institucional.',
    pergunta5:
      '¿Cuál de las siguientes opciones describe mejor tu papel en relación con el multiculturalismo en la educación?',
    pergunta5o1:
      'Reconozco la importancia de la diversidad cultural, pero aún estoy desarrollando prácticas inclusivas',
    pergunta5o2:
      'Integro regularmente perspectivas culturales diversas en mis actividades educativas',
    pergunta5o3:
      'Promuevo activamente el diálogo intercultural y valoro distintas visiones del mundo en mi contexto',
    pergunta5o4:
      'Lidero iniciativas que transforman la institución para que sea verdaderamente multicultural e inclusiva',
    pergunta5o5:
      'Trabajo para eliminar barreras culturales y promover la equidad entre los diferentes grupos en la educación',
    pergunta6:
      'Describe una experiencia en la que hayas promovido la diversidad cultural o la inclusión en un entorno educativo, explicando cómo esto impactó a los involucrados y qué aprendizajes obtuviste.',
    avancar: 'Siguiente',
    voltar: 'Volver',
    restante: '~15 minutos restantes',
    finalizado: '¡Formulario finalizado!',
    obrigado:
      '¡Gracias por participar! Revisa tus respuestas antes de enviarlas.',
    revisarRespostas: 'Revisar respuestas',
    menuPainel: 'Panel',
    menuFormulario: 'Formulario',
    menuInformacoes: 'Información',
    menuSair: 'Cerrar sesión',
  },
  onboardQuestionario: {
    titulo: 'FORMULARIO',
    start: '¿Comenzamos?',
    subtitulo: 'tienes un cuestionario disponible',
    mensagem:
      'Tus respuestas nos ayudan a mapear el panorama de tu organización.\n Es rápido y puedes pausar cuando quieras, tu progreso quedará guardado',
    tempo: '~15 minutos',
    secao: '4 secciones',
    avancar: 'Siguiente',
    menuPainel: 'Panel',
    menuFormulario: 'Formulario',
    menuInformacoes: 'Información',
    menuSair: 'Cerrar sesión',
  },
  onboardQuestionarioInfo: {
    titulo: 'Actualizar información',
    mensagem: '¿Quieres revisar algunos de tus datos personales?',
    yes: 'Sí',
    no: 'No',
  },
};
