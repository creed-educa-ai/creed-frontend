import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface QuestionProps {
  secao: number;
  totalSecoes: number;
  perguntaAtual: number;
  totalPerguntas: number;
  progresso: number;
  titulo: string;
  subtitulo: string;
  tipo: 'objetiva' | 'dissertativa' | 'quantitativa';
  respostas?: string[];
  valor?: string;
  onMudar?: (valor: string) => void;
  onProximo: () => void;
  onVoltar: () => void;
}

export function Questions({
  secao,
  totalSecoes,
  perguntaAtual,
  totalPerguntas,
  progresso,
  titulo,
  subtitulo,
  tipo,
  respostas = [],
  valor = '',
  onMudar,
  onProximo,
  onVoltar,
}: QuestionProps) {
  const [selecionado, setSelecionado] = useState(valor);
  const { t } = useTranslation(['formulario']);

  useEffect(() => {
    setSelecionado(valor);
  }, [valor]);

  const handleChange = (novoValor: string) => {
    setSelecionado(novoValor);
    onMudar?.(novoValor);
  };

  return (
    <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
      {/* Seletor de seções */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: totalSecoes }).map((_, i) => (
          <button
            key={i + 1}
            className={`rounded-lg px-4 py-2 whitespace-nowrap ${
              secao === i + 1
                ? 'bg-brand text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t('formulario:secao')} {i + 1}
          </button>
        ))}
      </div>

      <div className="w-full space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-1 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-2xl font-bold text-heading">
            {t('formulario:secao')} {secao}
          </p>
          <p className="text-xl font-bold text-heading">
            {t('formulario:pergunta')} {perguntaAtual} {t('formulario:de')}{' '}
            {totalPerguntas}
          </p>
        </header>

        <Progress value={progresso} />

        <div className="bg-brand flex flex-col items-start justify-start gap-4 rounded-xl p-8 text-primary-foreground">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <p className="text-xs whitespace-pre-line">{subtitulo}</p>
        </div>

        {/* perguntas objetivas */}
        {tipo === 'objetiva' && (
          <RadioGroup value={selecionado} onValueChange={handleChange}>
            {respostas.map((resposta, index) => (
              <div
                key={`op${String(index)}`}
                className="flex cursor-pointer items-center space-x-2 rounded-lg border border-primary px-4 py-3 hover:bg-primary/5"
              >
                <RadioGroupItem value={resposta} id={`op${String(index)}`} />
                <label
                  htmlFor={`op${String(index)}`}
                  className="flex-1 cursor-pointer text-primary"
                >
                  {resposta}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* perguntas dissertativas */}
        {tipo === 'dissertativa' && (
          <textarea
            value={selecionado}
            onChange={(e) => {
              const novoValor = e.target.value;
              setSelecionado(novoValor);
              onMudar?.(novoValor);
            }}
            placeholder={t('formulario:textbox')}
            className="w-full rounded-lg border border-primary p-4 text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            rows={6}
          />
        )}

        {/* perguntas quantitativas */}
        {tipo === 'quantitativa' && (
          <RadioGroup
            value={selecionado}
            onValueChange={handleChange}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {respostas.map((resposta, index) => (
              <RadioGroupItem
                key={`op${String(index)}`}
                variant="caixa"
                value={resposta}
                id={`op${String(index)}`}
              >
                <span className="text-lg font-bold">{resposta}</span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        )}

        <footer className="flex w-full items-center justify-between rounded-2xl border border-border bg-background p-2">
          <Button
            variant="outline"
            className="text-brand"
            onClick={() => {
              onVoltar();
            }}
            disabled={perguntaAtual === 1 && secao === 1}
          >
            {t('formulario:voltar')}
          </Button>
          <p>{t('formulario:restante')}</p>
          <Button
            className="bg-brand font-bold text-primary-foreground"
            onClick={() => {
              onProximo();
            }}
          >
            {t('formulario:avancar')}
          </Button>
        </footer>
      </div>
    </div>
  );
}
