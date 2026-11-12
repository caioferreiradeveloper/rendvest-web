import { useEffect, useState } from 'react';
import './BankLogo.scss';

interface BankLogoProps {
  label: string;
  logoDomain?: string;
  size?: 'small' | 'medium';
}

function getInitials(label: string): string {
  if (label === 'Não informado') {
    return '—';
  }

  const words = label.split(/\s+/).filter(Boolean);
  return words.length > 1
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : label.slice(0, 2).toUpperCase();
}

export default function BankLogo({
  label,
  logoDomain,
  size = 'medium',
}: BankLogoProps) {
  const [hasImageError, setHasImageError] = useState(!logoDomain);
  const logoUrl = logoDomain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=64`
    : null;

  useEffect(() => {
    setHasImageError(!logoUrl);
  }, [logoUrl]);

  return (
    <span
      aria-hidden="true"
      className={`bank-logo bank-logo--${size}`}
      title={label}
    >
      {logoUrl && !hasImageError ? (
        <img
          alt=""
          loading="lazy"
          onError={() => setHasImageError(true)}
          src={logoUrl}
        />
      ) : (
        <span className="bank-logo__fallback">{getInitials(label)}</span>
      )}
    </span>
  );
}
