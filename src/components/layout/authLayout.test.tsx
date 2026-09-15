// O visual (painel no topo no mobile, à direita no desktop, cantos arredondados)
// é CSS e o jsdom não faz layout: isso se confere no navegador, em 375 · 768 ·
// 1280. Aqui fica só o que o componente promete para quem o usa.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/authLayout';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('AuthLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra o conteúdo da tela, o título do painel e a marca', () => {
    render(
      <AuthLayout titulo="Título do painel" subtitulo="Texto de apoio">
        <h1>Conteúdo da tela</h1>
      </AuthLayout>,
    );

    expect(
      screen.getByRole('heading', { name: 'Conteúdo da tela' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Título do painel' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Texto de apoio')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'CREED.ai' })).toBeInTheDocument();
  });

  it('não reserva espaço para o subtítulo quando ele não é passado', () => {
    const { container } = render(
      <AuthLayout titulo="Título do painel">
        <p>Conteúdo</p>
      </AuthLayout>,
    );

    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('leva para boas-vindas ao clicar na marca', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<p>Tela de boas-vindas</p>} />
          <Route
            path="/login"
            element={
              <AuthLayout titulo="Login" exibirNavegacao>
                <p>Conteúdo</p>
              </AuthLayout>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(
      screen.getByRole('link', { name: 'Ir para a tela de boas-vindas' }),
    );

    expect(screen.getByText('Tela de boas-vindas')).toBeInTheDocument();
  });

  it('volta para a entrada anterior do histórico', async () => {
    render(
      <MemoryRouter initialEntries={['/origem', '/login']} initialIndex={1}>
        <Routes>
          <Route path="/origem" element={<p>Tela anterior</p>} />
          <Route
            path="/login"
            element={
              <AuthLayout titulo="Login" exibirNavegacao>
                <p>Conteúdo</p>
              </AuthLayout>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('Tela anterior')).toBeInTheDocument();
  });

  // O símbolo não tem papel acessível próprio: a classe da animação é o que
  // distingue "parado" de "girando" no DOM.
  it('gira o símbolo do painel só enquanto está carregando', () => {
    const { container, rerender } = render(
      <AuthLayout titulo="Login">
        <p>Conteúdo</p>
      </AuthLayout>,
    );
    expect(container.querySelector('.animate-logo-giro')).toBeNull();

    rerender(
      <AuthLayout titulo="Login" carregando>
        <p>Conteúdo</p>
      </AuthLayout>,
    );
    expect(container.querySelector('.animate-logo-giro')).not.toBeNull();
  });

  // Se o delay mudasse a cada re-render, o degradê pularia enquanto a pessoa
  // digita no formulário. Ele só pode ser calculado quando o painel monta.
  it('fixa o ponto da animação na montagem, sem mudar em re-render', () => {
    const relogio = vi.spyOn(performance, 'now').mockReturnValue(5000);
    const painel = () =>
      screen.getByRole('img', { name: 'CREED.ai' }).parentElement;

    const { rerender, unmount } = render(
      <AuthLayout titulo="Login">
        <p>Conteúdo</p>
      </AuthLayout>,
    );
    expect(painel()).toHaveStyle({ animationDelay: '-5000ms' });

    relogio.mockReturnValue(9000);
    rerender(
      <AuthLayout titulo="Login">
        <p>Conteúdo com outro estado</p>
      </AuthLayout>,
    );
    expect(painel()).toHaveStyle({ animationDelay: '-5000ms' });

    // Troca de página: painel novo acompanha o relógio.
    unmount();
    render(
      <AuthLayout titulo="Cadastro">
        <p>Outra tela</p>
      </AuthLayout>,
    );
    expect(painel()).toHaveStyle({ animationDelay: '-9000ms' });

    relogio.mockRestore();
  });
});
