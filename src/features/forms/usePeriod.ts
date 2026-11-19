import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  createPeriod,
  loadPeriods,
  pickActivePeriod,
  type CreatePeriodError,
} from '@/features/forms/formsSlice';
import {
  ERROS,
  toPeriodDates,
  type ManageQuestionnaireFormValues,
} from '@/features/forms/manageQuestionnaireSchema';

interface UsePeriodOptions {
  // A organização do vínculo de quem pede: o back só aceita essa.
  organizationId: string | null;
  // O mentorando (admin). Sem ele, o período da organização inteira (gestor).
  linkId?: string | undefined;
  // Desligado, não carrega: o modal fechado não precisa do período.
  enabled?: boolean;
}

// O período aberto ou agendado de um público e a abertura de um novo. É o
// que o painel da empresa e o modal da tabela de mentorandos têm em comum.
export function usePeriod({
  organizationId,
  linkId,
  enabled = true,
}: UsePeriodOptions) {
  const dispatch = useAppDispatch();
  const periods = useAppSelector((state) => state.forms.periods);
  // A lista no slice pode ser de outro público (o mentorando anterior) até a
  // carga deste começar.
  const status = periods.linkId === (linkId ?? null) ? periods.status : 'idle';

  useEffect(() => {
    if (enabled && organizationId) {
      void dispatch(loadPeriods({ organizationId, linkId }));
    }
  }, [dispatch, enabled, organizationId, linkId]);

  // Devolve o erro (chave de i18n) para o formulário mostrar, ou `null` se o
  // período foi aberto. Depois de abrir, recarrega: a tela passa a mostrar o
  // período novo.
  async function create(
    values: ManageQuestionnaireFormValues,
  ): Promise<CreatePeriodError | null> {
    // Sem organização na sessão não há onde abrir.
    if (!organizationId) return ERROS.periodoFalhou;
    const result = await dispatch(
      createPeriod({
        organizationId,
        ...toPeriodDates(values),
        ...(linkId ? { link_id: linkId } : {}),
      }),
    );
    if (createPeriod.rejected.match(result)) {
      return result.payload ?? ERROS.periodoFalhou;
    }
    void dispatch(loadPeriods({ organizationId, linkId }));
    return null;
  }

  return {
    activePeriod: status === 'ready' ? pickActivePeriod(periods.items) : null,
    // Enquanto carrega, a tela não sabe se pode abrir um período novo. Sem
    // organização na sessão não há o que carregar: os campos aparecem, e
    // abrir devolve o erro genérico.
    loading:
      enabled &&
      organizationId !== null &&
      (status === 'idle' || status === 'loading'),
    create,
  };
}
