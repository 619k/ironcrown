using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Cysharp.Threading.Tasks;
using IronCrownPlugin.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenMod.API.Plugins;
using OpenMod.Unturned.Plugins;

[assembly: PluginMetadata(
    "IronCrownPlugin",
    DisplayName = "IronCrown Plugin",
    Author = "IronCrown"
)]

namespace IronCrownPlugin
{
    public class IronCrownPlugin : OpenModUnturnedPlugin
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<IronCrownPlugin> _logger;

        private PluginConfig? _config;
        private BridgeService? _bridge;

        private Timer? _heartbeatTimer;
        private Timer? _playerSyncTimer;
        private Timer? _jobPollingTimer;
        private Timer? _inventorySyncTimer;

        // OpenMod injects IConfiguration and ILogger automatically
        public IronCrownPlugin(
            IConfiguration configuration,
            ILogger<IronCrownPlugin> logger,
            IServiceProvider serviceProvider)
            : base(serviceProvider)
        {
            _configuration = configuration;
            _logger = logger;
        }

        protected override async UniTask OnLoadAsync()
        {
            // Build config from OpenMod's IConfiguration
            _config = new PluginConfig
            {
                ApiBaseUrl            = _configuration["ApiBaseUrl"]            ?? "http://localhost:4000/api/bridge",
                ApiKey                = _configuration["ApiKey"]                ?? "ironcrown-plugin-key",
                ServerName            = _configuration["ServerName"]            ?? "IronCrown",
                HeartbeatInterval     = _configuration.GetValue("HeartbeatInterval",     60),
                PlayerSyncInterval    = _configuration.GetValue("PlayerSyncInterval",    30),
                JobPollingInterval    = _configuration.GetValue("JobPollingInterval",    10),
                InventorySyncInterval = _configuration.GetValue("InventorySyncInterval", 120),
                MaxJobAttempts        = _configuration.GetValue("MaxJobAttempts",        3),
                EnableDebugLogging    = _configuration.GetValue("EnableDebugLogging",    false),
                LogItemPickup         = _configuration.GetValue("LogItemPickup",         true),
                LogItemDrop           = _configuration.GetValue("LogItemDrop",           true),
            };

            // Create BridgeService directly — no DI needed for internal services
            _bridge = new BridgeService(_config, _logger);

            _logger.LogInformation("[IronCrown] 🏰 Plugin loading — {Server}", _config.ServerName);

            // ── Timers ──────────────────────────────────────────────────

            _heartbeatTimer = new Timer(async _ =>
            {
                try
                {
#if UNTURNED
                    await _bridge.SendHeartbeatAsync(SDG.Unturned.Provider.clients.Count);
#else
                    await _bridge.SendHeartbeatAsync(0);
#endif
                }
                catch (Exception ex) { _logger.LogError(ex, "[IronCrown] Heartbeat failed"); }
            }, null, TimeSpan.Zero, TimeSpan.FromSeconds(_config.HeartbeatInterval));

            _playerSyncTimer = new Timer(async _ =>
            {
                try { await SyncPlayersAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "[IronCrown] Player sync failed"); }
            }, null, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(_config.PlayerSyncInterval));

            _jobPollingTimer = new Timer(async _ =>
            {
                try { await ProcessPendingJobsAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "[IronCrown] Job poll failed"); }
            }, null, TimeSpan.FromSeconds(3), TimeSpan.FromSeconds(_config.JobPollingInterval));

            _inventorySyncTimer = new Timer(async _ =>
            {
                try { await SyncAllInventoriesAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "[IronCrown] Inventory sync failed"); }
            }, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(_config.InventorySyncInterval));

            _logger.LogInformation("[IronCrown] ✅ Ready. HB={Hb}s Sync={Ps}s Jobs={J}s Inv={Iv}s",
                _config.HeartbeatInterval, _config.PlayerSyncInterval,
                _config.JobPollingInterval, _config.InventorySyncInterval);

            await UniTask.CompletedTask;
        }

        protected override async UniTask OnUnloadAsync()
        {
            _heartbeatTimer?.Dispose();
            _playerSyncTimer?.Dispose();
            _jobPollingTimer?.Dispose();
            _inventorySyncTimer?.Dispose();
            _bridge?.Dispose();
            _logger.LogInformation("[IronCrown] Plugin unloaded");
            await UniTask.CompletedTask;
        }

        // ── Helpers ──────────────────────────────────────────────────────

        private async System.Threading.Tasks.Task SyncPlayersAsync()
        {
#if UNTURNED
            var players = SDG.Unturned.Provider.clients
                .Select(c => (object)new
                {
                    steamId    = c.playerID.steamID.ToString(),
                    playerName = c.playerID.playerName,
                    x          = c.player.transform.position.x,
                    y          = c.player.transform.position.y,
                    z          = c.player.transform.position.z,
                }).ToList();
            await _bridge!.SyncPlayersAsync(players);
#else
            await _bridge!.SyncPlayersAsync(new List<object>());
#endif
        }

        private async System.Threading.Tasks.Task ProcessPendingJobsAsync()
        {
            var jobs = await _bridge!.GetPendingJobsAsync();
            if (jobs.Count == 0) return;

            foreach (var job in jobs)
            {
                if (job.Attempts >= job.MaxAttempts)
                {
                    await _bridge.ReportJobResultAsync(job.Id, false, errorMessage: "Max attempts exceeded");
                    continue;
                }
                try
                {
#if UNTURNED
                    switch (job.Type.ToUpperInvariant())
                    {
                        case "KICK":            await ExecuteKickAsync(job); break;
                        case "GIVE_ITEM":       await ExecuteGiveItemAsync(job); break;
                        case "CLEAR_INVENTORY": await ExecuteClearInventoryAsync(job); break;
                        default: await _bridge.ReportJobResultAsync(job.Id, false, errorMessage: $"Unknown: {job.Type}"); break;
                    }
#else
                    await _bridge.ReportJobResultAsync(job.Id, false, errorMessage: "Stub build");
#endif
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[IronCrown] Job {Id} failed", job.Id);
                    await _bridge.ReportJobResultAsync(job.Id, false, errorMessage: ex.Message);
                }
            }
        }

