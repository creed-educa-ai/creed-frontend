import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useState } from 'react';
import { Questions } from '@/features/form/Question';
import { useTranslation } from 'react-i18next';

export function FormView() {
  const [secao, setSecao] = useState(1);
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const totalSecoes = 2;
  const perguntasPerSecao = 3;
  const progresso = (perguntaAtual / perguntasPerSecao) * 100;
  const { t } = useTranslation(['formulario']);

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

  // Ao ler o estado undefined o programa chega ao fim do formulário

  const perguntaAtualData =
    perguntas[secao as keyof typeof perguntas][perguntaAtual - 1];

  if (!perguntaAtualData) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-heading">
            {t('formulario:finalizado')}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t('formulario:obrigado')}
          </p>
        </div>
      </div>
    );
  }

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
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
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

      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-12">
        <Questions
          key={chaveResposta}
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
      </div>
    </div>
  );
}
