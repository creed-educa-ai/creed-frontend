import { NavMenu } from '@/components/layout/navMenu';
import { HeaderLanguageMenu } from '@/components/HeaderLanguageMenu';
import { pageGutterClassName } from '@/lib/layout';
import { pageTitleClassName } from '@/lib/typography';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  // Linha de cima: o nome da organização, ou "Administradora" no super adm.
  eyebrow?: string | null;
  title: string;
  // `brand`: texto branco, para tela com o fundo roxo da marca.
  tone?: 'default' | 'brand';
  // Tela pública (o Sobre) mostra o menu só para quem tem sessão.
  showNavMenu?: boolean;
  // Posição extra. O questionário tira o header do fluxo, para a pergunta
  // ficar no centro da tela sem o header mudar de lugar.
  className?: string;
}

// Topo de todas as telas logadas: um header só, para o título e o menu não
// pularem de lugar ao navegar entre as telas.
export function PageHeader({
  eyebrow = null,
  title,
  tone = 'default',
  showNavMenu = true,
  className,
}: PageHeaderProps) {
  const isBrand = tone === 'brand';

  return (
    <header
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 py-10 lg:flex-row lg:items-start lg:justify-between',
        pageGutterClassName,
        className,
      )}
    >
      {showNavMenu && (
        <div className="flex w-full justify-start lg:w-auto">
          <HeaderLanguageMenu />
        </div>
      )}
      <div className="text-center lg:text-left">
        {/* min-h-5: sem eyebrow, a linha fica reservada e o título não sobe. */}
        <p
          className={cn(
            'min-h-5 text-sm font-bold',
            isBrand ? 'text-primary-foreground' : 'text-heading',
          )}
        >
          {eyebrow}
        </p>
        <h1
          className={cn(
            pageTitleClassName,
            isBrand && 'text-primary-foreground',
          )}
        >
          {title}
        </h1>
      </div>

      {/* Até lg o menu vem antes do título (order-first): lado a lado, título
          e menu não cabem no tablet. No celular ocupa a largura toda; no
          tablet tem o próprio tamanho, centralizado. No desktop, volta à
          direita, na mesma linha. */}
      {showNavMenu && (
        <div className="order-first w-full sm:w-auto lg:order-none">
          <NavMenu />
        </div>
      )}
    </header>
  );
}
