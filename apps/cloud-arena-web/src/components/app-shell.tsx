import type { ReactElement, ReactNode } from "react";

type CloudArenaAppShellProps = {
  children: ReactNode;
  cloudArcanumWebBaseUrl: string;
  sidebarContent?: ReactNode;
  fullBleed?: boolean;
  pageVariant?: "default" | "battle";
};

const feedbackFormUrl = "https://forms.gle/tgCeYHQ6s1WjPUjw8";

export function CloudArenaAppShell({
  children,
  fullBleed = false,
  pageVariant = "default",
}: CloudArenaAppShellProps): ReactElement {
  return (
    <main className={`app-shell${fullBleed ? " is-full-bleed" : ""}${pageVariant === "battle" ? " is-battle-page" : ""}`}>
      <div className="app-shell-stage">
        <div className="app-shell-stage-content">{children}</div>
      </div>
      <a
        className="cloud-arena-feedback-button"
        href={feedbackFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Feedback"
        title="Feedback"
      >
        <svg
          className="cloud-arena-feedback-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4 4.75A2.75 2.75 0 0 1 6.75 2h10.5A2.75 2.75 0 0 1 20 4.75v9.5A2.75 2.75 0 0 1 17.25 17H9.1l-3.62 3.02A1 1 0 0 1 4 19.25V4.75Zm2.75-.75A.75.75 0 0 0 6 4.75v12.37l2.31-1.93A1 1 0 0 1 8.95 15h8.3a.75.75 0 0 0 .75-.75v-9.5A.75.75 0 0 0 17.25 4H6.75Z" />
        </svg>
        <span className="sr-only">Feedback</span>
      </a>
    </main>
  );
}
