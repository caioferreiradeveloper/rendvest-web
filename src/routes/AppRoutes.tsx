// React imports
import { Navigate, Route, Routes } from 'react-router-dom';

// Auth guard imports
import { RequireAuth, RequireGuest } from '@components/auth/AuthGuards';

// Layout imports
import PublicLayout from '../layouts/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout';

// Page imports
import DashboardPage from '@pages/private/Dashboard';
import DebtorsPage from '@pages/private/Debtors';
import FiisPage from '@pages/private/Fiis';
import InvestmentsPage from '@pages/private/Investments';
import MonthliesPage from '@pages/private/Monthlies';
import PayablesPage from '@pages/private/Payables';
import StocksPage from '@pages/private/Stocks';
import TransactionsPage from '@pages/private/Transactions';
import WishlistPage from '@pages/private/Wishlist';
import AboutPage from '@pages/public/About';
import ContactPage from '@pages/public/Contact';
import HomePage from '@pages/public/Home';
import LoginPage from '@pages/public/Login';
import NotFoundPage from '@pages/public/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/app"
        element={
          <RequireAuth>
            <PrivateLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="lancamentos" element={<TransactionsPage />} />
        <Route path="emprestimos" element={<PayablesPage />} />
        <Route path="devedores" element={<DebtorsPage />} />
        <Route path="lista-de-desejos" element={<WishlistPage />} />
        <Route path="mensalidades" element={<MonthliesPage />} />
        <Route path="assinaturas" element={<Navigate to="/app/mensalidades" replace />} />
        <Route path="investimentos" element={<InvestmentsPage />} />
        <Route path="acoes" element={<StocksPage />} />
        <Route path="fiis" element={<FiisPage />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
