import { useState } from 'react';
import type { MonthlyFlow } from '../../../services/dashboard/dashboardService';
import { formatCurrency } from '../../../utils/formatters';

const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });
const fullMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function MonthlyResult({ history }: { history: MonthlyFlow[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const selected = history.find(({ month }) => month === selectedMonth) ?? history.at(-1);

  const values = history.map(({ net }) => Number(net));
  const lower = Math.min(0, ...values);
  const upper = Math.max(0, ...values);
  const y = (value: number) => upper === lower ? 70 : 12 + (upper - value) / (upper - lower) * 116;
  const points = values.map((value, index) => [history.length === 1 ? 240 : 24 + index * 432 / (history.length - 1), y(value)]);
  const tone = selected && Number(selected.net) !== 0
    ? `financial-amount financial-amount--${Number(selected.net) > 0 ? 'income' : 'expense'}`
    : undefined;

  return (
    <section className="dashboard-card dashboard-result" aria-labelledby="dashboard-result-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="dashboard-result-title">Evolução do resultado mensal</h2>
          <p>Diferença entre entradas e saídas em cada mês.</p>
        </div>
      </header>
      {selected ? (
        <>
          <p className="dashboard-result__value" aria-live="polite">
            <span>{fullMonth.format(new Date(selected.month))}</span>
            <strong className={tone}>{formatCurrency(selected.net)}</strong>
          </p>
          <svg className="dashboard-result__plot" viewBox="0 0 480 140" aria-hidden="true">
            <line className="dashboard-result__zero" x1="0" x2="480" y1={y(0)} y2={y(0)} />
            <polyline points={points.map((point) => point.join(',')).join(' ')} />
            {points.map(([x, pointY], index) => (
              <circle key={history[index].month} cx={x} cy={pointY} r={history[index].month === selected.month ? 6 : 3} />
            ))}
          </svg>
          <div className="dashboard-result__months" role="group" aria-label="Escolher mês">
            {history.map(({ month, net }) => (
              <button key={month} type="button" aria-pressed={month === selected.month}
                aria-label={`${fullMonth.format(new Date(month))}, ${formatCurrency(net)}`}
                onClick={() => setSelectedMonth(month)}>
                {monthLabel.format(new Date(month))}
              </button>
            ))}
          </div>
        </>
      ) : <p>Sem histórico para exibir.</p>}
    </section>
  );
}
