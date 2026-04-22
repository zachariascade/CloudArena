import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

type CloudArenaAppShellProps = {
  children: ReactNode;
  cloudArcanumWebBaseUrl: string;
  sidebarContent?: ReactNode;
};

const navigationItems = [
  { to: "/", label: "Start", end: true },
  { to: "/battle", label: "Battle", end: true },
  { to: "/decks", label: "Deck Builder", end: true },
];

const headerRevealThresholdPx = 28;
const headerHideDelayMs = 220;

export function CloudArenaAppShell({
  children,
  cloudArcanumWebBaseUrl,
  sidebarContent,
}: CloudArenaAppShellProps): ReactElement {
  const cloudArcanumCardsUrl = `${cloudArcanumWebBaseUrl.replace(/\/$/, "")}/cards`;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const hideHeaderTimeoutRef = useRef<number | null>(null);
  const pointerYRef = useRef(Number.POSITIVE_INFINITY);
  const isPointerOverHeaderRef = useRef(false);

  function clearHideHeaderTimeout(): void {
    if (hideHeaderTimeoutRef.current !== null) {
      window.clearTimeout(hideHeaderTimeoutRef.current);
      hideHeaderTimeoutRef.current = null;
    }
  }

  function showHeader(): void {
    clearHideHeaderTimeout();
    setIsHeaderVisible(true);
  }

  function scheduleHideHeader(): void {
    clearHideHeaderTimeout();
    hideHeaderTimeoutRef.current = window.setTimeout(() => {
      setIsHeaderVisible(false);
      hideHeaderTimeoutRef.current = null;
    }, headerHideDelayMs);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsHeaderVisible(true);
      return;
    }

    function onWindowPointerMove(event: PointerEvent): void {
      if (event.pointerType !== "mouse") {
        return;
      }

      pointerYRef.current = event.clientY;

      if (event.clientY <= headerRevealThresholdPx || isSidebarOpen || isPointerOverHeaderRef.current) {
        showHeader();
        return;
      }

      scheduleHideHeader();
    }

    window.addEventListener("pointermove", onWindowPointerMove);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      clearHideHeaderTimeout();
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    function onWindowKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    if (isSidebarOpen || isPointerOverHeaderRef.current || pointerYRef.current <= headerRevealThresholdPx) {
      showHeader();
      return;
    }

    scheduleHideHeader();
  }, [isSidebarOpen]);

  return (
    <main className="app-shell">
      <header
        className={`panel app-header${isHeaderVisible || isSidebarOpen ? " is-visible" : ""}`}
        aria-hidden={!isHeaderVisible && !isSidebarOpen}
        onMouseEnter={() => {
          isPointerOverHeaderRef.current = true;
          showHeader();
        }}
        onMouseLeave={() => {
          isPointerOverHeaderRef.current = false;
          if (!isSidebarOpen && pointerYRef.current > headerRevealThresholdPx) {
            scheduleHideHeader();
          }
        }}
      >
        <section className="app-header-brand">
          <h1>Cloud Arena</h1>
        </section>
        <button
          type="button"
          className="cloud-arena-menu-button"
          tabIndex={isHeaderVisible || isSidebarOpen ? 0 : -1}
          aria-expanded={isSidebarOpen}
          aria-controls="cloud-arena-menu-sidebar"
          onClick={() => setIsSidebarOpen((current) => !current)}
        >
          <span className="cloud-arena-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Menu</span>
        </button>
      </header>
      <div className="app-shell-stage">
        <button
          type="button"
          className={`app-shell-backdrop${isSidebarOpen ? " is-open" : ""}`}
          aria-label="Close menu"
          aria-hidden={!isSidebarOpen}
          tabIndex={isSidebarOpen ? 0 : -1}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          id="cloud-arena-menu-sidebar"
          className={`panel app-shell-sidebar${isSidebarOpen ? " is-open" : ""}`}
          aria-label="Cloud Arena menu"
        >
          <div className="app-shell-sidebar-section">
            <strong>Navigate</strong>
            <nav className="app-shell-sidebar-nav" aria-label="Primary">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <a href={cloudArcanumCardsUrl} onClick={() => setIsSidebarOpen(false)}>
                Card Catalog
              </a>
            </nav>
          </div>

          {sidebarContent ? <div className="app-shell-sidebar-section">{sidebarContent}</div> : null}
        </aside>
        <div className="app-shell-stage-content">{children}</div>
      </div>
    </main>
  );
}
