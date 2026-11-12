import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CirclePlus,
  Eye,
  HandCoins,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { SelectField } from '../../../components/forms/fields';
import BankLogo from '../../../components/ui/BankLogo';
import MessageAlert from '../../../components/ui/MessageAlert';
import { Button, IconButton } from '../../../components/ui/buttons';
import {
  getTransactionBankLabel,
  getTransactionBankLogoDomain,
  transactionBankOptions,
} from '../../../config/transactionBanks';
import useLoans from '../../../hooks/useLoans';
import type {
  Loan,
  LoanPaymentPayload,
  LoanPayload,
} from '../../../interfaces/loan';
import DeleteLoanModal from './DeleteLoanModal';
import LoanDetailsSidebar from './LoanDetailsSidebar';
import LoanFormSidebar from './LoanFormSidebar';
import './Payables.scss';

const pageSize = 10;

type ToastMessage = {
  kind: 'error' | 'success';
  title: string;
  message: string;
};

const bankFilterOptions = [
  { value: 'all', label: 'Todos os bancos' },
  ...transactionBankOptions,
] as const;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatCurrency(value: string | number): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : '—';
}

function getLoanTotalPayable(loan: Loan): number {
  return Number(loan.total_with_interest);
}

function hasRegisteredPayments(loan: Loan): boolean {
  return Number(loan.amount_paid) > 0;
}

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export default function PayablesPage() {
  const {
    loans,
    selectedDetails,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    reload,
    create,
    update,
    remove,
    loadDetails,
    addPayment,
    clearError,
    clearSelectedDetails,
  } = useLoans();
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [paymentTargetId, setPaymentTargetId] = useState<string | null>(null);

  const filteredLoans = useMemo(
    () =>
      bankFilter === 'all'
        ? loans
        : loans.filter((loan) => loan.bank === bankFilter),
    [bankFilter, loans],
  );
  const pageCount = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
  const visibleLoans = filteredLoans.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const totalRemaining = loans.reduce(
    (total, loan) => total + Number(loan.remaining_amount),
    0,
  );
  const firstItem = filteredLoans.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filteredLoans.length);

  useEffect(() => {
    setPage(1);
  }, [bankFilter]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (error) {
      setToast({
        kind: 'error',
        title: 'Não foi possível concluir',
        message: error,
      });
    }
  }, [error]);

  function openCreateForm() {
    clearError();
    setPaymentTargetId(null);
    clearSelectedDetails();
    setEditingLoan(null);
    setIsFormOpen(true);
  }

  function openEditForm(loan: Loan) {
    if (hasRegisteredPayments(loan)) {
      setToast({
        kind: 'error',
        title: 'Edição indisponível',
        message:
          'Não é possível editar um empréstimo que já tenha pagamentos registrados.',
      });
      return;
    }

    clearError();
    setPaymentTargetId(null);
    clearSelectedDetails();
    setEditingLoan(loan);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsFormOpen(false);
    setEditingLoan(null);
    clearError();
  }

  async function handleSave(payload: LoanPayload): Promise<boolean> {
    if (editingLoan && hasRegisteredPayments(editingLoan)) {
      setToast({
        kind: 'error',
        title: 'Edição indisponível',
        message:
          'Não é possível editar um empréstimo que já tenha pagamentos registrados.',
      });
      return false;
    }

    const saved = editingLoan
      ? await update(editingLoan.id, payload)
      : await create(payload);

    if (saved) {
      setToast({
        kind: 'success',
        title: editingLoan ? 'Empréstimo atualizado' : 'Empréstimo cadastrado',
        message: editingLoan
          ? 'As alterações foram salvas com sucesso.'
          : 'O empréstimo foi adicionado à sua lista.',
      });
    }
    return saved;
  }

  async function handleOpenDetails(loan: Loan) {
    clearError();
    setPaymentTargetId(null);
    await loadDetails(loan.id);
  }

  async function handlePayInstallment(loan: Loan) {
    clearError();
    setPaymentTargetId(loan.id);
    await loadDetails(loan.id);
  }

  function openDeleteConfirmation(loan: Loan) {
    if (hasRegisteredPayments(loan)) {
      setToast({
        kind: 'error',
        title: 'Exclusão indisponível',
        message:
          'Não é possível excluir um empréstimo que já tenha pagamentos registrados.',
      });
      return;
    }

    setPaymentTargetId(null);
    clearSelectedDetails();
    setLoanToDelete(loan);
  }

  async function handleDelete() {
    if (!loanToDelete) {
      return;
    }
    if (hasRegisteredPayments(loanToDelete)) {
      setLoanToDelete(null);
      setToast({
        kind: 'error',
        title: 'Exclusão indisponível',
        message:
          'Não é possível excluir um empréstimo que já tenha pagamentos registrados.',
      });
      return;
    }

    const deleted = await remove(loanToDelete);
    if (deleted) {
      setLoanToDelete(null);
      setToast({
        kind: 'success',
        title: 'Empréstimo excluído',
        message: 'O empréstimo foi removido com sucesso.',
      });
    }
  }

  async function handleAddPayment(
    loanId: string,
    payment: LoanPaymentPayload,
  ): Promise<boolean> {
    const added = await addPayment(loanId, payment);
    if (added) {
      setToast({
        kind: 'success',
        title: 'Pagamento registrado',
        message: 'O pagamento foi registrado e a despesa foi criada.',
      });
    }
    return added;
  }

  return (
    <main className="payables-page">
      {toast && (
        <MessageAlert
          className="payables-page__toast"
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
          title={toast.title}
        />
      )}

      <header className="payables-page__header">
        <div className="payables-page__heading">
          <span className="payables-page__heading-icon">
            <HandCoins size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Empréstimos a pagar</h1>
            <p>Acompanhe valores contratados, juros e pagamentos.</p>
          </div>
        </div>
        <Button
          icon={<CirclePlus size={17} />}
          iconPosition="leading"
          onClick={openCreateForm}
        >
          Novo empréstimo
        </Button>
      </header>

      
      <section aria-labelledby="loan-list-title" className="loan-list">
        <header className="loan-list__header">
          <div>
            <h2 id="loan-list-title">Seus empréstimos</h2>
            <p>Consulte as condições e acompanhe os pagamentos.</p>
          </div>
          <SelectField
            fieldClassName="loan-bank-filter"
            id="loan-bank-filter"
            label="Banco"
            onChange={setBankFilter}
            options={bankFilterOptions}
            value={bankFilter}
          />
        </header>

        <div className="loan-table-wrap">
          <table className="loan-table">
            <thead>
              <tr>
                <th scope="col">Instituição</th>
                <th scope="col">Valor financiado</th>
                <th scope="col">Parcela mensal</th>
                <th scope="col">Total</th>
                <th scope="col">Saldo restante</th>
                <th scope="col">Prazo</th>
                <th scope="col">Início</th>
                <th scope="col">
                  <span className="visually-hidden">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="loan-table__state" colSpan={8}>
                    <span className="transaction-loading" aria-hidden="true" />
                    Carregando empréstimos...
                  </td>
                </tr>
              ) : visibleLoans.length ? (
                visibleLoans.map((loan) => (
                  <LoanRow
                    key={loan.id}
                    loan={loan}
                    hasRegisteredPayments={hasRegisteredPayments(loan)}
                    onDelete={() => openDeleteConfirmation(loan)}
                    onDetails={() => void handleOpenDetails(loan)}
                    onEdit={() => openEditForm(loan)}
                    onPay={() => void handlePayInstallment(loan)}
                  />
                ))
              ) : (
                <tr>
                  <td className="loan-table__state" colSpan={8}>
                    <div className="transaction-empty">
                      <span className="transaction-empty__icon">
                        <HandCoins size={22} aria-hidden="true" />
                      </span>
                      <strong>
                        {bankFilter === 'all'
                          ? 'Nenhum empréstimo encontrado'
                          : 'Nenhum empréstimo encontrado para este banco'}
                      </strong>
                      <p>
                        Cadastre um empréstimo para acompanhar os valores e
                        pagamentos.
                      </p>
                      {bankFilter === 'all' && (
                        <Button
                          onClick={openCreateForm}
                          size="small"
                          variant="secondary"
                        >
                          Cadastrar empréstimo
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="loan-pagination">
          <span>
            {filteredLoans.length
              ? `Exibindo ${firstItem}–${lastItem} de ${filteredLoans.length} empréstimos`
              : 'Nenhum empréstimo para exibir'}
          </span>
          <div className="loan-pagination__controls">
            <IconButton
              disabled={page <= 1 || isLoading}
              icon={<ArrowLeft size={16} />}
              label="Página anterior"
              onClick={() => setPage((current) => current - 1)}
            />
            <span>
              Página <strong>{page}</strong> de <strong>{pageCount}</strong>
            </span>
            <IconButton
              disabled={page >= pageCount || isLoading}
              icon={<ArrowRight size={16} />}
              label="Próxima página"
              onClick={() => setPage((current) => current + 1)}
            />
            <Button
              disabled={isLoading}
              onClick={() => void reload()}
              size="small"
              variant="text"
            >
              Atualizar
            </Button>
          </div>
        </footer>
      </section>

      {isFormOpen && (
        <LoanFormSidebar
          error={error}
          isSaving={isSaving}
          loan={editingLoan}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {isLoadingDetail && (
        <div className="transaction-drawer">
          <div
            aria-hidden="true"
            className="transaction-drawer__backdrop"
          />
          <aside
            aria-label="Carregando detalhes do empréstimo"
            aria-modal="true"
            className="transaction-drawer__panel transaction-detail-loading"
            role="dialog"
          >
            <span className="transaction-loading" aria-hidden="true" />
            Carregando detalhes...
          </aside>
        </div>
      )}

      {selectedDetails && (
        <LoanDetailsSidebar
          details={selectedDetails}
          error={error}
          isSaving={isSaving}
          openPaymentOnLoad={paymentTargetId === selectedDetails.loan.id}
          onAddPayment={handleAddPayment}
          onClose={() => {
            setPaymentTargetId(null);
            clearSelectedDetails();
          }}
          onDelete={openDeleteConfirmation}
          onEdit={openEditForm}
        />
      )}

      {loanToDelete && (
        <DeleteLoanModal
          isDeleting={isSaving}
          loan={loanToDelete}
          onCancel={() => {
            if (!isSaving) {
              setLoanToDelete(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </main>
  );
}

interface LoanRowProps {
  loan: Loan;
  hasRegisteredPayments: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
}

function LoanRow({
  loan,
  hasRegisteredPayments,
  onDetails,
  onEdit,
  onDelete,
  onPay,
}: LoanRowProps) {
  return (
    <tr>
      <td>
        <div className="loan-table__bank">
          <BankLogo
            label={getTransactionBankLabel(loan.bank)}
            logoDomain={getTransactionBankLogoDomain(loan.bank)}
          />
          <strong>{getTransactionBankLabel(loan.bank)}</strong>
        </div>
      </td>
      <td className="loan-table__amount">
        {formatCurrency(loan.financed_amount)}
      </td>
      <td className="loan-table__amount">
        {formatCurrency(loan.monthly_installment_amount)}
      </td>
      <td className="loan-table__amount">
        {formatCurrency(loan.total_with_interest)}
      </td>
      <td className="loan-table__amount loan-table__amount--remaining">
        {formatCurrency(loan.remaining_amount)}
      </td>
      <td>{loan.term_months} meses</td>
      <td className="loan-table__date">{formatDate(loan.started_at)}</td>
      <td className="loan-table__actions">
        <IconButton
          className="loan-table__pay"
          disabled={Number(loan.remaining_amount) <= 0}
          icon={<Plus size={16} />}
          label={`Pagar parcela do empréstimo de ${formatCurrency(getLoanTotalPayable(loan))}`}
          onClick={onPay}
        />
        <IconButton
          icon={<Eye size={16} />}
          label={`Ver detalhes do empréstimo de ${formatCurrency(getLoanTotalPayable(loan))}`}
          onClick={onDetails}
        />
        <IconButton
          disabled={hasRegisteredPayments}
          icon={<Pencil size={16} />}
          label={`Editar empréstimo de ${formatCurrency(getLoanTotalPayable(loan))}${hasRegisteredPayments ? ' (indisponível após pagamentos)' : ''}`}
          onClick={onEdit}
        />
        <IconButton
          className="loan-table__delete"
          disabled={hasRegisteredPayments}
          icon={<Trash2 size={16} />}
          label={`Excluir empréstimo de ${formatCurrency(getLoanTotalPayable(loan))}${hasRegisteredPayments ? ' (indisponível após pagamentos)' : ''}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
