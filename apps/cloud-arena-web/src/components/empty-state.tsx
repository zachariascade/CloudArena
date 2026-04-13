import type { ReactElement, ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function EmptyState({ title, description, actions }: EmptyStateProps): ReactElement {
  return (
    <section className="panel empty-state">
      <div>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
      {actions}
    </section>
  );
}
