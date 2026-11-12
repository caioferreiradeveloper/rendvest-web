import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Compass,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../../../components/ui/buttons';
import './Home.scss';

const highlights = [
  {
    icon: Target,
    title: 'Metas com propósito',
    description:
      'Dê nome aos seus planos e acompanhe cada passo, sem perder de vista o que importa.',
  },
  {
    icon: Compass,
    title: 'Mais clareza no caminho',
    description:
      'Organize suas prioridades em um só lugar e transforme intenção em rotina.',
  },
  {
    icon: ShieldCheck,
    title: 'No seu ritmo',
    description:
      'Planejamento simples, feito para acompanhar sua vida — não para complicá-la.',
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="container hero">
          <div className="hero__copy">
            <span className="eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              Seu dinheiro, com mais intenção
            </span>
            <h1>
              Um futuro mais leve começa com <em>um plano possível.</em>
            </h1>
            <p className="hero__description">
              Organize suas metas financeiras com clareza e dê o próximo passo
              com confiança. Sem complicação — do seu jeito.
            </p>
            <div className="hero__actions">
              <ButtonLink icon={<ArrowUpRight size={17} />} to="/login">
                Comece por aqui
              </ButtonLink>
              <Link className="text-link" to="/sobre">
                Conheça a Rendvest <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero__reassurance">
              <span className="hero__reassurance-icon" aria-hidden="true">
                <Check size={14} />
              </span>
              Um passo de cada vez já é progresso.
            </div>
          </div>

          <div
            className="hero-visual"
            role="img"
            aria-label="Ilustração de metas financeiras"
          >
            <div className="hero-visual__glow" />
            <div className="hero-note">
              <span className="hero-note__icon" aria-hidden="true">
                <Leaf size={17} />
              </span>
              <span>
                <strong>Planos que crescem</strong>
                <small>no seu tempo</small>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </div>
            <div className="goal-card">
              <div className="goal-card__top">
                <span>SEU PRÓXIMO CAPÍTULO</span>
                <span className="goal-card__dots" aria-hidden="true">
                  ···
                </span>
              </div>
              <div className="goal-card__title-row">
                <span className="goal-card__icon">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>Uma meta de cada vez</strong>
                  <span>Pequenos passos, grandes planos</span>
                </div>
              </div>
              <div className="goal-card__divider" />
              <div className="goal-card__progress-label">
                <span>Seu plano começa aqui</span>
                <span>01 / 03</span>
              </div>
              <div className="progress-track">
                <span />
              </div>
              <div className="goal-card__bottom">
                <span>
                  <Check size={13} aria-hidden="true" /> Clareza para decidir
                </span>
                <ArrowDownRight size={16} aria-hidden="true" />
              </div>
            </div>
            <div className="hero-sticker" aria-hidden="true">
              <span>cresça</span>
              <span>com calma</span>
              <Leaf size={16} />
            </div>
          </div>
        </div>
        <div className="hero-section__bottom container">
          <span>PLANEJAR TAMBÉM É CUIDAR DE SI</span>
          <a href="#como-funciona">
            Descubra um jeito mais leve <ArrowDownRight size={15} />
          </a>
        </div>
      </section>

      <section className="intro-section" id="como-funciona">
        <div className="container intro">
          <div className="section-heading">
            <span className="eyebrow">O que muda quando você planeja</span>
            <h2>
              Menos ruído.
              <br />
              Mais <em>intenção.</em>
            </h2>
          </div>
          <p className="intro__text">
            Cuidar do dinheiro não precisa ser complicado. A Rendvest ajuda você
            a enxergar prioridades e seguir em frente com escolhas que fazem
            sentido para a sua vida.
          </p>
        </div>
        <div className="container feature-grid">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-card__top">
                <span className="feature-card__icon">
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="feature-card__number">0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-card">
          <div className="closing-card__decoration" aria-hidden="true">
            <CircleHelp size={42} strokeWidth={1} />
          </div>
          <span className="eyebrow eyebrow--light">O próximo passo é seu</span>
          <h2>Seus planos merecem sair do papel.</h2>
          <p>Comece hoje. O caminho se constrói um passo de cada vez.</p>
          <ButtonLink
            icon={<ArrowUpRight size={17} />}
            to="/login"
            variant="light"
          >
            Vamos começar
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
