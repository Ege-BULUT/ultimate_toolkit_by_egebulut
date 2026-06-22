import React, { useState, useEffect, useCallback } from "react";
import { PluginRegistry } from "./PluginRegistry";
import { PluginCard } from "../../components/PluginCard";
import { CustomPluginLoader } from "../../components/CustomPluginLoader";
import type { PluginDefinition } from "../../types";
import { Tooltip } from "../../components/Tooltip";

interface PluginManagerProps {
  activePlugins: Set<string>;
  onTogglePlugin: (id: string, active: boolean) => void;
  onOpenPlugin: (id: string) => void;
}

/**
 * Plugin Manager — lists all available plugins with toggle/configure.
 */
export const PluginManager: React.FC<PluginManagerProps> = ({
  activePlugins,
  onTogglePlugin,
  onOpenPlugin,
}) => {
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setPlugins(PluginRegistry.getAllDefinitions());
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
          Plugins
        </h2>
        <Tooltip text="Total plugins installed">
          <span className="text-xs px-2 py-1 rounded-full" style={{
            background: "var(--color-surface-hover)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
          }}>
            {plugins.length} installed
          </span>
        </Tooltip>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Activate plugins to extend your toolkit functionality.
        Each plugin can be configured independently.
      </p>

      {plugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No plugins loaded. This is unusual — try restarting the app.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            isActive={activePlugins.has(plugin.id)}
            onToggle={(active) => onTogglePlugin(plugin.id, active)}
            onConfigure={() => onOpenPlugin(plugin.id)}
          />
        ))}
      </div>

      <div className="mt-6">
        <CustomPluginLoader onPluginLoaded={refresh} />
      </div>
    </div>
  );
};
