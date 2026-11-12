import {
  ArrowDownUp,
  Banknote,
  ChartNoAxesCombined,
  CircleDollarSign,
  HandCoins,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export const privateModules = {
  dashboard: {
    path: '/app/dashboard',
    title: 'Dashboard',
    description: 'Um resumo da sua organização financeira.',
    icon: LayoutDashboard,
  },
  transactions: {
    path: '/app/lancamentos',
    title: 'Ganhos e gastos',
    description: 'Acompanhe suas entradas e saídas em um só lugar.',
    icon: ArrowDownUp,
  },
  payables: {
    path: '/app/emprestimos-a-pagar',
    title: 'Empréstimos a pagar',
    description: 'Organize empréstimos, parcelas e compromissos futuros.',
    icon: HandCoins,
  },
  debtors: {
    path: '/app/devedores',
    title: 'Devedores',
    description: 'Mantenha seus valores a receber organizados.',
    icon: CircleDollarSign,
  },
  investments: {
    path: '/app/investimentos',
    title: 'Investimentos',
    description: 'Acompanhe sua carteira e seus objetivos de investimento.',
    icon: ChartNoAxesCombined,
  },
  stocks: {
    path: '/app/acoes',
    title: 'Ações',
    description: 'Organize seus investimentos em ações.',
    icon: ChartNoAxesCombined,
  },
  fiis: {
    path: '/app/fiis',
    title: 'FIIs',
    description: 'Organize seus investimentos em fundos imobiliários.',
    icon: Banknote,
  },
} satisfies Record<
  string,
  { path: string; title: string; description: string; icon: LucideIcon }
>;

export type PrivateModuleKey = keyof typeof privateModules;

export const privateNavigationGroups: {
  title: string;
  modules: PrivateModuleKey[];
}[] = [
  { title: 'Visão geral', modules: ['dashboard'] },
  {
    title: 'Organização',
    modules: ['transactions', 'payables', 'debtors'],
  },
  {
    title: 'Investimentos',
    modules: ['investments', 'stocks', 'fiis'],
  },
];
