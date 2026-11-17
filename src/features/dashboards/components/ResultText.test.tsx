import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { CreedSummary } from '@/features/dashboards/dashboardsApi';
import { PRISMAS } from '@/features/dashboards/prismas';
import type { Prisma } from '@/types/api';
import { ResultText } from './ResultText';

const TEXTOS_DOS_PRISMAS = Object.fromEntries(
  PRISMAS.map((prisma) => [prisma, `Leitura breve de ${prisma}.`]),
) as Record<Prisma, string>;

// O insight pronto. Os outros estados vêm sem texto e sem data, como o back
// manda.
function resumo(campos: Partial<CreedSummary> = {}): CreedSummary {
  return {
    analiseTexto: ['Primeiro parágrafo da análise.', 'Segundo parágrafo.'],
    recomendacaoTexto: ['Recomendação para o grupo.'],
    prismas: TEXTOS_DOS_PRISMAS,
    destaque: 'seguranca_psicologica',
    oportunidade: 'neuroinovacao_prisma',
    insight_status: 'done',
    generated_at: '2026-07-02T13:30:00Z',
    ...campos,
  };
}

const SEM_TEXTO = {
  analiseTexto: [],
  recomendacaoTexto: [],
  prismas: {} as never,
  generated_at: null,
};

describe('ResultText', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('pronto, mostra os textos e a data em que ficaram prontos', () => {
    render(<ResultText {...resumo()} />);

    expect(
      screen.getByText('Primeiro parágrafo da análise.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Leitura breve de seguranca_psicologica.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Gerado em 02/07/2026')).toBeInTheDocument();
  });

  it('a data sai no formato do idioma da tela', async () => {
    await i18n.changeLanguage('en');
    render(<ResultText {...resumo()} />);

    expect(screen.getByText('Generated on 07/02/2026')).toBeInTheDocument();
  });

  it('em preparo, avisa no lugar de cada texto e mantém as marcas', () => {
    render(
      <ResultText {...resumo({ ...SEM_TEXTO, insight_status: 'pending' })} />,
    );

    // Um na análise e um em cada um dos cinco cards de prisma.
    expect(
      screen.getAllByText('O Creed.ai está preparando este texto.'),
    ).toHaveLength(6);
    expect(screen.queryByText(/^Gerado em/)).not.toBeInTheDocument();
    expect(screen.getByText('Destaque')).toBeInTheDocument();
    expect(screen.getByText('Oportunidade')).toBeInTheDocument();
  });

  it('em preparo na visão da empresa, a recomendação também espera', () => {
    render(
      <ResultText
        empresa
        {...resumo({ ...SEM_TEXTO, insight_status: 'pending' })}
      />,
    );

    expect(
      screen.getAllByText('O Creed.ai está preparando este texto.'),
    ).toHaveLength(7);
  });

  it('indisponível, avisa sem oferecer tentar de novo (P-044)', () => {
    render(
      <ResultText {...resumo({ ...SEM_TEXTO, insight_status: 'failed' })} />,
    );

    expect(
      screen.getAllByText('Este texto não ficou disponível.'),
    ).toHaveLength(6);
    expect(
      screen.queryByRole('button', { name: /tentar/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('sem insight, fica sem texto e as marcas do cálculo continuam', () => {
    render(
      <ResultText {...resumo({ ...SEM_TEXTO, insight_status: 'none' })} />,
    );

    expect(screen.getAllByText('Análise ainda não disponível.')).toHaveLength(
      6,
    );
    expect(screen.queryByText(/^Gerado em/)).not.toBeInTheDocument();
    expect(screen.getByText('Destaque')).toBeInTheDocument();
    expect(screen.getByText('Oportunidade')).toBeInTheDocument();
  });
});
