import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { linksApi } from '@/features/links/linksApi';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import { ApiError } from '@/lib/apiClient';
import {
  INVITE_EMAIL_TAKEN,
  INVITE_FAILED,
} from '@/features/users/addMemberSchema';
import { usersApi } from '@/features/users/usersApi';
import reducer, {
  deleteMember,
  deleteMentee,
  inviteMember,
  inviteMentee,
  loadMembers,
  loadMentees,
  paraMember,
  updateMemberTag,
} from '@/features/users/usersSlice';
import type {
  Member,
  MemberListItem,
  OrganizationResponse,
  UserResponse,
} from '@/types/api';

const estadoInicial = reducer(undefined, { type: '@@init' });

const membro: Member = {
  id: '1',
  name: 'Enner Valência',
  email: 'michael.mitc@example.com',
  status: 'respondeu',
  tag: 'Marketing',
  updated_at: '2026-10-18T14:12:00.000Z',
};

describe('usersSlice', () => {
  it('marca carregando ao iniciar a busca', () => {
    const estado = reducer(estadoInicial, loadMembers.pending('', 'org-1'));
    expect(estado.status).toBe('loading');
  });

  it('guarda os membros e o nome da organização quando a busca conclui', () => {
    const estado = reducer(
      estadoInicial,
      loadMembers.fulfilled(
        { members: [membro], organization: 'Acme Inc.' },
        '',
        'org-1',
      ),
    );
    expect(estado.status).toBe('ready');
    expect(estado.members).toEqual([membro]);
    expect(estado.organization).toBe('Acme Inc.');
  });

  it('remove o membro após exclusão', () => {
    const cheio = {
      ...estadoInicial,
      status: 'ready' as const,
      members: [membro],
      organization: 'Acme Inc.',
    };
    const estado = reducer(
      cheio,
      deleteMember.fulfilled('1', '', { organizationId: 'org-1', id: '1' }),
    );
    expect(estado.members).toHaveLength(0);
  });

  it('troca a tag do membro, e aceita ficar sem tag', () => {
    const cheio = { ...estadoInicial, members: [membro] };
    const comTi = reducer(
      cheio,
      updateMemberTag.fulfilled({ id: '1', tag: 'TecnologiaInformacao' }, '', {
        organizationId: 'org-1',
        id: '1',
        tag: 'TecnologiaInformacao',
      }),
    );
    expect(comTi.members[0]?.tag).toBe('TecnologiaInformacao');
    const semTag = reducer(
      comTi,
      updateMemberTag.fulfilled({ id: '1', tag: null }, '', {
        organizationId: 'org-1',
        id: '1',
        tag: null,
      }),
    );
    expect(semTag.members[0]?.tag).toBeNull();
  });

  it('registra uma chave traduzível em caso de falha de carregamento', () => {
    const estado = reducer(
      estadoInicial,
      loadMembers.rejected(new Error('Falha técnica'), '', 'org-1'),
    );
    expect(estado.status).toBe('error');
    expect(estado.error).toBe('organizations:members.loadError');
  });

  it('mantém a lista quando a exclusão falha', () => {
    const cheio = {
      ...estadoInicial,
      status: 'ready' as const,
      members: [membro],
      organization: 'Acme Inc.',
    };
    const estado = reducer(
      cheio,
      deleteMember.rejected(new Error('Falha técnica'), '', {
        organizationId: 'org-1',
        id: '1',
      }),
    );
    expect(estado).toEqual(cheio);
  });
});

const ORGANIZATION_ID = '8f14e45f-ceea-467e-adde-3f81905dbc1c';

// Dado sintético, no formato do `GET /organizations/{id}/members` (M-2).
const mentorando: MemberListItem = {
  link_id: 'd40b7a55-b9cc-4b78-ae5d-ab325fd655e2',
  name: 'Enner Valência',
  email: 'enner@example.com',
  role: 'respondente',
  type: 'mentoria',
  department: null,
  updated_at: null,
  period: null,
};

// O membro como o `GET /organizations/{id}/members` devolve.
function doBack(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    link_id: 'link-enner',
    name: 'Enner Valência',
    email: 'enner@example.com',
    role: 'respondente',
    type: 'emprego',
    department: 'Marketing',
    updated_at: '2026-10-18T14:12:00.000Z',
    period: null,
    ...overrides,
  };
}

const PERIODO = {
  form_id: 'form-1',
  opens_at: '2026-11-01T12:00:00Z',
  closes_at: '2026-12-01T12:00:00Z',
  period_status: 'open' as const,
};

const ACME = { id: ORGANIZATION_ID, name: 'Acme Inc.' } as OrganizationResponse;

