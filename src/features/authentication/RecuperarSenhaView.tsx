import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/layout/authLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  recuperarSenhaSchema,
  type RecuperarSenhaForm,
} from '@/lib/validadores';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  EMAIL_RECUSADO,
  clearPasswordReset,
  requestPasswordReset,
} from '@/features/authentication/authenticationSlice';

// "Esqueci minha senha": a tela só pede o e-mail. Quem define a senha nova é
// a página do Keycloak, aberta pelo link que o back manda (P-012).
export function RecuperarSenhaView() {
  const { t } = useTranslation(['autenticacao']);
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(
    (state) => state.authentication.passwordReset,
  );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaForm>({
    resolver: zodResolver(recuperarSenhaSchema),
    defaultValues: { email: '' },
  });

  // O store é um só para o app: limpar ao entrar cobre o pedido que terminou
  // depois de a pessoa sair, e limpar ao sair evita que o resultado antigo
  // pisque na próxima visita. Não cobre o pedido que só resolve depois de ela
  // voltar: a visita nova mostra o resultado dele. Janela estreita, aceita.
  useEffect(() => {
    dispatch(clearPasswordReset());
    return () => {
      dispatch(clearPasswordReset());
    };
  }, [dispatch]);

  // Envio barrado pelo zod: a mensagem do envio anterior não vale mais.
  function aoRecusarFormulario() {
    dispatch(clearPasswordReset());
  }

  async function aoEnviar(dados: RecuperarSenhaForm) {
    try {
      await dispatch(requestPasswordReset({ email: dados.email })).unwrap();
    } catch (chave) {
      // O 422 é erro do campo, como o do zod. Os outros ficam no aviso
      // abaixo do botão, que lê o erro do slice.
      if (chave === EMAIL_RECUSADO) {
        setError('email', { message: EMAIL_RECUSADO });
      }
    }
  }

  function erroDoCampo(chave?: string) {
    if (!chave) return undefined;
    return { message: t(chave as never) };
  }

  // O 422 já aparece no campo: não se repete no aviso.
  const erroDoEnvio =
    status === 'error' && error !== EMAIL_RECUSADO ? error : null;

  return (
    <AuthLayout
      titulo={t('autenticacao:recuperarSenha.painelTitulo')}
      subtitulo={t('autenticacao:recuperarSenha.painelDescricao')}
      carregando={isSubmitting}
      exibirNavegacao
    >
      <h1 className="text-3xl font-bold text-heading">
        {t('autenticacao:recuperarSenha.titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('autenticacao:recuperarSenha.subtitulo')}
      </p>

      {/* noValidate: sem ele, o navegador barra o e-mail inválido com a
          mensagem dele, no idioma dele, antes do zod. */}
      <form
        noValidate
        className="mt-7 flex flex-col gap-4"
        onSubmit={(evento) =>
          void handleSubmit(aoEnviar, aoRecusarFormulario)(evento)
        }
      >
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">
            {t('autenticacao:recuperarSenha.email.rotulo')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('autenticacao:recuperarSenha.email.placeholder')}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError errors={[erroDoCampo(errors.email?.message)]} />
        </Field>

        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {t('autenticacao:recuperarSenha.enviar')}
        </Button>

        {/* A mesma mensagem para qualquer 204: a tela não revela se o e-mail
            tem acesso. O formulário fica, para corrigir e reenviar. */}
        {status === 'ready' && (
          <p role="status" className="text-center text-sm text-foreground">
            {t('autenticacao:recuperarSenha.enviado')}
          </p>
        )}
        {erroDoEnvio && (
          <p role="alert" className="text-center text-sm text-destructive">
            {t(erroDoEnvio as never)}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
