import { useNavigate } from 'react-router-dom';
import { Demograficos1View } from '@/features/respondentes/Demograficos1View';
import { Demograficos2View } from '@/features/respondentes/Demograficos2View';
import { Demograficos3View } from '@/features/respondentes/Demograficos3View';

// Ligação das três telas de dados demográficos:
// termo aceito → etapa 1 → etapa 2 → etapa 3 → onboarding do questionário.
//
// As telas não navegam sozinhas; recebem `onContinue`/`onSkip` como ponto de
// conexão (ver DEMOGRAPHICS.md). Este arquivo só preenche esses pontos com a
// próxima rota. Nada é enviado à API: os dados ficam no rascunho do Redux,
// porque a tabela `respondentes` ainda não existe no backend.

export function Demograficos1Etapa() {
  const navigate = useNavigate();
  return (
    <Demograficos1View
      onContinue={() => {
        navigate('/demograficos-2');
      }}
    />
  );
}

export function Demograficos2Etapa() {
  const navigate = useNavigate();
  const irParaEtapa3 = () => {
    navigate('/demograficos-3');
  };
  return <Demograficos2View onContinue={irParaEtapa3} onSkip={irParaEtapa3} />;
}

export function Demograficos3Etapa() {
  const navigate = useNavigate();
  const concluir = () => {
    navigate('/onboard-quest');
  };
  return <Demograficos3View onContinue={concluir} onSkip={concluir} />;
}
