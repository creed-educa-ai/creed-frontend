import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { QuestionarioPreviaView } from '@/features/questionario/QuestionarioPreviaView';

function renderizar() {
  return render(
    <MemoryRouter>
      <QuestionarioPreviaView />
    </MemoryRouter>,
  );
}

describe('QuestionarioPreviaView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('avisa que o questionário está em construção', () => {
    renderizar();

    expect(screen.getByText('Em construção')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Pergunta objetiva' }),
    ).toBeInTheDocument();
  });

  it('mostra seis opções e deixa marcar só uma', async () => {
    renderizar();
    const opcoes = screen.getAllByRole('radio');
    expect(opcoes).toHaveLength(6);

    await userEvent.click(screen.getByRole('radio', { name: 'Resposta 2' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Resposta 5' }));

    expect(screen.getByRole('radio', { name: 'Resposta 5' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Resposta 2' })).not.toBeChecked();
  });

  it('troca os textos ao mudar o idioma', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Inglês' }));

    expect(
      await screen.findByRole('heading', { name: 'Multiple-choice question' }),
    ).toBeInTheDocument();
  });
});
