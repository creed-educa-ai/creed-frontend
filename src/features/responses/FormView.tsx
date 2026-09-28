import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useState } from 'react';
import { Questions } from '@/features/responses/Question';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { ReviewQuestion } from '@/features/responses/RevisaoRespostasView';

export function FormView() {
  const [secao, setSecao] = useState(1);
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const totalSecoes = 2;
  const perguntasPerSecao = 3;
  // Progresso da seção = perguntas já respondidas ÷ total da seção.
  // Contar pela posição (pergunta 1 de 3 = 33%) marcava como feita a
  // pergunta que a pessoa ainda estava lendo.
  let respondidasNaSecao = 0;
  for (let pergunta = 1; pergunta <= perguntasPerSecao; pergunta++) {
    const resposta = respostas[`${String(secao)}-${String(pergunta)}`] ?? '';
    if (resposta.trim() !== '') {
      respondidasNaSecao++;
    }
  }
  const progresso = (respondidasNaSecao / perguntasPerSecao) * 100;
  const { t } = useTranslation(['formulario']);
  const navigate = useNavigate();

  {
    /* TODO: Todas as perguntas são placeholders hardcodadas e serão importadas do backend quando possível */
  }
  const perguntas = {
    1: [
      {
        titulo: t('formulario:pergunta1'),
        subtitulo: t('formulario:quantitativa'),
        tipo: 'quantitativa' as const,
        respostas: ['1', '2', '3', '4', '5'],
      },
      {
        titulo: t('formulario:pergunta2'),
        subtitulo: t('formulario:quantitativa'),
        tipo: 'quantitativa' as const,
        respostas: ['1', '2', '3', '4', '5'],
      },
      {
        titulo: t('formulario:pergunta3'),
        subtitulo: t('formulario:quantitativa'),
        tipo: 'quantitativa' as const,
        respostas: ['1', '2', '3', '4', '5'],
      },
    ],
    2: [
      {
        titulo: t('formulario:pergunta4'),
        subtitulo: t('formulario:quantitativa'),
        tipo: 'quantitativa' as const,
        respostas: ['1', '2', '3', '4', '5'],
      },
      {
        titulo: t('formulario:pergunta5'),
        subtitulo: t('formulario:objetiva'),
        tipo: 'objetiva' as const,
        respostas: [
          t('formulario:pergunta5o1'),
          t('formulario:pergunta5o2'),
          t('formulario:pergunta5o3'),
          t('formulario:pergunta5o4'),
          t('formulario:pergunta5o5'),
        ],
      },
      {
        titulo: t('formulario:pergunta6'),
        subtitulo: t('formulario:dissertativa'),
        tipo: 'dissertativa' as const,
        respostas: [],
      },
    ],
  };

  const perguntasParaRevisao: ReviewQuestion[] = [
    ...perguntas[1].map((pergunta, index) => ({
      id: `1-${String(index + 1)}`,
      section: 1,
      text: pergunta.titulo,
      type: pergunta.tipo,
      options: pergunta.respostas,
      required: true,
      answer: respostas[`1-${String(index + 1)}`] ?? null,
    })),
    ...perguntas[2].map((pergunta, index) => ({
      id: `2-${String(index + 1)}`,
      section: 2,
      text: pergunta.titulo,
      type: pergunta.tipo,
      options: pergunta.respostas,
      required: true,
      answer: respostas[`2-${String(index + 1)}`] ?? null,
    })),
  ];

  // Ao ler o estado undefined o programa chega ao fim do formulário

  const perguntaAtualData =
    perguntas[secao as keyof typeof perguntas][perguntaAtual - 1];

  const chaveResposta = `${String(secao)}-${String(perguntaAtual)}`;
  const valorAtual = respostas[chaveResposta] ?? '';

  const handleRespostaChange = (valor: string) => {
    setRespostas({
      ...respostas,
      [chaveResposta]: valor,
    });
  };

  const handleProximo = () => {
    if (perguntaAtual < perguntasPerSecao) {
      setPerguntaAtual(perguntaAtual + 1);
    } else if (secao < totalSecoes) {
      setSecao(secao + 1);
      setPerguntaAtual(1);
    } else {
      // Última pergunta da última seção - não faz nada, perguntaAtualData fica undefined
      setPerguntaAtual(perguntaAtual + 1);
    }
  };

  const handleVoltar = () => {
    if (perguntaAtual > 1) {
      setPerguntaAtual(perguntaAtual - 1);
    } else if (secao > 1) {
      setSecao(secao - 1);
      setPerguntaAtual(perguntasPerSecao);
    }
  };

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
        {perguntaAtualData ? (
          <Questions
            secao={secao}
            totalSecoes={totalSecoes}
            perguntaAtual={perguntaAtual}
            totalPerguntas={perguntasPerSecao}
            progresso={progresso}
            titulo={perguntaAtualData.titulo}
            subtitulo={perguntaAtualData.subtitulo}
            tipo={perguntaAtualData.tipo}
            respostas={perguntaAtualData.respostas}
            valor={valorAtual}
            onMudar={handleRespostaChange}
            onProximo={handleProximo}
            onVoltar={handleVoltar}
          />
        ) : (
          // Fim do questionário: mesmo card do onboarding — título e
          // agradecimento no bloco roxo, a ação na faixa de baixo.
          <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center">
            <div className="flex w-full flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col items-start justify-start gap-1 rounded-xl bg-primary p-8 text-primary-foreground">
                <h2 className="text-xl font-bold text-balance">
                  {t('formulario:finalizado')}
                </h2>
                <p className="text-balance">{t('formulario:obrigado')}</p>
              </div>
              <div className="flex w-full items-center justify-end rounded-2xl border border-border bg-background p-2">
                <Button
                  type="button"
                  onClick={() => {
                    navigate('/questionario/revisao', {
                      state: { questions: perguntasParaRevisao },
                    });
                  }}
                >
                  {t('formulario:revisarRespostas')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
