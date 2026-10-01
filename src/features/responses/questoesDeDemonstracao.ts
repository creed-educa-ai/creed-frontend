// DEMONSTRAÇÃO — decisão do Leonardo em 2026-09-30, para a apresentação à
// cliente. Duas perguntas que o back ainda não tem, escritas NO FORMATO DO BACK
// (QuestionResponse com `options`, P-039) e somadas às perguntas reais no
// `loadQuestionnaire`. Daí em diante passam pelo mesmo caminho das reais:
// seletor, tela, revisão e envio. O envio já não as manda, porque o back ainda
// recusa objetiva (ver `submitResponses`).
//
// Apagar este arquivo, e a linha que o usa no responsesSlice.ts, quando a
// CREED-37 trouxer alternativas de verdade.
import type { QuestionOptionResponse, QuestionResponse } from '@/types/api';

const CRIADO_EM = '2026-09-30T00:00:00Z';

function opcoes(
  questionId: string,
  itens: { label: string; value: string }[],
): QuestionOptionResponse[] {
  return itens.map((item, index) => ({
    id: `${questionId}-opcao-${String(index + 1)}`,
    question_id: questionId,
    label: item.label,
    value: item.value,
    order_index: index,
    created_at: CRIADO_EM,
  }));
}

export function questoesDeDemonstracao(formId: string): QuestionResponse[] {
  return [
    {
      id: 'demo-escala',
      form_id: formId,
      text: '[Demonstração, não é enviada] Tenho ou já tive experiência como fundador(a) ou sócio(a) de um negócio.',
      // Depois das perguntas reais da seção.
      order_index: 1000,
      // 🟡 Premissa P-040: escala é objetiva com alternativas de 1 a 5.
      type: 'objective',
      section: 'assessment',
      required: false,
      prisma: 'empreendedorismo',
      created_at: CRIADO_EM,
      options: opcoes(
        'demo-escala',
        ['1', '2', '3', '4', '5'].map((n) => ({ label: n, value: n })),
      ),
    },
    {
      id: 'demo-objetiva',
      form_id: formId,
      text: '[Demonstração, não é enviada] Qual das seguintes opções melhor descreve sua atuação em relação ao multiculturalismo na educação?',
      order_index: 1001,
      type: 'objective',
      section: 'assessment',
      required: false,
      prisma: 'multiculturalismo',
      created_at: CRIADO_EM,
      options: opcoes('demo-objetiva', [
        {
          label:
            'Reconheço a importância da diversidade cultural, mas ainda estou desenvolvendo práticas inclusivas',
          value: 'reconheco',
        },
        {
          label:
            'Integro perspectivas culturais diversas regularmente em minhas atividades educacionais',
          value: 'integro',
        },
        {
          label:
            'Promovo ativamente diálogos interculturais e valorizo diferentes visões de mundo em meu contexto',
          value: 'promovo',
        },
        {
          label:
            'Lidero iniciativas que transformam a instituição para ser verdadeiramente multicultural e inclusiva',
          value: 'lidero',
        },
        {
          label:
            'Trabalho para eliminar barreiras culturais e promover equidade entre diferentes grupos na educação',
          value: 'trabalho',
        },
      ]),
    },
  ];
}
