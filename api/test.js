const url = "https://ironcrown-production.up.railway.app/api/bridge/heartbeat";
const payload = { serverName: "TestServer", pluginVersion: "1.0", onlineCount: 0 };

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-api-key": "IronCrownSecret2024"
    },
    body: JSON.stringify(payload)
})
    .then(async (res) => {
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    })
    .catch(err => {
        console.error("Fetch error:", err);
    });
