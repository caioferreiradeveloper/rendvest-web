import { Navigate } from 'react-router-dom';
import { privateModules } from '@config/privateModules';

export default function StocksPage() {
  return <Navigate to={privateModules.fiis.path} replace />;
}
