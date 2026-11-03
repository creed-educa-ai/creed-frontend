import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { CompanyViewFilter } from './CompanyViewFilter';

function renderizar(departments: { id: 'Marketing'; label: string }[]) {
  render(
    <CompanyViewFilter
      departments={departments}
      members={[{ id: '1', label: 'Fulana' }]}
      value={{}}
      label="Acme Inc."
      organizationName="Acme Inc."
      onChange={() => undefined}
    />,
  );
}

describe('CompanyViewFilter', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra o submenu de setor quando a organização tem setores', async () => {
    const user = userEvent.setup();
    renderizar([{ id: 'Marketing', label: 'Marketing' }]);

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    expect(screen.getByRole('menuitem', { name: 'Setor' })).toBeInTheDocument();
  });

  it('esconde o submenu de setor quando a organização não tem nenhum', async () => {
    const user = userEvent.setup();
    renderizar([]);

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Setor' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Funcionário' }),
    ).toBeInTheDocument();
  });
});
