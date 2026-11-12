import { Clock3 } from 'lucide-react';
import { privateModules, type PrivateModuleKey } from '../../config/privateModules';
import './PrivateModulePage.scss';

interface PrivateModulePageProps {
  moduleKey: PrivateModuleKey;
}

export default function PrivateModulePage({
  moduleKey,
}: PrivateModulePageProps) {
  const module = privateModules[moduleKey];
  const ModuleIcon = module.icon;

  return (
    <main className="private-module-page">
      <div className="private-module-page__heading">
        <span className="private-module-page__icon">
          <ModuleIcon size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="private-module-page__title">
          <span className="eyebrow">Módulo financeiro</span>
          <h1>{module.title}</h1>
          <p>{module.description}</p>
        </div>
      </div>
      <section className="module-status" aria-label="Status do módulo">
        <span className="module-status__icon">
          <Clock3 size={19} aria-hidden="true" />
        </span>
        <div className="module-status__content">
          <span className="module-status__label">Em andamento</span>
          <p>Este módulo está sendo preparado e estará disponível em breve.</p>
        </div>
        <span className="module-status__badge">Em andamento</span>
      </section>
    </main>
  );
}
