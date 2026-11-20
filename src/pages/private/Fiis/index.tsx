import { Navigate } from 'react-router-dom';
import { privateModules } from '@config/privateModules';

export default function FiisPage() {
  return <Navigate to={`${privateModules.market.path}?tipo=fii`} replace />;
}
