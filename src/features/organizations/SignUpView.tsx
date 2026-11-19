import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/authLayout';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  DOCUMENTO_JA_CADASTRADO,
  clearSignUp,
  signUpOrganization,
} from '@/features/organizations/organizationsSlice';
import { signUpSchema, type SignUpForm } from '@/lib/validators';
import { pageTitleClassName } from '@/lib/typography';

export function SignUpView() {
  const { t } = useTranslation(['comum', 'cadastro']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(
    (state) => state.organizations.signUp,
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      nomeEmpresa: '',
      documento: '',
      email: '',
      nomeCompleto: '',
      telefone: '',
    },
  });

  // O store é um só para o app: limpar ao entrar e ao sair evita que o erro
  // de um envio antigo apareça numa visita nova (como no PasswordResetView).
  useEffect(() => {
    dispatch(clearSignUp());
    return () => {
      dispatch(clearSignUp());
    };
  }, [dispatch]);

  // Envio barrado pelo zod: a mensagem do envio anterior não vale mais.
  function aoRecusarFormulario() {
    dispatch(clearSignUp());
  }

  async function aoEnviar(dados: SignUpForm) {
    try {
      // Os nomes da tela viram os do contrato do back.
      await dispatch(
        signUpOrganization({
          name: dados.nomeEmpresa,
          document: dados.documento,
          email: dados.email,
          contact_name: dados.nomeCompleto,
          phone: dados.telefone,
        }),
      ).unwrap();
      // viewTransition: o painel roxo cresce até virar a tela de aguarde, que
      // tem o mesmo fundo (ver `transicao-painel-marca` em index.css).
      navigate('/awaiting-confirmation', { viewTransition: true });
    } catch (chave) {
      // O 409 é erro do campo documento. Os outros ficam no aviso abaixo do
      // botão, que lê o erro do slice, e o formulário continua preenchido.
      if (chave === DOCUMENTO_JA_CADASTRADO) {
        setError('documento', { message: DOCUMENTO_JA_CADASTRADO });
      }
    }
  }

  function erroDoCampo(chave?: string) {
    if (!chave) return undefined;
    return { message: t(chave as never) };
  }

  // O 409 já aparece no campo: não se repete no aviso.
  const erroDoEnvio =
    status === 'error' && error !== DOCUMENTO_JA_CADASTRADO ? error : null;

  const nomeEmpresaInvalido = Boolean(errors.nomeEmpresa);
  const documentoInvalido = Boolean(errors.documento);
  const emailInvalido = Boolean(errors.email);
  const nomeCompletoInvalido = Boolean(errors.nomeCompleto);
  const telefoneInvalido = Boolean(errors.telefone);

  return (
    <AuthLayout
      titulo={t('cadastro:titulo')}
      subtitulo={t('cadastro:painelDescricao')}
      carregando={isSubmitting}
      exibirNavegacao
    >
      <h1 className={pageTitleClassName}>{t('cadastro:titulo')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('cadastro:subtitulo')}
      </p>

      {/* noValidate: sem ele, o navegador barra o e-mail inválido com a
          mensagem dele, no idioma dele, antes do zod. */}
      <form
        noValidate
        className="mt-8 space-y-4"
        onSubmit={(evento) =>
          void handleSubmit(aoEnviar, aoRecusarFormulario)(evento)
        }
      >
        <Field data-invalid={nomeEmpresaInvalido}>
          <FieldLabel htmlFor="nomeEmpresa">
            {t('cadastro:campos.nomeEmpresa.rotulo')}
          </FieldLabel>
          <Input
            id="nomeEmpresa"
            type="text"
            placeholder={t('cadastro:campos.nomeEmpresa.placeholder')}
            aria-invalid={nomeEmpresaInvalido}
            aria-describedby={
              nomeEmpresaInvalido ? 'nomeEmpresa-erro' : undefined
            }
            {...register('nomeEmpresa')}
          />
          <FieldError
            id="nomeEmpresa-erro"
            errors={[erroDoCampo(errors.nomeEmpresa?.message)]}
          />
        </Field>

        <Field data-invalid={documentoInvalido}>
          <FieldLabel htmlFor="documento">
            {t('cadastro:campos.documento.rotulo')}
          </FieldLabel>
          <Input
            id="documento"
            type="text"
            placeholder={t('cadastro:campos.documento.placeholder')}
            aria-invalid={documentoInvalido}
            aria-describedby={documentoInvalido ? 'documento-erro' : undefined}
            {...register('documento')}
          />
          <FieldError
            id="documento-erro"
            errors={[erroDoCampo(errors.documento?.message)]}
          />
        </Field>

        <Field data-invalid={emailInvalido}>
          <FieldLabel htmlFor="email">
            {t('cadastro:campos.email.rotulo')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('cadastro:campos.email.placeholder')}
            aria-invalid={emailInvalido}
            aria-describedby={emailInvalido ? 'email-erro' : undefined}
            {...register('email')}
          />
          <FieldError
            id="email-erro"
            errors={[erroDoCampo(errors.email?.message)]}
          />
        </Field>

        <Field data-invalid={nomeCompletoInvalido}>
          <FieldLabel htmlFor="nomeCompleto">
            {t('cadastro:campos.nomeCompleto.rotulo')}
          </FieldLabel>
          <Input
            id="nomeCompleto"
            type="text"
            placeholder={t('cadastro:campos.nomeCompleto.placeholder')}
            aria-invalid={nomeCompletoInvalido}
            aria-describedby={
              nomeCompletoInvalido ? 'nomeCompleto-erro' : undefined
            }
            {...register('nomeCompleto')}
          />
          <FieldError
            id="nomeCompleto-erro"
            errors={[erroDoCampo(errors.nomeCompleto?.message)]}
          />
        </Field>

        <Field data-invalid={telefoneInvalido}>
          <FieldLabel htmlFor="telefone">
            {t('cadastro:campos.telefone.rotulo')}
          </FieldLabel>
          <Input
            id="telefone"
            type="tel"
            placeholder={t('cadastro:campos.telefone.placeholder')}
            aria-invalid={telefoneInvalido}
            aria-describedby={telefoneInvalido ? 'telefone-erro' : undefined}
            {...register('telefone')}
          />
          <FieldError
            id="telefone-erro"
            errors={[erroDoCampo(errors.telefone?.message)]}
          />
        </Field>

        <Button type="submit" className="mt-8 w-full" disabled={isSubmitting}>
          {t('cadastro:botaoAvancar')}
        </Button>
        {erroDoEnvio && (
          <p role="alert" className="text-center text-sm text-destructive">
            {t(erroDoEnvio as never)}
          </p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {t('cadastro:textoLogin')}{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            {t('cadastro:linkLogin')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
