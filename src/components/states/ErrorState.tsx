import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/alert';

// Falha ao carregar uma seção. `message` já vem traduzida (o slice guarda a
// chave de i18n); a dica de recarregar vem sempre junto.
export function ErrorState({ message }: { message?: string | null }) {
  const { t } = useTranslation('comum');

  return (
    <Alert variant="destructive" className="p-3 text-base">
      <p>
        {message} {t('tenteRecarregar')}
      </p>
    </Alert>
  );
}
