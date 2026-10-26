import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalAceite, type EmpresaPendente } from './ModalAceite';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const EMPRESA: EmpresaPendente = {
  nomeEmpresa: 'Acme Inc.',
  documento: '12.345.678/0001-90',
  email: 'contato@acme.com',
  nomeResponsavel: 'João Silva',
  telefone: '+55 (51) 99999.0000',
};

function renderizar(
  props: Partial<React.ComponentProps<typeof ModalAceite>> = {},
) {
  const aoMudarAbertura = vi.fn();
  const aoAceitar = vi.fn();
  const aoRejeitar = vi.fn();

  render(
    <ModalAceite
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

describe('ModalAceite', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra os dados da empresa quando aberto', () => {
    renderizar();

    expect(screen.getByText(EMPRESA.nomeEmpresa)).toBeInTheDocument();
    expect(screen.getByText(EMPRESA.documento)).toBeInTheDocument();
    expect(screen.getByText(EMPRESA.email)).toBeInTheDocument();
    expect(screen.getByText(EMPRESA.nomeResponsavel)).toBeInTheDocument();
    expect(screen.getByText(EMPRESA.telefone)).toBeInTheDocument();
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

    expect(screen.queryByText(EMPRESA.nomeEmpresa)).not.toBeInTheDocument();
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

  it('ao clicar em Rejeitar, fecha o modal e avisa a rejeição', async () => {
    const user = userEvent.setup();
    const { aoMudarAbertura, aoAceitar, aoRejeitar } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('aceite:rejeitar') }),
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
