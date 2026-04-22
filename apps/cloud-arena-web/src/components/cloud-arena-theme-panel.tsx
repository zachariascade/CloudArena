import type { ReactElement } from "react";

import {
  cloudArenaThemeFields,
  defaultCloudArenaTheme,
  type CloudArenaTheme,
  type CloudArenaThemeKey,
} from "../lib/cloud-arena-theme.js";

type CloudArenaThemePanelProps = {
  theme: CloudArenaTheme;
  onChange: (key: CloudArenaThemeKey, value: string) => void;
  onReset: () => void;
};

export function CloudArenaThemePanel({
  theme,
  onChange,
  onReset,
}: CloudArenaThemePanelProps): ReactElement {
  return (
    <section className="panel cloud-arena-theme-panel">
      <div className="cloud-arena-theme-header">
        <div>
          <div className="section-kicker">Theme</div>
          <strong>Recolor the shell</strong>
        </div>
        <button type="button" className="ghost-button cloud-arena-theme-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="cloud-arena-theme-grid">
        {cloudArenaThemeFields.map((field) => (
          <label key={field.key} className="field cloud-arena-theme-field">
            <span>{field.label}</span>
            <input
              type="color"
              value={theme[field.key] ?? defaultCloudArenaTheme[field.key]}
              aria-label={field.label}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
            <small>{field.description}</small>
          </label>
        ))}
      </div>

      <p className="cloud-arena-theme-note">
        These colors affect the UI shell, menus, panels, and shared chrome. Card faces keep their own styling.
      </p>
    </section>
  );
}
