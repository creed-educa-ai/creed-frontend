import { useState } from 'react';
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
  ComboboxValue,
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

// Combobox trabalha melhor com itens simples (strings); mantemos o rótulo
// em opcoesX (objetos) só para exibição, via rotuloDe().
const valoresOrigemEtnica = opcoesOrigemEtnica.map((o) => o.value);
const valoresReligiao = opcoesReligiao.map((o) => o.value);

function rotuloDe(opcoes: { value: string; label: string }[], value: string) {
  return opcoes.find((o) => o.value === value)?.label ?? value;
}

export function Demograficos2View() {
  const { t } = useTranslation(['comum', 'respondentes']);
  const dispatch = useAppDispatch();
  const dados = useAppSelector((state) => state.respondentesDemograficos);

  // Popup fecha ao selecionar (comportamento padrao do Base UI em modo
  // multiple); controlado explicitamente para garantir isso mesmo que o
  // padrao da lib varie entre versoes.
  const [origemEtnicaAberta, setOrigemEtnicaAberta] = useState(false);
  const [religiaoAberta, setReligiaoAberta] = useState(false);

  return (
    <FormLayout>
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
            {...(dados.genero ? { value: dados.genero } : {})}
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
            {...(dados.faixaEtaria ? { value: dados.faixaEtaria } : {})}
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
            items={valoresOrigemEtnica}
            value={dados.origemEtnica}
            onValueChange={(v: string[]) => {
              dispatch(definirOrigemEtnica(v));
              setOrigemEtnicaAberta(false);
            }}
            open={origemEtnicaAberta}
            onOpenChange={setOrigemEtnicaAberta}
          >
            <ComboboxChips>
              <ComboboxValue>
                {(value: string[]) =>
                  value.map((v) => (
                    <ComboboxChip key={v}>
                      {rotuloDe(opcoesOrigemEtnica, v)}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput
                id="origem-etnica"
                placeholder={t('respondentes:escolher')}
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>{t('respondentes:semResultado')}</ComboboxEmpty>
              <ComboboxList>
                {(v: string) => (
                  <ComboboxItem key={v} value={v}>
                    {rotuloDe(opcoesOrigemEtnica, v)}
                  </ComboboxItem>
                )}
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
            items={valoresReligiao}
            value={dados.religiao}
            onValueChange={(v: string[]) => {
              dispatch(definirReligiao(v));
              setReligiaoAberta(false);
            }}
            open={religiaoAberta}
            onOpenChange={setReligiaoAberta}
          >
            <ComboboxChips>
              <ComboboxValue>
                {(value: string[]) =>
                  value.map((v) => (
                    <ComboboxChip key={v}>
                      {rotuloDe(opcoesReligiao, v)}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput
                id="religiao"
                placeholder={t('respondentes:escolher')}
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>{t('respondentes:semResultado')}</ComboboxEmpty>
              <ComboboxList>
                {(v: string) => (
                  <ComboboxItem key={v} value={v}>
                    {rotuloDe(opcoesReligiao, v)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field>
          <FieldLabel htmlFor="nacionalidade">
            {t('respondentes:campos.nacionalidade')}
          </FieldLabel>
          <Select
            {...(dados.nacionalidade ? { value: dados.nacionalidade } : {})}
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
              {...(dados.estadoBrasil ? { value: dados.estadoBrasil } : {})}
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
              {...(dados.regiaoPortugal ? { value: dados.regiaoPortugal } : {})}
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
