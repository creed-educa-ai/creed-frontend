import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { Toaster } from '@/components/ui/sonner';
import { lastCall, stubFetch } from '@/test/stubFetch';
import type { ListaPaginada, OrganizationResponse } from '@/types/api';
import { CompaniesSection } from './CompaniesSection';

const ORGANIZACAO_DA_SESSAO = 'org-creed';

function organizacao(
  id: string,
  name: string,
  status: OrganizationResponse['status'],
): OrganizationResponse {
  return {
    id,
    name,
    address: '[A informar]',
    document_id: `doc-${id}`,
    status,
    email: `contato@${id}.com`,
    contact_name: 'Ana Silva',
    phone: '51 99999-0000',
    document: { type: 'cnpj', value: '12345678000190' },
    created_at: '2026-11-10T12:00:00Z',
    updated_at: null,
  };
}

const ORGANIZACOES = [
  organizacao(ORGANIZACAO_DA_SESSAO, 'CREED', 'active'),
  organizacao('acme', 'Acme Inc.', 'pending'),
  organizacao('tech', 'Tech Solutions', 'active'),
  organizacao('antiga', 'Antiga Ltda.', 'inactive'),
];

const LISTA: ListaPaginada<OrganizationResponse> = {
  itens: ORGANIZACOES,
  total: ORGANIZACOES.length,
  pagina: 1,
  tamanho_pagina: 200,
};

// Uma resposta só para a próxima chamada; as outras recebem a lista.
function responder(status: number, body?: unknown) {
  return Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

// O filtro da P-081 lê a organização da sessão: a store precisa da
// autenticação, como a do app.
function criarStore() {
  return configureStore({
    reducer: {
      authentication: authenticationReducer,
      organizations: organizationsReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'admin@creed.example.com',
          role: 'admin',
          link_id: 'vinculo-1',
          organization_id: ORGANIZACAO_DA_SESSAO,
          organization_name: 'CREED',
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });
}

// Renderiza e espera a lista chegar: a seção carrega pelo slice.
async function renderizar() {
  render(
    <Provider store={criarStore()}>
      <CompaniesSection />
      <Toaster />
    </Provider>,
  );
  await screen.findByRole('table');
}

function tabela() {
  return within(screen.getByRole('table'));
}

async function abrirAceite(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    tabela().getByRole('button', {
      name: 'Pendente: analisar o cadastro de Acme Inc.',
    }),
  );
  await screen.findByRole('heading', { name: 'Solicitação de cadastro' });
}

async function excluir(user: ReturnType<typeof userEvent.setup>, nome: string) {
  await user.click(tabela().getByRole('button', { name: `Excluir ${nome}` }));
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Excluir',
    }),
  );
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
}

