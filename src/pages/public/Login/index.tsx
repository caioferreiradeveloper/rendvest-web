import { ArrowLeft, ArrowUpRight, LockKeyhole, Sprout } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  InputPassword,
  InputText,
} from '../../../components/forms/fields';
import { Button } from '../../../components/ui/buttons';
import MessageAlert from '../../../components/ui/MessageAlert';
import { useAuth } from '../../../hooks/useAuth';
import { toApiAlert, type ApiAlertMessage } from '../../../services/api/apiFeedback';
import './Login.scss';

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = 'Informe seu e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export default function LoginPage() {
  const [notice, setNotice] = useState<ApiAlertMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: sessionError, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionError) {
      setNotice({
        kind: 'error',
        title: 'Falha ao validar a sessão',
        message: sessionError,
      });
    }
  }, [sessionError]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function handleFieldChange(event: ChangeEvent<HTMLFormElement>) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    const name = field.name;
    if (name !== 'email' && name !== 'password') {
      return;
    }

    const form = event.currentTarget;
    const email = name === 'email'
      ? field.value
      : String(new FormData(form).get('email') ?? '');
    const password = name === 'password'
      ? field.value
      : String(new FormData(form).get('password') ?? '');
    const nextErrors = validateLoginFields(email, password);

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: nextErrors[name],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') {
      setFieldErrors({
        email: 'Informe seu e-mail.',
        password: 'Informe sua senha.',
      });
      setNotice({
        kind: 'error',
        title: 'Confira os campos',
        message: 'Preencha os campos destacados para continuar.',
      });
      return;
    }

    const validationErrors = validateLoginFields(email, password);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setNotice({
        kind: 'error',
        title: 'Confira os campos',
        message: 'Preencha corretamente os campos destacados.',
      });
      const firstInvalidField = validationErrors.email
        ? 'login-email'
        : 'login-password';
      document.getElementById(firstInvalidField)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      const state = location.state as { from?: { pathname?: string } } | null;
      navigate(state?.from?.pathname ?? '/app/dashboard', { replace: true });
    } catch (error) {
      setNotice(toApiAlert(error, 'Não foi possível entrar. Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      {notice && (
        <MessageAlert
          kind={notice.kind}
          message={notice.message}
          onDismiss={() => setNotice(null)}
          title={notice.title}
        />
      )}
      <section className="login-story">
        <Link className="login-story__back" to="/">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para o início
        </Link>
        <div className="login-story__content">
          <span className="login-story__mark">
            <Sprout size={22} aria-hidden="true" />
          </span>
          <span className="eyebrow eyebrow--light">Que bom ter você aqui</span>
          <h1>
            Seus planos
            <br />
            continuam <em>crescendo.</em>
          </h1>
          <p>
            Entre no seu espaço e retome, com calma, o que você está construindo.
          </p>
          <div className="login-story__quote">
            <span aria-hidden="true">“</span>
            <p>O futuro fica mais próximo quando a gente sabe por onde começar.</p>
          </div>
        </div>
        <span className="login-story__footnote">
          Pequenos passos. Mais clareza.
        </span>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="login-form__heading">
            <span className="eyebrow">Seu espaço Rendvest</span>
            <h2>Boas-vindas de volta</h2>
            <p>Informe seus dados para continuar de onde parou.</p>
          </div>
          <form
            className="login-form"
            noValidate
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
          >
            <InputText
              autoComplete="email"
              id="login-email"
              label="E-mail"
              error={fieldErrors.email}
              name="email"
              placeholder="voce@exemplo.com"
              required
              type="email"
            />
            <InputPassword
              autoComplete="current-password"
              id="login-password"
              label="Senha"
              error={fieldErrors.password}
              name="password"
              placeholder="Sua senha"
              required
            />
            <div className="login-form__options">
              <label className="checkbox-field">
                <input name="remember" type="checkbox" />
                <span className="checkbox-field__box" aria-hidden="true" />
                <span>Manter conectado</span>
              </label>
              <Link className="form-link" to="/contato">
                Precisa de ajuda?
              </Link>
            </div>
            <Button
              disabled={isSubmitting}
              fullWidth
              icon={<ArrowUpRight size={17} />}
              type="submit"
            >
              {isSubmitting ? 'Entrando…' : 'Entrar na minha conta'}
            </Button>
          </form>
          <p className="login-form__signup">
            Ainda não tem uma conta? <Link to="/contato">Fale com a gente</Link>
          </p>
          <p className="login-form__secure">
            <LockKeyhole size={14} aria-hidden="true" />
            Seus dados ficam seguros com você.
          </p>
        </div>
      </section>
    </main>
  );
}
