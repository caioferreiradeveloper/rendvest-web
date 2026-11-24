import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Wallet, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { privateModules } from '@config/privateModules';
import Skeleton from '@components/ui/Skeleton';
import MessageAlert from '@components/ui/MessageAlert';
import { Button } from '@components/ui/buttons';
import { SelectField } from '@components/forms/fields';
import { getTransactionBankLabel, transactionBankOptions, type TransactionBank } from '@config/transactionBanks';
import type { SelectFieldOption } from '@components/forms/fields/SelectField';
import { getDashboard, type DashboardData, type MonthlyFlow } from '../../../services/dashboard/dashboardService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { portfolioTotal } from '../Investments/demoPortfolio';
import FinancialOverview from './FinancialOverview';
import MonthlyResult from './MonthlyResult';
import PortfolioAllocation from './PortfolioAllocation';
import './Dashboard.scss';

const bankOptions: SelectFieldOption<TransactionBank>[] = [
  { value: '', label: 'Todos os bancos' },
  ...transactionBankOptions.filter((bank) => bank.value !== ''),
];
const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const countFormat = new Intl.NumberFormat('pt-BR');
const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

type MetricTone = 'income' | 'expense';

function netTone(value: string): MetricTone | undefined {
  const amount = Number(value);
  if (amount === 0) return undefined;
  return amount > 0 ? 'income' : 'expense';
}

function amountClass(tone?: MetricTone) {
  return tone ? `financial-amount financial-amount--${tone}` : undefined;
}

const changeFormat = new Intl.NumberFormat('pt-BR', {
  style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero',
});

