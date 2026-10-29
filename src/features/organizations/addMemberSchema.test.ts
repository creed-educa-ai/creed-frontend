import {
  MEMBER_NAME_MAX,
  addMemberSchema,
} from '@/features/organizations/addMemberSchema';

const valido = {
  name: 'Ana Souza',
  email: 'ana@empresa.com.br',
  role: 'gestor',
};

function primeiroErro(dados: object) {
  const resultado = addMemberSchema.safeParse(dados);
  return resultado.success ? null : resultado.error.issues[0]?.message;
}

describe('addMemberSchema', () => {
  it.each(['respondente', 'gestor'])('aceita a função %s', (role) => {
    const resultado = addMemberSchema.safeParse({ ...valido, role });

    expect(resultado.success).toBe(true);
  });

  it('recusa admin: a empresa não cria administradores', () => {
    const resultado = addMemberSchema.safeParse({ ...valido, role: 'admin' });

    expect(resultado.success).toBe(false);
  });

  it('recusa e-mail inválido com a chave de tradução do erro', () => {
    expect(primeiroErro({ ...valido, email: 'nao-e-email' })).toBe(
      'organizations:errors.invalidEmail',
    );
  });

  it('aceita nome com 2 e com 200 caracteres, os limites do back', () => {
    for (const name of ['Al', 'a'.repeat(MEMBER_NAME_MAX)]) {
      expect(addMemberSchema.safeParse({ ...valido, name }).success).toBe(true);
    }
  });

  it.each([
    ['vazio', ''],
    ['com 1 caractere', 'A'],
    ['com 201 caracteres', 'a'.repeat(MEMBER_NAME_MAX + 1)],
    ['só com espaços', '     '],
  ])('recusa nome %s com a chave de tradução do erro', (_caso, name) => {
    expect(primeiroErro({ ...valido, name })).toBe(
      'organizations:errors.invalidName',
    );
  });

  it('entrega o nome sem os espaços das pontas', () => {
    const resultado = addMemberSchema.parse({
      ...valido,
      name: '  Ana Souza  ',
    });

    expect(resultado.name).toBe('Ana Souza');
  });
});
