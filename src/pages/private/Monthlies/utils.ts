// Utility imports
import { getLocalDateTimeValue } from '../../../utils/date';

// Interface imports
import type { Monthly } from '@interface/monthly';

export const monthlyTypeOptions = [
  { value: 'income', label: 'Ganho' },
  { value: 'expense', label: 'Gasto' },
] as const;

export function getToday(): string {
  return getLocalDateTimeValue().slice(0, 10);
}

export function getMonthlyStatus(monthly: Monthly): string {
  if (monthly.is_settled) {
    return 'Baixada';
  }
  if (!monthly.due_date) {
    return 'Sem vencimento';
  }
  return monthly.due_date < getToday() ? 'Vencida' : 'Pendente';
}
