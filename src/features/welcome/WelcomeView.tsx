import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CreedSymbol from '@/components/logos/logo';

export function WelcomeView() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* fundo (container principal) */}
      <div className="flex w-[55%] flex-col justify-center px-16">
        {/* container da esquerda */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-heading">Bem vindo!</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              O CREED.ai Educa é uma plataforma de avaliação de competências
              para organizações em transformação. Envolvendo Plasticidade Humana
              e Inteligência Neuroinovadora para Educação, Empreendedorismo e
              Organizações em Transformação.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              Já tem acesso? Entre na sua conta.
            </p>
            <Button variant="default">Entrar</Button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              Criar conta disponível apenas para empresas.
            </p>
            <Button variant="default">Criar Conta</Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Button variant="outline">Saiba mais sobre a plataforma</Button>
            <Button variant="outline">Fale conosco</Button>
          </div>
        </div>
      </div>
      <div className="flex w-[45%] flex-col items-center justify-center gap-4 rounded-l-3xl bg-purple-700 px-16">
        <CreedSymbol className="h-40 w-40" />

        <h2 className="text-5xl font-bold text-white">creed.ai</h2>
        <h3 className="text-2xl font-bold text-white">
          Avaliação de competências que mostra o seu time com clareza, sem
          planilha e sem achismo.
        </h3>
      </div>
    </div>
  );
}
