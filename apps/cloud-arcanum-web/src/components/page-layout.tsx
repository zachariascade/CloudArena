import type { ReactElement, ReactNode } from "react";

type PageLayoutProps = {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageLayout({
  kicker,
  title,
  description,
  children,
}: PageLayoutProps): ReactElement {
  return (
    <section className="panel">
      <header className="section-header">
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}
