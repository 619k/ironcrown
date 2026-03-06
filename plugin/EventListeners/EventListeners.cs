using System.Threading.Tasks;
using IronCrownPlugin.Services;
using Microsoft.Extensions.Logging;
using OpenMod.API.Eventing;

#if UNTURNED
using OpenMod.Unturned.Players.Life.Events;
using OpenMod.Unturned.Players.Inventory.Events;
using OpenMod.Unturned.Players.Connections.Events;
#endif

namespace IronCrownPlugin.EventListeners
{
#if UNTURNED
    /// <summary>Player join → API event log</summary>
    public class PlayerJoinListener : IEventListener<UnturnedPlayerConnectedEvent>
    {
        private readonly BridgeService _bridge;
        private readonly PluginConfig _config;
        private readonly ILogger<PlayerJoinListener> _logger;

        public PlayerJoinListener(BridgeService bridge, PluginConfig config, ILogger<PlayerJoinListener> logger)
        {
            _bridge = bridge; _config = config; _logger = logger;
        }

        public async Task HandleEventAsync(object? sender, UnturnedPlayerConnectedEvent @event)
        {
            var steamId    = @event.Player.SteamId.ToString();
            var playerName = @event.Player.SteamPlayer.playerID.playerName;
            if (_config.EnableDebugLogging)
                _logger.LogInformation("[IronCrown] Player joined: {Name} ({Id})", playerName, steamId);
            await _bridge.LogEventAsync("PLAYER_JOIN", steamId, playerName);
        }
    }

    /// <summary>Player leave → API event log</summary>
    public class PlayerLeaveListener : IEventListener<UnturnedPlayerDisconnectedEvent>
    {
        private readonly BridgeService _bridge;
        private readonly PluginConfig _config;

        public PlayerLeaveListener(BridgeService bridge, PluginConfig config)
        {
            _bridge = bridge; _config = config;
        }

        public async Task HandleEventAsync(object? sender, UnturnedPlayerDisconnectedEvent @event)
        {
            await _bridge.LogEventAsync(
                "PLAYER_LEAVE",
                @event.Player.SteamId.ToString(),
                @event.Player.SteamPlayer.playerID.playerName);
        }
    }

    /// <summary>Player death → API event log with cause/killer/limb metadata</summary>
    public class PlayerDeathListener : IEventListener<UnturnedPlayerDeathEvent>
    {
        private readonly BridgeService _bridge;
        public PlayerDeathListener(BridgeService bridge) => _bridge = bridge;

        public async Task HandleEventAsync(object? sender, UnturnedPlayerDeathEvent @event)
        {
            var metadata = new
            {
                cause  = @event.DeathCause.ToString(),
                killer = @event.Killer?.ToString(),
                limb   = @event.Limb.ToString(),
            };
            await _bridge.LogEventAsync(
                "PLAYER_DEATH",
                @event.Player.SteamId.ToString(),
                @event.Player.SteamPlayer.playerID.playerName,
                metadata);
        }
    }

    /// <summary>Item pickup → API event log</summary>
    public class ItemPickupListener : IEventListener<UnturnedPlayerItemGrabbedEvent>
    {
        private readonly BridgeService _bridge;
        private readonly PluginConfig _config;

        public ItemPickupListener(BridgeService bridge, PluginConfig config)
        {
            _bridge = bridge; _config = config;
        }

        public async Task HandleEventAsync(object? sender, UnturnedPlayerItemGrabbedEvent @event)
        {
            if (!_config.LogItemPickup) return;
            await _bridge.LogEventAsync(
                "ITEM_PICKUP",
                @event.Player.SteamId.ToString(),
                @event.Player.SteamPlayer.playerID.playerName,
                new { itemId = (int)@event.Item.id, amount = @event.Item.amount });
        }
    }

    /// <summary>Item drop → API event log</summary>
    public class ItemDropListener : IEventListener<UnturnedPlayerItemDroppedEvent>
    {
        private readonly BridgeService _bridge;
        private readonly PluginConfig _config;

        public ItemDropListener(BridgeService bridge, PluginConfig config)
        {
            _bridge = bridge; _config = config;
        }

        public async Task HandleEventAsync(object? sender, UnturnedPlayerItemDroppedEvent @event)
        {
            if (!_config.LogItemDrop) return;
            await _bridge.LogEventAsync(
                "ITEM_DROP",
                @event.Player.SteamId.ToString(),
                @event.Player.SteamPlayer.playerID.playerName,
                new { itemId = (int)@event.Item.asset.id });
        }
    }
#endif
}
