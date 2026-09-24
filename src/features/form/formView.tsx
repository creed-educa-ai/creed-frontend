import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useState } from 'react';
import { Questions } from '@/components/ui/questions';

export function FormView() {
  //const { t } = useTranslation(['Onboard_Quest']);
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  const totalPerguntas = 3;
  const progresso = (perguntaAtual / totalPerguntas) * 100;

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="flex w-full items-center justify-between px-6 py-10">
        <div>
          <p className="text-sm font-bold text-heading">João Silva</p>
          <h1 className="text-3xl font-bold text-heading">FORM</h1>
        </div>

        <div className="flex items-center justify-end gap-1 rounded-2xl border border-border p-2 shadow-sm">
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <LayoutDashboard size={24} />
          </button>
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <ClipboardPen size={24} />
          </button>
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <Info size={24} />
          </button>
          <CreedSymbol className="size-6" />
          <img src={wordmark} alt="CREED.ai" className="w-24" />
          <button className="text-brand p-2 transition-colors hover:opacity-80">
            <LogOut size={24} />
          </button>
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-12">
        <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-12">
          <Questions
            perguntaAtual={perguntaAtual}
            totalPerguntas={totalPerguntas}
            progresso={progresso}
            titulo="Pergunta 1"
            subtitulo="OBJETIVA"
            conteudo={<p>respostas</p>}
            onProximo={() => {
              setPerguntaAtual(perguntaAtual + 1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
