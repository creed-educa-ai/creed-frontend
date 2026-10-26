import { useTranslation } from 'react-i18next';
import { AdicionarMentorando } from './AdicionarMentorando';
import type { AdicionarMentorandoValues } from './adicionarMentorandoSchema';

// PLACEHOLDER APENAS PARA TESTAR O COMPONENTE DE ADICIONAR MENTORANDO
export function PainelControleSuperView() {
  const { t } = useTranslation(['painelControle']);

  function handleAdicionar(values: AdicionarMentorandoValues) {
    console.log('Mentorando adicionado:', values);
    // TODO: INTEGRAÇÃO BACKEND
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="px-6 py-10">
        <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
          {t('painelControle:titulo')}
        </h1>
      </header>

      <div className="px-6">
        <AdicionarMentorando onSubmit={handleAdicionar} />
      </div>
    </div>
  );
}
