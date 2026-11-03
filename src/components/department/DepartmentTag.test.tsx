import { render, screen } from '@testing-library/react';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { DepartmentDot, DepartmentTag } from './DepartmentTag';

describe('DepartmentTag', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra o nome traduzido do setor com a cor dele', () => {
    render(<DepartmentTag department="TecnologiaInformacao" />);

    expect(screen.getByText('TI')).toHaveClass('bg-[#C2185B]');
  });

  it('traduz o nome do setor', async () => {
    await i18n.changeLanguage('en');
    render(<DepartmentTag department="RecursosHumanos" />);

    expect(screen.getByText('HR')).toBeInTheDocument();
  });
});

describe('DepartmentDot', () => {
  it('é só decoração: a mesma cor, escondida do leitor de tela', () => {
    const { container } = render(<DepartmentDot department="Marketing" />);

    const dot = container.firstElementChild;
    expect(dot).toHaveClass('bg-[#009E4F]');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });
});
