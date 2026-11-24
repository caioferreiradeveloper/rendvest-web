import { ArrowUpRight, Mail, MessageCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  InputDate,
  InputNumber,
  InputText,
  TextArea,
} from '@components/forms/fields';
import { Button } from '@components/ui/buttons';
import { useToast } from '@contexts/ToastContext';
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';
import { administrationService } from '@services/administration/administrationService';
import { toApiAlert } from '@services/api/apiFeedback';
import './Contact.scss';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { hasAttemptedSubmit, handleInvalidCapture } =
    useRequiredFormValidation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSubmitting(true);
    try {
      await administrationService.sendContact({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        message: String(data.get('message') ?? ''),
        monthly_goal: String(data.get('monthlyGoal') ?? '') || null,
        preferred_date: String(data.get('preferredDate') ?? '') || null,
      });
      form.reset();
      showToast({ kind: 'success', title: 'Mensagem enviada', message: 'Recebemos seu contato.' });
    } catch (error) {
      showToast(toApiAlert(error, 'Não foi possível enviar a mensagem.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="page-heading">
        <div className="container page-heading__inner">
          <span className="eyebrow">Estamos por aqui</span>
          <h1>Vamos conversar?</h1>
          <p>
            Tem uma dúvida, uma ideia ou quer saber mais sobre a Rendvest?
            Escreva para a gente.
          </p>
        </div>
      </section>
      <section className="container contact-layout">
        <aside className="contact-aside">
          <span className="contact-aside__icon">
            <MessageCircle size="var(--icon-size-22)" aria-hidden="true" />
          </span>
          <h2>Uma boa conversa começa com uma pergunta.</h2>
          <p>
            Preencha o formulário e conte um pouco do que você precisa. Este
            espaço está preparado para receber sua mensagem.
          </p>
          <div className="contact-aside__note">
            <Mail size="var(--icon-size-17)" aria-hidden="true" />
            <span>
              <strong>Sem pressa, sem complicação.</strong>
              <small>Vamos dar um passo de cada vez.</small>
            </span>
          </div>
        </aside>
        <form
          className={`contact-form${hasAttemptedSubmit ? ' form-validation-attempted' : ''}`}
          onInvalidCapture={handleInvalidCapture}
          onSubmit={handleSubmit}
        >
          <div className="contact-form__heading">
            <span>ESCREVA PARA A GENTE</span>
            <h2>Como podemos ajudar?</h2>
          </div>
          <div className="form-grid">
            <InputText
              autoComplete="name"
              id="contact-name"
              label="Seu nome"
              maxLength={150}
              name="name"
              placeholder="Como podemos te chamar?"
              required
            />
            <InputText
              autoComplete="email"
              id="contact-email"
              label="E-mail"
              maxLength={254}
              name="email"
              placeholder="voce@exemplo.com"
              required
              type="email"
            />
            <InputNumber
              id="contact-goal"
              label="Meta mensal (opcional)"
              name="monthlyGoal"
              min={0}
              placeholder="Ex.: 500"
              max={9999999999.99}
              step="0.01"
              hint="Somente se fizer sentido para sua pergunta."
            />
            <InputDate
              id="contact-date"
              label="Melhor data para retorno (opcional)"
              name="preferredDate"
              min={new Date().toISOString().slice(0, 10)}
            />
            <div className="form-grid__full">
              <TextArea
                id="contact-message"
                label="Sua mensagem"
                maxLength={5000}
                name="message"
                placeholder="Conte um pouco sobre o que você precisa..."
                required
                rows={5}
              />
            </div>
          </div>
          <Button disabled={isSubmitting} icon={<Send size="var(--icon-size-16)" />} type="submit">
            {isSubmitting ? 'Enviando…' : 'Enviar mensagem'}
          </Button>
          <p className="contact-form__privacy">
            Não compartilhe senhas ou informações bancárias neste formulário.
          </p>
          <span className="contact-form__corner" aria-hidden="true">
            <ArrowUpRight size="var(--icon-size-20)" />
          </span>
        </form>
      </section>
    </main>
  );
}
