// Interface imports
import type { Debtor } from '@interface/debtor';

// Function to describe the payment status and any remaining balance
export function getDebtorStatus(debtor: Debtor): string {
  if (!debtor.is_paid) {
    return 'Em aberto';
  }
  return Number(debtor.remaining_amount) > 0 ? 'Recebido parcialmente' : 'Quitado';
}
