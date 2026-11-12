export const transactionBanks = [
  { value: '', label: 'Não informado' },
  { value: 'banco_do_brasil', label: 'Banco do Brasil', logoDomain: 'bb.com.br' },
  { value: 'bradesco', label: 'Bradesco', logoDomain: 'bradesco.com.br' },
  { value: 'btg_pactual', label: 'BTG Pactual', logoDomain: 'btgpactual.com' },
  { value: 'c6_bank', label: 'C6 Bank', logoDomain: 'c6bank.com.br' },
  { value: 'caixa', label: 'Caixa Econômica Federal', logoDomain: 'caixa.gov.br' },
  { value: 'inter', label: 'Banco Inter', logoDomain: 'inter.co' },
  { value: 'itau', label: 'Itaú Unibanco', logoDomain: 'itau.com.br' },
  { value: 'mercado_pago', label: 'Mercado Pago', logoDomain: 'mercadopago.com.br' },
  { value: 'nubank', label: 'Nubank', logoDomain: 'nubank.com.br' },
  { value: 'pagbank', label: 'PagBank', logoDomain: 'pagbank.com.br' },
  { value: 'picpay', label: 'PicPay', logoDomain: 'picpay.com' },
  { value: 'santander', label: 'Santander', logoDomain: 'santander.com.br' },
  { value: 'sicoob', label: 'Sicoob', logoDomain: 'sicoob.com.br' },
  { value: 'sicredi', label: 'Sicredi', logoDomain: 'sicredi.com.br' },
  { value: 'other', label: 'Outro' },
] as const;

export type TransactionBank = (typeof transactionBanks)[number]['value'];

export const transactionBankOptions = transactionBanks.map((bank) => ({
  value: bank.value,
  label: bank.label,
  ...( 'logoDomain' in bank ? { logoDomain: bank.logoDomain } : {}),
}));

export function getTransactionBankLabel(bank: string): string {
  return transactionBanks.find((option) => option.value === bank)?.label ??
    'Outro';
}

export function getTransactionBankLogoDomain(
  bank: TransactionBank,
): string | undefined {
  const option = transactionBanks.find((candidate) => candidate.value === bank);
  return option && 'logoDomain' in option ? option.logoDomain : undefined;
}
