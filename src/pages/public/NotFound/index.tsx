import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '../../../components/ui/buttons';
import './NotFound.scss';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span className="eyebrow">Erro 404</span>
      <h1>Este caminho ainda não existe.</h1>
      <p>Mas a gente pode voltar ao começo e tentar de novo.</p>
      <ButtonLink icon={<ArrowLeft size={16} />} iconPosition="leading" to="/">
        Ir para o início
      </ButtonLink>
    </main>
  );
}
