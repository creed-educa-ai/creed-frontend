import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IDIOMAS, IDIOMA_PADRAO } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface HeaderLanguageMenuProps {
  // `brand`: o header está sobre o fundo roxo, e o ghost não tem fundo próprio.
  tone?: 'default' | 'brand';
}

// Fica ao lado do menu, e não dentro dele: abre uma lista, e os itens do menu
// levam a outra tela. Do mesmo tamanho dos ícones do menu (40px, ícone de 24px),
// para a linha ficar alinhada. Só o ícone: o idioma atual aparece marcado na
// lista, e a dica diz o que o botão faz.
export function HeaderLanguageMenu({
  tone = 'default',
}: HeaderLanguageMenuProps) {
  const { t, i18n } = useTranslation();
  const idiomaSelecionado =
    IDIOMAS.find((idioma) => i18n.resolvedLanguage === idioma) ?? IDIOMA_PADRAO;

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('idioma.rotulo')}
                className={cn(
                  'size-10',
                  tone === 'brand'
                    ? 'text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground aria-expanded:bg-primary-foreground/15 aria-expanded:text-primary-foreground'
                    : 'text-brand',
                )}
              >
                <Globe aria-hidden="true" className="size-6" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {t('idioma.rotulo')}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
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
    </TooltipProvider>
  );
}
