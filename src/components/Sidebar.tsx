import React from "react";
import { Tooltip } from "./Tooltip";

export type Page = "plugins" | "settings" | string;

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  pluginList: { id: string; name: string; icon: string }[];
  activePlugins: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  pluginList,
  activePlugins,
}) => {
  return (
    <aside
      className="flex flex-col h-full border-r overflow-y-auto"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--color-surface-alt)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo / Header */}
      <div
        className="px-5 py-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--color-accent)" }}
          >
            UT
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Ultimate Toolkit
            </h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              v0.1.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Plugins section header */}
        <p
          className="px-2 text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Plugins
        </p>

        {pluginList.map((p) => (
          <Tooltip key={p.id} text={activePlugins.has(p.id) ? `${p.name} — Active` : `${p.name} — Click to configure`}>
            <button
              onClick={() => onNavigate(p.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activePage === p.id ? "var(--color-surface-hover)" : "transparent",
                color: "var(--color-text-primary)",
              }}
              onMouseEnter={(e) => {
                if (activePage !== p.id)
                  (e.currentTarget as HTMLElement).style.background = "var(--color-surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (activePage !== p.id)
                  (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="flex-1 text-left">{p.name}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: activePlugins.has(p.id)
                    ? "var(--color-success)"
                    : "var(--color-text-muted)",
                }}
              />
            </button>
          </Tooltip>
        ))}

        <div className="my-3 border-t" style={{ borderColor: "var(--color-border)" }} />

        <Tooltip text="Application settings — theme, updates, and preferences">
          <button
            onClick={() => onNavigate("settings")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activePage === "settings" ? "var(--color-surface-hover)" : "transparent",
              color: "var(--color-text-primary)",
            }}
            onMouseEnter={(e) => {
              if (activePage !== "settings")
                (e.currentTarget as HTMLElement).style.background = "var(--color-surface-hover)";
            }}
            onMouseLeave={(e) => {
              if (activePage !== "settings")
                (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </button>
        </Tooltip>
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-3 border-t text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <Tooltip text="View the project on GitHub">
          <a
            href="https://github.com/egebulut/ultimate_toolkit_by_egebulut"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            GitHub ↗
          </a>
        </Tooltip>
      </div>
    </aside>
  );
};
