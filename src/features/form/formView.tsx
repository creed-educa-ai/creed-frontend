import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { Info, LogOut, LayoutDashboard, ClipboardPen } from 'lucide-react';
import { useState } from 'react';
import { Questions } from '@/components/ui/questions';

export function FormView() {
  const [perguntaAtual, setPerguntaAtual] = useState(1);
  const totalPerguntas = 3;
  const progresso = (perguntaAtual / totalPerguntas) * 100;

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-heading">João Silva</p>
          <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
            FORM
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border p-2 shadow-sm sm:justify-end">
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
        {/* Todas as perguntas são placehoders hardcodadas e serão importadas do backend quando possivel*/}
        {/* Pergunta objetiva */}
        {perguntaAtual === 1 && (
          <Questions
            perguntaAtual={perguntaAtual}
            totalPerguntas={totalPerguntas}
            progresso={progresso}
            titulo="Pergunta 1"
            subtitulo="OBJETIVA"
            tipo="objetiva"
            respostas={['Resposta 1', 'Resposta 2', 'Resposta 3']}
            onProximo={() => {
              setPerguntaAtual(perguntaAtual + 1);
            }}
            onVoltar={() => {
              setPerguntaAtual(perguntaAtual - 1);
            }}
          />
        )}

        {/* Pergunta dissertativa */}
        {perguntaAtual === 2 && (
          <Questions
            perguntaAtual={perguntaAtual}
            totalPerguntas={totalPerguntas}
            progresso={progresso}
            titulo="Pergunta 2"
            subtitulo="DISSERTATIVA"
            tipo="dissertativa"
            onProximo={() => {
              setPerguntaAtual(perguntaAtual + 1);
            }}
            onVoltar={() => {
              setPerguntaAtual(perguntaAtual - 1);
            }}
          />
        )}

        {/* Pergunta quantitativa*/}
        {perguntaAtual === 3 && (
          <Questions
            perguntaAtual={perguntaAtual}
            totalPerguntas={totalPerguntas}
            progresso={progresso}
            titulo="Pergunta 3"
            subtitulo="QUANTITATIVA"
            tipo="quantitativa"
            respostas={['1', '2', '3', '4', '5']}
            onProximo={() => {
              setPerguntaAtual(perguntaAtual + 1);
            }}
            onVoltar={() => {
              setPerguntaAtual(perguntaAtual - 1);
            }}
          />
        )}
      </div>
    </div>
  );
}
