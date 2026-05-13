// src/context/SettingsContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "../apiUrl";

// ── Defaults (match CSS :root fallbacks) ──────────────────
const DEFAULTS = {
  primary_color: "#c9a96e",
  primary_color_hover: "#a07a52",
  page_bg_color: "#faf9f7",
  card_bg_color: "#ffffff",
  card_border_color: "#e8e0d4",
  text_color_dark: "#1c1c1c",
  text_color_muted: "#888888",
  heading_font: "Playfair Display, Georgia, serif",
  body_font: "Jost, sans-serif",
  google_fonts_url: "",
  app_name: "",
  app_eyebrow: "Our Portfolio",
  app_tagline: "Exceptional",
  app_tagline_italic: "Properties",
  app_subtitle: "Discover handcrafted developments built for modern living",
  app_logo_dark_url: null,
  app_logo_light_url: null,
};

const SettingsContext = createContext({
  settings: DEFAULTS,
  isLoaded: false,
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        // Merge with defaults so missing keys always have a value
        const merged = { ...DEFAULTS, ...data };
        setSettings(merged);

        // Apply CSS variables to :root
        const root = document.documentElement;
        const set = (key, val) => {
          const trimmed = (val || "").trim();
          if (trimmed) root.style.setProperty(key, trimmed);
        };

        set("--primary-color", merged.primary_color);
        set("--primary-hover", merged.primary_color_hover);
        set("--page-bg", merged.page_bg_color);
        set("--card-bg", merged.card_bg_color);
        set("--card-border", merged.card_border_color);
        set("--text-dark", merged.text_color_dark);
        set("--text-muted", merged.text_color_muted);
        set("--font-heading", merged.heading_font);
        set("--font-body", merged.body_font);

        // Load Google Font
        if (merged.google_fonts_url) {
          let link = document.getElementById("dynamic-gfonts");
          if (!link) {
            link = document.createElement("link");
            link.id = "dynamic-gfonts";
            link.rel = "stylesheet";
            document.head.appendChild(link);
          }
          link.href = merged.google_fonts_url;
        }

        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Settings fetch failed:", err);
        // Still mark loaded so app doesn't hang — defaults will be used
        setIsLoaded(true);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}
