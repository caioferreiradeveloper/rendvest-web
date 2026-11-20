import { Link } from 'react-router-dom';
import PrivateModulePage from '@components/private/PrivateModulePage';
import { privateModules } from '@config/privateModules';
import { formatCurrency } from '../../../utils/formatters';
import './Investments.scss';

const positions = [
  { category: 'Fundos imobiliários', example: 'HGLG11 e KNCR11', amount: 8640, to: privateModules.fiis.path },
  { category: 'Ações', example: 'ITUB4 e PETR4', amount: 7200 },
  { category: 'Tesouro Direto', example: 'Tesouro IPCA+ e Tesouro Prefixado', amount: 6800 },
  { category: 'Tesouro Selic', example: 'Título público atrelado à Selic', amount: 5400 },
  { category: 'Renda fixa atrelada ao CDI', example: 'CDB a 100% do CDI', amount: 4000 },
];

const portfolioTotal = positions.reduce((total, position) => total + position.amount, 0);

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
              {positions.map(({ category, example, amount, to }) => (
                <tr key={category}>
                  <td>{to ? <Link to={to}>{category}</Link> : <strong>{category}</strong>}</td>
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
