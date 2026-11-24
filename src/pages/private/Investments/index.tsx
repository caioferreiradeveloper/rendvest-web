import { useEffect, useState } from 'react';
import { ChartNoAxesCombined, CirclePlus, Wallet } from 'lucide-react';
import { useToast } from '@contexts/ToastContext';
import MessageAlert from '@components/ui/MessageAlert';
import Skeleton from '@components/ui/Skeleton';
import { Button } from '@components/ui/buttons';
import { privateModules } from '@config/privateModules';
import { fetchFundQuote, type FundQuote } from '@services/investments/fundQuote';
import { listInvestments, type Investment } from '@services/investments/investmentService';
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';
import InvestmentFormSidebar, { QuoteValue } from './InvestmentFormSidebar';
import './Investments.scss';

export default function InvestmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [investments, setInvestments] = useState<Investment[] | null>(null);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(0);
  const [quotes, setQuotes] = useState<Record<string, FundQuote | null>>({});
  const { showToast } = useToast();
  const { title, description, icon: ModuleIcon } = privateModules.investments;

  useEffect(() => {
    const controller = new AbortController();
    listInvestments(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setInvestments(data); })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(failure instanceof Error ? failure.message : 'Não foi possível carregar as aplicações.');
        }
      });
    return () => controller.abort();
  }, [request]);

  const quoteTickers = [...new Set(investments?.map(({ asset }) => asset))].sort().join(',');

  useEffect(() => {
    if (!quoteTickers) return;
    const controller = new AbortController();
    async function loadQuotes() {
      const tickers = quoteTickers.split(',');
      for (let offset = 0; offset < tickers.length && !controller.signal.aborted; offset += 4) {
        await Promise.all(tickers.slice(offset, offset + 4).map(async (ticker) => {
          const quote = await fetchFundQuote(ticker, controller.signal).catch(() => null);
          if (!controller.signal.aborted) setQuotes((current) => ({ ...current, [ticker]: quote }));
        }));
      }
    }
    void loadQuotes();
    return () => controller.abort();
  }, [quoteTickers]);

  const total = investments?.reduce((sum, investment) => sum + Math.round(Number(investment.amount) * 100), 0);

  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <ModuleIcon size="var(--icon-size-21)" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
        <Button icon={<CirclePlus size="var(--icon-size-17)" />} iconPosition="leading" onClick={() => setShowForm(true)}>
          Nova aplicação
        </Button>
      </header>
      {showForm && <InvestmentFormSidebar onClose={() => setShowForm(false)} onSave={(investment) => {
        setInvestments((previous) => previous && [investment, ...previous].sort((a, b) =>
          b.invested_at.localeCompare(a.invested_at) || b.id - a.id));
        setError('');
        setRequest((current) => current + 1);
        setShowForm(false);
        showToast({ kind: 'success', title: 'Aplicação cadastrada', message: 'Sua carteira foi atualizada.' });
      }} />}
      <section aria-labelledby="portfolio-title" className="transaction-list investment-list">
        <header className="transaction-list__header investment-list__header">
          <div>
            <h2 id="portfolio-title">Minhas aplicações</h2>
            <p>Acompanhe suas compras de FIIs e a última cotação disponível.</p>
          </div>
          <div className="investment-total">
            <Wallet size={19} aria-hidden="true" />
            <div>
              <span>Total aplicado</span>
              {total !== undefined && <strong>{formatCurrency(total / 100)}</strong>}
              {!investments && !error && <Skeleton width={96} height={20} />}
              {!investments && error && <strong>—</strong>}
            </div>
          </div>
        </header>
        {error && <div className="investment-feedback investment-list__feedback">
          <MessageAlert className="investment-alert" kind="error" message={error} />
          <Button variant="secondary" onClick={() => {
            setError('');
            setRequest((current) => current + 1);
          }}>Tentar novamente</Button>
        </div>}
        {!investments && !error && <span className="visually-hidden" role="status">Carregando aplicações…</span>}
        <div className="transaction-table-wrap" aria-busy={!investments && !error}>
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">FII</th>
                <th scope="col">Cotas compradas</th>
                <th scope="col">Data da compra</th>
                <th scope="col">Valor atual da cota</th>
                <th scope="col">Valor aplicado</th>
              </tr>
            </thead>
            <tbody>
              {!investments && !error && [0, 1, 2, 3].map((row) => (
                <tr key={row} aria-hidden="true">
                  <td><div className="transaction-table__name"><Skeleton width={34} height={34} /><Skeleton width={76} /></div></td>
                  {[58, 68, 66, 74].map((width, column) => (
                    <td key={width}><Skeleton width={width} className={column === 3 ? 'investment-table__amount-placeholder' : undefined} /></td>
                  ))}
                </tr>
              ))}
              {investments?.length === 0 && !error && (
                <tr>
                  <td className="transaction-table__state" colSpan={5}>
                    <div className="transaction-empty">
                      <span className="transaction-empty__icon"><Wallet size={20} aria-hidden="true" /></span>
                      <strong>Nenhuma aplicação registrada</strong>
                      <p>Registre uma aplicação para acompanhar sua carteira.</p>
                      <Button variant="secondary" onClick={() => setShowForm(true)}>Nova aplicação</Button>
                    </div>
                  </td>
                </tr>
              )}
              {investments?.map((investment) => (
                <tr key={investment.id}>
                  <td>
                    <div className="transaction-table__name">
                      <span className="transaction-type-icon investment-asset-icon">
                        <ChartNoAxesCombined size="var(--icon-size-16)" aria-hidden="true" />
                      </span>
                      <strong title={investment.asset}>{investment.asset}</strong>
                    </div>
                  </td>
                  <td>{investment.quantity?.toLocaleString('pt-BR') ?? 'Não informada'}</td>
                  <td className="transaction-table__date">{formatDateOnly(investment.invested_at)}</td>
                  <td><QuoteValue quote={quotes[investment.asset]} /></td>
                  <td className="financial-amount">{formatCurrency(Number(investment.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {investments && <footer className="transaction-pagination">
          <span>{investments.length} {investments.length === 1 ? 'aplicação' : 'aplicações'}</span>
        </footer>}
      </section>
    </main>
  );
}