describe('usersSlice — membros da empresa', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('paraMember usa o vínculo como id e o setor como tag', () => {
    expect(paraMember(doBack())).toEqual({
      id: 'link-enner',
      name: 'Enner Valência',
      email: 'enner@example.com',
      status: 'semPeriodo',
      tag: 'Marketing',
      updated_at: '2026-10-18T14:12:00.000Z',
    });
  });

  it('paraMember: o status é a resposta do período', () => {
    const respondeu = { ...PERIODO, has_answered: true };
    const pendente = { ...PERIODO, has_answered: false };

    expect(paraMember(doBack({ period: respondeu })).status).toBe('respondeu');
    expect(paraMember(doBack({ period: pendente })).status).toBe('pendente');
    expect(paraMember(doBack({ period: null })).status).toBe('semPeriodo');
  });

  it('paraMember: vínculo sem login fica com e-mail vazio', () => {
    expect(paraMember(doBack({ email: null })).email).toBe('');
  });

  it('carrega todos os vínculos da organização e o nome dela', async () => {
    const listMembers = vi
      .spyOn(linksApi, 'listMembers')
      .mockResolvedValue([doBack()]);
    const getOrganization = vi
      .spyOn(organizationsApi, 'getOrganization')
      .mockResolvedValue(ACME);
    const store = configureStore({ reducer: { users: reducer } });

    await store.dispatch(loadMembers(ORGANIZATION_ID));

    expect(listMembers).toHaveBeenCalledWith(ORGANIZATION_ID);
    expect(getOrganization).toHaveBeenCalledWith(ORGANIZATION_ID);
    const { members, organization } = store.getState().users;
    expect(members.map(({ id }) => id)).toEqual(['link-enner']);
    expect(organization).toBe('Acme Inc.');
  });

  it('troca o setor no back pelo vínculo', async () => {
    const update = vi
      .spyOn(linksApi, 'updateMemberDepartment')
      .mockResolvedValue(doBack({ department: 'Financeiro' }));
    const store = configureStore({ reducer: { users: reducer } });

    await store.dispatch(
      updateMemberTag({
        organizationId: ORGANIZATION_ID,
        id: 'link-enner',
        tag: 'Financeiro',
      }),
    );

    expect(update).toHaveBeenCalledWith(
      ORGANIZATION_ID,
      'link-enner',
      'Financeiro',
    );
  });

  it('exclui no back pelo vínculo', async () => {
    const remove = vi
      .spyOn(linksApi, 'deleteMember')
      .mockResolvedValue(undefined);
    const store = configureStore({ reducer: { users: reducer } });

    await store.dispatch(
      deleteMember({ organizationId: ORGANIZATION_ID, id: 'link-enner' }),
    );

    expect(remove).toHaveBeenCalledWith(ORGANIZATION_ID, 'link-enner');
  });
});

describe('usersSlice — convidar membro da empresa', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const convite = {
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    role: 'gestor' as const,
  };

  it('convida com o papel escolhido, sem forçar o tipo', async () => {
    const invite = vi
      .spyOn(usersApi, 'inviteMember')
      .mockResolvedValue({} as UserResponse);
    const store = configureStore({ reducer: { users: reducer } });

    const resultado = await store.dispatch(
      inviteMember({ organizationId: ORGANIZATION_ID, invite: convite }),
    );

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(invite).toHaveBeenCalledWith(ORGANIZATION_ID, convite);
  });

  it('409 é o e-mail que já tem acesso', async () => {
    vi.spyOn(usersApi, 'inviteMember').mockRejectedValue(
      new ApiError('já existe', 409),
    );
    const store = configureStore({ reducer: { users: reducer } });

    const resultado = await store.dispatch(
      inviteMember({ organizationId: ORGANIZATION_ID, invite: convite }),
    );

    expect(resultado.payload).toBe(INVITE_EMAIL_TAKEN);
  });

  it('sem organização na sessão, não chama o back', async () => {
    const invite = vi.spyOn(usersApi, 'inviteMember');
    const store = configureStore({ reducer: { users: reducer } });

    const resultado = await store.dispatch(
      inviteMember({ organizationId: null, invite: convite }),
    );

    expect(invite).not.toHaveBeenCalled();
    expect(resultado.payload).toBe(INVITE_FAILED);
  });
});

describe('usersSlice — mentorandos', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pede ao back só os vínculos mentoria da organização', async () => {
    const listMembers = vi
      .spyOn(linksApi, 'listMembers')
      .mockResolvedValue([mentorando]);
    const store = configureStore({ reducer: { users: reducer } });

    await store.dispatch(loadMentees(ORGANIZATION_ID));

    expect(listMembers).toHaveBeenCalledWith(ORGANIZATION_ID, 'mentoria');
    expect(store.getState().users.mentees.items).toEqual([mentorando]);
  });

  it('carrega os mentorandos sem mexer no status dos membros', () => {
    const carregando = reducer(
      estadoInicial,
      loadMentees.pending('', ORGANIZATION_ID),
    );
    expect(carregando.mentees.status).toBe('loading');
    expect(carregando.status).toBe('idle');

    const pronto = reducer(
      carregando,
      loadMentees.fulfilled([mentorando], '', ORGANIZATION_ID),
    );
    expect(pronto.mentees.status).toBe('ready');
    expect(pronto.mentees.items).toEqual([mentorando]);
  });

  it('registra uma chave traduzível quando a carga falha', () => {
    const estado = reducer(
      estadoInicial,
      loadMentees.rejected(new Error('Falha técnica'), '', ORGANIZATION_ID),
    );
    expect(estado.mentees.status).toBe('error');
    expect(estado.mentees.error).toBe('mentees:loadError');
  });

  it('remove o mentorando pelo vínculo após exclusão', () => {
    const cheio = reducer(
      estadoInicial,
      loadMentees.fulfilled([mentorando], '', ORGANIZATION_ID),
    );
    const estado = reducer(
      cheio,
      deleteMentee.fulfilled(mentorando.link_id, '', {
        organizationId: ORGANIZATION_ID,
        linkId: mentorando.link_id,
      }),
    );
    expect(estado.mentees.items).toHaveLength(0);
  });
});

