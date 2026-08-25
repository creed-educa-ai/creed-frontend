// Cobre a integração react-hook-form + zod + shadcn: o resolver traduz o erro
// do schema em mensagem, e o Form liga rótulo, input e mensagem por id.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
  nome: z.string().min(3, 'Informe ao menos 3 caracteres.'),
});

type Dados = z.infer<typeof schema>;

function FormularioDeTeste({ onSubmit }: { onSubmit: (dados: Dados) => void }) {
  const form = useForm<Dados>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={(evento) => void form.handleSubmit(onSubmit)(evento)}>
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Como aparece no documento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}

describe('Form', () => {
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

    expect(
      await screen.findByText('Informe ao menos 3 caracteres.'),
    ).toHaveAttribute(
      'id',
      campo.getAttribute('aria-describedby')?.split(' ')[1],
    );
  });
});
