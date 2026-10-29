import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BotaoVoltarProps {
  // Só cor e hover: a posição (canto superior esquerdo) é a mesma em todo
  // layout, e o elemento pai precisa ser `relative`.
  className?: string;
}

// Seta de voltar compartilhada pelo AuthLayout e pelo FormLayout.
export function BotaoVoltar({ className }: BotaoVoltarProps) {
  const { t } = useTranslation('comum');
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label={t('navegacao.voltar')}
      className={cn('absolute top-4 left-4 z-10', className)}
      onClick={() => {
        navigate(-1);
      }}
    >
      <ChevronLeft aria-hidden="true" className="size-6" />
    </Button>
  );
}
