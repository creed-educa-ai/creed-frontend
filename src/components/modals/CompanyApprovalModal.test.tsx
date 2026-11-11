import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyApprovalModal } from './CompanyApprovalModal';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { OrganizationResponse } from '@/types/api';

const EMPRESA: OrganizationResponse = {
  id: '5a1e9c3b-2f7d-4b8a-9e6c-0d4f1b2a3c5e',
  name: 'Acme Inc.',
  address: '[A informar]',
  document_id: '3b2f8c1a-6d4e-4f7a-9c5b-1e0d2a8f6b94',
  status: 'pending',
  email: 'contato@acme.com',
  contact_name: 'João Silva',
  phone: '+55 (51) 99999.0000',
  document: { type: 'cnpj', value: '12345678000190' },
  created_at: '2026-11-10T12:00:00Z',
  updated_at: null,
};

function renderizar(
  props: Partial<React.ComponentProps<typeof CompanyApprovalModal>> = {},
) {
  const aoMudarAbertura = vi.fn();
  const aoAceitar = vi.fn();
  const aoRejeitar = vi.fn();

  render(
    <CompanyApprovalModal
      open={true}
      onOpenChange={aoMudarAbertura}
      empresa={EMPRESA}
      onAccept={aoAceitar}
      onReject={aoRejeitar}
      {...props}
    />,
  );

  return { aoMudarAbertura, aoAceitar, aoRejeitar };
}

describe('CompanyApprovalModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra os dados da empresa quando aberto', () => {
    renderizar();

    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    // O número, não o id do documento.
    expect(screen.getByText('12345678000190')).toBeInTheDocument();
    expect(screen.getByText('contato@acme.com')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('+55 (51) 99999.0000')).toBeInTheDocument();
  });

  it('mostra "—" nos dados de contato que vieram nulos', () => {
    renderizar({
      empresa: { ...EMPRESA, email: null, contact_name: null, phone: null },
    });

    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('mostra o título e os rótulos de cada campo', () => {
    renderizar();

    expect(screen.getByText(i18n.t('aceite:titulo'))).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('cadastro:campos.nomeEmpresa.rotulo')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('cadastro:campos.documento.rotulo')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('cadastro:campos.email.rotulo')),
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t('aceite:responsavel'))).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('cadastro:campos.telefone.rotulo')),
    ).toBeInTheDocument();
  });

  it('não renderiza quando fechado', () => {
    renderizar({ open: false });

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
  });

  it('não renderiza quando não há empresa selecionada', () => {
    renderizar({ empresa: null });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ao clicar em Aceitar, fecha o modal e avisa o aceite', async () => {
    const user = userEvent.setup();
    const { aoMudarAbertura, aoAceitar, aoRejeitar } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('aceite:aceitar') }),
    );

    expect(aoAceitar).toHaveBeenCalledTimes(1);
    expect(aoMudarAbertura).toHaveBeenCalledWith(false);
    expect(aoRejeitar).not.toHaveBeenCalled();
  });

  it('ao clicar em Rejeitar, pede confirmação antes de rejeitar', async () => {
    const user = userEvent.setup();
    const { aoRejeitar } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('aceite:rejeitar') }),
    );

    const confirmacao = screen.getByRole('alertdialog');
    expect(
      within(confirmacao).getByText(/Você vai rejeitar Acme Inc\./),
    ).toBeInTheDocument();
    expect(aoRejeitar).not.toHaveBeenCalled();
  });

  it('cancelar a confirmação volta para o modal sem rejeitar', async () => {
    const user = userEvent.setup();
    const { aoRejeitar } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('aceite:rejeitar') }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Cancelar',
      }),
    );

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(aoRejeitar).not.toHaveBeenCalled();
  });

  it('ao confirmar a rejeição, fecha o modal e avisa a rejeição', async () => {
    const user = userEvent.setup();
    const { aoMudarAbertura, aoAceitar, aoRejeitar } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('aceite:rejeitar') }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: i18n.t('aceite:rejeitar'),
      }),
    );

    expect(aoRejeitar).toHaveBeenCalledTimes(1);
    expect(aoMudarAbertura).toHaveBeenCalledWith(false);
    expect(aoAceitar).not.toHaveBeenCalled();
  });

  it('pede o fechamento ao apertar Escape, sem aceitar nem rejeitar', async () => {
    const { aoMudarAbertura, aoAceitar, aoRejeitar } = renderizar();

    await userEvent.keyboard('{Escape}');

    expect(aoMudarAbertura).toHaveBeenCalledWith(false);
    expect(aoAceitar).not.toHaveBeenCalled();
    expect(aoRejeitar).not.toHaveBeenCalled();
  });

  it('traduz os textos ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(screen.getByText('Registration request')).toBeInTheDocument();
    expect(screen.getByText('Registered by')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });
});
