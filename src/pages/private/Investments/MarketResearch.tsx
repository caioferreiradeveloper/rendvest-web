import { useEffect, useState } from 'react';
import { ArrowUpRight, Building2, ChartNoAxesCombined } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { privateModules } from '@config/privateModules';
import FieldShell from '@components/forms/fields/FieldShell';
import PrivateModulePage from '@components/private/PrivateModulePage';
import { apiRequest } from '../../../services/api/apiClient';
import ApiError from '../../../services/api/ApiError';
import { formatCurrency } from '../../../utils/formatters';
import './Investments.scss';

interface Asset {
  ticker: string;
  name: string | null;
  segment: string | null;
}

interface AssetPage {
  count: number;
  results: Asset[];
  next_page: number | null;
}

interface Quote {
  ticker: string;
  price: string;
  currency: 'BRL';
  trade_date: string;
}

const apiPath = '/api/v1/investments';
const tradeDateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

type AssetType = 'stock' | 'fii';

export default function InvestmentMarketPage() {
  const [params, setParams] = useSearchParams();
  const type: AssetType = params.get('tipo') === 'fii' ? 'fii' : 'stock';

  return (
    <PrivateModulePage moduleKey="market">
      <nav className="market-filters" aria-label="Tipo de ativo">
        <button type="button" aria-pressed={type === 'stock'} onClick={() => setParams({ tipo: 'stock' })}>
          <ChartNoAxesCombined size={19} aria-hidden="true" />
          Ações
        </button>
        <button type="button" aria-pressed={type === 'fii'} onClick={() => setParams({ tipo: 'fii' })}>
          <Building2 size={19} aria-hidden="true" />
          Fundos imobiliários
        </button>
      </nav>
      <MarketResearch key={type} type={type} />
    </PrivateModulePage>
  );
}

function MarketResearch({ type }: { type: AssetType }) {
  const isFund = type === 'fii';
  const [input, setInput] = useState('');
  const [search, setSearch] = useState({ query: '', page: 1 });
  const [results, setResults] = useState<AssetPage | null>(null);
  const [searchError, setSearchError] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ type, q: search.query, page: String(search.page) });
    apiRequest<AssetPage>(`${apiPath}/assets/?${params}`, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResults(data); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSearchError(error instanceof Error ? error.message : 'Não foi possível pesquisar.');
        }
      });
    return () => controller.abort();
  }, [type, search]);

  useEffect(() => {
    if (!selectedTicker) return;
    const controller = new AbortController();
    apiRequest<Quote>(`${apiPath}/quotes/${encodeURIComponent(selectedTicker)}/`, {
      signal: controller.signal,
    }).then((data) => {
      if (!controller.signal.aborted) setQuote(data);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setQuoteError(error instanceof ApiError && error.status === 404
        ? 'Cotação indisponível para este ativo.'
        : error instanceof Error ? error.message : 'Não foi possível consultar a cotação.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingQuote(false);
    });
    return () => controller.abort();
  }, [selectedTicker, quoteRequest]);

  function searchAssets(query: string, page: number) {
    setSelectedTicker('');
    setQuote(null);
    setResults(null);
    setSearchError('');
    setSearch({ query, page });
  }

  function consultQuote(ticker: string) {
    if (ticker !== selectedTicker) setQuote(null);
    setSelectedTicker(ticker);
    setQuoteError('');
    setLoadingQuote(true);
    setQuoteRequest((current) => current + 1);
  }

  return (
    <section className="transaction-list" aria-labelledby="market-research-title">
      <header className="transaction-list__header">
        <h2 id="market-research-title">{isFund ? 'Pesquisar fundos imobiliários' : 'Pesquisar ações'}</h2>
        <form className="investment-filter" onSubmit={(event) => {
          event.preventDefault();
          searchAssets(input.trim(), 1);
        }}>
          <FieldShell id="asset-search" label={isFund ? 'Código, nome ou segmento' : 'Código, empresa ou setor'}>
            <input
              className="field-control"
              id="asset-search"
              type="search"
              maxLength={100}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </FieldShell>
          <button className="button button--primary button--small" type="submit">Buscar</button>
        </form>
      </header>
      {selectedTicker && (
        <section className="transaction-list__header" aria-labelledby="market-quote-title">
          <div aria-live="polite">
            <h3 id="market-quote-title">Cotação de {selectedTicker}</h3>
            {quote && (
              <p>
                Fechamento de <strong>{formatCurrency(Number(quote.price))}</strong>
                {' · Pregão de '}{tradeDateFormatter.format(new Date(quote.trade_date))}
                {' · Fonte Bolsai'}
              </p>
            )}
            {loadingQuote && <p role="status">Consultando cotação…</p>}
            {quoteError && <p role="alert">{quoteError}</p>}
          </div>
          <button className="button button--secondary button--small" type="button" disabled={loadingQuote} onClick={() => consultQuote(selectedTicker)}>
            Atualizar cotação
          </button>
        </section>
      )}
      <div className="transaction-table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">{isFund ? 'Fundo' : 'Empresa'}</th>
              <th scope="col">{isFund ? 'Segmento' : 'Setor'}</th>
              <th scope="col">{isFund ? 'Detalhes' : 'Cotação'}</th>
            </tr>
          </thead>
          <tbody>
            {results?.results.map((asset) => (
              <tr key={asset.ticker}>
                <td><strong>{asset.ticker}</strong></td>
                <td>{asset.name ?? '—'}</td>
                <td>{asset.segment ?? '—'}</td>
                <td>
                  {isFund ? (
                    <Link className="market-fund-link" to={`${privateModules.market.path}/fundos/${encodeURIComponent(asset.ticker)}`}>
                      Ver fundo <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  ) : (
                    <button
                      className="button button--secondary button--small"
                      type="button"
                      aria-label={`Ver cotação de ${asset.ticker}`}
                      onClick={() => consultQuote(asset.ticker)}
                    >
                      Ver cotação
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!results?.results.length && (
              <tr><td className="transaction-table__state" colSpan={4}>
                <span role={searchError ? 'alert' : 'status'}>
                  {searchError || (results ? 'Nenhum ativo encontrado.' : 'Carregando ativos…')}
                </span>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {(results || search.page > 1) && (
        <nav className="transaction-list__header" aria-label="Paginação dos ativos">
          <button className="button button--secondary button--small" type="button" disabled={search.page === 1} onClick={() => searchAssets(search.query, search.page - 1)}>
            Anterior
          </button>
          <span>Página {search.page}{results && ` · ${results.count} ativos`}</span>
          <button className="button button--secondary button--small" type="button" disabled={!results?.next_page} onClick={() => {
            if (results?.next_page) searchAssets(search.query, results.next_page);
          }}>
            Próxima
          </button>
        </nav>
      )}
    </section>
  );
}
