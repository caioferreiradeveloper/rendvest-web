import { useState } from 'react';
import type { DashboardData } from '../../../services/dashboard/dashboardService';
import { formatCurrency } from '../../../utils/formatters';

type View = 'open' | 'settled' | 'wishlist';
type Bar = [label: string, amount: string, tone: 'income' | 'expense' | 'neutral', detail?: string];

const views: { key: View; label: string }[] = [
  { key: 'open', label: 'Em aberto' },
  { key: 'settled', label: 'Pagos e recebidos' },
  { key: 'wishlist', label: 'Compras planejadas' },
];

const integer = new Intl.NumberFormat('pt-BR');
const count = (value: number, singular: string, plural: string) =>
  `${integer.format(value)} ${value === 1 ? singular : plural}`;

export default function FinancialOverview({ data }: { data: DashboardData }) {
  const [view, setView] = useState<View>('open');
  const { loans, debtors, monthlies, wishlist } = data;
  const bars: Record<View, Bar[]> = {
    open: [
      ['Saldo de empréstimos', loans.outstanding, 'expense', [
        count(loans.active_count, 'empréstimo ativo', 'empréstimos ativos'),
        count(loans.overdue_installments, 'parcela vencida', 'parcelas vencidas'),
      ].join(' · ')],
      ['Valores de devedores', debtors.outstanding, 'income', count(debtors.open_count, 'registro em aberto', 'registros em aberto')],
      ['Receitas recorrentes do mês', monthlies.pending_income, 'income'],
      ['Despesas recorrentes do mês', monthlies.pending_expenses, 'expense'],
    ],
    settled: [
      ['Empréstimos pagos no mês', loans.paid_this_month, 'expense'],
      ['Valores recebidos de devedores no mês', debtors.received_this_month, 'income'],
    ],
    wishlist: [
      ['Total da lista de desejos', wishlist.total, 'neutral', count(wishlist.count, 'item', 'itens')],
      ['Compras previstas para este mês', wishlist.planned_this_month, 'neutral', 'Já incluídas no total da lista'],
    ],
  };
  const visibleBars = bars[view];
  const max = Math.max(0, ...visibleBars.map(([, amount]) => Number(amount)));

  return (
    <section className="dashboard-card dashboard-overview" aria-labelledby="dashboard-overview-title">
      <header className="dashboard-card__header">
        <h2 id="dashboard-overview-title">Compromissos e planejamento</h2>
        <div className="dashboard-overview__filters" role="group" aria-label="Dados do gráfico">
          {views.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </div>
      </header>
      <dl className="dashboard-overview__bars">
        {visibleBars.map(([label, amount, tone, detail]) => (
          <div className="dashboard-overview__row" key={label} data-tone={tone}>
            <dt>{label}</dt>
            <dd>{formatCurrency(amount)}</dd>
            <span className="dashboard-overview__track" aria-hidden="true">
              <span style={{ width: max > 0 ? `${Number(amount) / max * 100}%` : '0%' }} />
            </span>
            {detail && <small>{detail}</small>}
          </div>
        ))}
      </dl>
      {view === 'open' && <p className="dashboard-overview__note">{count(monthlies.pending_count, 'mensalidade pendente', 'mensalidades pendentes')} no mês</p>}
      {view === 'settled' && <p className="dashboard-overview__note">{count(monthlies.settled_count, 'mensalidade baixada', 'mensalidades baixadas')} no mês</p>}
    </section>
  );
}
