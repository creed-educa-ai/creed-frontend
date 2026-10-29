// Tela da feature respondentes — referência de estrutura para as demais.
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SeletorIdioma } from '@/components/SeletorIdioma';
import { carregarRespondentes } from '@/features/respondentes/respondentesSlice';

export function RespondentesView() {
  // Os namespaces usados na tela precisam ser declarados aqui: é o que dá o
  // autocomplete das chaves. O primeiro é o padrão para chaves sem prefixo.
  const { t } = useTranslation(['comum', 'respondentes']);
  const dispatch = useAppDispatch();
  const { itens, total, status, erro } = useAppSelector(
    (state) => state.respondentes,
  );

  useEffect(() => {
    void dispatch(carregarRespondentes(1));
  }, [dispatch]);

  return (
    <section className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-prisma-700 text-2xl font-semibold">
            {t('respondentes:titulo')}
          </h1>
          {/* O plural fica no dicionário: cada idioma tem as suas regras. */}
          <p className="mt-1 text-sm text-slate-600">
            {t('respondentes:contagem', { count: total })}
          </p>
        </div>
        <SeletorIdioma />
      </div>

      {status === 'carregando' && (
        <p className="mt-6 text-slate-500">{t('carregando')}</p>
      )}

      {status === 'erro' && (
        <p className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {erro} {t('tenteRecarregar')}
        </p>
      )}

      {status === 'pronto' && itens.length === 0 && (
        <p className="mt-6 text-slate-500">{t('respondentes:vazio')}</p>
      )}

      {status === 'pronto' && itens.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-200">
          {itens.map((respondente) => (
            <li key={respondente.id} className="py-3">
              <span className="font-medium">{respondente.nome}</span>
              <span className="ml-2 text-sm text-slate-500">
                {respondente.pais ?? t('semDado')}
                {respondente.idade !== null &&
                  `, ${t('respondentes:idade', { count: respondente.idade })}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