describe('usersSlice — excluir mentorando (M-3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function excluirCom(resposta: () => Promise<undefined>) {
    const deleteMember = vi
      .spyOn(linksApi, 'deleteMember')
      .mockImplementation(resposta);
    const store = configureStore({ reducer: { users: reducer } });
    store.dispatch(loadMentees.fulfilled([mentorando], '', ORGANIZATION_ID));
    const result = await store.dispatch(
      deleteMentee({
        organizationId: ORGANIZATION_ID,
        linkId: mentorando.link_id,
      }),
    );
    return {
      deleteMember,
      result,
      items: store.getState().users.mentees.items,
    };
  }

  it('apaga no back e tira a linha', async () => {
    const { deleteMember, result, items } = await excluirCom(() =>
      Promise.resolve(undefined),
    );

    expect(deleteMember).toHaveBeenCalledWith(
      ORGANIZATION_ID,
      mentorando.link_id,
    );
    expect(deleteMentee.fulfilled.match(result)).toBe(true);
    expect(items).toHaveLength(0);
  });

  it('404 conta como excluído: a pessoa já não existe', async () => {
    const { result, items } = await excluirCom(() =>
      Promise.reject(new ApiError('Membro não encontrado', 404)),
    );

    expect(deleteMentee.fulfilled.match(result)).toBe(true);
    expect(items).toHaveLength(0);
  });

  it('503 pede para tentar de novo e mantém a linha', async () => {
    const { result, items } = await excluirCom(() =>
      Promise.reject(new ApiError('Keycloak fora do ar', 503)),
    );

    expect(deleteMentee.rejected.match(result)).toBe(true);
    expect(result.payload).toBe('mentees:errors.deleteUnavailable');
    expect(items).toEqual([mentorando]);
  });

  it('403 e outros erros usam a mensagem genérica e mantêm a linha', async () => {
    const { result, items } = await excluirCom(() =>
      Promise.reject(new ApiError('Sem acesso', 403)),
    );

    expect(result.payload).toBe('comum:tabela.erroExcluir');
    expect(items).toEqual([mentorando]);
  });
});

// O que o back devolve no 201 do convite (sintético).
const CONVIDADA: UserResponse = {
  id: '6a1d2c3b-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  name: 'Ana Souza',
  email: 'ana@example.com',
  status: 'active',
  role: 'respondente',
  link_id: '7b2e3d4c-5f6a-4b7c-9d8e-0f1a2b3c4d5e',
  organization_id: '8f14e45f-ceea-467e-adde-3f81905dbc1c',
  created_at: '2026-11-12T12:00:00Z',
};

describe('usersSlice — convidar mentorando', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function convidar(organizationId: string | null = ORGANIZATION_ID) {
    const store = configureStore({ reducer: { users: reducer } });
    return store.dispatch(
      inviteMentee({
        organizationId,
        name: 'Ana Souza',
        email: 'ana@example.com',
      }),
    );
  }

  it('convida como respondente, com vínculo mentoria', async () => {
    const inviteMember = vi
      .spyOn(usersApi, 'inviteMember')
      .mockResolvedValue(CONVIDADA);

    const result = await convidar();

    expect(inviteMentee.fulfilled.match(result)).toBe(true);
    expect(inviteMember).toHaveBeenCalledWith(ORGANIZATION_ID, {
      name: 'Ana Souza',
      email: 'ana@example.com',
      role: 'respondente',
      type: 'mentoria',
    });
  });

  it('409 é o e-mail que já tem acesso', async () => {
    vi.spyOn(usersApi, 'inviteMember').mockRejectedValue(
      new ApiError('Já existe usuário com o e-mail ana@example.com', 409),
    );

    const result = await convidar();

    expect(result.payload).toBe(INVITE_EMAIL_TAKEN);
  });

  it('503 e outros erros são o convite que não saiu', async () => {
    vi.spyOn(usersApi, 'inviteMember').mockRejectedValue(
      new ApiError('Provedor fora do ar', 503),
    );

    const result = await convidar();

    expect(result.payload).toBe(INVITE_FAILED);
  });

  it('sem organização na sessão, não chama o back', async () => {
    const inviteMember = vi.spyOn(usersApi, 'inviteMember');

    const result = await convidar(null);

    expect(result.payload).toBe(INVITE_FAILED);
    expect(inviteMember).not.toHaveBeenCalled();
  });
});
