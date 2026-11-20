import React from 'react';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export default function SurfaceCard({ className = '', interactive = false, ...props }: SurfaceCardProps) {
  return <div className={`surface-card ${interactive ? 'surface-card-interactive' : ''} ${className}`} {...props} />;
}
