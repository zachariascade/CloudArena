import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CloudArenaAppShell } from "../components/index.js";
import { createCloudArenaRunLocation, type CloudArenaContentMode } from "../lib/cloud-arena-web-lib.js";

type CloudArenaStartPageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  cloudArcanumWebBaseUrl: string;
};

export function CloudArenaStartPage({
  cloudArcanumWebBaseUrl,
}: CloudArenaStartPageProps): ReactElement {
  const navigate = useNavigate();

  function handleNewRun(): void {
    navigate(createCloudArenaRunLocation("master_deck", "demon_pack"));
  }

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
      <section className="cloud-arena-start-screen">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-start-hero">
          <div className="cloud-arena-start-copy">
            <h2>Cloud Arena</h2>
          </div>

          <div className="cloud-arena-start-stage">
            <div className="cloud-arena-start-menu">
              <button
                type="button"
                className="cloud-arena-start-menu-item is-primary"
                onClick={handleNewRun}
              >
                <strong>New Run</strong>
              </button>
              <Link className="cloud-arena-start-menu-item" to="/campaign">
                <strong>Campaign</strong>
              </Link>
              <Link className="cloud-arena-start-menu-item" to="/decks">
                <strong>Deck Builder</strong>
              </Link>
              <Link className="cloud-arena-start-menu-item" to="/bestiary">
                <strong>Bestiary</strong>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CloudArenaAppShell>
  );
}
