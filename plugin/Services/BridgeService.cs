using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace IronCrownPlugin.Services
{
    public class JobPayload
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "";
        public string? TargetSteamId { get; set; }
        public JsonElement Payload { get; set; }
        public int Attempts { get; set; }
        public int MaxAttempts { get; set; }
    }

    public class BridgeService : IDisposable
    {
        private readonly HttpClient _http;
        private readonly PluginConfig _config;
        private readonly ILogger _logger;

        public BridgeService(PluginConfig config, ILogger logger)
        {
            _config = config;
            _logger = logger;
            _http = new HttpClient { BaseAddress = new Uri(config.ApiBaseUrl) };
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _http.DefaultRequestHeaders.Add("X-API-Key", config.ApiKey);
        }

        // ── Core request helper ────────────────────────────────────────────────
        private async Task<bool> PostAsync(string endpoint, object payload, CancellationToken token = default)
        {
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(endpoint, content, token);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("[IronCrown] POST {Endpoint} failed: {Status} {Body}", endpoint, response.StatusCode, body);
                }
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[IronCrown] POST {Endpoint} threw exception", endpoint);
                return false;
            }
        }

        // ── Heartbeat ─────────────────────────────────────────────────────────
        public Task<bool> SendHeartbeatAsync(int onlineCount, CancellationToken token = default)
        {
            return PostAsync("/heartbeat", new
            {
                serverName = _config.ServerName,
                pluginVersion = _config.PluginVersion,
                onlineCount,
            }, token);
        }

        // ── Player Sync ───────────────────────────────────────────────────────
        public Task<bool> SyncPlayersAsync(List<object> players, CancellationToken token = default)
        {
            return PostAsync("/player-sync", new { players }, token);
        }

        // ── Inventory Sync ────────────────────────────────────────────────────
        public Task<bool> SyncInventoryAsync(string steamId, List<object> items, CancellationToken token = default)
        {
            return PostAsync("/inventory-sync", new { steamId, items }, token);
        }

        // ── Plugin Event Log ─────────────────────────────────────────────────
        public Task<bool> LogEventAsync(string eventType, string steamId, string? playerName = null, object? metadata = null, CancellationToken token = default)
        {
            return PostAsync("/event-log", new { eventType, steamId, playerName, metadata }, token);
        }

        // ── Pending Jobs ──────────────────────────────────────────────────────
        public async Task<List<JobPayload>> GetPendingJobsAsync(CancellationToken token = default)
        {
            try
            {
                var response = await _http.GetAsync("/jobs/pending", token);
                if (!response.IsSuccessStatusCode) return new List<JobPayload>();
                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);
                var data = doc.RootElement.GetProperty("data");
                return JsonSerializer.Deserialize<List<JobPayload>>(data.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                       ?? new List<JobPayload>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[IronCrown] GetPendingJobsAsync failed");
                return new List<JobPayload>();
            }
        }

        // ── Job Result ────────────────────────────────────────────────────────
        public Task<bool> ReportJobResultAsync(string jobId, bool success, string? result = null, string? errorMessage = null, CancellationToken token = default)
        {
            return PostAsync($"/jobs/{jobId}/result", new { success, result, errorMessage }, token);
        }

        public void Dispose() => _http.Dispose();
    }
}
