import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CirclePlus, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { InputText } from '@components/forms/fields';
import { Button, IconButton } from '@components/ui/buttons';
import Skeleton from '@components/ui/Skeleton';
import { privateModules } from '@config/privateModules';
import { useToast } from '@contexts/ToastContext';
import { listInvestments, type Investment } from '@services/investments/investmentService';
import { formatCurrency } from '../../../utils/formatters';
import InvestmentFormSidebar from '../Investments/InvestmentFormSidebar';
import './Fiis.scss';

const pageSize = 10;
const countFormat = new Intl.NumberFormat('pt-BR');

interface Holding {
  ticker: string;
  quantity: number | null;
  investedCents: number;
}

function groupHoldings(investments: Investment[]) {
  const holdings = new Map<string, Holding>();

  for (const investment of investments) {
    const ticker = investment.asset.toUpperCase();
    const current = holdings.get(ticker);
    const previousQuantity = current ? current.quantity : 0;
    const quantity = investment.quantity == null || previousQuantity === null ? null : previousQuantity + investment.quantity;
    holdings.set(ticker, {
      ticker,
      quantity,
      investedCents: (current?.investedCents ?? 0) + Math.round(Number(investment.amount) * 100),
    });
  }

  return [...holdings.values()].sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export default function FiisPage() {
  const [params, setParams] = useSearchParams();
  const [investments, setInvestments] = useState<Investment[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const listTitle = useRef<HTMLHeadingElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    listInvestments(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setInvestments(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [attempt]);

  const query = (params.get('q') ?? '').trim().slice(0, 100);
  const requestedPage = Number(params.get('page'));
  const holdings = groupHoldings(investments ?? []).filter(({ ticker }) => ticker.includes(query.toUpperCase()));
  const totalPages = Math.max(1, Math.ceil(holdings.length / pageSize));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, totalPages) : 1;
  const funds = holdings.slice((page - 1) * pageSize, page * pageSize);
  const loading = !investments && !error;
  const { title, description, icon: ModuleIcon } = privateModules.fiis;

  function changeFilters(nextQuery: string, nextPage: number) {
    const next = new URLSearchParams();
    if (nextQuery) next.set('q', nextQuery);
    if (nextPage > 1) next.set('page', String(nextPage));
    if (next.toString() !== params.toString()) setParams(next);
  }

  function changePage(nextPage: number) {
    changeFilters(query, nextPage);
    listTitle.current?.focus({ preventScroll: true });
    listTitle.current?.scrollIntoView({ block: 'nearest' });
  }

  function retry() {
    setError(false);
    setAttempt((current) => current + 1);
  }

  function handleSave(investment: Investment) {
    setInvestments((previous) => previous && [investment, ...previous.filter(({ id }) => id !== investment.id)]);
    retry();
    setShowForm(false);
    showToast({ kind: 'success', title: 'Aplicação cadastrada', message: 'Sua carteira foi atualizada.' });
  }

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

      <section className="transaction-list" aria-labelledby="fii-list-title">
        <header className="transaction-list__header fii-list__header">
          <div>
            <h2 id="fii-list-title" ref={listTitle} tabIndex={-1}>Meus fundos</h2>
          </div>
          <form className="fii-list__search" onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get('query');
            changeFilters(String(value ?? '').trim(), 1);
          }}>
            <InputText key={query} id="fii-query" name="query" type="search" label="Buscar na carteira"
              placeholder="Código do FII" defaultValue={query} maxLength={100} />
            <Button type="submit" variant="secondary" icon={<Search size={16} />} iconPosition="leading">Buscar</Button>
          </form>
        </header>

        {loading && <span className="visually-hidden" role="status">Carregando fundos da carteira…</span>}
        {error && (
          <div className="transaction-empty fii-list__state">
            <strong role="alert">Não foi possível carregar a carteira.</strong>
            <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
          </div>
        )}
        {investments && !error && funds.length === 0 && (
          <div className="transaction-empty fii-list__state">
            <span className="transaction-empty__icon"><Building2 size={20} aria-hidden="true" /></span>
            <strong>{query ? 'Nenhum fundo corresponde à busca' : 'Nenhum fundo na carteira'}</strong>
            {query ? (
              <Button variant="secondary" onClick={() => changeFilters('', 1)}>Limpar busca</Button>
            ) : (
              <Button variant="secondary" onClick={() => setShowForm(true)}>Nova aplicação</Button>
            )}
          </div>
        )}
        {(loading || funds.length > 0) && <FundGrid funds={funds} loading={loading} />}
        {investments && (
          <nav className="transaction-pagination fii-list__pagination" aria-label="Paginação dos fundos">
            <span>{countFormat.format(holdings.length)} {holdings.length === 1 ? 'fundo' : 'fundos'}</span>
            <div className="transaction-pagination__controls">
              <IconButton icon={<ArrowLeft size={16} />} label="Página anterior" disabled={page <= 1}
                onClick={() => changePage(page - 1)} />
              <span aria-live="polite">Página <strong>{page}</strong> de {totalPages}</span>
              <IconButton icon={<ArrowRight size={16} />} label="Próxima página" disabled={page >= totalPages}
                onClick={() => changePage(page + 1)} />
            </div>
          </nav>
        )}
      </section>
      {showForm && <InvestmentFormSidebar onClose={() => setShowForm(false)} onSave={handleSave} />}
    </main>
  );
}

function FundGrid({ funds, loading }: { funds: Holding[]; loading: boolean }) {
  return (
    <ul className="fii-grid" aria-busy={loading}>
      {loading ? Array.from({ length: pageSize }, (_, index) => (
        <li className="fii-card fii-card--loading" key={index} aria-hidden="true">
          <Skeleton width={34} height={34} />
          <Skeleton width={64} height={16} />
          <Skeleton width="78%" />
          <Skeleton width="52%" height={10} />
        </li>
      )) : funds.map((fund) => (
        <li className="fii-card" key={fund.ticker}>
          <span className="transaction-type-icon fii-icon"><Building2 size={17} aria-hidden="true" /></span>
          <strong>{fund.ticker}</strong>
          <span className="fii-card__quantity">
            {fund.quantity === null ? 'Cotas não informadas' : `${countFormat.format(fund.quantity)} ${fund.quantity === 1 ? 'cota' : 'cotas'}`}
          </span>
          <dl className="fii-card__investment">
            <dt>Valor aplicado</dt>
            <dd className="financial-amount">{formatCurrency(fund.investedCents / 100)}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
