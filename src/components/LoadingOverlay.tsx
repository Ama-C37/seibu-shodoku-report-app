import type { ReactNode } from 'react';

type Props = {
  loading: boolean;
  children: ReactNode;
};

export function LoadingOverlay({ loading, children }: Props) {
  return (
    <div className="loading-wrap">
      {children}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      ) : null}
    </div>
  );
}
