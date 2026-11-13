import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PeriodFilterProps {
  // O id vai para o back; o rótulo é o que a pessoa lê.
  periods: { id: string; label: string }[];
  value: string;
  onChange: (period: string) => void;
}

export function PeriodFilter({ periods, value, onChange }: PeriodFilterProps) {
  const { t } = useTranslation(['dashboard']);
  const label = periods.find((period) => period.id === value)?.label ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default">
          <ChevronDown />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{t('dashboard:Periodo')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {periods.map((period) => (
            <DropdownMenuRadioItem key={period.id} value={period.id}>
              {period.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
