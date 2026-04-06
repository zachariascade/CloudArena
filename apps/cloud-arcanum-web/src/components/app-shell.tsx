import type { ReactElement, ReactNode } from "react";
import { NavLink } from "react-router-dom";

type NavigationItem = {
  to: string;
  label: string;
  end?: boolean;
};

type AppShellProps = {
  children: ReactNode;
};

const navigationItems: NavigationItem[] = [
  { to: "/cards", label: "Cards" },
  { to: "/decks", label: "Decks" },
  { to: "/sets", label: "Sets" },
  { to: "/universes", label: "Universes" },
  { to: "/cloud-arena", label: "Cloud Arena" },
  { to: "/cloud-arena/trace-viewer", label: "Replay" },
];

export function AppShell({ children }: AppShellProps): ReactElement {
  return (
    <main className="app-shell">
      <header className="app-header">
        <section className="panel brand-block">
          <h1>Cloud Arcanum</h1>
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
        </nav>
      </header>
      <div style={{ height: "1.5rem" }} />
      {children}
    </main>
  );
}
