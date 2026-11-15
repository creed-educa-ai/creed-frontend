import { describe, expect, it, vi } from 'vitest';
import {
  buildDashboardCsvRows,
  formatCsv,
  exportDashboardCsv,
} from './exportDashboardCsv';
import { userDashboardFixture } from './__fixtures__/userDashboard';
import { companyDashboardFixture } from './__fixtures__/companyDashboard';

describe('exportDashboardCsv', () => {
  const fakeT = ((key: string, options?: { defaultValue?: string }) => {
    return options?.defaultValue ?? key;
  }) as any;

  const fakePeriodLabel = (id: string | null) =>
    id === 'form-outubro' ? 'Outubro 2026' : 'Setembro 2026';

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
  });

  describe('buildDashboardCsvRows - User Dashboard', () => {
    it('should generate structured rows for individual user dashboard', () => {
      const data = userDashboardFixture();
      const rows = buildDashboardCsvRows({
        kind: 'user',
        data,
        t: fakeT,
        periodLabel: fakePeriodLabel,
      });

      // Checa se as seções principais estão presentes
      expect(rows).toContainEqual([
        'Relatório',
        'Dashboard Individual - CREED.ai',
      ]);
      expect(rows).toContainEqual(['Organização', data.organization_name]);
      expect(rows).toContainEqual(['Prisma', 'Pontuação (0-100)']);
      expect(rows).toContainEqual(['Código', 'Dimensão', 'Pontuação (0-100)']);

      // Checa se as notas dos prismas foram incluídas
      const prismaRow = rows.find((r) => r[0] === 'seguranca_psicologica');
      expect(prismaRow).toBeDefined();
      expect(prismaRow?.[1]).toBe(data.scores.seguranca_psicologica);
    });
  });

  describe('buildDashboardCsvRows - Company Dashboard', () => {
    it('should generate structured rows for company dashboard with alignment and sectors', () => {
      const data = companyDashboardFixture();
      const rows = buildDashboardCsvRows({
        kind: 'company',
        data,
        t: fakeT,
        periodLabel: fakePeriodLabel,
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

      // Alinhamento
      const alignHeader = rows.find((r) => r[0] === 'Alinhamento da Equipe');
      expect(alignHeader).toBeDefined();

      // Mapa de setores
      const mapHeader = rows.find((r) => r[0] === 'Mapa de Setores × Prismas');
      expect(mapHeader).toBeDefined();
    });
  });

  describe('exportDashboardCsv trigger', () => {
    it('should trigger browser download with correct filename', () => {
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
        t: fakeT,
        periodLabel: fakePeriodLabel,
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
