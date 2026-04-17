import type { ReactElement, ReactNode } from "react";
import { NavLink } from "react-router-dom";

type CloudArenaAppShellProps = {
  children: ReactNode;
  cloudArcanumWebBaseUrl: string;
};

const navigationItems = [
  { to: "/", label: "Battle", end: true },
];

export function CloudArenaAppShell({
  children,
  cloudArcanumWebBaseUrl,
}: CloudArenaAppShellProps): ReactElement {
  const cloudArcanumCardsUrl = `${cloudArcanumWebBaseUrl.replace(/\/$/, "")}/cards`;

  return (
    <main className="app-shell">
      <header className="app-header">
        <section className="panel brand-block">
          <h1>Cloud Arena</h1>
        </section>
        <nav className="panel nav" aria-label="Primary">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
          <a href={cloudArcanumCardsUrl}>Card Catalog</a>
        </nav>
      </header>
      <div style={{ height: "1.5rem" }} />
      {children}
    </main>
  );
}
