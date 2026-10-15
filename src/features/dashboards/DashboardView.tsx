import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import {
  Info,
  LogOut,
  LayoutDashboard,
  ClipboardPen,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ResumoCards } from './ResumoCards';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

// TODO: períodos, grupos e membros virão do backend
const periods = ['2026/1', '2025/2', '2025/1'];
const views = [
  { id: 'geral', label: 'Visão Geral' },
  { id: 'gerentes', label: 'Gerentes' },
  { id: 'colaboradores', label: 'Colaboradores' },
];
const members = [
  { id: '1', nome: 'Neymar Jr' },
  { id: '2', nome: 'Walter White' },
  { id: '3', nome: 'Tom Cruise' },
];

export function DashboardView() {
  const { t } = useTranslation(['formulario']);
  const [period, setPeriod] = useState('2026/1');
  const [view, setView] = useState('geral');
  const [empresa, setEmpresa] = useState(false);

  const selectedLabel =
    members.find((member) => member.id === view)?.nome ??
    views.find((item) => item.id === view)?.label;

  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-background">
      <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-heading">João Silva</p>
          <h1 className="text-center text-3xl font-bold text-heading sm:text-left">
            Dashboard
          </h1>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-background p-2 sm:justify-end">
          {/* SELECIONAR PERÍODO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="default" className="gap-2">
                <ChevronDown />
                <span className="hidden sm:inline">{period}</span>
                <span className="sm:hidden">Período</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={period} onValueChange={setPeriod}>
                {periods.map((item) => (
                  <DropdownMenuRadioItem key={item} value={item}>
                    {item}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SELECIONAR VISÃO - APENAS PARA EMPRESA */}
          {empresa && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="default" className="gap-2">
                  <ChevronDown />
                  {selectedLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Grupos */}
                <DropdownMenuRadioGroup value={view} onValueChange={setView}>
                  {views.map((item) => (
                    <DropdownMenuRadioItem key={item.id} value={item.id}>
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                {/* Funcionário específico */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Funcionário</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                    <DropdownMenuRadioGroup
                      value={view}
                      onValueChange={setView}
                    >
                      {members.map((member) => (
                        <DropdownMenuRadioItem
                          key={member.id}
                          value={member.id}
                        >
                          {member.nome}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* BAIXAR */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="default" className="gap-2">
                <ChevronDown />
                Baixar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  window.print();
                }}
              >
                PDF
              </DropdownMenuItem>
              {/* TODO: IMPLEMENTAR LOGICA DE DOWNLOAD DE CSV */}
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background p-2 sm:justify-end">
          <button
            type="button"
            aria-label={t('formulario:menuPainel')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LayoutDashboard size={24} />
          </button>
          <button
            type="button"
            aria-label={t('formulario:menuFormulario')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <ClipboardPen size={24} />
          </button>
          <button
            type="button"
            aria-label={t('formulario:menuInformacoes')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <Info size={24} />
          </button>
          <CreedSymbol className="size-6" />
          <img src={wordmark} alt="CREED.ai" className="w-24" />
          <button
            type="button"
            aria-label={t('formulario:menuSair')}
            className="text-brand p-2 transition-colors hover:opacity-80"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
      {/* BOTÃO DE TOGGLE APENAS PARA TESTES */}
      <Button
        type="button"
        variant="default"
        aria-pressed={empresa}
        className="mx-6 mb-4 self-start"
        onClick={() => {
          if (empresa) {
            setView('Visão Geral');
          }
          setEmpresa((prev) => !prev);
        }}
      >
        Toggle empresa
      </Button>
      <div className="px-6">
        <ResumoCards
          nomeEmpresa="Acme Inc."
          concluidos={50}
          convidados={67}
          destaque={{
            titulo: 'Inovação',
            valor: 79,
            descricao:
              'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
          }}
          oportunidade={{
            titulo: 'Neuroinovação',
            valor: 54,
            descricao:
              'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
          }}
          maisComum={{
            titulo: 'Cultura',
            valor: 67,
            descricao:
              'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
          }}
        />
      </div>
    </div>
  );
}
