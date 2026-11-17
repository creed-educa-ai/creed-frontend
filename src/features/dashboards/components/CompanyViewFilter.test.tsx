import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { CompanyViewFilter } from './CompanyViewFilter';

function renderizar(
  departments: { id: 'Marketing'; label: string }[],
  {
    ownResult,
    members = [],
  }: {
    ownResult?: { id: string; label: string };
    members?: { id: string; label: string }[];
  } = {},
) {
  const onChange = vi.fn();
  const onOpenOwnResult = vi.fn();
  render(
    <CompanyViewFilter
      departments={departments}
      ownResult={ownResult}
      onOpenOwnResult={onOpenOwnResult}
      members={members}
      value={{}}
      label="Acme Inc."
      organizationName="Acme Inc."
      onChange={onChange}
    />,
  );
  return { onChange, onOpenOwnResult };
}

describe('CompanyViewFilter', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('lista a empresa toda e os setores numa lista só', async () => {
    const user = userEvent.setup();
    renderizar([{ id: 'Marketing', label: 'Marketing' }]);

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));

    expect(
      screen.getByRole('menuitemradio', { name: 'Acme Inc.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Marketing' }),
    ).toBeInTheDocument();
    // Sem submenu de setor.
    expect(
      screen.queryByRole('menuitem', { name: 'Setor' }),
    ).not.toBeInTheDocument();
  });

  it('esconde os setores quando a organização não tem nenhum', async () => {
    const user = userEvent.setup();
    renderizar([]);

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));

    expect(screen.queryByText('Setor')).not.toBeInTheDocument();
  });

  it('a gestora vê o próprio nome, e ele abre o resultado individual dela', async () => {
    const user = userEvent.setup();
    const { onChange, onOpenOwnResult } = renderizar(
      [{ id: 'Marketing', label: 'Marketing' }],
      {
        ownResult: { id: 'link-gestora', label: 'Gestora Exemplo' },
      },
    );

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Funcionário' }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('menuitemradio', { name: 'Gestora Exemplo' }),
    );

    // Não é um recorte da empresa: é o dashboard individual dela.
    expect(onOpenOwnResult).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('põe o próprio nome acima, separado da empresa e dos setores', async () => {
    const user = userEvent.setup();
    renderizar([{ id: 'Marketing', label: 'Marketing' }], {
      ownResult: { id: 'link-gestora', label: 'Gestora Exemplo' },
    });

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));

    expect(
      screen.getAllByRole('menuitemradio').map((item) => item.textContent),
    ).toEqual(['Gestora Exemplo', 'Acme Inc.', 'Marketing']);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    // Sem o rótulo "Setor": os setores ficam junto da empresa.
    expect(screen.queryByText('Setor')).not.toBeInTheDocument();
  });

  it('a administradora vê as outras pessoas num submenu', async () => {
    const user = userEvent.setup();
    renderizar([], { members: [{ id: '1', label: 'Fulana' }] });

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));

    expect(
      screen.getByRole('menuitem', { name: 'Funcionário' }),
    ).toBeInTheDocument();
  });
});
