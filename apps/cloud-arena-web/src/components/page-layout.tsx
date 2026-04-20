import type { ReactElement, ReactNode } from "react";

type PageLayoutProps = {
  kicker?: string;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function PageLayout({
  kicker,
  title,
  description,
  children,
}: PageLayoutProps): ReactElement {
  const hasHeader = kicker || title || description;

  return (
    <section className="panel page-layout">
      {hasHeader ? (
        <header className="section-header">
          {kicker ? <div className="section-kicker">{kicker}</div> : null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
