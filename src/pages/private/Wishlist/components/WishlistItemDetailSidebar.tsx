// React imports
import { useEffect } from 'react';
import { X } from 'lucide-react';

// Component imports
import { Button, IconButton } from '@components/ui/buttons';

// Utility imports
import { formatCurrency, formatDateOnly } from '../../../../utils/formatters';

// Interface imports
import type { WishlistItem } from '@interface/wishlist';

interface WishlistItemDetailSidebarProps {
  item: WishlistItem;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Exported page component - WishlistItemDetailSidebar
export default function WishlistItemDetailSidebar({
  item,
  onClose,
  onEdit,
  onDelete,
}: WishlistItemDetailSidebarProps) {
  // Effect to handle closing the sidebar on Escape key press and preventing body scroll
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Render the wishlist item details and actions
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes do item"
        className="transaction-drawer__backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="wishlist-detail-title"
        aria-modal="true"
        className="transaction-drawer__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Detalhes do item</span>
            <h2 id="wishlist-detail-title">{item.name}</h2>
          </div>
          <IconButton
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div className="transaction-detail">
          <div className="transaction-detail__amount">
            <span>Valor previsto</span>
            <strong>{formatCurrency(item.amount)}</strong>
          </div>
          <dl className="transaction-detail__list">
            <div>
              <dt>Data prevista da compra</dt>
              <dd>
                {item.expected_purchase_date
                  ? formatDateOnly(item.expected_purchase_date)
                  : 'Sem data prevista'}
              </dd>
            </div>
          </dl>
        </div>

        <footer className="transaction-form__actions">
          <Button onClick={onDelete} variant="secondary">Excluir</Button>
          <Button onClick={onEdit}>Editar item</Button>
        </footer>
      </aside>
    </div>
  );
}
