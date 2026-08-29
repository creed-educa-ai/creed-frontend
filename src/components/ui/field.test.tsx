// Cobre a integração react-hook-form + zod + Field: o resolver traduz o erro do
// schema em mensagem, e a composição liga rótulo, input, descrição e erro por id.
//
// Na geração atual do shadcn o `form` saiu do registry e o `field` entrou. O
// FieldError já recebe os erros no formato do react-hook-form, mas a ligação por
// id é explícita — então ela é código nosso, e é o que estes testes protegem.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const schema = z.object({
  nome: z.string().min(3, 'Informe ao menos 3 caracteres.'),
});

type Dados = z.infer<typeof schema>;

function FormularioDeTeste({ onSubmit }: { onSubmit: (dados: Dados) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Dados>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '' },
  });

  const invalido = Boolean(errors.nome);

  // Controller, e não register: no React 18 os componentes da geração atual do
  // shadcn são function components sem forwardRef, então o ref que o register
  // devolve é descartado e o valor nunca chega ao formulário. O Controller passa
  // value/onChange por prop. O ref do field fica de fora do spread pelo mesmo
  // motivo: espalhá-lo dispara o aviso de ref em function component.
  return (
    <form onSubmit={(evento) => void handleSubmit(onSubmit)(evento)}>
      <Field data-invalid={invalido}>
        <FieldLabel htmlFor="nome">Nome</FieldLabel>
        <Controller
          control={control}
          name="nome"
          render={({ field }) => (
            <Input
              id="nome"
              aria-invalid={invalido}
              aria-describedby={
                invalido ? 'nome-descricao nome-erro' : 'nome-descricao'
              }
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldDescription id="nome-descricao">
          Como aparece no documento.
        </FieldDescription>
        <FieldError id="nome-erro" errors={[errors.nome]} />
      </Field>
      <Button type="submit">Salvar</Button>
    </form>
  );
}

describe('Field + react-hook-form', () => {
  it('mostra a mensagem do schema quando o valor é inválido', async () => {
    const onSubmit = vi.fn();
    render(<FormularioDeTeste onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Nome'), 'ab');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Informe ao menos 3 caracteres.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nome')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('envia os dados validados', async () => {
    const onSubmit = vi.fn();
    render(<FormularioDeTeste onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Maria');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { nome: 'Ana Maria' },
      expect.anything(),
    );
  });

  it('associa descrição e mensagem ao campo para leitores de tela', async () => {
    render(<FormularioDeTeste onSubmit={vi.fn()} />);

    const campo = screen.getByLabelText('Nome');
    expect(campo).toHaveAccessibleDescription('Como aparece no documento.');

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    const mensagem = await screen.findByRole('alert');
    expect(mensagem).toHaveTextContent('Informe ao menos 3 caracteres.');
    expect(campo.getAttribute('aria-describedby')?.split(' ')).toContain(
      mensagem.getAttribute('id'),
    );
  });
});
