// React imports
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  CirclePlus,
  Eye,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';

// Component imports
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Config imports
import { getPageSize } from '@config/pagination';

// Context imports
import { useToast } from '@contexts/ToastContext';

// Hook imports
import useDebtors from '@hooks/useDebtors';

// Interface imports
import type { Debtor, DebtorPayload, DebtorPaymentPayload } from '@interface/debtor';

// Utility imports
import { formatCurrency, formatDate } from '../../../utils/formatters';

// Page imports
import DeleteDebtorModal from './components/DeleteDebtorModal';
import DebtorDetailSidebar from './components/DebtorDetailSidebar';
import DebtorFormSidebar from './components/DebtorFormSidebar';
import { getDebtorStatus } from './utils';
import './Debtors.scss';

// Get the page size from the configuration
const pageSize = getPageSize();

// Exported page component - DebtorsPage
export default function DebtorsPage() {
  // State variables
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [debtorToDelete, setDebtorToDelete] = useState<Debtor | null>(null);
  // Use the custom hook to manage debtors
  const {
    debtors,
    selectedDebtor,
    totalCount,
    hasNext,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    reload,
    create,
    update,
    remove,
    pay,
    loadDetail,
    clearError,
    clearSelectedDebtor,
  } = useDebtors({ page, pageSize });
  const { showToast } = useToast();

  // Calculate pagination details
  const pageCount =
    totalCount === null
      ? Math.max(1, page + (hasNext ? 1 : 0))
      : Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = debtors.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem =
    totalCount === null
      ? (page - 1) * pageSize + debtors.length
      : Math.min(page * pageSize, totalCount);

  // Effect to ensure the current page does not exceed the total page count
  useEffect(() => {
    if (!isLoading && totalCount !== null && page > pageCount) {
      setPage(pageCount);
    }
  }, [isLoading, page, pageCount, totalCount]);

  // Effect to show a toast message when an error occurs
  useEffect(() => {
    if (error) {
      showToast({
        kind: 'error',
        title: 'Não foi possível concluir',
        message: error,
      });
    }
  }, [error, showToast]);

  // Function to open the create form
  function openCreateForm() {
    clearError();
    clearSelectedDebtor();
    setEditingDebtor(null);
    setIsFormOpen(true);
  }

  // Function to open the edit form
  function openEditForm(debtor: Debtor) {
    clearError();
    clearSelectedDebtor();
    setEditingDebtor(debtor);
    setIsFormOpen(true);
  }

  // Function to close the form
  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsFormOpen(false);
    setEditingDebtor(null);
    clearError();
  }

  // Function to save a new or existing debtor
  async function handleSave(payload: DebtorPayload): Promise<boolean> {
    const saved = editingDebtor
      ? await update(editingDebtor.id, payload)
      : await create(payload);

    if (saved) {
      showToast({
        kind: 'success',
        title: editingDebtor ? 'Devedor atualizado' : 'Devedor cadastrado',
        message: editingDebtor
          ? 'As alterações foram salvas com sucesso.'
          : 'O valor a receber foi adicionado à sua lista.',
      });
    }
    return saved;
  }

  // Function to load debtor details
  async function handleOpenDetail(debtor: Debtor) {
    clearError();
    await loadDetail(debtor.id);
  }

  // Function to open the delete confirmation
  function openDeleteConfirmation(debtor: Debtor) {
    clearSelectedDebtor();
    setDebtorToDelete(debtor);
  }

  // Function to delete a debtor
  async function handleDelete() {
    if (!debtorToDelete) {
      return;
    }

    const deleted = await remove(debtorToDelete.id);
    if (deleted) {
      setDebtorToDelete(null);
      showToast({
        kind: 'success',
        title: 'Registro excluído',
        message: 'O valor a receber foi removido com sucesso.',
      });
    }
  }

  // Function to register a payment and notify the user
  async function handlePay(id: string, payment: DebtorPaymentPayload) {
    if (await pay(id, payment)) {
      showToast({
        kind: 'success',
        title: 'Recebimento registrado',
        message: 'O saldo do devedor foi atualizado.',
      });
    }
  }

  // Render the DebtorsPage component
  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <CircleDollarSign
              size="var(--icon-size-21)"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Devedores</h1>
            <p>Acompanhe quem deve, a data e o valor a receber.</p>
          </div>
        </div>
        <Button
          icon={<CirclePlus size="var(--icon-size-17)" />}
          iconPosition="leading"
          onClick={openCreateForm}
        >
          Novo devedor
        </Button>
      </header>

      {error && !isFormOpen && (
        <MessageAlert kind="error" message={error} onDismiss={clearError} />
      )}

      <section aria-labelledby="debtor-list-title" className="transaction-list">
        <header className="transaction-list__header">
          <div>
            <h2 id="debtor-list-title">Valores a receber</h2>
            <p>Consulte e atualize os registros de quem deve.</p>
          </div>
        </header>

        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Data</th>
                <th scope="col">Valor original</th>
                <th scope="col">Saldo a receber</th>
                <th scope="col">Situação</th>
                <th scope="col">
                  <span className="visually-hidden">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="transaction-table__state"
                    colSpan={6}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="table-loading">
                      <span
                        className="loading-spinner loading-spinner--table"
                        aria-hidden="true"
                      />
                      <span>Carregando devedores...</span>
                    </div>
                  </td>
                </tr>
              ) : debtors.length ? (
                debtors.map((debtor) => (
                  <DebtorRow
                    key={debtor.id}
                    debtor={debtor}
                    onDelete={() => openDeleteConfirmation(debtor)}
                    onDetail={() => void handleOpenDetail(debtor)}
                    onEdit={() => openEditForm(debtor)}
                  />
                ))
              ) : error ? (
                <tr>
                  <td className="transaction-table__state" colSpan={6}>
                    Não foi possível carregar os devedores.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="transaction-table__state" colSpan={6}>
                    <div className="transaction-empty">
                      <span className="transaction-empty__icon">
                        <CalendarDays
                          size="var(--icon-size-22)"
                          aria-hidden="true"
                        />
                      </span>
                      <strong>Nenhum devedor cadastrado</strong>
                      <p>
                        Cadastre uma pessoa e o valor que ela deve para
                        acompanhar seus recebimentos.
                      </p>
                      <Button
                        onClick={openCreateForm}
                        size="small"
                        variant="secondary"
                      >
                        Cadastrar devedor
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="transaction-pagination">
          <span>
            {totalCount === null
              ? debtors.length
                ? `Exibindo ${firstItem}–${lastItem} devedores`
                : 'Nenhum devedor para exibir'
              : totalCount
                ? `Exibindo ${firstItem}–${lastItem} de ${totalCount} devedores`
                : 'Nenhum devedor para exibir'}
          </span>
          <div className="transaction-pagination__controls">
            <IconButton
              disabled={page <= 1 || isLoading}
              icon={<ArrowLeft size="var(--icon-size-16)" />}
              label="Página anterior"
              onClick={() => setPage((current) => current - 1)}
            />
            <span>
              Página <strong>{page}</strong> de <strong>{pageCount}</strong>
            </span>
            <IconButton
              disabled={!hasNext || isLoading}
              icon={<ArrowRight size="var(--icon-size-16)" />}
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
        <DebtorFormSidebar
          debtor={editingDebtor}
          error={error}
          isSaving={isSaving}
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
            aria-label="Carregando detalhes do devedor"
            aria-modal="true"
            className="transaction-drawer__panel transaction-detail-loading"
            role="dialog"
          >
            <span className="loading-spinner" aria-hidden="true" />
            Carregando detalhes...
          </aside>
        </div>
      )}

      {selectedDebtor && (
        <DebtorDetailSidebar
          debtor={selectedDebtor}
          error={error}
          isSaving={isSaving}
          onClose={clearSelectedDebtor}
          onPay={(payment) => handlePay(selectedDebtor.id, payment)}
          onDelete={() => openDeleteConfirmation(selectedDebtor)}
          onEdit={() => openEditForm(selectedDebtor)}
        />
      )}

      {debtorToDelete && (
        <DeleteDebtorModal
          debtor={debtorToDelete}
          isDeleting={isSaving}
          onCancel={() => {
            if (!isSaving) {
              setDebtorToDelete(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </main>
  );
}

interface DebtorRowProps {
  debtor: Debtor;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Render a debtor row with action buttons
function DebtorRow({
  debtor,
  onDetail,
  onEdit,
  onDelete,
}: DebtorRowProps) {
  return (
    <tr>
      <td>
        <div className="transaction-table__name">
          <span className="transaction-type-icon transaction-type-icon--income">
            <UserRound size="var(--icon-size-16)" aria-hidden="true" />
          </span>
          <strong>{debtor.debtor_name}</strong>
        </div>
      </td>
      <td className="transaction-table__date">
        {formatDate(debtor.occurred_at)}
      </td>
      <td className="financial-amount financial-amount--income">
        {formatCurrency(debtor.amount)}
      </td>
      <td className="financial-amount financial-amount--income">
        {formatCurrency(debtor.remaining_amount)}
      </td>
      <td>{getDebtorStatus(debtor)}</td>
      <td className="transaction-table__actions">
        <IconButton
          icon={<Eye size="var(--icon-size-16)" />}
          label={`Ver detalhes de ${debtor.debtor_name}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size="var(--icon-size-16)" />}
          label={`Editar devedor: ${debtor.debtor_name}`}
          onClick={onEdit}
        />
        <IconButton
          className="transaction-table__delete"
          icon={<Trash2 size="var(--icon-size-16)" />}
          label={`Excluir devedor: ${debtor.debtor_name}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
