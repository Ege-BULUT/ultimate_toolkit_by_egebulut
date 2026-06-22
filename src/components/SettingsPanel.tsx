import React from "react";
import { Tooltip } from "./Tooltip";
import type { Theme } from "../types";

interface SettingsPanelProps {
  theme: Theme;
  autoUpdate: boolean;
  onThemeChange: (theme: Theme) => void;
  onAutoUpdateChange: (enabled: boolean) => void;
  updateInfo: { available: boolean; version: string | null; download_url: string | null } | null;
  checkingUpdate: boolean;
  onCheckUpdate: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: string; desc: string }[] = [
  { value: "light", label: "Light", icon: "☀️", desc: "Bright interface for daytime use" },
  { value: "dark", label: "Dark", icon: "🌙", desc: "Easy on the eyes in low light" },
  { value: "system", label: "System", icon: "💻", desc: "Follows your system theme" },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  autoUpdate,
  onThemeChange,
  onAutoUpdateChange,
  updateInfo,
  checkingUpdate,
  onCheckUpdate,
}) => {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Settings
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Customize your toolkit experience
      </p>

      {/* ──────── Theme ──────── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Appearance
        </h3>
        <div className="flex gap-3">
          {THEME_OPTIONS.map((opt) => (
            <Tooltip key={opt.value} text={opt.desc}>
              <button
                onClick={() => onThemeChange(opt.value)}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:
                    theme === opt.value
                      ? "var(--color-accent)"
                      : "var(--color-surface-alt)",
                  color:
                    theme === opt.value ? "#fff" : "var(--color-text-primary)",
                  border:
                    theme === opt.value
                      ? "2px solid var(--color-accent)"
                      : "2px solid var(--color-border)",
                }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* ──────── Updates ──────── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Updates
        </h3>

        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              Automatic update checks
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Check for new versions on startup
            </p>
          </div>
          <Tooltip text={autoUpdate ? "Disable auto-update" : "Enable auto-update"}>
            <label className="toggle">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => onAutoUpdateChange(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </Tooltip>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Tooltip text="Check for new updates now">
            <button
              onClick={onCheckUpdate}
              disabled={checkingUpdate}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                opacity: checkingUpdate ? 0.6 : 1,
              }}
            >
              {checkingUpdate ? "Checking..." : "Check for Updates"}
            </button>
          </Tooltip>

          {updateInfo && (
            <span
              className="text-xs font-medium"
              style={{
                color: updateInfo.available
                  ? "var(--color-success)"
                  : "var(--color-text-muted)",
              }}
            >
              {updateInfo.available
                ? `✨ v${updateInfo.version} available!`
                : "✓ You're on the latest version"}
            </span>
          )}
        </div>
      </section>

      {/* ──────── About ──────── */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          About
        </h3>
        <div
          className="p-4 rounded-xl text-sm leading-relaxed"
          style={{
            background: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          <p>
            <strong style={{ color: "var(--color-text-primary)" }}>Ultimate Toolkit</strong> v0.1.0
          </p>
          <p className="mt-1">
            A modern, open-source Windows utility toolkit. Built with Tauri + React + Rust.
          </p>
          <p className="mt-1">
            Created by{" "}
            <a
              href="https://github.com/egebulut"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)" }}
            >
              Ege Bulut
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};
