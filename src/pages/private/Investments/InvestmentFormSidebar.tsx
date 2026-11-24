import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, X } from 'lucide-react';
import { InputDate, InputNumber, InputText, SelectField } from '@components/forms/fields';
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';
import MessageAlert from '@components/ui/MessageAlert';
import Skeleton from '@components/ui/Skeleton';
import { Button, IconButton } from '@components/ui/buttons';
import { fetchFundQuote, type FundQuote } from '@services/investments/fundQuote';
import { createInvestment, searchFundAssets, type Investment } from '@services/investments/investmentService';
import { formatCurrency, formatDateOnly } from '../../../utils/formatters';
import './InvestmentFormSidebar.scss';

const localDateFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' });

interface AssetOption {
  asset: string;
  label: string;
  name: string | null;
  segment: string | null;
}

function calculateAmount(price: FundQuote['price'] | undefined, quantity: string) {
  const shares = Number(quantity);
  const decimal = /^(\d+)(?:\.(\d+))?$/.exec(String(price));
  if (!decimal || !Number.isSafeInteger(shares) || shares < 1) return '';

  const [, whole, fraction = ''] = decimal;
  const scale = 10n ** BigInt(fraction.length);
  // Keep the quote's precision until the total is rounded to cents.
  const total = BigInt(whole + fraction) * BigInt(shares);
  const cents = (total * 100n + scale / 2n) / scale;
  if (cents === 0n) return '';
  const amount = cents.toString().padStart(3, '0');
  return `${amount.slice(0, -2)}.${amount.slice(-2)}`;
}

export function QuoteValue({ quote }: { quote: FundQuote | null | undefined }) {
  if (quote === undefined) return <span role="status">Consultando…</span>;
  if (quote?.price == null || quote.price === '') return <span>Cotação indisponível</span>;
  return <span className="investment-quote-value">
    <strong>{formatCurrency(Number(quote.price))}</strong>
    {quote.trade_date && <small>Pregão de {formatDateOnly(quote.trade_date)}</small>}
  </span>;
}

