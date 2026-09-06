import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/authLayout';
import { useState } from 'react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export function CadastroView() {
  const { t } = useTranslation(['comum', 'cadastro']);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erros, setErros] = useState<Record<string, boolean>>({});

  return (
    <AuthLayout
      titulo={t('cadastro:titulo')}
      subtitulo={t('cadastro:painelDescricao')}
    >
      <h1 className="text-3xl font-semibold text-heading">
        {t('cadastro:titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('cadastro:subtitulo')}
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();

          const novosErros: Record<string, boolean> = {};
          if (nomeEmpresa.trim() === '') novosErros.nomeEmpresa = true;
          if (documento.trim() === '') novosErros.documento = true;
          if (email.trim() === '') novosErros.email = true;
          if (nomeCompleto.trim() === '') novosErros.nomeCompleto = true;
          if (telefone.trim() === '') novosErros.telefone = true;

          setErros(novosErros);
        }}
      >
        <Field data-invalid={erros.nomeEmpresa}>
          <FieldLabel htmlFor="nomeEmpresa">
            {t('cadastro:campos.nomeEmpresa.rotulo')}
          </FieldLabel>
          <Input
            id="nomeEmpresa"
            type="text"
            placeholder={t('cadastro:campos.nomeEmpresa.placeholder')}
            value={nomeEmpresa}
            onChange={(e) => {
              setNomeEmpresa(e.target.value);
            }}
            aria-invalid={erros.nomeEmpresa}
          />
          {erros.nomeEmpresa && (
            <FieldError>{t('comum:erros.obrigatorio')}</FieldError>
          )}
        </Field>

        <Field data-invalid={erros.documento}>
          <FieldLabel htmlFor="documento">
            {t('cadastro:campos.documento.rotulo')}
          </FieldLabel>
          <Input
            id="documento"
            type="text"
            placeholder={t('cadastro:campos.documento.placeholder')}
            value={documento}
            onChange={(e) => {
              setDocumento(e.target.value);
            }}
            aria-invalid={erros.documento}
          />
          {erros.documento && (
            <FieldError>{t('comum:erros.obrigatorio')}</FieldError>
          )}
        </Field>

        <Field data-invalid={erros.email}>
          <FieldLabel htmlFor="email">
            {t('cadastro:campos.email.rotulo')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('cadastro:campos.email.placeholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            aria-invalid={erros.email}
          />
          {erros.email && (
            <FieldError>{t('comum:erros.obrigatorio')}</FieldError>
          )}
        </Field>

        <Field data-invalid={erros.nomeCompleto}>
          <FieldLabel htmlFor="nomeCompleto">
            {t('cadastro:campos.nomeCompleto.rotulo')}
          </FieldLabel>
          <Input
            id="nomeCompleto"
            type="text"
            placeholder={t('cadastro:campos.nomeCompleto.placeholder')}
            value={nomeCompleto}
            onChange={(e) => {
              setNomeCompleto(e.target.value);
            }}
            aria-invalid={erros.nomeCompleto}
          />
          {erros.nomeCompleto && (
            <FieldError>{t('comum:erros.obrigatorio')}</FieldError>
          )}
        </Field>
        <Field data-invalid={erros.telefone}>
          <FieldLabel htmlFor="telefone">
            {t('cadastro:campos.telefone.rotulo')}
          </FieldLabel>
          <Input
            id="telefone"
            type="tel"
            placeholder={t('cadastro:campos.telefone.placeholder')}
            value={telefone}
            onChange={(e) => {
              setTelefone(e.target.value);
            }}
            aria-invalid={erros.telefone}
          />
          {erros.telefone && (
            <FieldError>{t('comum:erros.obrigatorio')}</FieldError>
          )}
        </Field>
        <Button type="submit" className="mt-8 w-full">
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
