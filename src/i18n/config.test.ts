import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('i18n', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('resolve chaves no idioma padrão', () => {
    expect(i18n.t('carregando')).toBe('Carregando…');
    expect(i18n.t('respondentes:titulo')).toBe('Respondentes');
  });

  it('troca de idioma', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('carregando')).toBe('Loading…');
    expect(i18n.t('respondentes:titulo')).toBe('Respondents');
  });

  it('troca para espanhol', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('carregando')).toBe('Cargando…');
    expect(i18n.t('respondentes:titulo')).toBe('Encuestados');
  });

  it('aplica plural por idioma', () => {
    expect(i18n.t('respondentes:contagem', { count: 0 })).toBe(
      '0 pessoas cadastradas',
    );
    expect(i18n.t('respondentes:contagem', { count: 1 })).toBe(
      '1 pessoa cadastrada',
    );
    expect(i18n.t('respondentes:contagem', { count: 3 })).toBe(
      '3 pessoas cadastradas',
    );
  });

  it('aplica plural em espanhol', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('respondentes:contagem', { count: 0 })).toBe(
      '0 personas registradas',
    );
    expect(i18n.t('respondentes:contagem', { count: 1 })).toBe(
      '1 persona registrada',
    );
    expect(i18n.t('respondentes:contagem', { count: 3 })).toBe(
      '3 personas registradas',
    );
  });

  it('trata "pt" sem região como pt-BR', async () => {
    await i18n.changeLanguage('pt');
    expect(i18n.t('carregando')).toBe('Carregando…');
  });

  it('resolve variante regional "es-MX" para espanhol', async () => {
    await i18n.changeLanguage('es-MX');
    expect(i18n.t('carregando')).toBe('Cargando…');
  });

  it('sincroniza o atributo lang do documento', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('sincroniza o atributo lang do documento em espanhol', async () => {
    await i18n.changeLanguage('es');
    expect(document.documentElement.lang).toBe('es');
  });
});