export default function InvestmentFormSidebar({ onClose, onSave }: {
  onClose: () => void;
  onSave: (investment: Investment) => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState({ query: '', page: 1 });
  const [options, setOptions] = useState<AssetOption[]>([]);
  const [selected, setSelected] = useState('');
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = localDateFormatter.format(new Date());
  const [investedAt, setInvestedAt] = useState(today);
  const [manualAmount, setManualAmount] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [quote, setQuote] = useState<FundQuote | null>();
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const selectedFund = options.find((option) => option.asset === selected);
  const calculatedAmount = selected ? calculateAmount(quote?.price, quantity) : '';
  const amount = manualAmount ?? calculatedAmount;
  const { hasAttemptedSubmit, handleInvalidCapture, hasMissingCustomRequiredFields } = useRequiredFormValidation();

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialogRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadOptions() {
      try {
        const data = await searchFundAssets(search.query, search.page, controller.signal);
        if (controller.signal.aborted) return;
        const assets = data.results.map(({ ticker, name, segment }) => ({
          asset: ticker,
          name,
          segment,
          label: name ? `${ticker} · ${name}` : ticker,
        }));
        setOptions((previous) => search.page === 1 ? assets : [...previous, ...assets]);
        setNextPage(data.next_page);
      } catch (error) {
        if (!controller.signal.aborted) {
          setCatalogError(error instanceof Error ? error.message : 'Catálogo indisponível.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadOptions();
    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    fetchFundQuote(selected, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        const price = data?.price;
        setQuote(price != null && price !== '' && Number.isFinite(Number(price)) ? data : null);
      })
      .catch(() => { if (!controller.signal.aborted) setQuote(null); });
    return () => controller.abort();
  }, [selected, quoteAttempt]);

  function loadPage(query: string, page: number) {
    setLoading(true);
    setCatalogError('');
    if (page === 1) {
      setOptions([]);
      setSelected('');
      setQuote(undefined);
      setManualAmount(null);
      setNextPage(null);
    }
    setSearch({ query: query.trim(), page });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || hasMissingCustomRequiredFields(event.currentTarget) || !selected) return;
    setSaving(true);
    setSaveError('');
    try {
      const investment = await createInvestment({
        asset: selected,
        quantity,
        invested_at: investedAt,
        amount,
      });
      onSave(investment);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar a aplicação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="transaction-drawer investment-drawer">
      <button className="transaction-drawer__backdrop" type="button" tabIndex={-1}
        aria-label="Fechar formulário" disabled={saving} onClick={onClose} />
      <aside
        ref={dialogRef}
        className="transaction-drawer__panel transaction-form__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="investment-form-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !saving) onClose();
          if (event.key !== 'Tab') return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:enabled, input:enabled');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first || !last) {
            event.preventDefault();
          } else if (event.shiftKey && (event.target === first || event.target === event.currentTarget)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && event.target === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Fundos imobiliários</span>
            <h2 id="investment-form-title">Nova aplicação</h2>
            <p>Escolha o FII e informe os dados da compra.</p>
          </div>
          <IconButton icon={<X size="var(--icon-size-18)" />} label="Fechar formulário" onClick={onClose} disabled={saving} />
        </header>
        <form className={`transaction-form${hasAttemptedSubmit ? ' form-validation-attempted' : ''}`}
          onInvalidCapture={handleInvalidCapture} onSubmit={submit}>
          <div className="transaction-form__fields">
            <div className="investment-entry-form__search form-grid__item--span-4">
              <InputText id="investment-search" label="Buscar FII por código ou nome" type="search" disabled={saving}
                maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    loadPage(query, 1);
                  }
                }} />
              <Button variant="secondary" disabled={saving} onClick={() => loadPage(query, 1)}>Buscar</Button>
            </div>
            <SelectField id="investment-asset" label="Fundo imobiliário"
              options={options.map((option) => ({ value: option.asset, label: option.label }))}
              value={selected} onChange={(ticker) => {
                if (ticker === selected) return;
                setQuote(undefined);
                setManualAmount(null);
                setSelected(ticker);
              }} required validationAttempted={hasAttemptedSubmit}
              fieldClassName="form-grid__item--span-4" disabled={saving || options.length === 0}
              placeholder={loading ? 'Carregando catálogo…' : 'Selecione'} />
            {loading && <div className="form-grid__item--span-4" role="status" aria-label="Carregando catálogo de ativos"><Skeleton width="62%" /></div>}
            {catalogError && (
              <div className="investment-feedback form-grid__item--span-4">
                <MessageAlert className="investment-alert" kind="error" message={catalogError} />
                <Button variant="secondary" size="small" disabled={saving} onClick={() => loadPage(search.query, search.page)}>Tentar novamente</Button>
              </div>
            )}
            {nextPage !== null && !catalogError && (
              <Button variant="secondary" size="small" className="form-grid__item--span-4 investment-entry-form__more" disabled={saving || loading} onClick={() => loadPage(search.query, nextPage)}>
                Carregar mais FIIs
              </Button>
            )}
            {!loading && !catalogError && options.length === 0 && <p className="field__hint form-grid__item--span-4">Nenhum FII encontrado.</p>}
            {selectedFund && (
              <section className="investment-form-asset form-grid__item--span-4" aria-label="Detalhes do ativo">
                <div className="investment-form-asset__identity">
                  <span className="transaction-type-icon investment-form-asset__icon">
                    <Building2 size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{selectedFund.asset}</strong>
                    {selectedFund.name && <span>{selectedFund.name}</span>}
                    {selectedFund.segment && <span className="transaction-category">{selectedFund.segment}</span>}
                  </div>
                </div>
                <div className="investment-form-asset__quote" aria-live="polite">
                  <span>Valor atual da cota</span>
                  {quote === undefined ? (
                    <div role="status" aria-label="Consultando cotação"><Skeleton width={94} height={20} /></div>
                  ) : <QuoteValue quote={quote} />}
                  {quote === null && (
                    <Button size="small" variant="secondary" disabled={saving} onClick={() => {
                      setQuote(undefined);
                      setQuoteAttempt((current) => current + 1);
                    }}>Tentar novamente</Button>
                  )}
                </div>
              </section>
            )}
            <InputDate id="investment-date" label="Data da compra" value={investedAt} max={today} required
              disabled={saving} fieldClassName="form-grid__item--span-4"
              onChange={(event) => setInvestedAt(event.target.value)} />
            <InputNumber id="investment-quantity" label="Cotas compradas" min="1" max="2147483647"
              step="1" required disabled={saving} fieldClassName="form-grid__item--span-2"
              value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <InputNumber id="investment-amount" label="Valor aplicado (R$)" min="0.01" max="999999999999.99"
              step="0.01" placeholder="0,00" required disabled={saving} fieldClassName="form-grid__item--span-2"
              hint={calculatedAmount ? 'Cotação × quantidade. Você pode editar o valor.' : undefined}
              value={amount} onChange={(event) => setManualAmount(event.target.value)} />
            {manualAmount !== null && calculatedAmount && (
              <Button className="form-grid__item--span-4 investment-entry-form__more" variant="secondary"
                size="small" disabled={saving} onClick={() => setManualAmount(null)}>
                Usar valor calculado
              </Button>
            )}
            {saveError && <MessageAlert className="investment-alert form-grid__item--span-4" kind="error" message={saveError} />}
          </div>
          <footer className="transaction-form__actions">
            <Button variant="secondary" disabled={saving} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving || options.length === 0}>{saving ? 'Salvando…' : 'Salvar aplicação'}</Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
