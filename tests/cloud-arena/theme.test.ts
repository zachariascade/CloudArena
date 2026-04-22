import { describe, expect, it } from "vitest";

import {
  buildCloudArenaThemeCssVariables,
  defaultCloudArenaTheme,
  readCloudArenaTheme,
  cloudArenaThemeStorageKey,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-theme.js";

describe("cloud arena theme", () => {
  it("falls back to the default palette when storage is empty or invalid", () => {
    const storage = {
      clear() {},
      key() {
        return null;
      },
      length: 0,
      getItem() {
        return null;
      },
      removeItem() {},
      setItem() {},
    } as Storage;

    expect(readCloudArenaTheme(storage)).toEqual(defaultCloudArenaTheme);
  });

  it("builds shell css variables without touching the card palette", () => {
    const variables = buildCloudArenaThemeCssVariables({
      bg: "#111111",
      surface: "#222222",
      ink: "#eeeeee",
      muted: "#aaaaaa",
      accent: "#ff6600",
      border: "#444444",
    });

    expect(variables["--arena-ui-bg"]).toBe("#111111");
    expect(variables["--arena-ui-surface"]).toBe("rgba(34, 34, 34, 0.9)");
    expect(variables["--arena-ui-accent"]).toBe("#ff6600");
    expect(variables["--bg"]).toBe("#111111");
    expect(variables["--accent-strong"]).toBe("#c24e00");
    expect(variables["--panel"]).toBe("rgba(34, 34, 34, 0.9)");
    expect(variables["--ink"]).toBe("#eeeeee");
    expect(variables["--border"]).toBe("rgba(68, 68, 68, 0.18)");
  });

  it("reads a stored theme when the json is valid", () => {
    const storage = {
      getItem(key: string) {
        if (key !== cloudArenaThemeStorageKey) {
          return null;
        }

        return JSON.stringify({
          bg: "#010101",
          surface: "#020202",
          ink: "#030303",
          muted: "#040404",
          accent: "#050505",
          border: "#060606",
        });
      },
    } as Storage;

    expect(readCloudArenaTheme(storage)).toEqual({
      bg: "#010101",
      surface: "#020202",
      ink: "#030303",
      muted: "#040404",
      accent: "#050505",
      border: "#060606",
    });
  });
});
