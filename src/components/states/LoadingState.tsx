import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// "Carregando…" com o esboço do que vai aparecer. O esboço (os `Skeleton`)
// é de quem usa: cada seção sabe o formato do próprio conteúdo.
export function LoadingState({ children }: { children: ReactNode }) {
  const { t } = useTranslation('comum');

  return (
    <div className="space-y-3" aria-live="polite">
      <p className="text-sm text-muted-foreground">{t('carregando')}</p>
      {children}
    </div>
  );
}
