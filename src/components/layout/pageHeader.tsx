import { NavMenu } from '@/components/layout/navMenu';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  // Linha de cima: o nome da organização, ou "Administradora" no super adm.
  eyebrow?: string | null;
  title: string;
  // `brand`: texto branco, para tela com o fundo roxo da marca.
  tone?: 'default' | 'brand';
  // Tela pública (o Sobre) mostra o menu só para quem tem sessão.
  showNavMenu?: boolean;
}

// Topo de todas as telas logadas: um header só, para o título e o menu não
// pularem de lugar ao navegar entre as telas.
export function PageHeader({
  eyebrow = null,
  title,
  tone = 'default',
  showNavMenu = true,
}: PageHeaderProps) {
  const isBrand = tone === 'brand';

  return (
    <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-center sm:text-left">
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
            'text-3xl font-bold',
            isBrand ? 'text-primary-foreground' : 'text-heading',
          )}
        >
          {title}
        </h1>
      </div>

      {showNavMenu && <NavMenu />}
    </header>
  );
}
