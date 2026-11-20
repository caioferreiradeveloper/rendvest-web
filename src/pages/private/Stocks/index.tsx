import { Navigate } from 'react-router-dom';
import { privateModules } from '@config/privateModules';

export default function StocksPage() {
  return <Navigate to={`${privateModules.market.path}?tipo=stock`} replace />;
}
