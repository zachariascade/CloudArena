import type { ReactElement, ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description: string;
  details?: ReactNode;
};

export function ErrorState({
  title,
  description,
  details,
}: ErrorStateProps): ReactElement {
  return (
    <section className="panel empty-state error-state">
      <div>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
      {details ? <div className="error-details">{details}</div> : null}
    </section>
  );
}
