import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IDIOMAS, IDIOMA_PADRAO } from '@/i18n/config';

export function HeaderLanguageMenu() {
  const { t, i18n } = useTranslation();
  const idiomaAtual = IDIOMAS.find(
    (idioma) => i18n.resolvedLanguage === idioma,
  );
  const idiomaSelecionado = idiomaAtual ?? IDIOMA_PADRAO;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={t('idioma.rotulo')}
          className="gap-1.5"
        >
          <span>{t(`idioma.${idiomaSelecionado}`)}</span>
          <ChevronDown aria-hidden="true" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={idiomaSelecionado}
          onValueChange={(idioma) => {
            if (IDIOMAS.some((opcao) => opcao === idioma)) {
              void i18n.changeLanguage(idioma);
            }
          }}
        >
          {IDIOMAS.map((idioma) => (
            <DropdownMenuRadioItem key={idioma} value={idioma}>
              {t(`idioma.${idioma}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
