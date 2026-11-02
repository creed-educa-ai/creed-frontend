import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { DemographicsStep1View } from './DemographicsStep1View';
import demographicsReducer, { setName } from './demographicsSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function criarStore() {
  return configureStore({
    reducer: { demographics: demographicsReducer },
  });
}

function renderizar(store = criarStore()) {
  const onContinue = vi.fn();
  // MemoryRouter: a seta de voltar do FormLayout usa o roteador.
  render(
    <MemoryRouter>
      <Provider store={store}>
        <DemographicsStep1View onContinue={onContinue} />
      </Provider>
    </MemoryRouter>,
  );
  return { store, onContinue };
}

describe('DemographicsStep1View', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mantém o texto no formulário e só confirma o nome ao avançar', async () => {
    const user = userEvent.setup();
    const { store, onContinue } = renderizar();
    const campo = screen.getByRole('textbox', { name: 'Nome' });

    await user.type(campo, '  Ana Silva  ');
    expect(store.getState().demographics.name).toBe('');

    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(store.getState().demographics.name).toBe('Ana Silva');
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledWith({ name: 'Ana Silva' });
  });

  it('mostra uma mensagem acessível e traduzida quando o nome está vazio', async () => {
    const user = userEvent.setup();
    const { onContinue } = renderizar();

    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Informe seu nome para continuar.',
    );
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('reabre a etapa com o nome confirmado anteriormente', () => {
    const store = criarStore();
    store.dispatch(setName('Nome anterior'));
    renderizar(store);

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue(
      'Nome anterior',
    );
  });

  it('acompanha o idioma selecionado', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(
      screen.getByRole('heading', {
        name: "Let's get started! What's your name?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
      'placeholder',
      'Your full name',
    );
  });
});
