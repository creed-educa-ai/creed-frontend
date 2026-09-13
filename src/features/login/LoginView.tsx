import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/layout/authLayout';
import { loginSchema, type LoginForm } from '@/lib/validadores';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { entrar } from '@/features/login/loginSlice';

export function LoginView() {
  const { t } = useTranslation(['autenticacao']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loginErro = useAppSelector((state) => state.auth.erro);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '', lembrarDeMim: false },
  });

  async function aoEnviar(dados: LoginForm) {
    try {
      await dispatch(entrar(dados)).unwrap();
      const origem = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname;
      navigate(origem ?? '/respondentes', { replace: true });
    } catch {
      // O erro permanece no estado Redux para a mensagem traduzida da tela.
    }
  }

  function erroDoCampo(chave?: string) {
    if (!chave) return undefined;
    return { message: t(chave as never) };
  }

  return (
    <AuthLayout
      titulo={t('autenticacao:login.painelTitulo')}
      subtitulo={t('autenticacao:login.painelDescricao')}
    >
      <h1 className="text-3xl font-bold text-heading">
        {t('autenticacao:login.titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('autenticacao:login.subtitulo')}
      </p>

      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={(evento) => void handleSubmit(aoEnviar)(evento)}
      >
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">
            {t('autenticacao:login.email.rotulo')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('autenticacao:login.email.placeholder')}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError errors={[erroDoCampo(errors.email?.message)]} />
        </Field>

        <Field data-invalid={Boolean(errors.senha)}>
          <FieldLabel htmlFor="senha">
            {t('autenticacao:login.senha.rotulo')}
          </FieldLabel>
          <Input
            id="senha"
            type="password"
            placeholder={t('autenticacao:login.senha.placeholder')}
            aria-invalid={Boolean(errors.senha)}
            {...register('senha')}
          />
          <FieldError errors={[erroDoCampo(errors.senha?.message)]} />
        </Field>

        <div className="flex items-center justify-between gap-3 text-xs">
          <Controller
            control={control}
            name="lembrarDeMim"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                {t('autenticacao:login.lembrarDeMim')}
              </label>
            )}
          />
          <Link
            to="/recuperar-senha"
            className="font-medium text-primary hover:underline"
          >
            {t('autenticacao:login.esqueciSenha')}
          </Link>
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {t('autenticacao:login.entrar')}
        </Button>
        {loginErro && (
          <p role="alert" className="text-center text-sm text-destructive">
            {t(loginErro as never)}
          </p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {t('autenticacao:login.semConta')}{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-primary hover:underline"
          >
            {t('autenticacao:login.criarConta')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
