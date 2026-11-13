import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { toast } from '@/components/ui/sonner';
import { DemographicsStep1View } from '@/features/demographics/DemographicsStep1View';
import { DemographicsStep2View } from '@/features/demographics/DemographicsStep2View';
import { DemographicsStep3View } from '@/features/demographics/DemographicsStep3View';
import {
  loadDemographics,
  saveDemographics,
} from '@/features/demographics/demographicsSlice';

// Ligação das três telas de dados demográficos:
// termo aceito → etapa 1 → etapa 2 → etapa 3 → onboarding do questionário.
//
// As telas não navegam sozinhas; recebem `onContinue`/`onSkip` como ponto de
// conexão (ver README.md). Este arquivo preenche esses pontos com a próxima
// rota. O rascunho começa do perfil já salvo no back (etapa 1) e vai inteiro
// para ele no fim da etapa 3, no Avançar ou no Pular.

export function DemographicsStep1Route() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // O `PUT` do fim substitui o perfil inteiro: sem partir do que já está
  // salvo, refazer o onboarding e pular apagaria as respostas de antes.
  useEffect(() => {
    void dispatch(loadDemographics());
  }, [dispatch]);
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
  const { t } = useTranslation(['respondentes', 'comum']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Se o envio falhar, a pessoa fica na etapa 3 e pode tentar de novo: o
  // rascunho continua no Redux.
  const concluir = async () => {
    try {
      await dispatch(saveDemographics()).unwrap();
      navigate('/questionnaire');
    } catch {
      toast.error(t('respondentes:demograficos3.erroAoSalvar'), {
        description: t('comum:tenteNovamenteEmInstantes'),
      });
    }
  };
  return <DemographicsStep3View onContinue={concluir} onSkip={concluir} />;
}
