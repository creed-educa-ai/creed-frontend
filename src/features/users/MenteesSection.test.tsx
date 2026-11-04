import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { MenteesSection } from '@/features/users/MenteesSection';
import { resetMenteesMock } from '@/features/users/usersApi';
import usersReducer from '@/features/users/usersSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function renderizar() {
  const store = configureStore({ reducer: { users: usersReducer } });
  return render(
    <Provider store={store}>
      <MenteesSection />
    </Provider>,
  );
}

describe('MenteesSection', () => {
  beforeEach(async () => {
    resetMenteesMock();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('abre o questionário do mentorando ao clicar em Editar', async () => {
    const user = userEvent.setup();
    renderizar();
    await screen.findByRole('table', { hidden: true });

    // Tabela e cartões do celular estão os dois no DOM: o primeiro basta.
    const [editar] = screen.getAllByRole('button', {
      name: 'Editar questionário de Enner Valência',
    });
    if (!editar) throw new Error('botão Editar não encontrado');
    await user.click(editar);

    expect(
      screen.getByRole('heading', { name: 'Questionário de Enner Valência' }),
    ).toBeInTheDocument();
  });
});
