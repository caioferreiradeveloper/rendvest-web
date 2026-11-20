import { ArrowLeft, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { privateModules } from '@config/privateModules';
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';
import { loadFundData, readAmount } from './fundData';
import './Investments.scss';
import './FundDetail.scss';

type FundData = Awaited<ReturnType<typeof loadFundData>>;
type Series = NonNullable<FundData['prices']>;
type Payments = NonNullable<FundData['distributions']>['payments'];

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, signDisplay: 'exceptZero' });
const perShare = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 4,
});
const month = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

const money = (value: number | null) => value === null ? '—' : formatCurrency(value);
const percent = (value: number | null) => value === null ? '—' : `${decimal.format(value)}%`;
const paymentValue = (value: number | null) => value === null ? '—' : perShare.format(value);

export default function FundDetailPage() {
  const { ticker = '' } = useParams();
  return <FundDetail key={ticker} ticker={ticker.toUpperCase()} />;
}

function FundDetail({ ticker }: { ticker: string }) {
  const [data, setData] = useState<FundData | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!/^[A-Z0-9]{4}[0-9]{1,2}$/.test(ticker)) return;
    const controller = new AbortController();
    loadFundData(ticker, controller.signal).then((result) => {
      if (!controller.signal.aborted) setData(result);
    });
    return () => controller.abort();
  }, [ticker, attempt]);

  const valid = /^[A-Z0-9]{4}[0-9]{1,2}$/.test(ticker);
  const profile = data?.profile;
  const quote = readAmount(data?.quote?.price);
  const price = quote ?? readAmount(profile?.close_price);
  const date = quote !== null ? data?.quote?.trade_date : profile?.reference_date;
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = monthsBefore(today, 12);
  const payments = (data?.distributions?.payments ?? []).filter((payment) =>
    (payment.payment_date ?? payment.record_date ?? payment.reference_date ?? '') >= yearStart,
  ).sort((a, b) => (b.payment_date ?? '').localeCompare(a.payment_date ?? ''));
  const latest = payments.find((payment) => payment.payment_date && payment.payment_date <= today &&
    readAmount(payment.value_per_share) !== null);
  const lastDistribution = readAmount(latest?.value_per_share);
  const dy = readAmount(data?.distributions?.dividend_yield_ttm) ?? readAmount(profile?.dividend_yield_ttm);
  const liquidity = (data?.prices ?? []).slice(-30).map(({ traded_amount }) => readAmount(traded_amount));
  const average = liquidity.length === 30 && liquidity.every((value) => value !== null)
    ? liquidity.reduce((total, value) => total + value, 0) / 30
    : null;
  const recent = data?.prices?.at(-1);
  const previous = readAmount(data?.prices?.at(-2)?.close);
  const statsChange = data?.stats?.trade_date === date ? readAmount(data?.stats?.daily_change_pct) : null;
  const daily = statsChange ?? (quote !== null && recent?.trade_date === date && previous !== null && previous > 0
    ? (quote / previous - 1) * 100
    : null);
  const pvp = readAmount(profile?.pvp);
  const holders = readAmount(profile?.total_shareholders);
  const partial = data && (!data.profile || !data.distributions || !data.prices);
  const retry = () => { setData(null); setAttempt((current) => current + 1); };

  return (
    <main className="private-module-page fund-page">
      <Link className="fund-back" to={`${privateModules.market.path}?tipo=fii`}>
        <ArrowLeft size={17} aria-hidden="true" /> Fundos imobiliários
      </Link>
      <header className="fund-hero">
        <div className="fund-hero__identity">
          <span className="private-module-page__icon"><Building2 size={22} aria-hidden="true" /></span>
          <div>
            <h1>{ticker || 'Fundo imobiliário'}</h1>
            {profile?.name && <p>{profile.name}</p>}
            {profile?.fund_type && <span className="fund-tag">{profile.fund_type}</span>}
          </div>
        </div>
        {price !== null && (
          <div className="fund-hero__price">
            <strong>{money(price)}</strong>
            {daily !== null && <span className={`financial-amount financial-amount--${daily < 0 ? 'expense' : 'income'}`}>{signed.format(daily)}%</span>}
            <small>{date ? `${quote !== null ? 'Fechamento' : 'Referência'} de ${formatDateOnly(date)} · Bolsai` : 'Fonte Bolsai'}</small>
          </div>
        )}
      </header>
      {!valid && <p role="alert">Código de fundo inválido.</p>}
      {valid && !data && <p role="status">Carregando dados do fundo…</p>}
      {partial && (
        <div className="fund-notice">
          <span role="status">Parte dos dados do fundo está indisponível no momento.</span>
          <button className="button button--secondary button--small" type="button" onClick={retry}>Tentar novamente</button>
        </div>
      )}
      {data && (
        <>
          <section className="fund-section" aria-labelledby="fund-overview">
            <h2 id="fund-overview">Visão geral</h2>
            <dl className="fund-metrics">
              <Metric label="Cotação" value={money(price)} />
              <Metric label="DY 12 meses" value={percent(dy)} />
              <Metric label="Último rendimento por cota" value={paymentValue(lastDistribution)} />
              <Metric label="P/VP" value={pvp === null ? '—' : decimal.format(pvp)} />
              <Metric label="Volume médio em 30 pregões" value={money(average)} />
            </dl>
          </section>
          <div className="fund-columns">
            <PriceHistory prices={data.prices ?? []} stats={data.stats} />
            <aside className="fund-card" aria-labelledby="fund-summary">
              <h3 id="fund-summary">Resumo do fundo</h3>
              <dl className="fund-summary">
                <Metric label="Administrador" value={profile?.administrator ?? '—'} />
                <Metric label="Segmento" value={profile?.segment ?? '—'} />
                <Metric label="Patrimônio líquido" value={money(readAmount(profile?.net_asset_value))} />
                <Metric label="Cotistas" value={holders === null ? '—' : decimal.format(holders)} />
              </dl>
            </aside>
          </div>
          <DistributionsSection payments={payments} />
          <FundSimulator price={price} distribution={lastDistribution} />
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function monthsBefore(date: string, months: number) {
  const cutoff = new Date(date);
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(day, lastDay));
  return cutoff.toISOString().slice(0, 10);
}

function PriceHistory({ prices, stats }: { prices: Series; stats: FundData['stats'] }) {
  const [period, setPeriod] = useState(6);
  const end = prices.at(-1)?.trade_date;
  const cutoff = end ? monthsBefore(end, period) : '';
  const periodPrices = prices.filter(({ trade_date }) => trade_date >= cutoff);
  const adjusted = periodPrices.every((point) => readAmount(point.adjusted_close) !== null);
  const points = periodPrices.flatMap((point) => {
    const price = readAmount(adjusted ? point.adjusted_close : point.close);
    return price === null ? [] : [{ date: point.trade_date, price }];
  });
  const min = Math.min(...points.map(({ price }) => price));
  const max = Math.max(...points.map(({ price }) => price));
  const first = points[0];
  const last = points.at(-1);
  const width = 640;
  const height = 160;
  const padding = 12;
  const startTime = first ? Date.parse(first.date) : 0;
  const span = last ? Date.parse(last.date) - startTime : 0;
  const xy = points.map(({ price, date }) => {
    const elapsed = Date.parse(date) - startTime;
    const x = padding + (span ? elapsed / span : 0.5) * (width - 2 * padding);
    const y = padding + (max === min ? 0.5 : (max - price) / (max - min)) * (height - 2 * padding);
    return [x, y];
  });
  const change = first && last && first.price > 0 ? (last.price / first.price - 1) * 100 : null;

  return (
    <section className="fund-card fund-section" aria-labelledby="fund-history">
      <header className="fund-section-heading">
        <h2 id="fund-history">Histórico de cotação</h2>
        {prices.length > 0 && <div className="fund-switch" role="group" aria-label="Período da cotação">
          {[1, 6, 12].map((months) => (
            <button key={months} type="button" aria-pressed={period === months} onClick={() => setPeriod(months)}>{months}M</button>
          ))}
        </div>}
      </header>
      {stats && (
        <dl className="fund-metrics fund-metrics--inline">
          <Metric label="Mínima em 52 semanas" value={money(readAmount(stats.week_52_low))} />
          <Metric label="Máxima em 52 semanas" value={money(readAmount(stats.week_52_high))} />
        </dl>
      )}
      {points.length > 1 && last ? (
        <>
          <dl className="fund-metrics fund-metrics--period">
            <Metric label="Mínima no período" value={money(min)} />
            <Metric label="Máxima no período" value={money(max)} />
            <Metric label="Variação no período" value={change === null ? '—' : `${signed.format(change)}%`} />
          </dl>
          <svg className="fund-price-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Fechamentos de ${formatDateOnly(first.date)} a ${formatDateOnly(last.date)}`}>
            {[12, 57, 103, 148].map((y) => <line key={y} x1={12} y1={y} x2={628} y2={y} />)}
            <polyline points={xy.map((point) => point.join(',')).join(' ')} />
          </svg>
          <div className="fund-chart-labels"><span>{formatDateOnly(first.date)}</span><span>{formatDateOnly(last.date)}</span></div>
          <p className="fund-note">Fechamentos {adjusted ? 'ajustados' : 'sem ajuste'} · Bolsai</p>
        </>
      ) : <p className="fund-note">Série de fechamentos indisponível para este período.</p>}
    </section>
  );
}

function DistributionsSection({ payments }: { payments: Payments }) {
  const totals = new Map<string, number>();
  for (const payment of payments) {
    const date = payment.reference_date?.slice(0, 7);
    const value = readAmount(payment.value_per_share);
    if (date && value !== null) totals.set(date, (totals.get(date) ?? 0) + value);
  }
  const bars = [...totals].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maximum = Math.max(0, ...bars.map(([, value]) => value));

  return (
    <section className="fund-section" aria-labelledby="fund-distributions">
      <h2 id="fund-distributions">Histórico de proventos</h2>
      {payments.length ? (
        <div className="fund-columns">
          <div className="fund-card fund-table">
            <div className="transaction-table-wrap">
              <table className="transaction-table" aria-label="Proventos dos últimos 12 meses">
                <thead><tr>
                  <th scope="col">Competência</th><th scope="col">Por cota</th><th scope="col">Yield</th>
                  <th scope="col">Data-com</th><th scope="col">Pagamento</th>
                </tr></thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={`${payment.record_date}-${payment.payment_date}-${index}`}>
                      <td>{payment.reference_date ? month.format(new Date(payment.reference_date)) : '—'}</td>
                      <td className="financial-amount financial-amount--income">{paymentValue(readAmount(payment.value_per_share))}</td>
                      <td>{percent(readAmount(payment.dy_month_pct))}</td>
                      <td>{payment.record_date ? formatDateOnly(payment.record_date) : '—'}</td>
                      <td>{payment.payment_date ? formatDateOnly(payment.payment_date) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {bars.length > 0 && <div className="fund-card">
            <h3>Rendimento mensal por cota</h3>
            <ul className="fund-bars">
              {bars.map(([date, value]) => (
                <li key={date}>
                  <span>{paymentValue(value)}</span>
                  <meter min={0} max={maximum || 1} value={value} aria-label={date} />
                  <span>{month.format(new Date(`${date}-01`))}</span>
                </li>
              ))}
            </ul>
            <p className="fund-note">Últimas competências com registros · Bolsai</p>
          </div>}
        </div>
      ) : <p className="fund-note">Sem proventos disponíveis para exibição.</p>}
    </section>
  );
}

function FundSimulator({ price, distribution }: { price: number | null; distribution: number | null }) {
  const [mode, setMode] = useState<'amount' | 'shares'>('amount');
  const [amount, setAmount] = useState('10000');
  const [shares, setShares] = useState('100');
  const [months, setMonths] = useState(12);
  const available = price !== null && price > 0 && distribution !== null;
  const input = Math.max(0, readAmount(mode === 'amount' ? amount : shares) ?? 0);
  const quantity = mode === 'amount' && available
    ? Math.floor(Math.round(input * 100) * 100 / Math.round(price * 10000))
    : Math.floor(input);

  return (
    <section className="fund-card fund-section" aria-labelledby="fund-simulator">
      <h2 id="fund-simulator">Simulador de investimento</h2>
      {available ? (
        <>
          <div className="fund-simulator-controls">
            <div className="fund-switch" role="group" aria-label="Modo de simulação">
              <button type="button" aria-pressed={mode === 'amount'} onClick={() => setMode('amount')}>Por valor</button>
              <button type="button" aria-pressed={mode === 'shares'} onClick={() => setMode('shares')}>Por cotas</button>
            </div>
            <label>{mode === 'amount' ? 'Valor a aplicar (R$)' : 'Quantidade de cotas'}
              <input className="field-control" type="number" min={0} step={mode === 'amount' ? '0.01' : '1'}
                value={mode === 'amount' ? amount : shares}
                onChange={(event) => (mode === 'amount' ? setAmount : setShares)(event.target.value)} />
            </label>
            <label>Período de {months} {months === 1 ? 'mês' : 'meses'}
              <input type="range" min={1} max={60} value={months} onChange={(event) => setMonths(Number(event.target.value))} />
            </label>
          </div>
          <dl className="fund-metrics">
            <Metric label="Cotas inteiras" value={decimal.format(quantity)} />
            <Metric label="Valor em cotas" value={money(quantity * price)} />
            <Metric label="Renda mensal estimada" value={money(quantity * distribution)} />
            <Metric label="Renda acumulada estimada" value={money(quantity * distribution * months)} />
          </dl>
          <p className="fund-note">Projeção com a cotação e o último rendimento pago constantes, sem reinvestimento.</p>
        </>
      ) : <p className="fund-note">A simulação fica disponível quando há cotação e rendimento pago.</p>}
    </section>
  );
}
