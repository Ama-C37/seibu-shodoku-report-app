import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function PrimaryButton({ icon, variant = 'primary', children, className = '', ...props }: Props) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
