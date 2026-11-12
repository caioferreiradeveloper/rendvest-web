import { ArrowLeft, ArrowUpRight, LockKeyhole, Sprout } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  InputPassword,
  InputText,
} from '../../../components/forms/fields';
import { Button } from '../../../components/ui/buttons';
import './Login.scss';

export default function LoginPage() {
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      'A autenticação ainda não está conectada. Seus dados não foram enviados.',
    );
  }

  return (
    <main className="login-page">
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
          <form className="login-form" onSubmit={handleSubmit}>
            <InputText
              autoComplete="email"
              id="login-email"
              label="E-mail"
              name="email"
              placeholder="voce@exemplo.com"
              required
              type="email"
            />
            <InputPassword
              autoComplete="current-password"
              id="login-password"
              label="Senha"
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
              fullWidth
              icon={<ArrowUpRight size={17} />}
              type="submit"
            >
              Entrar na minha conta
            </Button>
            {notice && (
              <p className="form-notice" role="status">
                <LockKeyhole size={16} aria-hidden="true" />
                {notice}
              </p>
            )}
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
