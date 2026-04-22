import { useEffect, useState } from "react";

export type CloudArenaThemeKey = "bg" | "surface" | "ink" | "muted" | "accent" | "border";

export type CloudArenaTheme = Record<CloudArenaThemeKey, string>;

export type CloudArenaThemeField = {
  key: CloudArenaThemeKey;
  label: string;
  description: string;
};

type CloudArenaThemeCssVariables = Record<
  | "--arena-ui-bg"
  | "--arena-ui-surface"
  | "--arena-ui-ink"
  | "--arena-ui-muted"
  | "--arena-ui-accent"
  | "--arena-ui-accent-strong"
  | "--arena-ui-border"
  | "--arena-ui-shadow"
  | "--arena-ui-backdrop"
  | "--bg"
  | "--panel"
  | "--ink"
  | "--muted"
  | "--accent"
  | "--accent-strong"
  | "--border",
  string
>;

export const cloudArenaThemeStorageKey = "cloud-arena-theme";

export const defaultCloudArenaTheme: CloudArenaTheme = {
  bg: "#f7f0e6",
  surface: "#fffdf8",
  ink: "#1c1713",
  muted: "#5f544c",
  accent: "#9a3412",
  border: "#8a7d72",
};

export const cloudArenaThemeFields: CloudArenaThemeField[] = [
  {
    key: "bg",
    label: "Background",
    description: "The page canvas and outer shell backdrop.",
  },
  {
    key: "surface",
    label: "Surface",
    description: "Panels, headers, and shared controls.",
  },
  {
    key: "ink",
    label: "Ink",
    description: "Primary text and strong contrast elements.",
  },
  {
    key: "muted",
    label: "Muted",
    description: "Secondary labels and supporting copy.",
  },
  {
    key: "accent",
    label: "Accent",
    description: "Buttons, active states, and highlights.",
  },
  {
    key: "border",
    label: "Border",
    description: "Outlines and separators across the shell.",
  },
];

function normalizeThemeValue(value: string | null | undefined, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/iu.test(trimmedValue)) {
    return trimmedValue;
  }

  return fallback;
}

function readThemeStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCloudArenaTheme(storage: Storage | null = readThemeStorage()): CloudArenaTheme {
  if (!storage) {
    return defaultCloudArenaTheme;
  }

  const rawTheme = storage.getItem(cloudArenaThemeStorageKey);

  if (!rawTheme) {
    return defaultCloudArenaTheme;
  }

  try {
    const parsedTheme = JSON.parse(rawTheme) as Partial<CloudArenaTheme>;

    return {
      bg: normalizeThemeValue(parsedTheme.bg, defaultCloudArenaTheme.bg),
      surface: normalizeThemeValue(parsedTheme.surface, defaultCloudArenaTheme.surface),
      ink: normalizeThemeValue(parsedTheme.ink, defaultCloudArenaTheme.ink),
      muted: normalizeThemeValue(parsedTheme.muted, defaultCloudArenaTheme.muted),
      accent: normalizeThemeValue(parsedTheme.accent, defaultCloudArenaTheme.accent),
      border: normalizeThemeValue(parsedTheme.border, defaultCloudArenaTheme.border),
    };
  } catch {
    return defaultCloudArenaTheme;
  }
}

function colorChannelToHex(channel: number): string {
  return channel.toString(16).padStart(2, "0");
}

function hexToRgbChannels(hexColor: string): [number, number, number] | null {
  const cleanedColor = hexColor.trim().replace(/^#/, "");

  if (cleanedColor.length === 3) {
    const expandedColor = cleanedColor
      .split("")
      .map((channel) => `${channel}${channel}`)
      .join("");

    return hexToRgbChannels(expandedColor);
  }

  if (cleanedColor.length !== 6) {
    return null;
  }

  const red = Number.parseInt(cleanedColor.slice(0, 2), 16);
  const green = Number.parseInt(cleanedColor.slice(2, 4), 16);
  const blue = Number.parseInt(cleanedColor.slice(4, 6), 16);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return [red, green, blue];
}

function mixHexColors(leftColor: string, rightColor: string, ratio: number): string {
  const boundedRatio = Math.max(0, Math.min(1, ratio));
  const leftChannels = hexToRgbChannels(leftColor);
  const rightChannels = hexToRgbChannels(rightColor);

  if (!leftChannels || !rightChannels) {
    return leftColor;
  }

  const mixedChannels = leftChannels.map((leftChannel, index) => {
    const rightChannel = rightChannels[index] ?? leftChannel;
    return Math.round(leftChannel * (1 - boundedRatio) + rightChannel * boundedRatio);
  });

  return `#${mixedChannels.map(colorChannelToHex).join("")}`;
}

function rgbaFromHex(hexColor: string, alpha: number): string {
  const channels = hexToRgbChannels(hexColor);

  if (!channels) {
    return hexColor;
  }

  const boundedAlpha = Math.max(0, Math.min(1, alpha));
  const [red, green, blue] = channels;
  return `rgba(${red}, ${green}, ${blue}, ${boundedAlpha})`;
}

export function buildCloudArenaThemeCssVariables(theme: CloudArenaTheme): CloudArenaThemeCssVariables {
  const accentStrong = mixHexColors(theme.accent, "#000000", 0.24);

  return {
    "--arena-ui-bg": theme.bg,
    "--arena-ui-surface": rgbaFromHex(theme.surface, 0.9),
    "--arena-ui-ink": theme.ink,
    "--arena-ui-muted": theme.muted,
    "--arena-ui-accent": theme.accent,
    "--arena-ui-accent-strong": accentStrong,
    "--arena-ui-border": rgbaFromHex(theme.border, 0.18),
    "--arena-ui-shadow": rgbaFromHex(theme.ink, 0.08),
    "--arena-ui-backdrop": rgbaFromHex(theme.ink, 0.28),
    "--bg": theme.bg,
    "--panel": rgbaFromHex(theme.surface, 0.9),
    "--ink": theme.ink,
    "--muted": theme.muted,
    "--accent": theme.accent,
    "--accent-strong": accentStrong,
    "--border": rgbaFromHex(theme.border, 0.18),
  };
}

export function applyCloudArenaTheme(theme: CloudArenaTheme, target: HTMLElement | null = null): void {
  const element = target ?? (typeof document !== "undefined" ? document.documentElement : null);

  if (!element) {
    return;
  }

  const variables = buildCloudArenaThemeCssVariables(theme);

  for (const [key, value] of Object.entries(variables)) {
    element.style.setProperty(key, value);
  }
}

export function persistCloudArenaTheme(theme: CloudArenaTheme, storage: Storage | null = readThemeStorage()): void {
  if (!storage) {
    return;
  }

  storage.setItem(cloudArenaThemeStorageKey, JSON.stringify(theme));
}

export function useCloudArenaTheme() {
  const [theme, setTheme] = useState<CloudArenaTheme>(() => readCloudArenaTheme());

  useEffect(() => {
    applyCloudArenaTheme(theme);
    persistCloudArenaTheme(theme);
  }, [theme]);

  function updateThemeColor(key: CloudArenaThemeKey, value: string): void {
    setTheme((currentTheme) => ({
      ...currentTheme,
      [key]: value,
    }));
  }

  function resetTheme(): void {
    setTheme(defaultCloudArenaTheme);
  }

  return {
    theme,
    resetTheme,
    updateThemeColor,
  };
}
