import { useState } from 'react';
import FieldShell from '@components/forms/fields/FieldShell';
import PrivateModulePage from '@components/private/PrivateModulePage';
import { formatCurrency } from '../../../utils/formatters';
import '../Investments/Investments.scss';

const funds = [
  { ticker: 'HGLG11', name: 'Pátria Logística', segment: 'Logística', price: 157.25, change: 0.0042, yield12m: 0.085, priceToBook: 0.96, distribution: 1.10 },
  { ticker: 'KNCR11', name: 'Kinea Rendimentos Imobiliários', segment: 'Recebíveis', price: 103.40, change: -0.0028, yield12m: 0.123, priceToBook: 1.02, distribution: 1.05 },
  { ticker: 'XPML11', name: 'XP Malls', segment: 'Shopping centers', price: 104.80, change: 0.007, yield12m: 0.107, priceToBook: 0.91, distribution: 0.92 },
];

const percentage = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 });
const variation = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, signDisplay: 'exceptZero' });
const ratio = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 });

export default function FiisPage() {
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase('pt-BR');
  const visibleFunds = funds.filter(({ ticker, name, segment }) =>
    `${ticker} ${name} ${segment}`.toLocaleLowerCase('pt-BR').includes(search),
  );

  return (
    <PrivateModulePage moduleKey="fiis">
      <section aria-labelledby="fund-list-title" className="transaction-list">
        <header className="transaction-list__header">
          <div>
            <h2 id="fund-list-title">Indicadores dos fundos</h2>
            <p>Dados simulados</p>
          </div>
          <FieldShell className="transaction-list__filter investment-filter" id="fund-search" label="Buscar fundo">
            <input
              className="field-control"
              id="fund-search"
              type="search"
              placeholder="Código, nome ou segmento"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </FieldShell>
        </header>
        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Fundo</th>
                <th scope="col">Segmento</th>
                <th scope="col">Cotação</th>
                <th scope="col">Variação diária</th>
                <th scope="col"><abbr title="Dividend yield em 12 meses">DY 12m</abbr></th>
                <th scope="col"><abbr title="Preço sobre valor patrimonial">P/VP</abbr></th>
                <th scope="col">Último rendimento por cota</th>
              </tr>
            </thead>
            <tbody>
              {visibleFunds.map((fund) => (
                <tr key={fund.ticker}>
                  <td><div className="investment-table__name"><strong>{fund.ticker}</strong><span>{fund.name}</span></div></td>
                  <td>{fund.segment}</td>
                  <td>{formatCurrency(fund.price)}</td>
                  <td className={`financial-amount financial-amount--${fund.change >= 0 ? 'income' : 'expense'}`}>
                    {variation.format(fund.change)}
                  </td>
                  <td>{percentage.format(fund.yield12m)}</td>
                  <td>{ratio.format(fund.priceToBook)}</td>
                  <td className="financial-amount financial-amount--income">{formatCurrency(fund.distribution)}</td>
                </tr>
              ))}
              {visibleFunds.length === 0 && (
                <tr><td className="transaction-table__state" colSpan={7}>Nenhum fundo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PrivateModulePage>
  );
}
