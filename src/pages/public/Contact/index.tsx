import { ArrowUpRight, Mail, MessageCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  InputDate,
  InputNumber,
  InputText,
  TextArea,
} from '../../../components/forms/fields';
import { Button } from '../../../components/ui/buttons';
import './Contact.scss';

export default function ContactPage() {
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      'O formulário está pronto para integração. Nenhuma mensagem foi enviada.',
    );
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
            <MessageCircle size={22} aria-hidden="true" />
          </span>
          <h2>Uma boa conversa começa com uma pergunta.</h2>
          <p>
            Preencha o formulário e conte um pouco do que você precisa. Este
            espaço está preparado para receber sua mensagem.
          </p>
          <div className="contact-aside__note">
            <Mail size={17} aria-hidden="true" />
            <span>
              <strong>Sem pressa, sem complicação.</strong>
              <small>Vamos dar um passo de cada vez.</small>
            </span>
          </div>
        </aside>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__heading">
            <span>ESCREVA PARA A GENTE</span>
            <h2>Como podemos ajudar?</h2>
          </div>
          <div className="form-grid">
            <InputText
              autoComplete="name"
              id="contact-name"
              label="Seu nome"
              name="name"
              placeholder="Como podemos te chamar?"
              required
            />
            <InputText
              autoComplete="email"
              id="contact-email"
              label="E-mail"
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
              step="any"
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
                name="message"
                placeholder="Conte um pouco sobre o que você precisa..."
                required
                rows={5}
              />
            </div>
          </div>
          <Button icon={<Send size={16} />} type="submit">
            Enviar mensagem
          </Button>
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}
          <p className="contact-form__privacy">
            Não compartilhe senhas ou informações bancárias neste formulário.
          </p>
          <span className="contact-form__corner" aria-hidden="true">
            <ArrowUpRight size={20} />
          </span>
        </form>
      </section>
    </main>
  );
}
