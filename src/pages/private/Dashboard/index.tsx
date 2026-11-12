import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SelectField } from '../../../components/forms/fields';
import BankLogo from '../../../components/ui/BankLogo';
import {
  getTransactionBankLabel,
  transactionBankOptions,
  type TransactionBank,
} from '../../../config/transactionBanks';
import type { SelectFieldOption } from '../../../components/forms/fields/SelectField';
import './Dashboard.scss';

type DashboardBank = TransactionBank | 'all';
type TransactionKind = 'income' | 'expense';

interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}

interface DashboardTransaction {
  title: string;
  category: string;
  date: string;
  amount: number;
  kind: TransactionKind;
  bank: string;
}

const bankOptions: SelectFieldOption<DashboardBank>[] = [
  { value: 'all', label: 'Todos os bancos' },
  ...transactionBankOptions.filter((bank) => bank.value !== ''),
];

const bankFactors: Record<string, number> = {
  banco_do_brasil: 1.12,
  bradesco: 1.04,
  btg_pactual: 1.26,
  c6_bank: 0.88,
  caixa: 0.94,
  inter: 0.78,
  itau: 1.18,
  mercado_pago: 0.68,
  nubank: 0.92,
  pagbank: 0.74,
  picpay: 0.7,
  santander: 1.08,
  sicoob: 0.84,
  sicredi: 0.82,
  other: 0.66,
};

const baseMonthlyFlow: MonthlyFlow[] = [
  { month: 'Jun', income: 7200, expenses: 4680 },
  { month: 'Jul', income: 8100, expenses: 5120 },
  { month: 'Ago', income: 7600, expenses: 4920 },
  { month: 'Set', income: 8900, expenses: 5380 },
  { month: 'Out', income: 8350, expenses: 5060 },
  { month: 'Nov', income: 9200, expenses: 4890 },
];

const baseTransactions: Omit<DashboardTransaction, 'bank'>[] = [
  {
    title: 'Salário',
    category: 'Renda',
    date: '12 nov',
    amount: 8200,
    kind: 'income',
  },
  {
    title: 'Mercado da semana',
    category: 'Alimentação',
    date: '11 nov',
    amount: 486.35,
    kind: 'expense',
  },
  {
    title: 'Freelance de design',
    category: 'Renda extra',
    date: '10 nov',
    amount: 1450,
    kind: 'income',
  },
  {
    title: 'Conta de energia',
    category: 'Moradia',
    date: '08 nov',
    amount: 213.9,
    kind: 'expense',
  },
];

const allBankTransactions: DashboardTransaction[] = [
  { ...baseTransactions[0], bank: 'itau' },
  { ...baseTransactions[1], bank: 'nubank' },
  { ...baseTransactions[2], bank: 'inter' },
  { ...baseTransactions[3], bank: 'banco_do_brasil' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function getBankFactor(bank: TransactionBank): number {
  return bankFactors[bank] ?? 0.86;
}

function getBankTransactions(bank: TransactionBank): DashboardTransaction[] {
  const factor = getBankFactor(bank);
  return baseTransactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount * factor,
    bank,
  }));
}

