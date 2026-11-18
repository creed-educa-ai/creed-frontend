import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import {
  buildDashboardCsvRows,
  formatCsv,
  exportDashboardCsv,
  safeText,
} from './exportDashboardCsv';
import { userDashboardFixture } from './__fixtures__/userDashboard';
import { companyDashboardFixture } from './__fixtures__/companyDashboard';
import { retrato } from './__fixtures__/overviewDashboard';

describe('exportDashboardCsv', () => {
  // O i18n de verdade: um `t` falso devolveria qualquer chave, inclusive uma
  // que não existe, e o teste passaria com o CSV cheio de códigos crus.
  const t = i18n.getFixedT(null, ['comum', 'dashboardPrisma'] as const);

  const fakePeriodLabel = (id: string) =>
    id === 'form-outubro' ? 'Outubro 2026' : 'Setembro 2026';

  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  describe('formatCsv', () => {
    it('should format cells with semicolon and escape quotes and linebreaks', () => {
      const rows = [
        ['Nome', 'Valor;com ponto e vírgula', 'Linha com "aspas"'],
        ['Simples', 42, null],
      ];
      const csv = formatCsv(rows);

      expect(csv).toBe(
        'Nome;"Valor;com ponto e vírgula";"Linha com ""aspas"""\r\nSimples;42;',
      );
    });

    it('should write decimals with the separator of the language', () => {
      expect(formatCsv([[72.5]], 'pt-BR')).toBe('72,5');
      expect(formatCsv([[72.5]], 'es')).toBe('72,5');
      expect(formatCsv([[72.5]], 'en')).toBe('72.5');
    });
  });

  describe('safeText', () => {
    it('should neutralize text that a spreadsheet would run as a formula', () => {
      expect(safeText('=HYPERLINK("http://evil","x")')).toBe(
        `'=HYPERLINK("http://evil","x")`,
      );
      expect(safeText('+1')).toBe(`'+1`);
      expect(safeText('-1')).toBe(`'-1`);
      expect(safeText('@SUM(A1)')).toBe(`'@SUM(A1)`);
      expect(safeText('Acme Ltda')).toBe('Acme Ltda');
    });
  });

  describe('buildDashboardCsvRows - User Dashboard', () => {
    it('should generate structured rows for individual user dashboard', () => {
      const data = userDashboardFixture();
      const rows = buildDashboardCsvRows({
        kind: 'user',
        data,
        t,
        periodLabel: fakePeriodLabel,
        locale: 'pt-BR',
      });

      // Checa se as seções principais estão presentes
      expect(rows).toContainEqual([
        'Relatório',
        'Dashboard Individual - CREED.ai',
      ]);
      expect(rows).toContainEqual(['Organização', data.organization_name]);
      expect(rows).toContainEqual(['Prisma', 'Pontuação (0-100)']);
      expect(rows).toContainEqual(['Código', 'Dimensão', 'Pontuação (0-100)']);

      // Prismas e dimensões saem com o nome traduzido, não com o código
      const prismaRow = rows.find((r) => r[0] === 'Segurança Psicológica');
      expect(prismaRow?.[1]).toBe(data.scores.seguranca_psicologica);
      expect(rows).toContainEqual([
        'S2',
        'Vivência e Competências Empreendedoras',
        data.dimensions.S2,
      ]);
      expect(rows.flat()).not.toContain('seguranca_psicologica');
    });

    it('should follow the language of the screen', async () => {
      await i18n.changeLanguage('en');
      const rows = buildDashboardCsvRows({
        kind: 'user',
        data: userDashboardFixture(),
        t,
        periodLabel: fakePeriodLabel,
        locale: 'en',
      });

      expect(rows).toContainEqual(['Prism', 'Score (0-100)']);
    });
  });

  describe('buildDashboardCsvRows - Company Dashboard', () => {
    it('should generate structured rows for company dashboard with alignment and sectors', () => {
      const data = companyDashboardFixture();
      const rows = buildDashboardCsvRows({
        kind: 'company',
        data,
        t,
        periodLabel: fakePeriodLabel,
        locale: 'pt-BR',
        viewLabel: 'Marketing',
      });

      expect(rows).toContainEqual([
        'Relatório',
        'Dashboard da Organização - CREED.ai',
      ]);
      expect(rows).toContainEqual(['Recorte / Visão', 'Marketing']);
      expect(rows).toContainEqual([
        'Convidados',
        data.company_summary.convidados,
      ]);
      expect(rows).toContainEqual([
        'Concluídos',
        data.company_summary.concluidos,
      ]);

      // Alinhamento, com o nível traduzido
      const alignHeader = rows.find((r) => r[0] === 'Alinhamento da Equipe');
      expect(alignHeader).toBeDefined();
      const level = data.alignment?.prismas?.seguranca_psicologica.level;
      const alignRow = rows.find(
        (r, i) =>
          r[0] === 'Segurança Psicológica' &&
          i > rows.indexOf(alignHeader ?? []),
      );
      expect(alignRow?.[1]).toBe(
        t(`dashboardPrisma:alinhamento.niveis.${level ?? 'alinhado'}`),
      );

      // Mapa de setores, com uma coluna por prisma
      const mapIndex = rows.findIndex(
        (r) => r[0] === 'Mapa de Setores × Prismas',
      );
      expect(mapIndex).toBeGreaterThan(-1);
      expect(rows[mapIndex + 1]).toEqual([
        'Setor',
        'Respondentes',
        'Segurança Psicológica',
        'Liderança Adaptativa',
        'Cultura Empreendedora',
        'Adaptabilidade Cognitiva',
        'Neuroinovação',
      ]);
    });

    it('should neutralize names that a spreadsheet would run as a formula', () => {
      const data = companyDashboardFixture();
      data.organization_name = '=cmd|calc';
      const rows = buildDashboardCsvRows({
        kind: 'company',
        data,
        t,
        periodLabel: fakePeriodLabel,
        locale: 'pt-BR',
        viewLabel: '@membro',
      });

      expect(rows).toContainEqual(['Organização', `'=cmd|calc`]);
      expect(rows).toContainEqual(['Recorte / Visão', `'@membro`]);
    });
  });

  describe('buildDashboardCsvRows - Overview', () => {
    const overview = (data = retrato('companies')) =>
      buildDashboardCsvRows({
        kind: 'overview',
        data,
        t,
        locale: 'pt-BR',
        viewLabel: 'Todas as empresas',
        responsesLabel: 'Respostas de 01/09/2026 a 15/10/2026',
        matrixTitle: 'Empresas × prismas',
        groupHeading: 'Empresa',
      });

    it('should identify the current picture, with the response dates in place of the period', () => {
      const rows = overview();

      expect(rows).toContainEqual(['Relatório', 'Retrato Atual - CREED.ai']);
      expect(rows).toContainEqual(['Recorte / Visão', 'Todas as empresas']);
      expect(rows).toContainEqual([
        'Período',
        'Respostas de 01/09/2026 a 15/10/2026',
      ]);
      expect(rows).toContainEqual(['Convidados', 10]);
      expect(rows).toContainEqual(['Taxa de Conclusão', '90%']);
    });

    it('should list each company in the map and in the comparisons', () => {
      const rows = overview();

      const mapIndex = rows.findIndex((r) => r[0] === 'Empresas × prismas');
      expect(rows[mapIndex + 1]?.slice(0, 2)).toEqual([
        'Empresa',
        'Respondentes',
      ]);
      expect(rows[mapIndex + 2]).toEqual(['Empresa A', 3, 70, 70, 70, 70, 70]);
      expect(rows[mapIndex + 3]).toEqual(['Empresa B', 3, 50, 50, 50, 50, 50]);

      // A comparação é com cada empresa, não com um período.
      expect(rows).toContainEqual([
        'Empresa B',
        'Segurança Psicológica',
        50,
        '+10',
      ]);
    });

    it('should neutralize company names that a spreadsheet would run as a formula', () => {
      const data = retrato('companies');
      data.groups[0] = { ...data.groups[0]!, label: '=HYPERLINK("x")' };

      const rows = overview(data);

      expect(rows).toContainEqual([`'=HYPERLINK("x")`, 3, 70, 70, 70, 70, 70]);
    });
  });

  describe('exportDashboardCsv trigger', () => {
    // O jsdom não tem essas funções: guardar o descritor deixa o URL como
    // estava (inclusive sem elas) para os testes seguintes do mesmo worker.
    const urlMethods = ['createObjectURL', 'revokeObjectURL'] as const;
    const originals = urlMethods.map((name) =>
      Object.getOwnPropertyDescriptor(window.URL, name),
    );

    afterEach(() => {
      urlMethods.forEach((name, i) => {
        const original = originals[i];
        if (original) Object.defineProperty(window.URL, name, original);
        else Reflect.deleteProperty(window.URL, name);
      });
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should trigger browser download and revoke the URL only afterwards', () => {
      vi.useFakeTimers();
      const data = userDashboardFixture();
      const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
      const revokeObjectURLMock = vi.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      exportDashboardCsv({
        kind: 'user',
        data,
        t,
        periodLabel: fakePeriodLabel,
        locale: 'pt-BR',
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test');
    });
  });
});