describe('CompaniesSection', () => {
  let fetchMock: ReturnType<typeof stubFetch>;

  beforeEach(async () => {
    window.localStorage.clear();
    fetchMock = stubFetch(200, LISTA);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista as organizações do back, menos a da sessão', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { name: 'Empresas' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/organizacoes?pagina=1&tamanho_pagina=200',
      expect.anything(),
    );
    expect(tabela().queryByText('CREED')).not.toBeInTheDocument();

    const linhaAcme = screen.getByRole('row', { name: /Acme Inc\./ });
    expect(
      within(linhaAcme).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    ).toBeInTheDocument();
    const linhaTech = screen.getByRole('row', { name: /Tech Solutions/ });
    expect(within(linhaTech).getByText('Ativo')).toBeInTheDocument();
    const linhaAntiga = screen.getByRole('row', { name: /Antiga Ltda\./ });
    expect(within(linhaAntiga).getByText('Inativo')).toBeInTheDocument();
  });

  it('aceitar aprova no back, troca a linha por "Ativo" e avisa do convite', async () => {
    const user = userEvent.setup();
    await renderizar();
    await abrirAceite(user);
    fetchMock.mockImplementationOnce(() =>
      responder(200, organizacao('acme', 'Acme Inc.', 'active')),
    );

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizations/acme/approval',
      method: 'POST',
    });
    expect(await screen.findByText('Empresa aprovada')).toBeInTheDocument();
    expect(
      screen.getByText(
        'O convite de acesso de Acme Inc. foi enviado ao e-mail do cadastro.',
      ),
    ).toBeInTheDocument();
    const linhaAcme = screen.getByRole('row', { name: /Acme Inc\./ });
    expect(within(linhaAcme).getByText('Ativo')).toBeInTheDocument();
    expect(
      within(linhaAcme).getByRole('button', { name: 'Ver Resultados' }),
    ).toBeEnabled();
  });

  it('aprovação com 409 explica as duas causas e recarrega a lista', async () => {
    const user = userEvent.setup();
    await renderizar();
    await abrirAceite(user);
    fetchMock.mockImplementationOnce(() =>
      responder(409, { detail: 'A organização não está pendente.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(
      await screen.findByText('Não foi possível aprovar a empresa'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ela pode já ter sido aprovada, ou o e-mail informado já tem acesso à plataforma. Se for o e-mail, rejeite o cadastro.',
      ),
    ).toBeInTheDocument();
    // Carregar, aprovar e carregar de novo.
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizacoes?pagina=1&tamanho_pagina=200',
      method: 'GET',
    });
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('aprovação com 503 pede para tentar de novo, sem recarregar', async () => {
    const user = userEvent.setup();
    await renderizar();
    await abrirAceite(user);
    fetchMock.mockImplementationOnce(() =>
      responder(503, { detail: 'Envio de e-mail indisponível.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(
      await screen.findByText('Não foi possível aprovar a empresa'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tente novamente em alguns instantes.'),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const linhaAcme = screen.getByRole('row', { name: /Acme Inc\./ });
    expect(
      within(linhaAcme).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Empresa aprovada')).toBeNull();
  });

  it('rejeitar exclui a pendente no back e tira a linha', async () => {
    const user = userEvent.setup();
    await renderizar();
    await abrirAceite(user);
    fetchMock.mockImplementationOnce(() => responder(204));

    await user.click(screen.getByRole('button', { name: 'Rejeitar' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Rejeitar',
      }),
    );

    expect(await screen.findByText('Empresa rejeitada')).toBeInTheDocument();
    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizations/acme',
      method: 'DELETE',
    });
    expect(tabela().queryByText('Acme Inc.')).toBeNull();
    expect(tabela().getByText('Tech Solutions')).toBeInTheDocument();
  });

  it('excluir chama o DELETE em /organizations e tira só aquela linha', async () => {
    const user = userEvent.setup();
    await renderizar();
    fetchMock.mockImplementationOnce(() => responder(204));

    await excluir(user, 'Tech Solutions');

    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizations/tech',
      method: 'DELETE',
    });
    expect(await screen.findByText('Empresa excluída')).toBeInTheDocument();
    expect(
      screen.getByText('Tech Solutions foi removida da plataforma.'),
    ).toBeInTheDocument();
    expect(tabela().queryByText('Tech Solutions')).toBeNull();
    expect(tabela().getByText('Acme Inc.')).toBeInTheDocument();
    expect(tabela().getByText('Antiga Ltda.')).toBeInTheDocument();
  });

  it('excluir com 503 avisa por toast e mantém a linha', async () => {
    const user = userEvent.setup();
    await renderizar();
    fetchMock.mockImplementationOnce(() =>
      responder(503, { detail: 'Keycloak indisponível.' }),
    );

    await excluir(user, 'Tech Solutions');

    expect(
      await screen.findByText('Não foi possível excluir a empresa'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tente novamente em alguns instantes.'),
    ).toBeInTheDocument();
    expect(tabela().getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.queryByText('Empresa excluída')).toBeNull();
  });

  it('mostra o erro traduzido quando a lista não carrega', async () => {
    stubFetch(503, { detail: 'Falha técnica' });
    render(
      <Provider store={criarStore()}>
        <CompaniesSection />
      </Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as empresas.',
    );
  });
});
