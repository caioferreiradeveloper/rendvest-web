// React imports
import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CirclePlus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';

// Component imports
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';
import { SelectField } from '@components/forms/fields';
import BankLogo from '@components/ui/BankLogo';

// Config imports
import {
  getTransactionBankLogoDomain,
  getTransactionBankLabel,
  transactionBankOptions
} from '@config/transactionBanks';
import { getPageSize } from '@config/pagination';

// Hook imports
import useTransactions from '@hooks/useTransactions';

// Utility imports
import { formatCurrency, formatDate } from '../../../utils/formatters';

// Interface imports
import type {
  Transaction,
  TransactionPayload,
  TransactionType,
} from '@interface/transaction';
import type { BankFilter, TransactionFilter } from '@interface/filter';

// Context imports
import { useToast } from '@contexts/ToastContext';

// Page imports
import DeleteTransactionModal from './components/DeleteTransactionModal';
import TransactionDetailSidebar from './components/TransactionDetailSidebar';
import TransactionFormSidebar from './components/TransactionFormSidebar';

// Get the page size from the configuration
const pageSize = getPageSize();

// Bank filter options for the select field
const bankFilterOptions = [
  { value: 'all', label: 'Todos os bancos' },
  ...transactionBankOptions,
] as const;


// Exported page component - TransactionsPage
export default function TransactionsPage() {

  // State variables
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [bankFilter, setBankFilter] = useState<BankFilter>('all');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  // Use the custom hook to manage transactions
  const {
    transactions,
    selectedTransaction,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    totalCount,
    hasNext,
    clearError,
    reload,
    create,
    update,
    loadDetail,
    remove,
    clearSelectedTransaction,
  } = useTransactions({
    page,
    pageSize,
    type: filter === 'all' ? undefined : filter,
    typeBank: bankFilter === 'all' ? undefined : bankFilter,
  });
  
  
  // Calculate pagination and filters details
  const pageCount = totalCount === null
    ? Math.max(1, page + (hasNext ? 1 : 0))
    : Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = transactions.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalCount === null
    ? (page - 1) * pageSize + transactions.length
    : Math.min(page * pageSize, totalCount);
  const drawerInitialType: TransactionType = filter === 'expense' ? 'expense' : 'income';

  // Effect to ensure the current page does not exceed the total page count
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

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

  // Functions to handle filter changes and form actions
  function changeTypeFilter(value: TransactionFilter) {
    setFilter(value);
    setPage(1);
  }

  // Function to handle bank filter changes
  function changeBankFilter(value: BankFilter) {
    setBankFilter(value);
    setPage(1);
  }

  // Functions to handle opening forms
  function openCreateForm() {
    clearError();
    clearSelectedTransaction();
    setEditingTransaction(null);
    setIsDrawerOpen(true);
  }

  // Functions to handle opening edit forms
  function openEditForm(transaction: Transaction) {
    clearError();
    clearSelectedTransaction();
    setEditingTransaction(transaction);
    setIsDrawerOpen(true);
  }

  // Functions to handle opening delete confirmation
  function openDeleteConfirmation(transaction: Transaction) {
    clearSelectedTransaction();
    setTransactionToDelete(transaction);
  }

  // Functions to handle closing forms
  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsDrawerOpen(false);
    setEditingTransaction(null);
    clearError();
  }

  // Functions to handle saving transactions (create or update)
  async function handleSave(values: TransactionPayload): Promise<boolean> {
    if (editingTransaction) {
      const saved = await update(editingTransaction.id, values);
      if (saved) {
        showToast({
          kind: 'success',
          title: 'Lançamento atualizado',
          message: 'As alterações foram salvas com sucesso.',
        });
      }
      return saved;
    }

    const saved = await create(values);
    if (saved) {
      showToast({
        kind: 'success',
        title: 'Lançamento cadastrado',
        message: 'A movimentação foi adicionada à sua lista.',
      });
    }
    return saved;
  }

  // Functions to handle deleting transactions
  async function handleDelete() {
    if (!transactionToDelete) {
      return;
    }

    const deleted = await remove(
      transactionToDelete.id,
      transactionToDelete.type,
    );
    if (deleted) {
      setTransactionToDelete(null);
      showToast({
        kind: 'success',
        title: 'Lançamento excluído',
        message: 'A movimentação foi removida com sucesso.',
      });
    }
  }

  // Functions to handle opening transaction details
  async function handleOpenDetail(transaction: Transaction) {
    clearError();
    await loadDetail(transaction.id, transaction.type);
  }

  // Functions to handle editing transaction details
  function handleEditDetail() {
    if (selectedTransaction) {
      openEditForm(selectedTransaction);
    }
  }

  // Render the TransactionsPage component
  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <ArrowDownUp size="var(--icon-size-21)" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Ganhos e gastos</h1>
            <p>Acompanhe suas entradas e saídas em um só lugar.</p>
          </div>
        </div>
        <Button
          icon={<CirclePlus size="var(--icon-size-17)" />}
          iconPosition="leading"
          onClick={openCreateForm}
        >
          Novo lançamento
        </Button>
      </header>


      {error && !isDrawerOpen && (
        <MessageAlert
          kind="error"
          message={error}
          onDismiss={clearError}
        />
      )}

      <section aria-labelledby="transaction-list-title" className="transaction-list">
        <div className="transaction-list__header">
          <div>
            <h2 id="transaction-list-title">Lançamentos</h2>
            <p>Consulte e atualize suas movimentações financeiras.</p>
          </div>
          <div className="transaction-list__filters">
            <div className="transaction-type-filter">
              <span className="transaction-type-filter__label">Tipo</span>
              <div
                aria-label="Filtrar por tipo"
                className="transaction-filters"
                role="group"
              >
                {([
                  ['all', 'Todos'],
                  ['income', 'Ganhos'],
                  ['expense', 'Gastos'],
                ] as const).map(([value, label]) => (
                  <button
                    aria-pressed={filter === value}
                    className="transaction-filters__button"
                    key={value}
                    onClick={() => changeTypeFilter(value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <SelectField
              fieldClassName="transaction-bank-filter"
              id="transaction-bank-filter"
              label="Banco"
              onChange={changeBankFilter}
              options={bankFilterOptions}
              value={bankFilter}
            />
          </div>
        </div>

        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Movimentação</th>
                <th scope="col">Categoria</th>
                <th scope="col">Banco</th>
                <th scope="col">Data</th>
                <th scope="col">Valor</th>
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
                      <span>Carregando lançamentos...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length ? (
                transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    onDelete={() => openDeleteConfirmation(transaction)}
                    onDetail={() => void handleOpenDetail(transaction)}
                    onEdit={() => openEditForm(transaction)}
                    transaction={transaction}
                  />
                ))
              ) : (
                <tr>
                  <td className="transaction-table__state" colSpan={6}>
                    <div className="transaction-empty">
                      <span className="transaction-empty__icon">
                        <CalendarDays size="var(--icon-size-22)" aria-hidden="true" />
                      </span>
                      <strong>
                        {filter === 'all'
                          ? 'Nenhum lançamento encontrado'
                          : `Nenhum ${filter === 'income' ? 'ganho' : 'gasto'} encontrado`}
                      </strong>
                      <p>
                        Cadastre uma movimentação para começar a acompanhar suas finanças.
                      </p>
                      {filter === 'all' && (
                        <Button
                          onClick={openCreateForm}
                          size="small"
                          variant="secondary"
                        >
                          Cadastrar lançamento
                        </Button>
                      )}
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
              ? transactions.length
                ? `Exibindo ${firstItem}–${lastItem} lançamentos`
                : 'Nenhum lançamento para exibir'
              : totalCount
                ? `Exibindo ${firstItem}–${lastItem} de ${totalCount} lançamentos`
                : 'Nenhum lançamento para exibir'}
          </span>
          <div className="transaction-pagination__controls">
            <IconButton
              disabled={page <= 1 || isLoading}
              icon={<ArrowLeft size="var(--icon-size-16)" />}
              label="Página anterior"
              onClick={() => setPage((currentPage) => currentPage - 1)}
            />
            <span>
              Página <strong>{page}</strong> de <strong>{pageCount}</strong>
            </span>
            <IconButton
              disabled={!hasNext || isLoading}
              icon={<ArrowRight size="var(--icon-size-16)" />}
              label="Próxima página"
              onClick={() => setPage((currentPage) => currentPage + 1)}
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

      {isDrawerOpen && (
        <TransactionFormSidebar
          error={error}
          initialType={drawerInitialType}
          isSaving={isSaving}
          onClose={closeForm}
          onSave={handleSave}
          transaction={editingTransaction}
        />
      )}
      {isLoadingDetail && (
        <div className="transaction-drawer">
          <div
            aria-hidden="true"
            className="transaction-drawer__backdrop"
          />
          <aside
            aria-label="Carregando detalhes do lançamento"
            aria-modal="true"
            className="transaction-drawer__panel transaction-detail-loading"
            role="dialog"
          >
            <span className="loading-spinner" aria-hidden="true" />
            Carregando detalhes...
          </aside>
        </div>
      )}
      {selectedTransaction && (
        <TransactionDetailSidebar
          onClose={clearSelectedTransaction}
          onDelete={() => openDeleteConfirmation(selectedTransaction)}
          onEdit={handleEditDetail}
          transaction={selectedTransaction}
        />
      )}
      {transactionToDelete && (
        <DeleteTransactionModal
          isDeleting={isSaving}
          onCancel={() => {
            if (!isSaving) {
              setTransactionToDelete(null);
            }
          }}
          onConfirm={() => void handleDelete()}
          transaction={transactionToDelete}
        />
      )}
    </main>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TransactionRow({
  transaction,
  onDetail,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'income';

  return (
    <tr>
      <td>
        <div className="transaction-table__name">
          <span
            className={`transaction-type-icon ${
              isIncome
                ? 'transaction-type-icon--income'
                : 'transaction-type-icon--expense'
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size="var(--icon-size-16)" aria-hidden="true" />
            ) : (
              <ArrowUpRight size="var(--icon-size-16)" aria-hidden="true" />
            )}
          </span>
          <div>
            <strong>{transaction.description || transaction.category}</strong>
            <span>{isIncome ? 'Ganho' : 'Gasto'}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="transaction-category">{transaction.category}</span>
      </td>
      <td>
        <span className="transaction-bank">
          <BankLogo
            label={getTransactionBankLabel(transaction.bank)}
            logoDomain={getTransactionBankLogoDomain(transaction.bank)}
            size="small"
          />
          {getTransactionBankLabel(transaction.bank)}
        </span>
      </td>
      <td className="transaction-table__date">
        {formatDate(transaction.occurred_at)}
      </td>
      <td
        className={`transaction-table__amount ${
          isIncome
            ? 'transaction-table__amount--income'
            : 'transaction-table__amount--expense'
        }`}
      >
        {isIncome ? '+' : '−'}
        {formatCurrency(transaction.amount)}
      </td>
      <td className="transaction-table__actions">
        <IconButton
          icon={<Eye size="var(--icon-size-16)" />}
          label={`Ver detalhes: ${transaction.category}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size="var(--icon-size-16)" />}
          label={`Editar ${isIncome ? 'ganho' : 'gasto'}: ${transaction.category}`}
          onClick={onEdit}
        />
        <IconButton
          className="transaction-table__delete"
          icon={<Trash2 size="var(--icon-size-16)" />}
          label={`Excluir ${isIncome ? 'ganho' : 'gasto'}: ${transaction.category}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