function SummaryCard({ label, amount, kind, Icon, previous }: {
  label: string;
  amount: string | number;
  kind: 'income' | 'expense' | 'investments';
  Icon: LucideIcon;
  previous?: string;
}) {
  const baseline = Number(previous);
  const change = baseline > 0 ? (Number(amount) - baseline) / baseline : null;
  const favorable = change !== null && (kind === 'income' ? change > 0 : change < 0);
  const caption = kind === 'investments' ? 'Carteira simulada' : 'Sem base de comparação';

  return (
    <div className="dashboard-metric">
      <span className={`dashboard-metric__icon dashboard-metric__icon--${kind}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="dashboard-metric__label">{label}</span>
      <strong>{formatCurrency(amount)}</strong>
      <span className={`dashboard-metric__change dashboard-metric__change--${favorable ? 'positive' : 'neutral'}`}>
        {change === null ? caption : <>{changeFormat.format(change)} <span>vs. mês anterior</span></>}
      </span>
    </div>
  );
}

function CashFlow({ history, transactions }: { history: MonthlyFlow[]; transactions: DashboardData['transactions'] }) {
  const maxFlow = Math.max(1, ...history.flatMap(({ income, expenses }) => [Number(income), Number(expenses)]));
  return (
    <section className="dashboard-card dashboard-flow" aria-labelledby="dashboard-flow-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="dashboard-flow-title">Fluxo de caixa em seis meses</h2>
          <p>Entradas e saídas realizadas. Compras vinculadas a faturas entram no fluxo quando a fatura é paga.</p>
        </div>
      </header>
      <dl className="dashboard-flow__summary" aria-label="Totais do mês">
        <div><dt>Resultado do mês</dt><dd className={amountClass(netTone(transactions.net))}>{formatCurrency(transactions.net)}</dd></div>
      </dl>
      <p className="dashboard-overview__note">
        {countFormat.format(transactions.transaction_count)} {transactions.transaction_count === 1 ? 'lançamento registrado' : 'lançamentos registrados'} no mês
      </p>
      <div className="dashboard-flow__legend" aria-hidden="true">
        <span><i className="dashboard-flow__legend-dot dashboard-flow__legend-dot--income" />Entradas</span>
        <span><i className="dashboard-flow__legend-dot dashboard-flow__legend-dot--expenses" />Saídas</span>
      </div>
      <div className="dashboard-flow__chart">
        {history.map((period) => (
          <div key={period.month} className="dashboard-flow__month">
            <div className="dashboard-flow__bars" role="img" aria-label={`Entradas: ${formatCurrency(period.income)} · Saídas: ${formatCurrency(period.expenses)}`} title={`Entradas: ${formatCurrency(period.income)} · Saídas: ${formatCurrency(period.expenses)}`}>
              <span className="dashboard-flow__bar dashboard-flow__bar--income" hidden={Number(period.income) === 0} style={{ height: `${Number(period.income) / maxFlow * 100}%` }} />
              <span className="dashboard-flow__bar dashboard-flow__bar--expenses" hidden={Number(period.expenses) === 0} style={{ height: `${Number(period.expenses) / maxFlow * 100}%` }} />
            </div>
            <span className="dashboard-flow__month-label">{monthFormat.format(new Date(period.month))}</span>
          </div>
        ))}
      </div>
      <Link className="dashboard-chart-link" to={privateModules.transactions.path}>
        Ver valores por mês <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </section>
  );
}

function DashboardLoading() {
  return (
    <div role="status" aria-label="Carregando indicadores financeiros">
      <div className="dashboard-balance dashboard-balance--loading" aria-hidden="true">
        <div className="dashboard-balance__content">
          <Skeleton width={118} />
          <Skeleton width={204} height={40} />
          <Skeleton width={164} height={10} />
        </div>
        <Skeleton width={42} height={42} />
      </div>
      <div className="dashboard-metrics" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div className="dashboard-metric dashboard-metric--loading" key={index}>
            <Skeleton className="dashboard-metric__icon" height={38} />
            <Skeleton width="55%" />
            <Skeleton width="75%" height={22} />
            <Skeleton width="45%" height={9} />
          </div>
        ))}
      </div>
      <div className="dashboard-card dashboard-section dashboard-recent" aria-hidden="true">
        <div className="dashboard-card__header"><Skeleton width={170} height={17} /></div>
        <ul className="dashboard-activity__list">
          {[64, 48, 57].map((width) => (
            <li className="dashboard-activity__item" key={width}>
              <Skeleton width={32} height={32} />
              <span className="dashboard-activity__description">
                <Skeleton width={width + '%'} />
                <Skeleton width="30%" height={9} />
              </span>
              <Skeleton width={75} height={15} />
            </li>
          ))}
        </ul>
      </div>
      <div className="dashboard-charts dashboard-section" aria-hidden="true">
        <div className="dashboard-card">
          <Skeleton width={170} height={17} />
          <div className="dashboard-flow__chart">
            {[42, 68, 53, 76, 64, 88].map((height) => (
              <div className="dashboard-flow__month" key={height}>
                <Skeleton width="55%" height={height + '%'} />
                <Skeleton width="70%" height={10} />
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-card">
          <Skeleton width={145} height={17} />
          <div className="dashboard-portfolio__chart dashboard-portfolio__chart--loading">
            <div className="dashboard-portfolio__total"><Skeleton width="56%" height={18} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [bank, setBank] = useState<TransactionBank>('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    getDashboard(bank, request.signal)
      .then((response) => { if (!request.signal.aborted) setData(response); })
      .catch((failure: unknown) => {
        if (!request.signal.aborted) {
          setError(failure instanceof Error ? failure.message : 'Não foi possível carregar o dashboard.');
        }
      });
    return () => request.abort();
  }, [bank, retry]);

  function changeBank(value: TransactionBank) {
    if (value === bank) return;
    setError('');
    setData(null);
    setBank(value);
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__heading">
          <span className="dashboard-page__heading-icon"><ChartNoAxesCombined aria-hidden="true" /></span>
          <div><h1>Dashboard financeiro</h1><p>Resumo dos seus lançamentos e compromissos.</p></div>
        </div>
        <SelectField fieldClassName="dashboard-bank-filter" id="dashboard-bank-filter"
          label="Banco dos lançamentos" onChange={changeBank} options={bankOptions} value={bank} />
      </header>
      {error && (
        <div className="dashboard-card dashboard-section dashboard-recent dashboard-feedback">
          <MessageAlert kind="error" message={error} />
          <Button variant="secondary" onClick={() => {
            setError('');
            setRetry((current) => current + 1);
          }}>Tentar novamente</Button>
        </div>
      )}
      {!data && !error && <DashboardLoading />}
      {data && (
        <>
          <section className="dashboard-balance" aria-label="Saldo acumulado">
            <div className="dashboard-balance__content">
              <span className="dashboard-balance__label">{bank ? `Saldo em ${getTransactionBankLabel(bank)}` : 'Saldo total registrado'}</span>
              <strong>{formatCurrency(Number(data.transactions.balance))}</strong>
              <span className="dashboard-balance__trend">Entradas menos saídas até {dateFormat.format(new Date(data.as_of))}</span>
            </div>
            <span className="dashboard-balance__icon"><Wallet aria-hidden="true" /></span>
          </section>

          <section className="dashboard-metrics" aria-label="Resumo do mês e investimentos">
            <SummaryCard label="Receitas do mês" amount={data.transactions.income}
              previous={data.history.at(-2)?.income} kind="income" Icon={ArrowDownLeft} />
            <SummaryCard label="Despesas do mês" amount={data.transactions.expenses}
              previous={data.history.at(-2)?.expenses} kind="expense" Icon={ArrowUpRight} />
            <SummaryCard label="Total investido" amount={portfolioTotal}
              kind="investments" Icon={ChartNoAxesCombined} />
          </section>

          <section className="dashboard-card dashboard-section dashboard-recent" aria-label="Movimentações recentes">
            <header className="dashboard-card__header">
              <h2>Movimentações recentes</h2>
              <Link className="dashboard-activity__more" to={privateModules.transactions.path}
                aria-label="Ver todos os lançamentos" title="Ver todos os lançamentos">
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </header>
            {data.recent.length === 0 ? <p className="dashboard-overview__note">Nenhuma movimentação registrada.</p> : (
              <ul className="dashboard-activity__list">
                {data.recent.map((item) => (
                  <li className="dashboard-activity__item dashboard-recent-item" key={item.id}>
                    <span className={`dashboard-activity__kind dashboard-activity__kind--${item.type}`}>
                      {item.type === 'expense' ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownLeft size={16} aria-hidden="true" />}
                    </span>
                    <span className="dashboard-activity__description">
                      <strong>{item.description || item.category}</strong>
                      <span>{[getTransactionBankLabel(item.bank), formatDate(item.occurred_at)].filter(Boolean).join(' · ')}</span>
                    </span>
                    <strong className={`financial-amount financial-amount--${item.type}`}>
                      {item.type === 'expense' ? '−' : '+'}{formatCurrency(Number(item.amount))}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="dashboard-charts dashboard-section">
            <CashFlow history={data.history} transactions={data.transactions} />
            <PortfolioAllocation />
            <MonthlyResult history={data.history} />
            <FinancialOverview data={data} />
          </div>
        </>
      )}
    </main>
  );
}
