import { useState } from 'react';
import { Link } from 'react-router-dom';
import { privateModules } from '@config/privateModules';
import { formatCurrency } from '../../../utils/formatters';
import { portfolioTotal, positions } from '../Investments/demoPortfolio';

const colors = ['#27734f', '#387c89', '#5363a0', '#8a5797', '#a76b26'];
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
let end = 0;
const slices = positions.map((position, index) => {
  const start = end;
  end += position.amount / portfolioTotal * 100;
  return { ...position, start, end, color: colors[index] };
});

export default function PortfolioAllocation() {
  const [selected, setSelected] = useState<string | null>(null);
  const position = slices.find(({ category }) => category === selected);
  const gradient = slices.map(({ category, color, start, end }) =>
    `${!selected || selected === category ? color : 'var(--color-divider)'} ${start}% ${end}%`,
  ).join(', ');

  return (
    <section className="dashboard-card dashboard-portfolio" aria-labelledby="dashboard-portfolio-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="dashboard-portfolio-title">Carteira por investimento</h2>
          <p>Dados simulados</p>
        </div>
        <Link to={privateModules.investments.path}>Ver carteira</Link>
      </header>
      <div className="dashboard-portfolio__chart" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="dashboard-portfolio__total" aria-live="polite">
          <span>{position ? percent.format(position.amount / portfolioTotal) + ' da carteira' : 'Saldo da carteira'}</span>
          <strong>{formatCurrency(position?.amount ?? portfolioTotal)}</strong>
        </div>
      </div>
      <ul className="dashboard-portfolio__legend">
        {slices.map(({ category, amount, color }) => (
          <li key={category}>
            <button type="button" aria-pressed={selected === category}
              onClick={() => setSelected((current) => current === category ? null : category)}>
              <i style={{ backgroundColor: color }} aria-hidden="true" />
              <span>{category}</span>
              <strong>{formatCurrency(amount)}</strong>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
