import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  definirEstadoBrasil,
  definirFaixaEtaria,
  definirGenero,
  definirNacionalidade,
  definirNacionalidadeOutra,
  definirOrigemEtnica,
  definirRegiaoPortugal,
  definirReligiao,
} from '@/features/respondentes/respondentesDemograficosSlice';
import {
  opcoesEstadoBrasil,
  opcoesFaixaEtaria,
  opcoesGenero,
  opcoesNacionalidade,
  opcoesOrigemEtnica,
  opcoesRegiaoPortugal,
  opcoesReligiao,
} from '@/features/respondentes/respondentesDemograficasOpcoes';

export function Demograficos2View() {
  const { t } = useTranslation(['comum', 'respondentes']);
  const dispatch = useAppDispatch();
  const dados = useAppSelector((state) => state.respondentesDemograficos);

  const rotuloDe = (
    opcoes: { value: string; label: string }[],
    value: string,
  ) => opcoes.find((o) => o.value === value)?.label ?? value;

  return (
    <FormLayout etapa={t('respondentes:demograficos2.etapa')}>
      <h1 className="text-2xl font-bold text-heading">
        {t('respondentes:demograficos2.titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('respondentes:demograficos2.subtitulo')}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="genero">
            {t('respondentes:campos.genero')}
          </FieldLabel>
          <Select
            value={dados.genero ?? undefined}
            onValueChange={(v) => dispatch(definirGenero(v))}
          >
            <SelectTrigger id="genero" className="w-full">
              <SelectValue placeholder={t('respondentes:escolher')} />
            </SelectTrigger>
            <SelectContent>
              {opcoesGenero.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="faixa-etaria">
            {t('respondentes:campos.faixaEtaria')}
          </FieldLabel>
          <Select
            value={dados.faixaEtaria ?? undefined}
            onValueChange={(v) => dispatch(definirFaixaEtaria(v))}
          >
            <SelectTrigger id="faixa-etaria" className="w-full">
              <SelectValue placeholder={t('respondentes:escolher')} />
            </SelectTrigger>
            <SelectContent>
              {opcoesFaixaEtaria.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="origem-etnica">
            {t('respondentes:campos.origemEtnica')}
          </FieldLabel>
          <Combobox
            multiple
            items={opcoesOrigemEtnica}
            value={dados.origemEtnica}
            onValueChange={(v: string[]) => dispatch(definirOrigemEtnica(v))}
          >
            <ComboboxChips>
              {dados.origemEtnica.map((v) => (
                <ComboboxChip key={v} value={v}>
                  {rotuloDe(opcoesOrigemEtnica, v)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id="origem-etnica"
                placeholder={t('respondentes:escolher')}
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>{t('respondentes:semResultado')}</ComboboxEmpty>
              <ComboboxList>
                {opcoesOrigemEtnica.map((o) => (
                  <ComboboxItem key={o.value} value={o.value}>
                    {o.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field>
          <FieldLabel htmlFor="religiao">
            {t('respondentes:campos.religiao')}
          </FieldLabel>
          <Combobox
            multiple
            items={opcoesReligiao}
            value={dados.religiao}
            onValueChange={(v: string[]) => dispatch(definirReligiao(v))}
          >
            <ComboboxChips>
              {dados.religiao.map((v) => (
                <ComboboxChip key={v} value={v}>
                  {rotuloDe(opcoesReligiao, v)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id="religiao"
                placeholder={t('respondentes:escolher')}
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>{t('respondentes:semResultado')}</ComboboxEmpty>
              <ComboboxList>
                {opcoesReligiao.map((o) => (
                  <ComboboxItem key={o.value} value={o.value}>
                    {o.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field>
          <FieldLabel htmlFor="nacionalidade">
            {t('respondentes:campos.nacionalidade')}
          </FieldLabel>
          <Select
            value={dados.nacionalidade ?? undefined}
            onValueChange={(v) => dispatch(definirNacionalidade(v))}
          >
            <SelectTrigger id="nacionalidade" className="w-full">
              <SelectValue placeholder={t('respondentes:escolher')} />
            </SelectTrigger>
            <SelectContent>
              {opcoesNacionalidade.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dados.nacionalidade === 'brasileira' && (
            <Select
              value={dados.estadoBrasil ?? undefined}
              onValueChange={(v) => dispatch(definirEstadoBrasil(v))}
            >
              <SelectTrigger id="estado-brasil" className="w-full">
                <SelectValue placeholder={t('respondentes:campos.estado')} />
              </SelectTrigger>
              <SelectContent>
                {opcoesEstadoBrasil.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {dados.nacionalidade === 'portuguesa' && (
            <Select
              value={dados.regiaoPortugal ?? undefined}
              onValueChange={(v) => dispatch(definirRegiaoPortugal(v))}
            >
              <SelectTrigger id="regiao-portugal" className="w-full">
                <SelectValue placeholder={t('respondentes:campos.regiao')} />
              </SelectTrigger>
              <SelectContent>
                {opcoesRegiaoPortugal.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {dados.nacionalidade === 'outra' && (
            <Input
              aria-label={t('respondentes:campos.nacionalidadeOutra')}
              placeholder={t('respondentes:campos.nacionalidadeOutra')}
              value={dados.nacionalidadeOutra}
              onChange={(e) =>
                dispatch(definirNacionalidadeOutra(e.target.value))
              }
            />
          )}
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button type="button" className="w-full">
          {t('respondentes:avancar')}
        </Button>
        <Button type="button" variant="outline" className="w-full">
          {t('respondentes:pular')}
        </Button>
      </div>
    </FormLayout>
  );
}
