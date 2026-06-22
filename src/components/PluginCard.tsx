import React from "react";
import { Tooltip } from "./Tooltip";
import type { PluginDefinition } from "../types";

interface PluginCardProps {
  plugin: PluginDefinition;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onConfigure: () => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  isActive,
  onToggle,
  onConfigure,
}) => {
  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: "var(--color-surface-alt)",
        border: "1px solid var(--color-border)",
        opacity: isActive ? 1 : 0.6,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{plugin.icon}</span>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              {plugin.name}
            </h3>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              v{plugin.version} · {plugin.author}
            </p>
          </div>
        </div>

        <Tooltip text={isActive ? "Deactivate plugin" : "Activate plugin"}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </Tooltip>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
        {plugin.description}
      </p>

      <div className="flex gap-2">
        <Tooltip text={`Configure ${plugin.name} settings`}>
          <button
            onClick={onConfigure}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-accent)";
            }}
          >
            Configure
          </button>
        </Tooltip>

        {plugin.hasFloatingUI && (
          <Tooltip text={`Enable floating ${plugin.name} window`}>
            <span
              className="px-4 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "var(--color-surface-hover)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {isActive ? "Floating UI active" : "Activate to use floating"}
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
