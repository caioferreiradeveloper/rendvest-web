import type { CSSProperties } from 'react';
import './Skeleton.scss';

export default function Skeleton({ width = '100%', height = 12, className }: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}) {
  return <span aria-hidden="true" className={['skeleton', className].filter(Boolean).join(' ')} style={{ width, height }} />;
}
