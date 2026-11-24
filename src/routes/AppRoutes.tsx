// React imports
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

// Auth guard imports
import { RequireAuth, RequireFinancialArea, RequireGuest, RequireStaff } from '@components/auth/AuthGuards';

// Layout imports
import PublicLayout from '../layouts/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout';

// Page imports
import { AdminMessagePage, AdminMessagesPage, AdminUsersPage } from '@pages/private/Administration';
import AdminDashboardPage from '@pages/private/Administration/AdminDashboardPage';
import RegisterPage from '@pages/public/Register';
import DashboardPage from '@pages/private/Dashboard';
import DebtorsPage from '@pages/private/Debtors';
import FiisPage from '@pages/private/Fiis';
import InvestmentsPage from '@pages/private/Investments';
import FundDetailPage from '@pages/private/Fiis/FundDetailPage';
import { privateModules } from '@config/privateModules';
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

function LegacyFundRedirect() {
  const { ticker = '' } = useParams();
  return <Navigate to={`${privateModules.fiis.path}/${encodeURIComponent(ticker)}`} replace />;
}

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
        <Route element={<RequireFinancialArea />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="lancamentos" element={<TransactionsPage />} />
          <Route path="emprestimos" element={<PayablesPage />} />
          <Route path="devedores" element={<DebtorsPage />} />
          <Route path="lista-de-desejos" element={<WishlistPage />} />
          <Route path="mensalidades" element={<MonthliesPage />} />
          <Route path="assinaturas" element={<Navigate to="/app/mensalidades" replace />} />
          <Route path="investimentos" element={<InvestmentsPage />} />
          <Route path="investimentos/mercado" element={<Navigate to={privateModules.fiis.path} replace />} />
          <Route path="investimentos/mercado/fundos/:ticker" element={<LegacyFundRedirect />} />
          <Route path="acoes" element={<StocksPage />} />
          <Route path="fiis" element={<FiisPage />} />
          <Route path="fiis/:ticker" element={<FundDetailPage />} />
        </Route>
        <Route path="administrador" element={<RequireStaff />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="usuarios" element={<AdminUsersPage key="all" />} />
          <Route path="pendentes" element={<AdminUsersPage key="pending" pending />} />
          <Route path="mensagens" element={<AdminMessagesPage />} />
          <Route path="mensagens/:id" element={<AdminMessagePage />} />
        </Route>
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
        <Route path="/cadastre-se" element={<RequireGuest><RegisterPage /></RequireGuest>} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
