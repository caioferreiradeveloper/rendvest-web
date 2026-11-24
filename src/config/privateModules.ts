import {
  ArrowDownUp,
  Banknote,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  HandCoins,
  LayoutDashboard,
  ShoppingBag,
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
    path: '/app/emprestimos',
    title: 'Empréstimos',
    description: 'Organize empréstimos, parcelas e compromissos futuros.',
    icon: HandCoins,
  },
  debtors: {
    path: '/app/devedores',
    title: 'Devedores',
    description: 'Registre quem deve, em qual data e o valor a receber.',
    icon: CircleDollarSign,
  },
  monthlies: {
    path: '/app/mensalidades',
    title: 'Mensalidades',
    description: 'Acompanhe vencimentos e registre baixas de mensalidades.',
    icon: Banknote,
  },
  wishlist: {
    path: '/app/lista-de-desejos',
    title: 'Lista de desejos',
    description: 'Planeje suas próximas compras.',
    icon: ShoppingBag,
  },
  investments: {
    path: '/app/investimentos',
    title: 'Meus investimentos',
    description: 'Acompanhe suas aplicações em fundos imobiliários.',
    icon: ChartNoAxesCombined,
  },
  fiis: {
    path: '/app/fiis',
    title: 'Fundos Imobiliários',
    description: 'Acompanhe os fundos imobiliários da sua carteira.',
    icon: Building2,
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
    modules: ['transactions', 'payables', 'debtors', 'monthlies', 'wishlist'],
  },
  {
    title: 'Investimentos',
    modules: ['investments', 'fiis'],
  },
];
