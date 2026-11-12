import { ArrowUpRight, Compass, Heart, Leaf, Target } from 'lucide-react';
import { ButtonLink } from '../../../components/ui/buttons';
import './About.scss';

const principles = [
  {
    icon: Compass,
    title: 'Clareza antes de tudo',
    description: 'Informação organizada para apoiar escolhas mais conscientes.',
  },
  {
    icon: Heart,
    title: 'Respeito ao seu momento',
    description: 'Cada pessoa tem seu ritmo, seus planos e suas prioridades.',
  },
  {
    icon: Target,
    title: 'Progresso possível',
    description: 'Pequenas decisões também podem levar a grandes mudanças.',
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="page-heading page-heading--about">
        <div className="container page-heading__inner">
          <span className="eyebrow">Sobre a Rendvest</span>
          <h1>Planejar o futuro pode ser mais simples.</h1>
          <p>
            Um projeto que acredita que cuidar do dinheiro começa com clareza,
            boas perguntas e passos que cabem na vida real.
          </p>
        </div>
        <Leaf className="page-heading__leaf" size={150} strokeWidth={0.8} />
      </section>
      <section className="container about-story">
        <div className="about-story__label">
          <span>01</span>
          <span>A ideia</span>
        </div>
        <div className="about-story__content">
          <span className="eyebrow">Um pouco sobre o projeto</span>
          <h2>
            Mais espaço para o que realmente <em>importa.</em>
          </h2>
          <p>
            A Rendvest é um projeto digital voltado à organização financeira e
            ao planejamento de objetivos. A proposta é ajudar cada pessoa a
            visualizar seus planos com mais tranquilidade, sem transformar
            finanças em algo distante ou difícil de entender.
          </p>
          <p>
            Este é o começo de uma plataforma em construção. As páginas e os
            formulários já dão forma à experiência; serviços de conta,
            autenticação e envio de mensagens ainda precisam ser conectados.
          </p>
        </div>
      </section>
      <section className="principles-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <span className="eyebrow">O que guia a experiência</span>
            <h2>
              Simples por escolha.
              <br />
              <em>Feito para pessoas.</em>
            </h2>
          </div>
          <div className="principle-grid">
            {principles.map(({ icon: Icon, title, description }) => (
              <article className="principle-card" key={title}>
                <span className="principle-card__icon">
                  <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container creator-section">
        <div className="creator-section__mark" aria-hidden="true">
          <Leaf size={27} strokeWidth={1.5} />
        </div>
        <div>
          <span className="eyebrow">Quem está por trás</span>
          <h2>Uma ideia em construção, com propósito.</h2>
          <p>
            A Rendvest está sendo desenvolvida como um projeto independente. A
            apresentação pessoal e a trajetória de seu criador serão incluídas
            aqui quando essas informações estiverem definidas.
          </p>
        </div>
      </section>
      <section className="container about-cta">
        <div>
          <span className="eyebrow">Quer saber mais?</span>
          <h2>Estamos abertos à conversa.</h2>
        </div>
        <ButtonLink icon={<ArrowUpRight size={17} />} to="/contato">
          Entre em contato
        </ButtonLink>
      </section>
    </main>
  );
}
