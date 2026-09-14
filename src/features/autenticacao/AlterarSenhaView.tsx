import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/layout/authLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { alterarSenhaSchema, type AlterarSenhaForm } from '@/lib/validadores';

export function AlterarSenhaView() {
  const { t } = useTranslation(['autenticacao']);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AlterarSenhaForm>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: { novaSenha: '', confirmarSenha: '' },
  });

  // > 🟡 Premissa P-003 — sem integração com o backend ainda (não existe
  // domínio de autenticação no creed-backend). Atualizar quando o contrato
  // existir.
  async function aoEnviar(dados: AlterarSenhaForm) {
    console.info('Senha validada, pronta para quando a API existir:', dados);
    // PROVISÓRIO — espera simulada para a apresentação. Sem API, o envio é
    // instantâneo e o símbolo do painel não chegaria a girar. Sai junto com a
    // P-003: a própria requisição passa a ser a espera.
    await new Promise((resolver) => setTimeout(resolver, 1500));
  }

  // t() só aceita, em tempo de compilação, as chaves que existem no
  // dicionário — mas a mensagem de erro que vem do schema (zod) chega como
  // string comum em tempo de execução, mesmo sendo sempre uma chave válida na
  // prática (só o nosso schema produz esse valor). `as never` avisa ao
  // TypeScript "aceite esse valor onde quer que ele caiba" só neste ponto.
  function erroDoCampo(chave?: string) {
    if (!chave) return undefined;
    return { message: t(chave as never) };
  }

  return (
    <AuthLayout
      titulo={t('autenticacao:primeiroAcesso.boasVindasTitulo')}
      subtitulo={t('autenticacao:primeiroAcesso.boasVindasMensagem')}
      carregando={isSubmitting}
    >
      <h1 className="text-2xl font-bold text-heading">
        {t('autenticacao:primeiroAcesso.titulo')}
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        {t('autenticacao:primeiroAcesso.subtitulo')}
      </p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(evento) => void handleSubmit(aoEnviar)(evento)}
      >
        {/* campo de nova senha */}
        <Field data-invalid={Boolean(errors.novaSenha)}>
          <FieldLabel htmlFor="novaSenha">
            {t('autenticacao:primeiroAcesso.campoNovaSenha')}
          </FieldLabel>
          <Input
            id="novaSenha"
            type="password"
            aria-invalid={Boolean(errors.novaSenha)}
            {...register('novaSenha')}
          />
          <FieldError errors={[erroDoCampo(errors.novaSenha?.message)]} />
        </Field>

        {/* campo de confirmação de nova senha */}
        <Field data-invalid={Boolean(errors.confirmarSenha)}>
          <FieldLabel htmlFor="confirmarSenha">
            {t('autenticacao:primeiroAcesso.campoConfirmarSenha')}
          </FieldLabel>
          <Input
            id="confirmarSenha"
            type="password"
            aria-invalid={Boolean(errors.confirmarSenha)}
            {...register('confirmarSenha')}
          />
          <FieldError errors={[erroDoCampo(errors.confirmarSenha?.message)]} />
        </Field>

        {/* botão salvar */}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {t('autenticacao:primeiroAcesso.avancar')}
        </Button>
      </form>
    </AuthLayout>
  );
}