export default function DashboardPage() {
  const [selectedBank, setSelectedBank] = useState<DashboardBank>('all');
  const bankFactor = selectedBank === 'all' ? 1 : getBankFactor(selectedBank);
  const monthlyFlow = baseMonthlyFlow.map((month) => ({
    ...month,
    income: month.income * bankFactor,
    expenses: month.expenses * bankFactor,
  }));
  const transactions =
    selectedBank === 'all'
      ? allBankTransactions
      : getBankTransactions(selectedBank);
  const selectedBankOption = bankOptions.find(
    (bank) => bank.value === selectedBank,
  );
  const maxFlow = Math.max(...monthlyFlow.map((month) => month.income));
  const currentIncome = monthlyFlow[monthlyFlow.length - 1].income;
  const currentExpenses = monthlyFlow[monthlyFlow.length - 1].expenses;
  const currentBalance = 28450 * bankFactor;
  const investedAmount = 18700 * bankFactor;

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__heading">
          <span className="dashboard-page__heading-icon">
            <ChartNoAxesCombined size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Visão geral</span>
            <h1>Seu dinheiro em equilíbrio</h1>
            <p>Acompanhe sua vida financeira em um só lugar.</p>
          </div>
        </div>
        <SelectField
          fieldClassName="dashboard-bank-filter"
          id="dashboard-bank-filter"
          label="Visualizar banco"
          onChange={setSelectedBank}
          options={bankOptions}
          value={selectedBank}
        />
      </header>

      <section
        aria-label="Saldo disponível"
        className="dashboard-balance"
      >
        <div className="dashboard-balance__content">
          <span className="dashboard-balance__label">
            {selectedBank === 'all'
              ? 'Saldo total em todos os bancos'
              : `Saldo disponível no ${getTransactionBankLabel(selectedBank)}`}
          </span>
          <strong>{formatCurrency(currentBalance)}</strong>
          <span className="dashboard-balance__trend">
            <ArrowUpRight size={15} aria-hidden="true" />
            6,8% em relação ao mês passado
          </span>
        </div>
        <span className="dashboard-balance__icon" aria-hidden="true">
          <Wallet size={23} />
        </span>
        <div className="dashboard-balance__footer">
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            Dados demonstrativos · atualizado em 12 nov. 2026
          </span>
          {selectedBankOption && selectedBank !== 'all' && (
            <span className="dashboard-balance__bank">
              <BankLogo
                label={selectedBankOption.label}
                logoDomain={selectedBankOption.logoDomain}
                size="small"
              />
              {selectedBankOption.label}
            </span>
          )}
        </div>
      </section>

      <section aria-label="Resumo do mês" className="dashboard-metrics">
        <article className="dashboard-metric">
          <span className="dashboard-metric__icon dashboard-metric__icon--income">
            <ArrowDownLeft size={18} aria-hidden="true" />
          </span>
          <span className="dashboard-metric__label">Receitas do mês</span>
          <strong>{formatCurrency(currentIncome)}</strong>
          <span className="dashboard-metric__change dashboard-metric__change--positive">
            +12,4% <span>vs. mês anterior</span>
          </span>
        </article>
        <article className="dashboard-metric">
          <span className="dashboard-metric__icon dashboard-metric__icon--expense">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
          <span className="dashboard-metric__label">Despesas do mês</span>
          <strong>{formatCurrency(currentExpenses)}</strong>
          <span className="dashboard-metric__change dashboard-metric__change--neutral">
            -3,2% <span>vs. mês anterior</span>
          </span>
        </article>
        <article className="dashboard-metric">
          <span className="dashboard-metric__icon dashboard-metric__icon--investments">
            <ChartNoAxesCombined size={18} aria-hidden="true" />
          </span>
          <span className="dashboard-metric__label">Total investido</span>
          <strong>{formatCurrency(investedAmount)}</strong>
          <span className="dashboard-metric__change dashboard-metric__change--positive">
            +5,6% <span>este mês</span>
          </span>
        </article>
      </section>

      <div className="dashboard-content">
        <section
          aria-labelledby="dashboard-flow-title"
          className="dashboard-card dashboard-flow"
        >
          <header className="dashboard-card__header">
            <div>
              <h2 id="dashboard-flow-title">Fluxo financeiro</h2>
              <p>Receitas e despesas nos últimos seis meses</p>
            </div>
            <span className="dashboard-card__period">Jun — Nov, 2026</span>
          </header>

          <div className="dashboard-flow__legend" aria-hidden="true">
            <span>
              <i className="dashboard-flow__legend-dot dashboard-flow__legend-dot--income" />
              Receitas
            </span>
            <span>
              <i className="dashboard-flow__legend-dot dashboard-flow__legend-dot--expenses" />
              Despesas
            </span>
          </div>
          <div
            aria-label="Gráfico de receitas e despesas por mês"
            className="dashboard-flow__chart"
            role="img"
          >
            {monthlyFlow.map((month) => (
              <div className="dashboard-flow__month" key={month.month}>
                <div className="dashboard-flow__bars">
                  <span
                    className="dashboard-flow__bar dashboard-flow__bar--income"
                    style={{ height: `${(month.income / maxFlow) * 100}%` }}
                    title={`Receitas em ${month.month}: ${formatCurrency(month.income)}`}
                  />
                  <span
                    className="dashboard-flow__bar dashboard-flow__bar--expenses"
                    style={{ height: `${(month.expenses / maxFlow) * 100}%` }}
                    title={`Despesas em ${month.month}: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <span className="dashboard-flow__month-label">{month.month}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="dashboard-activity-title"
          className="dashboard-card dashboard-activity"
        >
          <header className="dashboard-card__header">
            <div>
              <h2 id="dashboard-activity-title">Movimentações recentes</h2>
              <p>Suas últimas atividades</p>
            </div>
            <Link
              aria-label="Ver todas as movimentações"
              className="dashboard-activity__more"
              to="/app/lancamentos"
            >
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </header>
          <ul className="dashboard-activity__list">
            {transactions.map((transaction, index) => {
              const bank = transactionBankOptions.find(
                (option) => option.value === transaction.bank,
              );
              const isIncome = transaction.kind === 'income';

              return (
                <li
                  className="dashboard-activity__item"
                  key={`${transaction.title}-${transaction.bank}-${index}`}
                >
                  <span
                    className={`dashboard-activity__kind ${
                      isIncome
                        ? 'dashboard-activity__kind--income'
                        : 'dashboard-activity__kind--expense'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={16} aria-hidden="true" />
                    ) : (
                      <ArrowUpRight size={16} aria-hidden="true" />
                    )}
                  </span>
                  <span className="dashboard-activity__description">
                    <strong>{transaction.title}</strong>
                    <span>
                      {transaction.category} · {transaction.date}
                    </span>
                  </span>
                  <span className="dashboard-activity__amount">
                    <strong
                      className={
                        isIncome
                          ? 'dashboard-activity__amount--income'
                          : undefined
                      }
                    >
                      {isIncome ? '+' : '−'}
                      {formatCurrency(transaction.amount)}
                    </strong>
                    {bank && (
                      <span>
                        <BankLogo
                          label={bank.label}
                          logoDomain={bank.logoDomain}
                          size="small"
                        />
                        {bank.label}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
