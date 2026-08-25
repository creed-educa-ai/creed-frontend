// Troca o idioma da interface. Fica em components/ (e não numa feature) porque
// é compartilhado — e serve de exemplo de uso do shadcn/ui + i18n juntos.
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { IDIOMAS } from '@/i18n';

export function SeletorIdioma() {
  const { t, i18n } = useTranslation();

  return (
    // resolvedLanguage e não language: com "en-US" no navegador, o idioma
    // efetivamente aplicado é "en" — é ele que marca o botão ativo.
    <div
      role="group"
      aria-label={t('idioma.rotulo')}
      className="flex items-center gap-1"
    >
      {IDIOMAS.map((idioma) => (
        <Button
          key={idioma}
          type="button"
          size="sm"
          variant={i18n.resolvedLanguage === idioma ? 'secondary' : 'ghost'}
          aria-pressed={i18n.resolvedLanguage === idioma}
          onClick={() => {
            void i18n.changeLanguage(idioma);
          }}
        >
          {t(`idioma.${idioma}`)}
        </Button>
      ))}
    </div>
  );
}
