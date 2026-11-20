import PrivateModulePage from '@components/private/PrivateModulePage';
import { formatCurrency } from '../../../utils/formatters';
import { portfolioTotal, positions } from './demoPortfolio';
import './Investments.scss';

export default function InvestmentsPage() {
  return (
    <PrivateModulePage moduleKey="investments">
      <section aria-labelledby="portfolio-title" className="transaction-list">
        <header className="transaction-list__header">
          <div>
            <h2 id="portfolio-title">Carteira por tipo de investimento</h2>
            <p>Dados simulados</p>
          </div>
          <div className="investment-total">
            <span>Saldo da carteira</span>
            <strong>{formatCurrency(portfolioTotal)}</strong>
          </div>
        </header>
        <div className="transaction-table-wrap">
          <table className="transaction-table investment-table">
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Exemplos na carteira</th>
                <th scope="col">Saldo</th>
                <th scope="col">Participação</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(({ category, example, amount }) => (
                <tr key={category}>
                  <td><strong>{category}</strong></td>
                  <td>{example}</td>
                  <td>{formatCurrency(amount)}</td>
                  <td>{(amount / portfolioTotal).toLocaleString('pt-BR', {
                    style: 'percent',
                    maximumFractionDigits: 1,
                  })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PrivateModulePage>
  );
}
