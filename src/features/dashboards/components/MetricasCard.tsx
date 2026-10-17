import { useTranslation } from 'react-i18next';

interface Metrica {
  nome: string; // ex.: "Segurança Psicológica"
  valor: number; // ex.: 79
}

interface MetricasCardProps {
  metricas: Metrica[];
  titulo?: string; // ex.: "Métricas"
}

export function MetricasCard({ metricas, titulo }: MetricasCardProps) {
  const { t } = useTranslation(['resultado']);

  // Do maior para o menor,
  const ordenadas = [...metricas].sort((a, b) => b.valor - a.valor);
  const destaque = ordenadas[0];
  const atencao = ordenadas[ordenadas.length - 1];

  return (
    <article className="rounded-2xl bg-card p-5 shadow-sm">
      <h3 className="text-xl font-bold text-heading">
        {titulo ?? t('resultado:metricas')}
      </h3>

      <ul className="mt-3 divide-y divide-border">
        {ordenadas.map((metrica) => {
          // Primeira palavra em destaque, o resto em cinza (como no Figma).
          const [primeira, ...resto] = metrica.nome.split(' ');
          const ehDestaque = metrica === destaque;
          const ehAtencao = metrica === atencao && metrica !== destaque;

          return (
            <li
              key={metrica.nome}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="text-sm">
                <span className="font-bold text-heading">{primeira}</span>
                {resto.length > 0 && (
                  <span className="font-medium text-muted-foreground">
                    {' '}
                    {resto.join(' ')}
                  </span>
                )}
              </span>

              <span className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${
                    ehDestaque
                      ? 'bg-success'
                      : ehAtencao
                        ? 'bg-warning'
                        : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
                {ehDestaque && (
                  <span className="sr-only">{t('resultado:destaque')}</span>
                )}
                {ehAtencao && (
                  <span className="sr-only">{t('resultado:oportunidade')}</span>
                )}
                <span className="text-xl font-bold text-heading">
                  {metrica.valor}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
