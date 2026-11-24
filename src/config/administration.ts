import { LayoutDashboard, Mail, UserRoundCheck, UsersRound } from 'lucide-react';

export const administrationLinks = {
  dashboard: { path: '/app/administrador/dashboard', title: 'Dashboard', icon: LayoutDashboard },
  users: { path: '/app/administrador/usuarios', title: 'Todos os usuários', icon: UsersRound },
  pending: { path: '/app/administrador/pendentes', title: 'Usuários para aprovar', icon: UserRoundCheck },
  messages: { path: '/app/administrador/mensagens', title: 'Mensagens', icon: Mail },
};
