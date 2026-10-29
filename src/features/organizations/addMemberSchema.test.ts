import { addMemberSchema } from '@/features/organizations/addMemberSchema';

describe('addMemberSchema', () => {
  it.each(['respondente', 'gestor'])('aceita a função %s', (role) => {
    const resultado = addMemberSchema.safeParse({
      email: 'ana@empresa.com.br',
      role,
    });

    expect(resultado.success).toBe(true);
  });

  it('recusa admin: a empresa não cria administradores', () => {
    const resultado = addMemberSchema.safeParse({
      email: 'ana@empresa.com.br',
      role: 'admin',
    });

    expect(resultado.success).toBe(false);
  });

  it('recusa e-mail inválido com a chave de tradução do erro', () => {
    const resultado = addMemberSchema.safeParse({
      email: 'nao-e-email',
      role: 'gestor',
    });

    expect(resultado.success ? null : resultado.error.issues[0]?.message).toBe(
      'organizations:errors.invalidEmail',
    );
  });
});
