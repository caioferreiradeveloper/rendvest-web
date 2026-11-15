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
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';
import { getPageSize } from '@config/pagination';
import { useToast } from '@contexts/ToastContext';
import useDebtors from '@hooks/useDebtors';
import type { Debtor, DebtorPayload } from '@interface/debtor';
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';
import DeleteDebtorModal from './components/DeleteDebtorModal';
import DebtorDetailSidebar from './components/DebtorDetailSidebar';
import DebtorFormSidebar from './components/DebtorFormSidebar';
import './Debtors.scss';

const pageSize = getPageSize();

export default function DebtorsPage() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [debtorToDelete, setDebtorToDelete] = useState<Debtor | null>(null);
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
    loadDetail,
    clearError,
    clearSelectedDebtor,
  } = useDebtors({ page, pageSize });
  const { showToast } = useToast();

  const pageCount =
    totalCount === null
      ? Math.max(1, page + (hasNext ? 1 : 0))
      : Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = debtors.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem =
    totalCount === null
      ? (page - 1) * pageSize + debtors.length
      : Math.min(page * pageSize, totalCount);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (error) {
      showToast({
        kind: 'error',
        title: 'Não foi possível concluir',
        message: error,
      });
    }
  }, [error, showToast]);

  function openCreateForm() {
    clearError();
    clearSelectedDebtor();
    setEditingDebtor(null);
    setIsFormOpen(true);
  }

  function openEditForm(debtor: Debtor) {
    clearError();
    clearSelectedDebtor();
    setEditingDebtor(debtor);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsFormOpen(false);
    setEditingDebtor(null);
    clearError();
  }

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

  async function handleOpenDetail(debtor: Debtor) {
    clearError();
    await loadDetail(debtor.id);
  }

  function openDeleteConfirmation(debtor: Debtor) {
    clearSelectedDebtor();
    setDebtorToDelete(debtor);
  }

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

      <section aria-labelledby="debtor-list-title" className="debtor-list">
        <header className="debtor-list__header">
          <div>
            <h2 id="debtor-list-title">Valores a receber</h2>
            <p>Consulte e atualize os registros de quem deve.</p>
          </div>
        </header>

        <div className="debtor-table-wrap">
          <table className="debtor-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Data</th>
                <th scope="col">Valor devido</th>
                <th scope="col">
                  <span className="visually-hidden">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="debtor-table__state"
                    colSpan={4}
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
                  <td className="debtor-table__state" colSpan={4}>
                    Não foi possível carregar os devedores.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="debtor-table__state" colSpan={4}>
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

        <footer className="debtor-pagination">
          <span>
            {totalCount === null
              ? debtors.length
                ? `Exibindo ${firstItem}–${lastItem} devedores`
                : 'Nenhum devedor para exibir'
              : totalCount
                ? `Exibindo ${firstItem}–${lastItem} de ${totalCount} devedores`
                : 'Nenhum devedor para exibir'}
          </span>
          <div className="debtor-pagination__controls">
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
          onClose={clearSelectedDebtor}
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

function DebtorRow({
  debtor,
  onDetail,
  onEdit,
  onDelete,
}: DebtorRowProps) {
  return (
    <tr>
      <td>
        <div className="debtor-table__name">
          <span className="debtor-table__icon">
            <UserRound size="var(--icon-size-16)" aria-hidden="true" />
          </span>
          <strong>{debtor.name}</strong>
        </div>
      </td>
      <td className="debtor-table__date">
        {formatDateOnly(debtor.occurred_at)}
      </td>
      <td className="debtor-table__amount">
        {formatCurrency(debtor.amount)}
      </td>
      <td className="debtor-table__actions">
        <IconButton
          icon={<Eye size="var(--icon-size-16)" />}
          label={`Ver detalhes de ${debtor.name}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size="var(--icon-size-16)" />}
          label={`Editar devedor: ${debtor.name}`}
          onClick={onEdit}
        />
        <IconButton
          className="debtor-table__delete"
          icon={<Trash2 size="var(--icon-size-16)" />}
          label={`Excluir devedor: ${debtor.name}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
