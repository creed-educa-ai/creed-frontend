import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { DemographicsStep2View } from '@/features/demographics/DemographicsStep2View';
import { DemographicsStep3View } from '@/features/demographics/DemographicsStep3View';
import {
  loadMyDemographics,
  saveMyDemographics,
  type DemographicsState,
} from '@/features/demographics/demographicsSlice';

// Ligação das telas de dados demográficos com as rotas e com o back:
//
//   termo aceito → etapa 2 (perfil) → etapa 3 (perspectiva) → PUT → questionário
//
// As telas não navegam nem falam com a API sozinhas; recebem `onContinue` e
// `onSkip` como ponto de conexão (ver README.md). É este arquivo que preenche
// esses pontos. Os nomes `step-2` e `step-3` das rotas vêm de quando existia
// uma etapa 1, que pedia o nome (CREED-68).
//
// Três regras moram aqui:
// 1. Antes de mostrar o onboarding, o perfil é buscado no back. Quem já tem
//    perfil não passa pelas telas de novo.
// 2. No fim da etapa 3, o rascunho é salvo com PUT. Pular também salva: os
//    campos vão vazios, e é assim que o back registra que a pessoa pulou.
// 3. Quem vem do modal "revisar dados" do questionário (`review`) abre as
//    telas já preenchidas, mesmo tendo perfil.

const DEPOIS_DO_ONBOARDING = '/questionnaire';

// O que as rotas de demográficos recebem pelo `state` da navegação.
interface DemographicsRouteState {
  // Veio do modal "revisar dados": mostra as telas mesmo para quem tem perfil.
  review?: boolean;
  // A rota pedida na entrada da área logada.
  from?: string;
}

function useDemographicsRouteState(): DemographicsRouteState {
  const location = useLocation();
  return (location.state as DemographicsRouteState | null) ?? {};
}

// Para onde vai quem já tem perfil e caiu no onboarding. Uma rota de
// demográficos como origem faria a tela redirecionar para si mesma.
function destinoDeQuemJaTemPerfil(from: string | undefined): string {
  if (from && !from.startsWith('/demographics')) return from;
  return DEPOIS_DO_ONBOARDING;
}

function useDemographicsProfile(check = true) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.demographics.profile);

  useEffect(() => {
    if (check && profile.status === 'idle') void dispatch(loadMyDemographics());
  }, [check, dispatch, profile.status]);

  return profile;
}

function DemographicsProfileStatus({
  profile,
}: {
  profile: DemographicsState['profile'];
}) {
  const { t } = useTranslation(['respondentes', 'comum']);
  const dispatch = useAppDispatch();

  return (
    <FormLayout>
      {profile.status === 'error' ? (
        <div role="alert" className="flex flex-col items-start gap-4">
          <p className="text-foreground">
            {/* O slice guarda a chave como string; mesma saída do FormView. */}
            {t(
              (profile.error ??
                'respondentes:demograficos.erroCarregar') as never,
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void dispatch(loadMyDemographics());
            }}
          >
            {t('comum:acoes.tentarNovamente')}
          </Button>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {t('respondentes:demograficos.carregando')}
        </p>
      )}
    </FormLayout>
  );
}

export function DemographicsGate() {
  const { pathname, search, hash } = useLocation();
  const inDemographics = useMatch('/demographics/:step') !== null;
  const profile = useDemographicsProfile(!inDemographics);

  // As etapas cuidam da própria entrada. Quem já tem perfil fica no destino,
  // inclusive se o GET disparado para revisar os dados ainda estiver em curso.
  if (inDemographics || profile.exists) return <Outlet />;
  if (profile.status !== 'ready') {
    return <DemographicsProfileStatus profile={profile} />;
  }

  return (
    <Navigate
      to="/demographics/step-2"
      replace
      state={{ from: pathname + search + hash }}
    />
  );
}

export function DemographicsStep2Route() {
  const navigate = useNavigate();
  const routeState = useDemographicsRouteState();
  const profile = useDemographicsProfile();

  if (profile.status !== 'ready') {
    return <DemographicsProfileStatus profile={profile} />;
  }

  if (profile.exists && !routeState.review) {
    return <Navigate to={destinoDeQuemJaTemPerfil(routeState.from)} replace />;
  }

  // O `state` segue junto: a etapa 3 precisa saber se é revisão.
  const irParaEtapa3 = () => {
    navigate('/demographics/step-3', { state: routeState });
  };
  // A tela só é montada aqui, depois da busca: é na montagem que o formulário
  // lê os valores iniciais, e na revisão eles vêm do perfil gravado.
  return (
    <DemographicsStep2View onContinue={irParaEtapa3} onSkip={irParaEtapa3} />
  );
}

export function DemographicsStep3Route() {
  const { t } = useTranslation('respondentes');
  const dispatch = useAppDispatch();
  const routeState = useDemographicsRouteState();
  const profile = useAppSelector((state) => state.demographics.profile);
  const saving = useAppSelector((state) => state.demographics.saving);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );

  if (saving.status === 'ready' && saving.requestId === submittedRequestId) {
    return <Navigate to={DEPOIS_DO_ONBOARDING} />;
  }

  // Quem chega aqui sem ter passado pela etapa 2 nesta sessão (recarregou a
  // página, abriu o endereço direto) tem o rascunho vazio. Salvar agora
  // apagaria o perfil gravado, porque o PUT substitui tudo: volta à etapa 2,
  // que busca o perfil antes.
  if (profile.status !== 'ready') {
    return <Navigate to="/demographics/step-2" replace state={routeState} />;
  }
  if (profile.exists && !routeState.review) {
    return <Navigate to={destinoDeQuemJaTemPerfil(routeState.from)} replace />;
  }

  // Avançar e pular terminam igual: salvam o rascunho como estiver e seguem
  // para o questionário — o destino do primeiro acesso e também de quem veio
  // revisar. Se o PUT falhar, a pessoa fica nesta tela, com a mensagem de
  // erro (que o slice guarda) e o que preencheu.
  const submit = () => {
    const request = dispatch(saveMyDemographics());
    setSubmittedRequestId(request.requestId);
  };

  return (
    <DemographicsStep3View
      onContinue={submit}
      onSkip={submit}
      saving={saving.status === 'loading'}
      errorMessage={saving.error ? t(saving.error as never) : null}
    />
  );
}
