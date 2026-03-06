using System;

namespace IronCrownPlugin
{
    /// <summary>
    /// Plugin configuration — maps to config.yaml
    /// </summary>
    [Serializable]
    public class PluginConfig
    {
        // ── API Bridge ────────────────────────────────────────────────────────
        public string ApiBaseUrl { get; set; } = "http://localhost:4000/api/bridge";
        public string ApiKey { get; set; } = "ironcrown-plugin-secret-key-change-me";

        // ── Sync Intervals (seconds) ─────────────────────────────────────────
        public int HeartbeatInterval { get; set; } = 60;
        public int PlayerSyncInterval { get; set; } = 30;
        public int JobPollingInterval { get; set; } = 10;
        public int InventorySyncInterval { get; set; } = 120;

        // ── Job Retry ─────────────────────────────────────────────────────────
        public int MaxJobAttempts { get; set; } = 3;

        // ── Plugin behavior ───────────────────────────────────────────────────
        public bool LogInventoryChanges { get; set; } = true;
        public bool LogItemPickup { get; set; } = true;
        public bool LogItemDrop { get; set; } = true;
        public bool EnableDebugLogging { get; set; } = false;

        // ── Server identity ───────────────────────────────────────────────────
        public string ServerName { get; set; } = "IronCrown Medieval RP";
        public string PluginVersion { get; set; } = "1.0.0";
    }
}
