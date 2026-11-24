import { ArrowLeft, ArrowUpRight, Sprout } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { InputPassword, InputText } from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, ButtonLink } from '@components/ui/buttons';
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';
import { administrationService } from '@services/administration/administrationService';
import { toApiAlert } from '@services/api/apiFeedback';
import '../Login/Login.scss';
import './Register.scss';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const { hasAttemptedSubmit, handleInvalidCapture } = useRequiredFormValidation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    if (password !== data.get('confirm_password')) {
      setError('As senhas precisam ser iguais.');
      event.currentTarget.querySelector<HTMLInputElement>('[name="confirm_password"]')?.focus();
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await administrationService.register({
        first_name: String(data.get('first_name') ?? ''),
        last_name: String(data.get('last_name') ?? ''),
        email: String(data.get('email') ?? ''),
        password,
      });
      setRegistered(true);
    } catch (requestError) {
      setError(toApiAlert(requestError, 'Não foi possível solicitar o cadastro.').message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page register-page">
      <aside className="login-story">
        <Link className="login-story__back" to="/">
          <ArrowLeft size="var(--icon-size-16)" aria-hidden="true" /> Voltar para o início
        </Link>
        <div className="login-story__content">
          <span className="login-story__mark">
            <Sprout size="var(--icon-size-22)" aria-hidden="true" />
          </span>
          <h2>Um espaço para <em>seus planos.</em></h2>
          <p>Organize suas finanças e acompanhe seus investimentos na Rendvest.</p>
        </div>
      </aside>
      <section className="login-panel" aria-labelledby="register-title">
        <div className="login-form-wrap">
          <div className="login-form__heading">
            <span className="eyebrow">Seu espaço Rendvest</span>
            <h1 id="register-title">{registered ? 'Cadastro recebido' : 'Cadastre-se'}</h1>
            {!registered && <p>Seu acesso será liberado após a aprovação do cadastro.</p>}
          </div>
          {registered ? (
            <div className="login-form">
              <MessageAlert
                kind="success"
                message="Seu cadastro está aguardando aprovação. Você poderá entrar assim que um administrador aprovar sua conta."
              />
              <ButtonLink to="/login" fullWidth>Voltar para o login</ButtonLink>
            </div>
          ) : (
            <>
              <form
                className={`login-form${hasAttemptedSubmit ? ' form-validation-attempted' : ''}`}
                onInvalidCapture={handleInvalidCapture}
                onSubmit={handleSubmit}
              >
                <div className="register-page__names">
                  <InputText id="register-first-name" name="first_name" label="Nome" autoComplete="given-name" maxLength={150} required />
                  <InputText id="register-last-name" name="last_name" label="Sobrenome" autoComplete="family-name" maxLength={150} />
                </div>
                <InputText id="register-email" name="email" label="E-mail" autoComplete="email" type="email" maxLength={254} required />
                <InputPassword id="register-password" name="password" label="Senha" autoComplete="new-password"
                  hint="Use no mínimo 8 caracteres." minLength={8} required />
                <InputPassword id="register-confirm" name="confirm_password" label="Confirme a senha" autoComplete="new-password" required />
                {error && <MessageAlert kind="error" message={error} />}
                <Button disabled={isSubmitting} fullWidth icon={<ArrowUpRight size="var(--icon-size-17)" />} type="submit">
                  {isSubmitting ? 'Enviando…' : 'Solicitar cadastro'}
                </Button>
              </form>
              <p className="login-form__signup">Já tem uma conta? <Link to="/login">Entrar</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
