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
import MessageAlert from '../../../components/ui/MessageAlert';
import { Button, IconButton } from '../../../components/ui/buttons';
import { SelectField } from '../../../components/forms/fields';
import BankLogo from '../../../components/ui/BankLogo';
import {
  getTransactionBankLogoDomain,
  getTransactionBankLabel,
  transactionBankOptions,
  type TransactionBank,
} from '../../../config/transactionBanks';
import useTransactions from '../../../hooks/useTransactions';
import type {
  Transaction,
  TransactionPayload,
  TransactionType,
} from '../../../interfaces/transaction';
import DeleteTransactionModal from './DeleteTransactionModal';
import TransactionDetailSidebar from './TransactionDetailSidebar';
import TransactionFormSidebar from './TransactionFormSidebar';
import './Transactions.scss';

const pageSize = 5;

type TransactionFilter = 'all' | TransactionType;
type BankFilter = 'all' | TransactionBank;
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

function formatCurrency(value: string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : '—';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [bankFilter, setBankFilter] = useState<BankFilter>('all');
  const [page, setPage] = useState(1);
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const pageCount =
    totalCount === null
      ? Math.max(1, page + (hasNext ? 1 : 0))
      : Math.max(1, Math.ceil(totalCount / pageSize));
  const incomeTotal = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenseTotal = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const firstItem = transactions.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem =
    totalCount === null
      ? (page - 1) * pageSize + transactions.length
      : Math.min(page * pageSize, totalCount);
  const drawerInitialType: TransactionType =
    filter === 'expense' ? 'expense' : 'income';

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

  function changeTypeFilter(value: TransactionFilter) {
    setFilter(value);
    setPage(1);
  }

  function changeBankFilter(value: BankFilter) {
    setBankFilter(value);
    setPage(1);
  }

  function openCreateForm() {
    clearError();
    clearSelectedTransaction();
    setEditingTransaction(null);
    setIsDrawerOpen(true);
  }

  function openEditForm(transaction: Transaction) {
    clearError();
    clearSelectedTransaction();
    setEditingTransaction(transaction);
    setIsDrawerOpen(true);
  }

  function openDeleteConfirmation(transaction: Transaction) {
    clearSelectedTransaction();
    setTransactionToDelete(transaction);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsDrawerOpen(false);
    setEditingTransaction(null);
    clearError();
  }

  async function handleSave(values: TransactionPayload): Promise<boolean> {
    if (editingTransaction) {
      const saved = await update(editingTransaction.id, values);
      if (saved) {
        setToast({
          kind: 'success',
          title: 'Lançamento atualizado',
          message: 'As alterações foram salvas com sucesso.',
        });
      }
      return saved;
    }

    const saved = await create(values);
    if (saved) {
      setToast({
        kind: 'success',
        title: 'Lançamento cadastrado',
        message: 'A movimentação foi adicionada à sua lista.',
      });
    }
    return saved;
  }

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
      setToast({
        kind: 'success',
        title: 'Lançamento excluído',
        message: 'A movimentação foi removida com sucesso.',
      });
    }
  }

  async function handleOpenDetail(transaction: Transaction) {
    clearError();
    await loadDetail(transaction.id, transaction.type);
  }

  function handleEditDetail() {
    if (selectedTransaction) {
      openEditForm(selectedTransaction);
    }
  }

  return (
    <main className="transactions-page">
      {toast && (
        <MessageAlert
          className="transactions-page__toast"
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
          title={toast.title}
        />
      )}
      <header className="transactions-page__header">
        <div className="transactions-page__heading">
          <span className="transactions-page__heading-icon">
            <ArrowDownUp size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Ganhos e gastos</h1>
            <p>Acompanhe suas entradas e saídas em um só lugar.</p>
          </div>
        </div>
        <Button
          icon={<CirclePlus size={17} />}
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
                  <td className="transaction-table__state" colSpan={6}>
                    <span className="transaction-loading" aria-hidden="true" />
                    Carregando lançamentos...
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
                        <CalendarDays size={22} aria-hidden="true" />
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
              icon={<ArrowLeft size={16} />}
              label="Página anterior"
              onClick={() => setPage((currentPage) => currentPage - 1)}
            />
            <span>
              Página <strong>{page}</strong> de <strong>{pageCount}</strong>
            </span>
            <IconButton
              disabled={!hasNext || isLoading}
              icon={<ArrowRight size={16} />}
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
            <span className="transaction-loading" aria-hidden="true" />
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
              <ArrowDownLeft size={16} aria-hidden="true" />
            ) : (
              <ArrowUpRight size={16} aria-hidden="true" />
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
          icon={<Eye size={16} />}
          label={`Ver detalhes: ${transaction.category}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size={16} />}
          label={`Editar ${isIncome ? 'ganho' : 'gasto'}: ${transaction.category}`}
          onClick={onEdit}
        />
        <IconButton
          className="transaction-table__delete"
          icon={<Trash2 size={16} />}
          label={`Excluir ${isIncome ? 'ganho' : 'gasto'}: ${transaction.category}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
