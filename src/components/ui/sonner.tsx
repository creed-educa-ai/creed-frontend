import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

// Toast de confirmação: "convite enviado", "membro excluído". Mudanças sobre o
// que o shadcn instala:
// - sem `next-themes`: o projeto não tem tema escuro, e sem o provider o
//   toast seguiria o tema do sistema e ficaria escuro num app claro;
// - `unstyled`: o CSS do sonner troca a fonte e põe o X numa bolinha fora do
//   toast. Aqui o visual vem dos tokens, como nos modais (fundo branco, título
//   na cor de título, X dentro, no canto);
// - sempre com o X para fechar e sem botão de desfazer.
const Toaster = ({ ...props }: ToasterProps) => {
  const { t } = useTranslation('comum');

  return (
    <Sonner
      theme="light"
      position="bottom-right"
      closeButton
      containerAriaLabel={t('notificacoes')}
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5 text-primary" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: (
          <Loader2Icon className="size-5 animate-spin text-muted-foreground motion-reduce:animate-none" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: t('acoes.fechar'),
        classNames: {
          toast:
            'flex w-(--width) items-start gap-3 rounded-xl bg-card p-4 pr-12 font-sans text-sm text-card-foreground shadow-md ring-1 ring-foreground/10',
          icon: 'mt-px shrink-0',
          content: 'flex min-w-0 flex-1 flex-col gap-1',
          title: 'font-heading font-bold text-heading',
          description: 'text-muted-foreground',
          closeButton:
            "absolute top-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-4",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
