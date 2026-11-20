// React imports
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CirclePlus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react';

// Component imports
import { SelectField } from '@components/forms/fields';
import FieldShell from '@components/forms/fields/FieldShell';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Config imports
import { getPageSize } from '@config/pagination';

// Context imports
import { useToast } from '@contexts/ToastContext';

// Hook imports
import useMonthlies from '@hooks/useMonthlies';

// Interface imports
import type { Monthly, MonthlyPayload, MonthlySettlementPayload } from '@interface/monthly';
import type { TransactionType } from '@interface/transaction';

// Utility imports
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';

// Page imports
import DeleteMonthlyModal from './components/DeleteMonthlyModal';
import MonthlyDetailSidebar from './components/MonthlyDetailSidebar';
import MonthlyFormSidebar from './components/MonthlyFormSidebar';
import { getMonthlyStatus, getToday, monthlyTypeOptions } from './utils';
import './Monthlies.scss';

// Get the page size from the configuration
const pageSize = getPageSize();
const monthlyTypeFilterOptions = [
  { value: '', label: 'Todos os tipos' },
  ...monthlyTypeOptions,
] as const;

// Exported page component - MonthliesPage
export default function MonthliesPage() {
  // State variables
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState(() => {
    const requestedMonth = searchParams.get('mes');
    return requestedMonth && /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) && !requestedMonth.startsWith('0000')
      ? requestedMonth
      : getToday().slice(0, 7);
  });
  const [type, setType] = useState<TransactionType | ''>('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'monthly' | 'invoice' | null>(null);
  const [editingMonthly, setEditingMonthly] = useState<Monthly | null>(null);
  const [monthlyToDelete, setMonthlyToDelete] = useState<Monthly | null>(null);
  // Use the custom hook to manage monthlies
  const {
    monthlies,
    selectedMonthly,
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
    settle,
    loadDetail,
    clearError,
    clearSelectedMonthly,
  } = useMonthlies({ month, page, pageSize, type });
  const { showToast } = useToast();

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
  function openCreateForm(mode: 'monthly' | 'invoice' = 'monthly') {
    clearError();
    clearSelectedMonthly();
    setEditingMonthly(null);
    setFormMode(mode);
  }

  // Function to open the edit form
  function openEditForm(monthly: Monthly) {
    clearError();
    clearSelectedMonthly();
    setEditingMonthly(monthly);
    setFormMode(monthly.is_invoice ? 'invoice' : 'monthly');
  }

  // Function to close the form
  function closeForm() {
    if (isSaving) {
      return;
    }
    setFormMode(null);
    setEditingMonthly(null);
    clearError();
  }

  // Function to save a new or existing monthly
  async function handleSave(payload: MonthlyPayload): Promise<boolean> {
    const saved = editingMonthly
      ? await update(editingMonthly.id, payload)
      : await create(payload);

    if (saved) {
      showToast({
        kind: 'success',
        title: payload.is_invoice
          ? editingMonthly ? 'Fatura atualizada' : 'Fatura cadastrada'
          : editingMonthly ? 'Mensalidade atualizada' : 'Mensalidade cadastrada',
        message: editingMonthly
          ? 'As alterações foram salvas com sucesso.'
          : 'A recorrência foi adicionada à sua lista.',
      });
    }
    return saved;
  }

  // Function to load monthly details
  async function handleOpenDetail(monthly: Monthly) {
    clearError();
    await loadDetail(monthly.id);
  }

  // Function to open the delete confirmation
  function openDeleteConfirmation(monthly: Monthly) {
    clearSelectedMonthly();
    setMonthlyToDelete(monthly);
  }

  // Function to delete a monthly
  async function handleDelete() {
    if (!monthlyToDelete) {
      return;
    }

    const goToPreviousPage = page > 1 && !hasNext && monthlies.length === 1;
    const deleted = await remove(monthlyToDelete.id, !goToPreviousPage);
    if (deleted) {
      if (goToPreviousPage) {
        setPage(page - 1);
      }
      setMonthlyToDelete(null);
      showToast({
        kind: 'success',
        title: 'Mensalidade excluída',
        message: 'A recorrência foi removida com sucesso.',
      });
    }
  }

  // Function to register a settlement and notify the user
  async function handleSettle(monthly: Monthly, settlement: MonthlySettlementPayload) {
    if (await settle(monthly.id, settlement)) {
      showToast({
        kind: 'success',
        title: 'Baixa registrada',
        message: monthly.invoice
          ? 'O valor foi adicionado à fatura deste mês.'
          : 'O lançamento foi adicionado a Ganhos e gastos.',
      });
    }
  }

  // Render the MonthliesPage component
  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <Banknote
              size="var(--icon-size-21)"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Mensalidades</h1>
            <p>Acompanhe faturas, ganhos e gastos recorrentes.</p>
          </div>
        </div>
        <div className="monthly-header-actions">
          <Button
            icon={<CirclePlus size="var(--icon-size-17)" />}
            iconPosition="leading"
            onClick={() => openCreateForm()}
          >
            Nova mensalidade
          </Button>
          <Button onClick={() => openCreateForm('invoice')} variant="secondary">
            Criar fatura
          </Button>
        </div>
      </header>

      {error && !formMode && (
        <MessageAlert kind="error" message={error} onDismiss={clearError} />
      )}

      <section aria-labelledby="monthly-list-title" className="transaction-list">
        <header className="transaction-list__header">
          <div>
            <h2 id="monthly-list-title">Mensalidades do mês</h2>
            <p>Consulte os lançamentos recorrentes do mês selecionado.</p>
          </div>
          <div className="transaction-list__filters">
            <FieldShell
              className="transaction-list__filter"
              id="monthly-reference"
              label="Mês de referência"
            >
              <input
                className="field-control field-control--date"
                id="monthly-reference"
                type="month"
                defaultValue={month}
                onBlur={(event) => {
                  event.currentTarget.value = month;
                }}
                onChange={(event) => {
                  const value = event.target.value;
                  if (/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(value) && !value.startsWith('0000')) {
                    setPage(1);
                    setMonth(value);
                  }
                }}
              />
            </FieldShell>
            <SelectField
              fieldClassName="transaction-list__filter"
              id="monthly-type-filter"
              label="Tipo"
              options={monthlyTypeFilterOptions}
              value={type}
              onChange={(nextType) => {
                setPage(1);
                setType(nextType);
              }}
            />
          </div>
        </header>

        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tipo</th>
                <th scope="col">Vencimento</th>
                <th scope="col">Valor</th>
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
                      <span>Carregando mensalidades...</span>
                    </div>
                  </td>
                </tr>
              ) : monthlies.length ? (
                monthlies.map((monthly) => (
                  <MonthlyRow
                    key={monthly.id}
                    monthly={monthly}
                    onDelete={() => openDeleteConfirmation(monthly)}
                    onDetail={() => void handleOpenDetail(monthly)}
                    onEdit={() => openEditForm(monthly)}
                  />
                ))
              ) : error ? (
                <tr>
                  <td className="transaction-table__state" colSpan={6}>
                    Não foi possível carregar as mensalidades.
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
                      <strong>Nenhuma mensalidade encontrada</strong>
                      <p>
                        Cadastre uma recorrência ou altere o filtro de tipo.
                      </p>
                      <Button
                        onClick={() => openCreateForm()}
                        size="small"
                        variant="secondary"
                      >
                        Cadastrar mensalidade
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
              ? `${monthlies.length} nesta página`
              : `${monthlies.length} de ${totalCount} mensalidades`}
          </span>
          <div className="transaction-pagination__controls">
            <IconButton
              disabled={page <= 1 || isLoading}
              icon={<ArrowLeft size="var(--icon-size-16)" />}
              label="Página anterior"
              onClick={() => setPage((current) => current - 1)}
            />
            <span>
              Página <strong>{page}</strong>
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

      {formMode && (
        <MonthlyFormSidebar
          monthly={editingMonthly}
          initialIsInvoice={formMode === 'invoice'}
          month={month}
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
            aria-label="Carregando detalhes da mensalidade"
            aria-modal="true"
            className="transaction-drawer__panel transaction-detail-loading"
            role="dialog"
          >
            <span className="loading-spinner" aria-hidden="true" />
            Carregando detalhes...
          </aside>
        </div>
      )}

      {selectedMonthly && (
        <MonthlyDetailSidebar
          monthly={selectedMonthly}
          error={error}
          isSaving={isSaving}
          onClose={clearSelectedMonthly}
          onSettle={(settlement) => handleSettle(selectedMonthly, settlement)}
          onDelete={() => openDeleteConfirmation(selectedMonthly)}
          onEdit={() => openEditForm(selectedMonthly)}
        />
      )}

      {monthlyToDelete && (
        <DeleteMonthlyModal
          monthly={monthlyToDelete}
          isDeleting={isSaving}
          onCancel={() => {
            if (!isSaving) {
              setMonthlyToDelete(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </main>
  );
}

interface MonthlyRowProps {
  monthly: Monthly;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Render a monthly row with action buttons
function MonthlyRow({
  monthly,
  onDetail,
  onEdit,
  onDelete,
}: MonthlyRowProps) {
  const type = monthly.settlement?.type ?? monthly.type;

  return (
    <tr>
      <td>
        <div className="transaction-table__name">
          <span className={`transaction-type-icon transaction-type-icon--${type}`}>
            <CalendarDays size="var(--icon-size-16)" aria-hidden="true" />
          </span>
          <strong>{monthly.name}</strong>
        </div>
      </td>
      <td>{monthly.is_invoice ? 'Fatura' : type === 'income' ? 'Ganho' : 'Gasto'}</td>
      <td className="transaction-table__date">
        {monthly.due_date ? formatDateOnly(monthly.due_date) : '—'}
      </td>
      <td className={`financial-amount financial-amount--${type}`}>
        {formatCurrency(monthly.settlement?.amount ?? monthly.invoice_total ?? monthly.amount)}
      </td>
      <td>{getMonthlyStatus(monthly)}</td>
      <td className="transaction-table__actions">
        <IconButton
          icon={<Eye size="var(--icon-size-16)" />}
          label={`Ver detalhes de ${monthly.name}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size="var(--icon-size-16)" />}
          label={`Editar mensalidade: ${monthly.name}`}
          onClick={onEdit}
        />
        <IconButton
          className="transaction-table__delete"
          icon={<Trash2 size="var(--icon-size-16)" />}
          label={`Excluir mensalidade: ${monthly.name}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
