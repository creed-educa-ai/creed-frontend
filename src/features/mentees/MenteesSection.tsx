import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/layout/sectionHeader';
import { MenteesTable, type Mentee } from '@/features/mentees/MenteesTable';

// Dados fictícios até a integração com o backend.
const menteesIniciais: Mentee[] = [
  {
    id: '1',
    name: 'Enner Valência',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '2',
    name: 'Wilson Mathias',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '3',
    name: 'Volante Ronaldo',
    status: 'active',
    hasAnsweredCurrent: false,
  },
  {
    id: '4',
    name: 'Maurides Cambalhota',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '5',
    name: 'Clayton Sampaio',
    status: 'inactive',
    hasAnsweredCurrent: false,
  },
];

// Seção "Mentorandos" do painel do super adm.
export function MenteesSection() {
  const { t } = useTranslation(['mentees']);
  const [mentees, setMentees] = useState<Mentee[]>(menteesIniciais);

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader>{t('mentees:title')}</SectionHeader>
      <div className="flex-1 rounded-3xl bg-card p-6 shadow-sm">
        <MenteesTable
          mentees={mentees}
          onViewResults={(mentee) => {
            console.log('Ver resultados do mentorando:', mentee.id);
            // TODO: integração com o backend
          }}
          onEditQuestionnaire={(mentee) => {
            console.log('Editar questionário do mentorando:', mentee.id);
            // TODO: integração com o backend
          }}
          onDelete={(mentee) => {
            setMentees((atuais) =>
              atuais.filter((item) => item.id !== mentee.id),
            );
          }}
        />
      </div>
    </section>
  );
}
