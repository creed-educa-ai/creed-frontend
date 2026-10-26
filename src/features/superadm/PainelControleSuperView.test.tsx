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

  it('should render the translated title and the add mentee section', () => {
    render(<PainelControleSuperView />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: i18n.t('adicionarMentorando:titulo'),
      }),
    ).toBeInTheDocument();
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
