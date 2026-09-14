import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/authLayout';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastroSchema, type CadastroForm } from '@/lib/validadores';

export function CadastroView() {
  const { t } = useTranslation(['comum', 'cadastro']);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nomeEmpresa: '',
      documento: '',
      email: '',
      nomeCompleto: '',
      telefone: '',
    },
  });

  async function aoEnviar(dados: CadastroForm) {
    console.info('Cadastro validado:', dados);
    // PROVISÓRIO — espera simulada para a apresentação. Sem API, o envio é
    // instantâneo e o símbolo do painel não chegaria a girar. Sai quando o
    // cadastro chamar o backend: a própria requisição passa a ser a espera.
    await new Promise((resolver) => setTimeout(resolver, 1500));
    // viewTransition: o painel roxo cresce até virar a tela de aguarde, que
    // tem o mesmo fundo (ver `transicao-painel-marca` em index.css).
    navigate('/aguarde-confirmacao', { viewTransition: true });
  }

  function erroDoCampo(chave?: string) {
    if (!chave) return undefined;
    return { message: t(chave as never) };
  }

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
    >
      <h1 className="text-3xl font-semibold text-heading">
        {t('cadastro:titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('cadastro:subtitulo')}
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(evento) => void handleSubmit(aoEnviar)(evento)}
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
