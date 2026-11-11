import { describe, expect, it } from 'vitest';
import { signUpSchema } from '@/lib/validators';

// As regras do `OrganizationSignUp` do back, conferidas direto no schema: a
// tela (SignUpView.test.tsx) só prova que um envio barrado não chama o back.
const VALIDO = {
  nomeEmpresa: 'Empresa Teste',
  documento: '12.345.678/0001-90',
  email: 'gestora@empresa.com.br',
  nomeCompleto: 'Gestora Teste',
  telefone: '51 99999-0000',
};

function errosDe(dados: Partial<typeof VALIDO>) {
  const resultado = signUpSchema.safeParse({ ...VALIDO, ...dados });
  if (resultado.success) return {};
  // A tela mostra a primeira mensagem de cada campo.
  const primeiraPorCampo: Record<string, string> = {};
  for (const issue of resultado.error.issues) {
    const campo = String(issue.path[0]);
    primeiraPorCampo[campo] ??= issue.message;
  }
  return primeiraPorCampo;
}

describe('signUpSchema', () => {
  it('aceita o cadastro válido e tira os espaços das pontas, como o back', () => {
    const resultado = signUpSchema.parse({
      ...VALIDO,
      nomeEmpresa: '  Empresa Teste  ',
      telefone: ' 51 ',
    });

    expect(resultado.nomeEmpresa).toBe('Empresa Teste');
    expect(resultado.telefone).toBe('51');
    // O documento segue como foi digitado: quem guarda só os dígitos é o back.
    expect(resultado.documento).toBe('12.345.678/0001-90');
  });

  describe('documento (P-076)', () => {
    it.each([
      { caso: 'CPF com pontuação', documento: '123.456.789-09' },
      { caso: 'CPF só com dígitos', documento: '12345678909' },
      { caso: 'CNPJ com pontuação', documento: '12.345.678/0001-90' },
      { caso: 'CNPJ só com dígitos', documento: '12345678000190' },
    ])('aceita $caso', ({ documento }) => {
      expect(errosDe({ documento })).toEqual({});
    });

    it.each([
      { caso: 'curto demais', documento: '123' },
      { caso: 'com 12 dígitos', documento: '123456789012' },
      { caso: 'com letra no meio', documento: '1234567890A' },
    ])('recusa documento $caso', ({ documento }) => {
      expect(errosDe({ documento })).toEqual({
        documento: 'cadastro:erros.documentoInvalido',
      });
    });

    it('trata só espaços como campo vazio', () => {
      expect(errosDe({ documento: '   ' })).toEqual({
        documento: 'comum:erros.obrigatorio',
      });
    });
  });

  it('recusa e-mail mal formado com a mesma mensagem do login', () => {
    expect(errosDe({ email: 'abc' })).toEqual({
      email: 'autenticacao:erros.emailInvalido',
    });
  });

  describe('nome do responsável (P-082)', () => {
    it.each([
      { caso: '1 caractere', nomeCompleto: 'A' },
      { caso: '201 caracteres', nomeCompleto: 'A'.repeat(201) },
    ])('recusa $caso', ({ nomeCompleto }) => {
      expect(errosDe({ nomeCompleto })).toEqual({
        nomeCompleto: 'cadastro:erros.nomeCompletoInvalido',
      });
    });

    it('aceita 2 e 200 caracteres', () => {
      expect(errosDe({ nomeCompleto: 'Al' })).toEqual({});
      expect(errosDe({ nomeCompleto: 'A'.repeat(200) })).toEqual({});
    });
  });

  it('recusa nome da empresa com mais de 200 e telefone com mais de 30', () => {
    expect(
      errosDe({ nomeEmpresa: 'A'.repeat(201), telefone: '1'.repeat(31) }),
    ).toEqual({
      nomeEmpresa: 'cadastro:erros.ate200Caracteres',
      telefone: 'cadastro:erros.ate30Caracteres',
    });
  });
});
