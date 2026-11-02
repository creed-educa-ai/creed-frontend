import { useNavigate } from 'react-router-dom';
import { DemographicsStep1View } from '@/features/demographics/DemographicsStep1View';
import { DemographicsStep2View } from '@/features/demographics/DemographicsStep2View';
import { DemographicsStep3View } from '@/features/demographics/DemographicsStep3View';

// Ligação das três telas de dados demográficos:
// termo aceito → etapa 1 → etapa 2 → etapa 3 → onboarding do questionário.
//
// As telas não navegam sozinhas; recebem `onContinue`/`onSkip` como ponto de
// conexão (ver README.md). Este arquivo só preenche esses pontos com a
// próxima rota. Nada é enviado à API: os dados ficam no rascunho do Redux,
// porque o domínio `demographics` do back ainda não tem rota.

export function DemographicsStep1Route() {
  const navigate = useNavigate();
  return (
    <DemographicsStep1View
      onContinue={() => {
        navigate('/demographics/step-2');
      }}
    />
  );
}

export function DemographicsStep2Route() {
  const navigate = useNavigate();
  const irParaEtapa3 = () => {
    navigate('/demographics/step-3');
  };
  return (
    <DemographicsStep2View onContinue={irParaEtapa3} onSkip={irParaEtapa3} />
  );
}

export function DemographicsStep3Route() {
  const navigate = useNavigate();
  const concluir = () => {
    navigate('/questionnaire');
  };
  return <DemographicsStep3View onContinue={concluir} onSkip={concluir} />;
}
