import axios from "axios";

const API = "http://127.0.0.1:4000/api";

async function runUAT() {
  console.log("🚀 Starting Founder UAT Flow...");
  try {
    // 1. Create Workspace
    console.log("1. Creating Workspace...");
    const wsRes = await axios.post(`${API}/workspace/create`, {
      path: "C:/business-os-workspaces/uat-test",
      name: "UAT Test",
      owner: "Founder",
    });
    console.log("   ✅ Workspace Created:", wsRes.data.success);

    // 2. Connect Instagram
    console.log("2. Connecting Instagram...");
    const connRes = await axios.post(`${API}/connectors/instagram/connect`, {
      accessToken: "mock_token_trigger_fallback",
    });
    console.log("   ✅ Instagram Connected:", connRes.data.success);

    // 3. Start Sync
    console.log("3. Starting Sync...");
    const syncRes = await axios.post(`${API}/connectors/instagram/sync`, {});
    console.log("   ✅ Sync Triggered:", syncRes.data.message);

    // 4. Poll Status
    console.log("4. Polling Status...");
    let ready = false;
    for (let i = 0; i < 15; i++) {
      const statusRes = await axios.get(`${API}/connectors/status`);
      const state = statusRes.data.instagram.state;
      console.log(
        `   ⏳ Status [${i}]: ${state} - ${statusRes.data.instagram.message}`,
      );
      if (state === "ready") {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!ready) throw new Error("Sync timed out.");

    // 5. Ask Question
    console.log("5. Asking Brain Interface...");
    const chatRes = await axios.post(`${API}/chat`, {
      message: "How are my campaigns performing?",
    });
    console.log("   ✅ Brain Responded:\n", chatRes.data.text);
    console.log("   ✅ Recommendations:\n", chatRes.data.recommendations);

    // 6. Check Health
    console.log("6. Checking Product Health Dashboard...");
    const healthRes = await axios.get(`${API}/analytics/health`);
    console.log(
      "   ✅ Health Data:\n",
      JSON.stringify(healthRes.data, null, 2),
    );

    console.log("🎉 UAT Passed Successfully.");
  } catch (err: any) {
    console.error("❌ UAT Failed:", err.response?.data || err.message);
  }
}

runUAT();
