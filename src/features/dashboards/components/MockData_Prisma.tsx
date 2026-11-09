// MockData: resultados calculados da análise CREED.
// Uso exclusivo em desenvolvimento e testes locais. Não utilizar em produção.
// Os campos e valores preservam a planilha "Resultados CREED".

export interface AnalisePrismas {
  [key: string]: unknown;
  Código: string;

  'Data/Hora': string;
  Perfil: string;
  S2: number;
  S4: number;
  S5A: number;
  S5B: number;
  S6: number;
  S7: number;
  S8: number;
  Total: number;
  Nível: string;
  SP: number;
  LA: number;
  CE: number;
  AC: number;
  NP: number;
}

const analisePrismas: AnalisePrismas[] = [
  {
    Código: 'CM20260627182212136',
    'Data/Hora': '27/06/2026 18:22:12',
    Perfil: 'Pesquisador(a)',
    S2: 1.11,
    S4: 1,
    S5A: 1.57,
    S5B: 1.25,
    S6: 2,
    S7: 2.5,
    S8: 3,
    Total: 85,
    Nível: 'Emergente',
    SP: 2.25,
    LA: 2.75,
    CE: 1.5,
    AC: 1.41,
    NP: 1.78,
  },
  {
    Código: 'CM20260715183555723',
    'Data/Hora': '15/07/2026 18:35:55',
    Perfil: 'Fundador(a) / Empreendedor(a)',
    S2: 3.11,
    S4: 3,
    S5A: 2.29,
    S5B: 2.88,
    S6: 2.17,
    S7: 2.67,
    S8: 3,
    Total: 135,
    Nível: 'Em Desenvolvimento',
    SP: 2.42,
    LA: 2.84,
    CE: 2.59,
    AC: 2.59,
    NP: 2.73,
  },
  {
    Código: 'CM20260722073615454',
    'Data/Hora': '22/07/2026 07:36:15',
    Perfil: 'Fundador(a) / Empreendedor(a)',
    S2: 4.89,
    S4: 4.67,
    S5A: 4.71,
    S5B: 4.88,
    S6: 4.83,
    S7: 3.67,
    S8: 4.71,
    Total: 228,
    Nível: 'Avançado',
    SP: 4.25,
    LA: 4.19,
    CE: 4.75,
    AC: 4.8,
    NP: 4.62,
  },
  {
    Código: 'CM20260812175006615',
    'Data/Hora': '12/08/2026 17:50:06',
    Perfil: 'Gestor(a) / Líder',
    S2: 2.78,
    S4: 3,
    S5A: 2.86,
    S5B: 3.38,
    S6: 3.17,
    S7: 3.33,
    S8: 3.14,
    Total: 151,
    Nível: 'Em Desenvolvimento',
    SP: 3.25,
    LA: 3.24,
    CE: 3.09,
    AC: 3.12,
    NP: 3.09,
  },
  {
    Código: 'CM20260814112740717',
    'Data/Hora': '14/08/2026 11:27:40',
    Perfil: 'Outro',
    S2: 2.78,
    S4: 4,
    S5A: 3.43,
    S5B: 3.63,
    S6: 4,
    S7: 3.33,
    S8: 3.43,
    Total: 170,
    Nível: 'Em Desenvolvimento',
    SP: 3.67,
    LA: 3.38,
    CE: 4,
    AC: 3.53,
    NP: 3.51,
  },
  {
    Código: 'CM20260814170927509',
    'Data/Hora': '14/08/2026 17:09:27',
    Perfil: 'Professor(a) / Docente',
    S2: 3,
    S4: 3,
    S5A: 3,
    S5B: 3,
    S6: 3,
    S7: 3,
    S8: 3,
    Total: 147,
    Nível: 'Em Desenvolvimento',
    SP: 3,
    LA: 3,
    CE: 3,
    AC: 3,
    NP: 3,
  },
  {
    Código: 'CM20260821133754267',
    'Data/Hora': '21/08/2026 13:37:54',
    Perfil: 'Outro',
    S2: 5,
    S4: 5,
    S5A: 3,
    S5B: 3,
    S6: 1.17,
    S7: 3.33,
    S8: 3,
    Total: 168,
    Nível: 'Em Desenvolvimento',
    SP: 2.25,
    LA: 3.17,
    CE: 3.09,
    AC: 3,
    NP: 3.36,
  },
];

export function getDataPrismas(): AnalisePrismas[] {
  return analisePrismas;
}
