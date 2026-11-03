import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTipProps {
  // O título do card, para o leitor de tela saber do que é a explicação.
  title: string;
  text: string;
}

// Ícone de informação ao lado do título de um card. O tooltip do Radix só
// abre no hover e no foco; no celular não há hover, então o toque também
// abre. Fecha como qualquer tooltip: tocando fora, com Esc ou saindo dele.
export function InfoTip({ title, text }: InfoTipProps) {
  const { t } = useTranslation(['dashboard']);
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t('dashboard:info.sobre', { titulo: title })}
            onClick={(event) => {
              // O Radix fecha o tooltip no clique do gatilho; o
              // `preventDefault` pula esse fechamento, e o toque abre.
              event.preventDefault();
              setOpen(true);
            }}
            // O ícone tem 16px, mas a área de toque vai a 40px (`after`).
            className="relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full align-middle text-muted-foreground transition-colors after:absolute after:-inset-2 hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Info className="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-left leading-snug font-normal">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
