const https = require("https");
https.get("https://openrouter.ai/api/v1/models", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    const models = JSON.parse(data).data;
    const freeModels = models.filter((m) => m.id.endsWith(":free"));
    console.log(freeModels.map((m) => m.id).slice(0, 10));
  });
});
