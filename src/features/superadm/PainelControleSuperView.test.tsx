import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PainelControleSuperView } from './PainelControleSuperView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('PainelControleSuperView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the admin header and the three section titles', () => {
    render(<PainelControleSuperView />);

    expect(
      screen.getByText(i18n.t('painelControle:administradora')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:subtituloAdmin')),
    ).toBeInTheDocument();
    for (const titulo of [
      i18n.t('adicionarMentorando:titulo'),
      i18n.t('empresas:titulo'),
      i18n.t('mentees:title'),
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: titulo }),
      ).toBeInTheDocument();
    }
  });

  it('should list the companies and the mentees', () => {
    render(<PainelControleSuperView />);

    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getAllByText('Wilson Mathias').length).toBeGreaterThan(0);
  });

  it('should highlight the control panel in the menu', () => {
    render(<PainelControleSuperView />);

    expect(
      screen.getByRole('button', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('should hand the typed email to the placeholder handler', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<PainelControleSuperView />);

    await user.type(
      screen.getByRole('textbox', {
        name: i18n.t('adicionarMentorando:email.label'),
      }),
      'ana@exemplo.com',
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('adicionarMentorando:adicionar'),
      }),
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Mentorando adicionado:', {
        email: 'ana@exemplo.com',
      });
    });
  });
});
