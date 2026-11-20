// React imports
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CirclePlus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';

// Component imports
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Context imports
import { useToast } from '@contexts/ToastContext';

// Hook imports
import useWishlist from '@hooks/useWishlist';

// Interface imports
import type { WishlistItem, WishlistItemPayload } from '@interface/wishlist';

// Utility imports
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';

// Page imports
import DeleteWishlistItemModal from './components/DeleteWishlistItemModal';
import WishlistItemDetailSidebar from './components/WishlistItemDetailSidebar';
import WishlistItemFormSidebar from './components/WishlistItemFormSidebar';

// Exported page component - WishlistPage
export default function WishlistPage() {
  // State variables
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  // Use the custom hook to manage items
  const {
    items,
    selectedWishlistItem,
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
    clearSelectedWishlistItem,
  } = useWishlist(page);
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
  function openCreateForm() {
    clearError();
    clearSelectedWishlistItem();
    setEditingItem(null);
    setIsFormOpen(true);
  }

  // Function to open the edit form
  function openEditForm(item: WishlistItem) {
    clearError();
    clearSelectedWishlistItem();
    setEditingItem(item);
    setIsFormOpen(true);
  }

  // Function to close the form
  function closeForm() {
    if (isSaving) {
      return;
    }
    setIsFormOpen(false);
    setEditingItem(null);
    clearError();
  }

  // Function to save a new or existing wishlist item
  async function handleSave(payload: WishlistItemPayload): Promise<boolean> {
    const saved = editingItem
      ? await update(editingItem.id, payload)
      : await create(payload);

    if (saved) {
      showToast({
        kind: 'success',
        title: editingItem ? 'Item atualizado' : 'Item cadastrado',
        message: editingItem
          ? 'As alterações foram salvas com sucesso.'
          : 'O item foi adicionado à lista de desejos.',
      });
    }
    return saved;
  }

  // Function to load wishlist details
  async function handleOpenDetail(item: WishlistItem) {
    clearError();
    await loadDetail(item.id);
  }

  // Function to open the delete confirmation
  function openDeleteConfirmation(item: WishlistItem) {
    clearSelectedWishlistItem();
    setItemToDelete(item);
  }

  // Function to delete a wishlist item
  async function handleDelete() {
    if (!itemToDelete) {
      return;
    }

    const goToPreviousPage = page > 1 && !hasNext && items.length === 1;
    const deleted = await remove(itemToDelete.id, !goToPreviousPage);
    if (deleted) {
      if (goToPreviousPage) {
        setPage(page - 1);
      }
      setItemToDelete(null);
      showToast({
        kind: 'success',
        title: 'Item excluído',
        message: 'O item foi removido da lista de desejos.',
      });
    }
  }

  // Render the WishlistPage component
  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <ShoppingBag
              size="var(--icon-size-21)"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div>
            <span className="eyebrow">Organização financeira</span>
            <h1>Lista de desejos</h1>
            <p>Planeje suas próximas compras.</p>
          </div>
        </div>
        <Button
          icon={<CirclePlus size="var(--icon-size-17)" />}
          iconPosition="leading"
          onClick={openCreateForm}
        >
          Novo item
        </Button>
      </header>

      {error && !isFormOpen && (
        <MessageAlert kind="error" message={error} onDismiss={clearError} />
      )}

      <section aria-labelledby="wishlist-list-title" className="transaction-list">
        <header className="transaction-list__header">
          <div>
            <h2 id="wishlist-list-title">Compras planejadas</h2>
            <p>Consulte e atualize os itens que você pretende comprar.</p>
          </div>
        </header>

        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Valor</th>
                <th scope="col">Data prevista da compra</th>
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
                    colSpan={4}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="table-loading">
                      <span
                        className="loading-spinner loading-spinner--table"
                        aria-hidden="true"
                      />
                      <span>Carregando itens...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <WishlistItemRow
                    key={item.id}
                    item={item}
                    onDelete={() => openDeleteConfirmation(item)}
                    onDetail={() => void handleOpenDetail(item)}
                    onEdit={() => openEditForm(item)}
                  />
                ))
              ) : error ? (
                <tr>
                  <td className="transaction-table__state" colSpan={4}>
                    Não foi possível carregar os itens.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="transaction-table__state" colSpan={4}>
                    <div className="transaction-empty">
                      <span className="transaction-empty__icon">
                        <ShoppingBag
                          size="var(--icon-size-22)"
                          aria-hidden="true"
                        />
                      </span>
                      <strong>Nenhum item na lista</strong>
                      <p>
                        Adicione algo que você quer comprar.
                      </p>
                      <Button
                        onClick={openCreateForm}
                        size="small"
                        variant="secondary"
                      >
                        Adicionar item
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
              ? `${items.length} nesta página`
              : `${items.length} de ${totalCount} itens`}
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

      {isFormOpen && (
        <WishlistItemFormSidebar
          item={editingItem}
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
            aria-label="Carregando detalhes do item"
            aria-modal="true"
            className="transaction-drawer__panel transaction-detail-loading"
            role="dialog"
          >
            <span className="loading-spinner" aria-hidden="true" />
            Carregando detalhes...
          </aside>
        </div>
      )}

      {selectedWishlistItem && (
        <WishlistItemDetailSidebar
          item={selectedWishlistItem}
          onClose={clearSelectedWishlistItem}
          onDelete={() => openDeleteConfirmation(selectedWishlistItem)}
          onEdit={() => openEditForm(selectedWishlistItem)}
        />
      )}

      {itemToDelete && (
        <DeleteWishlistItemModal
          item={itemToDelete}
          isDeleting={isSaving}
          onCancel={() => {
            if (!isSaving) {
              setItemToDelete(null);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </main>
  );
}

interface WishlistItemRowProps {
  item: WishlistItem;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Render a wishlist row with action buttons
function WishlistItemRow({
  item,
  onDetail,
  onEdit,
  onDelete,
}: WishlistItemRowProps) {
  return (
    <tr>
      <td>
        <div className="transaction-table__name">
          <span className="transaction-type-icon">
            <ShoppingBag size="var(--icon-size-16)" aria-hidden="true" />
          </span>
          <strong>{item.name}</strong>
        </div>
      </td>
      <td className="financial-amount financial-amount--expense">{formatCurrency(item.amount)}</td>
      <td className="transaction-table__date">
        {item.expected_purchase_date ? formatDateOnly(item.expected_purchase_date) : '—'}
      </td>
      <td className="transaction-table__actions">
        <IconButton
          icon={<Eye size="var(--icon-size-16)" />}
          label={`Ver detalhes de ${item.name}`}
          onClick={onDetail}
        />
        <IconButton
          icon={<Pencil size="var(--icon-size-16)" />}
          label={`Editar item: ${item.name}`}
          onClick={onEdit}
        />
        <IconButton
          className="transaction-table__delete"
          icon={<Trash2 size="var(--icon-size-16)" />}
          label={`Excluir item: ${item.name}`}
          onClick={onDelete}
        />
      </td>
    </tr>
  );
}
