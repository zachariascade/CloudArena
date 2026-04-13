import type { ReactElement } from "react";

type LoadingStateProps = {
  title: string;
  description: string;
};

export function LoadingState({
  title,
  description,
}: LoadingStateProps): ReactElement {
  return (
    <section className="panel empty-state loading-state" aria-live="polite">
      <div className="loading-pulse" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
    </section>
  );
}
