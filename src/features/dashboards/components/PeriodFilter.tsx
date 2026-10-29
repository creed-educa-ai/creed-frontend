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
  periods: string[];
  value: string;
  onChange: (period: string) => void;
}

export function PeriodFilter({ periods, value, onChange }: PeriodFilterProps) {
  const { t } = useTranslation(['dashboard']);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default" className="gap-2">
          <ChevronDown />
          <span className="hidden sm:inline">{value}</span>
          <span className="sm:hidden">{t('dashboard:Periodo')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {periods.map((period) => (
            <DropdownMenuRadioItem key={period} value={period}>
              {period}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
