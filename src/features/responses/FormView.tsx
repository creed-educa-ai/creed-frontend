import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Questions,
  QuestionsCompleted,
  type Direcao,
} from '@/features/responses/Question';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ReviewQuestion } from '@/features/responses/RevisaoRespostasView';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  DEMO_FORM_ID,
  loadQuestionnaire,
  selectQuestionnaireSections,
  type QuestionnaireSection,
} from '@/features/responses/responsesSlice';

// Busca as perguntas no back e decide o que desenhar: carregando, erro, vazio
// ou o questionário. A navegação entre as perguntas mora em `FormQuestions`.
export function FormView() {
  const { t } = useTranslation(['formulario', 'comum']);
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.responses.status);
  const error = useAppSelector((state) => state.responses.error);
  const secoes = useAppSelector(selectQuestionnaireSections);

  useEffect(() => {
    void dispatch(loadQuestionnaire(DEMO_FORM_ID));
  }, [dispatch]);

  function conteudo() {
    if (status === 'error') {
      return (
        <div
          role="alert"
          className="mx-auto my-auto flex max-w-md flex-col items-center gap-4 text-center"
        >
          <p className="text-foreground">
            {/* O slice guarda a chave como string; mesma saída do LoginView. */}
            {t((error ?? 'formulario:erros.servicoIndisponivel') as never)}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void dispatch(loadQuestionnaire(DEMO_FORM_ID));
            }}
          >
            {t('comum:acoes.tentarNovamente')}
          </Button>
        </div>
      );
    }

    if (status !== 'ready') {
      return (
        <p role="status" className="mx-auto my-auto text-muted-foreground">
          {t('comum:carregando')}
        </p>
      );
    }

    if (secoes.length === 0) {
      return (
        <p className="mx-auto my-auto text-center text-muted-foreground">
          {t('formulario:semPerguntas')}
        </p>
      );
    }

    return <FormQuestions secoes={secoes} />;
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      {/* #region header */}
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-heading">João Silva</p>
          <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
            {t('formulario:titulo')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end">
          {/* para que seja possível navegar com estes botões, precisaremos implementar "aria-label" e "type=button" */}
          <button
            type="button"
            aria-label={t('formulario:menuPainel')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LayoutDashboard size={24} />
          </button>
          <button
            type="button"
            aria-label={t('formulario:menuFormulario')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <ClipboardPen size={24} />
          </button>
          <button
            type="button"
            aria-label={t('formulario:menuInformacoes')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <Info size={24} />
          </button>
          <CreedSymbol className="size-6" />
          <img src={wordmark} alt="CREED.ai" className="w-24" />
          <button
            type="button"
            aria-label={t('formulario:menuSair')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
      {/* #endregion */}

      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-8">
        {conteudo()}
      </div>
    </div>
  );
}

interface FormQuestionsProps {
  secoes: QuestionnaireSection[];
}

// A navegação do questionário: abas, avançar, voltar e barra de progresso.
// As respostas ficam aqui, em memória, até a revisão (🟡 Premissa P-034: nada
// é gravado no back antes de confirmar o envio). A chave é o id da pergunta.
function FormQuestions({ secoes }: FormQuestionsProps) {
  const [secao, setSecao] = useState(1);
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  // Para que lado a pergunta nova entra na tela (ver `Questions`).
  const [direcao, setDirecao] = useState<Direcao>('avancar');
  // A seção mais adiante a que a pessoa já chegou: libera as abas até ela.
  // Voltar por uma aba não "desfaz" o avanço, dá para ir e vir.
  const [secaoMaisAvancada, setSecaoMaisAvancada] = useState(1);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  // Perguntas em que a pessoa clicou "Avançar" (pelo id da pergunta).
  // É o clique em Avançar que confirma a resposta para a barra de progresso.
  const [confirmadas, setConfirmadas] = useState<string[]>([]);
  // Aviso de "responda as obrigatórias antes de sair da seção" (ver handleProximo).
  const [avisoSecaoIncompleta, setAvisoSecaoIncompleta] = useState(false);
  const { t } = useTranslation(['formulario']);
  const navigate = useNavigate();

  const totalSecoes = secoes.length;

  function perguntasDaSecao(numeroSecao: number) {
    return secoes[numeroSecao - 1]?.questions ?? [];
  }

  function temResposta(questionId: string) {
    return (respostas[questionId] ?? '').trim() !== '';
  }

  const perguntasDaSecaoAtual = perguntasDaSecao(secao);
  const totalPerguntasNaSecao = perguntasDaSecaoAtual.length;

  // Progresso da seção = perguntas respondidas E confirmadas com "Avançar",
  // ÷ total da seção. A barra não anda ao marcar uma opção, só ao avançar.
  // Contar pela posição (pergunta 1 de 3 = 33%) marcava como feita a
  // pergunta que a pessoa ainda estava lendo.
  const respondidasNaSecao = perguntasDaSecaoAtual.filter(
    ({ id }) => confirmadas.includes(id) && temResposta(id),
  ).length;
  const progresso = (respondidasNaSecao / totalPerguntasNaSecao) * 100;

  const perguntasParaRevisao: ReviewQuestion[] = secoes.flatMap(
    ({ numero, questions }) =>
      questions.map((question) => ({
        id: question.id,
        section: numero,
        text: question.text,
        type: 'dissertativa' as const,
        options: [],
        required: question.required,
        answer: respostas[question.id] ?? null,
      })),
  );

  // Ao passar da última pergunta, `perguntaAtualData` fica undefined e a tela
  // mostra o fim do formulário.
  const perguntaAtualData = perguntasDaSecaoAtual[perguntaAtual - 1];
  const valorAtual = perguntaAtualData
    ? (respostas[perguntaAtualData.id] ?? '')
    : '';

  // 🟡 Premissa P-038: só as obrigatórias seguram a pessoa na seção.
  // Número da primeira obrigatória sem resposta da seção, ou null se não há.
  function primeiraSemResposta(numeroSecao: number): number | null {
    const indice = perguntasDaSecao(numeroSecao).findIndex(
      (question) => question.required && !temResposta(question.id),
    );
    return indice === -1 ? null : indice + 1;
  }

  // Concluída = a pessoa já passou pela seção (avançou para a seguinte ou para
  // o fim) E toda obrigatória está respondida e confirmada com "Avançar". Sem
  // o "já passou", uma seção só de opcionais nasceria com o check, antes de ser
  // aberta. Só responder a última, sem avançar, ainda não conclui.
  const secoesConcluidas = secoes
    .filter(
      ({ numero, questions }) =>
        numero < secaoMaisAvancada &&
        questions.every(
          (question) =>
            !question.required ||
            (confirmadas.includes(question.id) && temResposta(question.id)),
        ),
    )
    .map(({ numero }) => numero);

  // Dentro da seção dá para pular perguntas; sair dela, não. Quem tenta sair
  // com obrigatória em aberto vai para a primeira sem resposta e vê o aviso.
  // Devolve true quando barrou a saída.
  function barrarSaidaDaSecao(): boolean {
    const faltando = primeiraSemResposta(secao);
    if (faltando === null) {
      return false;
    }
    setDirecao('voltar');
    setPerguntaAtual(faltando);
    setAvisoSecaoIncompleta(true);
    return true;
  }

  const handleRespostaChange = (valor: string) => {
    if (!perguntaAtualData) return;
    setRespostas({
      ...respostas,
      [perguntaAtualData.id]: valor,
    });
  };

  const handleProximo = () => {
    setDirecao('avancar');
    // Só confirma com resposta: quem pulou, volta e responde depois precisa
    // avançar de novo para a barra contar.
    if (
      perguntaAtualData &&
      valorAtual.trim() !== '' &&
      !confirmadas.includes(perguntaAtualData.id)
    ) {
      setConfirmadas([...confirmadas, perguntaAtualData.id]);
    }
    if (perguntaAtual < totalPerguntasNaSecao) {
      setPerguntaAtual(perguntaAtual + 1);
      return;
    }
    if (barrarSaidaDaSecao()) {
      return;
    }
    setAvisoSecaoIncompleta(false);
    if (secao < totalSecoes) {
      setSecao(secao + 1);
      setPerguntaAtual(1);
      setSecaoMaisAvancada(Math.max(secaoMaisAvancada, secao + 1));
    } else {
      // Última pergunta da última seção: perguntaAtualData fica undefined.
      setPerguntaAtual(perguntaAtual + 1);
      // Passou da última: todas as seções ficam feitas.
      setSecaoMaisAvancada(totalSecoes + 1);
    }
  };

  // Clique numa aba: vai para a primeira pergunta daquela seção.
  const handleIrParaSecao = (numero: number) => {
    // Ir para uma seção seguinte pela aba também é sair desta.
    if (numero > secao && barrarSaidaDaSecao()) {
      return;
    }
    setAvisoSecaoIncompleta(false);
    setDirecao(numero > secao ? 'avancar' : 'voltar');
    setSecao(numero);
    setPerguntaAtual(1);
  };

  const handleVoltar = () => {
    setDirecao('voltar');
    if (perguntaAtual > 1) {
      setPerguntaAtual(perguntaAtual - 1);
    } else if (secao > 1) {
      setAvisoSecaoIncompleta(false);
      setSecao(secao - 1);
      setPerguntaAtual(perguntasDaSecao(secao - 1).length);
    }
  };

  if (!perguntaAtualData) {
    return (
      <QuestionsCompleted
        totalSecoes={totalSecoes}
        totalPerguntas={perguntasParaRevisao.length}
        respondidas={
          perguntasParaRevisao.filter(
            ({ answer }) => answer !== null && answer.trim() !== '',
          ).length
        }
        secoesConcluidas={secoesConcluidas}
        onIrParaSecao={handleIrParaSecao}
        onRevisar={() => {
          navigate('/questionario/revisao', {
            state: { questions: perguntasParaRevisao },
          });
        }}
      />
    );
  }

  return (
    <Questions
      secao={secao}
      totalSecoes={totalSecoes}
      perguntaAtual={perguntaAtual}
      totalPerguntas={totalPerguntasNaSecao}
      progresso={progresso}
      titulo={perguntaAtualData.text}
      subtitulo={t('formulario:dissertativa')}
      // 🟡 Premissa P-037: só chegam descritivas até a CREED-37.
      tipo="dissertativa"
      valor={valorAtual}
      onMudar={handleRespostaChange}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      direcao={direcao}
      secaoMaisAvancada={secaoMaisAvancada}
      secoesConcluidas={secoesConcluidas}
      onIrParaSecao={handleIrParaSecao}
      // Some sozinho quando a última obrigatória que faltava é respondida.
      avisoSecaoIncompleta={
        avisoSecaoIncompleta && primeiraSemResposta(secao) !== null
      }
    />
  );
}