#if UNTURNED
        private System.Threading.Tasks.Task ExecuteKickAsync(JobPayload job)
        {
            if (!ulong.TryParse(job.TargetSteamId, out var sid))
                return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Invalid SteamID");
            var c = SDG.Unturned.Provider.clients.FirstOrDefault(x => x.playerID.steamID.m_SteamID == sid);
            if (c == null) return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Not online");
            var reason = job.Payload.TryGetProperty("reason", out var r) ? r.GetString() ?? "Kicked" : "Kicked";
            SDG.Unturned.Provider.kick(c.playerID.steamID, reason);
            return _bridge!.ReportJobResultAsync(job.Id, true, result: $"Kicked {c.playerID.playerName}");
        }

        private System.Threading.Tasks.Task ExecuteGiveItemAsync(JobPayload job)
        {
            if (!ulong.TryParse(job.TargetSteamId, out var sid))
                return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Invalid SteamID");
            var c = SDG.Unturned.Provider.clients.FirstOrDefault(x => x.playerID.steamID.m_SteamID == sid);
            if (c == null) return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Not online");
            if (!job.Payload.TryGetProperty("itemId", out var idEl) || !idEl.TryGetUInt16(out var itemId))
                return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Invalid itemId");
            var amount  = job.Payload.TryGetProperty("amount",  out var aEl) ? (byte)aEl.GetInt32() : (byte)1;
            var quality = job.Payload.TryGetProperty("quality", out var qEl) ? (byte)qEl.GetInt32() : (byte)100;
            c.player.inventory.forceAddItem(new SDG.Unturned.Item(itemId, amount, quality), true);
            return _bridge!.ReportJobResultAsync(job.Id, true, result: $"Gave {amount}x {itemId}");
        }

        private System.Threading.Tasks.Task ExecuteClearInventoryAsync(JobPayload job)
        {
            if (!ulong.TryParse(job.TargetSteamId, out var sid))
                return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Invalid SteamID");
            var c = SDG.Unturned.Provider.clients.FirstOrDefault(x => x.playerID.steamID.m_SteamID == sid);
            if (c == null) return _bridge!.ReportJobResultAsync(job.Id, false, errorMessage: "Not online");
            for (byte p = 0; p < SDG.Unturned.PlayerInventory.PAGES - 1; p++)
                c.player.inventory.items[p].resize(0, 0);
            return _bridge!.ReportJobResultAsync(job.Id, true, result: "Cleared");
        }

        private async System.Threading.Tasks.Task SyncAllInventoriesAsync()
        {
            foreach (var client in SDG.Unturned.Provider.clients)
            {
                try
                {
                    var items = new List<object>();
                    for (byte p = 0; p < SDG.Unturned.PlayerInventory.PAGES - 1; p++)
                    {
                        var page = client.player.inventory.items[p];
                        for (byte i = 0; i < page.getItemCount(); i++)
                        {
                            var ji = page.getItem(i);
                            if (ji?.item == null) continue;
                            items.Add(new
                            {
                                itemId = (int)ji.item.id, amount = (int)ji.item.amount,
                                quality = (int)ji.item.quality, durability = (double)ji.item.durability,
                                gridX = (int)ji.x, gridY = (int)ji.y, rotation = (int)ji.rot,
                                container = p switch { 0=>"hotbar",1=>"inventory",2=>"clothing",3=>"backpack",4=>"vest",5=>"shirt",6=>"pants",_=>"misc" },
                            });
                        }
                    }
                    await _bridge!.SyncInventoryAsync(client.playerID.steamID.ToString(), items);
                }
                catch (Exception ex) { _logger.LogWarning(ex, "[IronCrown] Inv sync err"); }
            }
        }
#else
        private System.Threading.Tasks.Task SyncAllInventoriesAsync() => System.Threading.Tasks.Task.CompletedTask;
#endif
    }
}
