"use client";

import { useEffect, useState } from "react";
import { 
  FolderPlus, 
  FolderOpen, 
  Settings, 
  Layers, 
  FileText, 
  User, 
  Info, 
  LogOut, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Terminal,
  TrendingUp,
  Inbox
} from "lucide-react";

interface Workspace {
  path: string;
  name: string;
  version: number;
  owner: string;
  databasePath: string;
  status: string;
}

interface RecentWorkspace {
  name: string;
  path: string;
  lastOpened: string;
}

const API_BASE = "http://127.0.0.1:4000";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [recentWorkspaces, setRecentWorkspaces] = useState<RecentWorkspace[]>([]);
  const [serverHealth, setServerHealth] = useState<{ status: string; time: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createPath, setCreatePath] = useState("");
  const [createName, setCreateName] = useState("");
  const [createOwner, setCreateOwner] = useState("");

  const [showOpenForm, setShowOpenForm] = useState(false);
  const [openPath, setOpenPath] = useState("");

  // Navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "connectors" | "reports" | "settings">("dashboard");

  // Fetch server status & workspace metadata
  const checkStatus = async () => {
    try {
      // 1. Health check
      const healthRes = await fetch(`${API_BASE}/health`).catch(() => null);
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json();
        setServerHealth(healthData);
      } else {
        setServerHealth(null);
      }

      // 2. Active Workspace
      const activeRes = await fetch(`${API_BASE}/api/workspace/active`);
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveWorkspace(activeData.workspace);
      }

      // 3. Recent Workspaces
      const recentRes = await fetch(`${API_BASE}/api/workspace/recent`);
      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentWorkspaces(recentData);
      }
      
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Connection failure:", err);
      setErrorMsg("Failed to connect to Local Fastify Backend on http://localhost:4000. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll status periodically (every 5 seconds)
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPath || !createName || !createOwner) {
      alert("Please fill in all fields.");
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/workspace/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: createPath, name: createName, owner: createOwner }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveWorkspace(data.workspace);
        setShowCreateForm(false);
        setCreatePath("");
        setCreateName("");
        setCreateOwner("");
        checkStatus();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg("Failed to create workspace. Server error.");
    }
  };

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openPath) return;
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/workspace/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: openPath }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveWorkspace(data.workspace);
        setShowOpenForm(false);
        setOpenPath("");
        checkStatus();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg("Failed to open workspace. Check if locked or invalid path.");
    }
  };

  const handleOpenPath = async (pathString: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/workspace/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathString }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveWorkspace(data.workspace);
        checkStatus();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg("Failed to open workspace path. Directory might have been moved or locked.");
    }
  };

  const handleClose = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workspace/close`, { method: "POST" });
      if (res.ok) {
        setActiveWorkspace(null);
        checkStatus();
      }
    } catch (err) {
      setErrorMsg("Failed to close workspace.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center flex-col">
        <Activity className="h-8 w-8 text-neutral-400 animate-pulse mb-3" />
        <p className="text-neutral-400 text-sm font-medium font-mono">BOOTING BUSINESS OS FOUNDATION...</p>
      </div>
    );
  }

  // Dashboard Interface (Workspace is open)
  if (activeWorkspace) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col font-sans">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent font-mono tracking-tight">
              BUSINESS_OS //
            </span>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                {activeWorkspace.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-neutral-500 font-mono">Founder Profile</p>
              <p className="text-sm text-neutral-300 font-medium">{activeWorkspace.owner}</p>
            </div>
            <button 
              onClick={handleClose}
              className="flex items-center gap-2 text-xs border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-neutral-300 hover:text-red-400 px-3  py-1.5 rounded-md transition-all font-mono"
            >
              <LogOut className="h-3.5 w-3.5" />
              UNMOUNT
            </button>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/5 bg-[#08080a] p-4 flex flex-col gap-1.5">
            <div className="mb-4 px-2">
              <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider font-mono">Navigation</p>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white/5 border border-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Layers className="h-4 w-4" />
              Workspace Dashboard
            </button>
            <button
              onClick={() => setActiveTab("connectors")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "connectors"
                  ? "bg-white/5 border border-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Data Connectors
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "reports"
                  ? "bg-white/5 border border-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <FileText className="h-4 w-4" />
              Insight Reports
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-white/5 border border-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Settings className="h-4 w-4" />
              System Settings
            </button>

            <div className="mt-auto border-t border-white/5 pt-4 px-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono">
                <span>V1 Foundation</span>
                <span>Port 4000</span>
              </div>
            </div>
          </aside>

          {/* Main Workspace Frame */}
          <main className="flex-1 bg-[#09090b] p-8 overflow-y-auto">
            {activeTab === "dashboard" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-bold font-mono tracking-tight text-white">Active Workspace</h1>
                  <p className="text-neutral-500 text-sm mt-1">Operational view of the mounted company container.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-xl bg-white/3 border border-white/5 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 font-mono uppercase">Company Name</p>
                      <h3 className="text-lg font-semibold text-neutral-200 mt-1">{activeWorkspace.name}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                      <User className="h-3.5 w-3.5" />
                      <span>{activeWorkspace.owner} (Owner)</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-white/3 border border-white/5 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 font-mono uppercase">Engine Version</p>
                      <h3 className="text-lg font-semibold text-neutral-200 mt-1">v{activeWorkspace.version}.0.0</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Clean Schema (marketing-v1)</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-[#0e0e13]/60 border border-white/5 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 font-mono uppercase">Fastify Server State</p>
                      <h3 className="text-lg font-semibold text-emerald-400 mt-1 flex items-center gap-2">
                        Online
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{serverHealth ? new Date(serverHealth.time).toLocaleTimeString() : "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* File details panel */}
                <div className="rounded-xl border border-white/5 bg-[#0a0a0c] p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Terminal className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold font-mono text-neutral-200">Local Paths & Directories</h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <p className="text-neutral-500">Root Directory Path</p>
                      <p className="text-neutral-300 bg-white/2 p-2 rounded mt-1 border border-white/5 select-all">{activeWorkspace.path}</p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Relational Store (SQLite)</p>
                      <p className="text-neutral-300 bg-white/2 p-2 rounded mt-1 border border-white/5 select-all">{activeWorkspace.databasePath}</p>
                    </div>
                  </div>
                </div>

                {/* Sync status */}
                <div className="rounded-xl border border-white/5 bg-white/2 p-6 flex items-start gap-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">System Initialized Successfully</h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      All system directories (`connectors/`, `generated/`, `reports/`, `uploads/`, `logs/`, `cache/`) have been successfully established in the target workspace. Drizzle migrations and locks are operational.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "connectors" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-bold font-mono tracking-tight text-white">Data Connectors</h1>
                  <p className="text-neutral-500 text-sm mt-1">Configure sources to sync marketing conversations and analytics metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/5 rounded-xl bg-white/2 p-5 flex flex-col justify-between opacity-60">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-neutral-200">Instagram Connector</span>
                        <span className="text-[10px] font-mono text-neutral-500 border border-white/5 bg-white/3 px-2 py-0.5 rounded">Sprint 003</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2">Imports accounts, campaign metrics, profiles, reach, CTR, and posts.</p>
                    </div>
                    <button disabled className="mt-4 w-full text-xs bg-neutral-800 border border-neutral-700/50 text-neutral-500 py-2 rounded-lg font-mono">UNAVAILABLE</button>
                  </div>

                  <div className="border border-white/5 rounded-xl bg-white/2 p-5 flex flex-col justify-between opacity-60">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-neutral-200">Gmail Connector</span>
                        <span className="text-[10px] font-mono text-neutral-500 border border-white/5 bg-white/3 px-2 py-0.5 rounded">Sprint 004</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2">Pulls marketing and sales conversations, matching client-side query filters.</p>
                    </div>
                    <button disabled className="mt-4 w-full text-xs bg-neutral-800 border border-neutral-700/50 text-neutral-500 py-2 rounded-lg font-mono">UNAVAILABLE</button>
                  </div>

                  <div className="border border-white/5 rounded-xl bg-white/2 p-5 flex flex-col justify-between opacity-60">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-neutral-200">Google Ads Connector</span>
                        <span className="text-[10px] font-mono text-neutral-500 border border-white/5 bg-white/3 px-2 py-0.5 rounded">Sprint 005</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2">Retrieves keywords, campaigns, daily metric snapshots, and conversions.</p>
                    </div>
                    <button disabled className="mt-4 w-full text-xs bg-neutral-800 border border-neutral-700/50 text-neutral-500 py-2 rounded-lg font-mono">UNAVAILABLE</button>
                  </div>

                  <div className="border border-white/5 rounded-xl bg-white/2 p-5 flex flex-col justify-between opacity-60">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-neutral-200">Website Scraping Connector</span>
                        <span className="text-[10px] font-mono text-neutral-500 border border-white/5 bg-white/3 px-2 py-0.5 rounded">Sprint 006</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-2">Extracts brand architecture, positioning, and products from root domains.</p>
                    </div>
                    <button disabled className="mt-4 w-full text-xs bg-neutral-800 border border-neutral-700/50 text-neutral-500 py-2 rounded-lg font-mono">UNAVAILABLE</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-bold font-mono tracking-tight text-white">Insight Reports</h1>
                  <p className="text-neutral-500 text-sm mt-1">Central repository for compiled marketing analysis reports.</p>
                </div>

                <div className="border border-white/5 rounded-xl bg-white/2 p-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-neutral-500">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-300">No Reports Yet</h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      Once sync reports and marketing analysis documents are created, they will be saved here in Markdown files.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-bold font-mono tracking-tight text-white">System Settings</h1>
                  <p className="text-neutral-500 text-sm mt-1">Configure active parameters, syncing schedules, and database updates.</p>
                </div>

                <div className="border border-white/5 rounded-xl bg-white/2 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-200">System Theme</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">Adapt screen colors to system settings.</p>
                    </div>
                    <select disabled className="bg-neutral-800 border border-white/10 rounded px-2.5 py-1 text-xs text-neutral-300 font-mono">
                      <option>Dark Mode (Default)</option>
                      <option>Light Mode</option>
                      <option>System Default</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-200">Sync Frequency</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">How often local importer runs.</p>
                    </div>
                    <select disabled className="bg-neutral-800 border border-white/10 rounded px-2.5 py-1 text-xs text-neutral-300 font-mono">
                      <option>Manual Sync Only (V1)</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-200">Credential Vault</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">Manage encrypted local keys for integrations.</p>
                    </div>
                    <button disabled className="text-xs bg-neutral-800 border border-neutral-700/50 text-neutral-500 px-3 py-1.5 rounded-lg font-mono">MANAGE KEYS</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Welcome Screen / Workspace Selector (Workspace is closed)
  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-neutral-200">
      <div className="w-full max-w-lg space-y-8">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <span className="font-mono text-xs tracking-widest text-neutral-500 uppercase font-semibold">FOUNDATION STAGE // MVP V1</span>
          <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent font-mono tracking-tight mt-1">
            BUSINESS OS
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            A local-first system to help solo founders understand and optimize marketing.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-red-300 font-mono">SERVER EXCEPTION</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Dashboard Actions */}
        <div className="grid grid-cols-1 gap-4">
          {!showCreateForm && !showOpenForm && (
            <>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setErrorMsg(null);
                }}
                className="w-full flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all text-left shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-sm group-hover:text-white transition-colors">Create New Workspace</h3>
                    <p className="text-xs text-neutral-500 mt-1">Mount a brand new local workspace folder.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowOpenForm(true);
                  setErrorMsg(null);
                }}
                className="w-full flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all text-left shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-sm group-hover:text-white transition-colors">Open Existing Workspace</h3>
                    <p className="text-xs text-neutral-500 mt-1">Mount a directory containing a `businessos/` container.</p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Form - Create Workspace */}
          {showCreateForm && (
            <form onSubmit={handleCreate} className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c] space-y-4 shadow-xl">
              <h3 className="text-sm font-semibold font-mono text-neutral-200 flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-neutral-400" />
                CREATE CONTAINER
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Workspace Directory Path</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. D:/Minds_db_my_folder/shekar_suman_project/BusinessOS_MVP_Foundation/workspace"
                    value={createPath}
                    onChange={(e) => setCreatePath(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Startup"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Founder / Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashutosh"
                    value={createOwner}
                    onChange={(e) => setCreateOwner(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-semibold py-2 rounded-lg transition-colors font-mono"
                >
                  MOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-neutral-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors font-mono"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* Form - Open Workspace */}
          {showOpenForm && (
            <form onSubmit={handleOpen} className="p-6 rounded-xl border border-white/5 bg-[#0a0a0c] space-y-4 shadow-xl">
              <h3 className="text-sm font-semibold font-mono text-neutral-200 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-neutral-400" />
                MOUNT CONTAINER
              </h3>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Workspace Directory Path</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. D:/Minds_db_my_folder/shekar_suman_project/BusinessOS_MVP_Foundation/workspace"
                  value={openPath}
                  onChange={(e) => setOpenPath(e.target.value)}
                  className="w-full mt-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/30 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-semibold py-2 rounded-lg transition-colors font-mono"
                >
                  OPEN
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpenForm(false)}
                  className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-neutral-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors font-mono"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent workspaces section */}
        {recentWorkspaces.length > 0 && !showCreateForm && !showOpenForm && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono text-neutral-600 font-bold uppercase tracking-wider">RECENT WORKSPACES</h4>
            <div className="space-y-2">
              {recentWorkspaces.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenPath(w.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 text-left text-xs transition-all font-mono"
                >
                  <div>
                    <span className="font-semibold text-neutral-200">{w.name}</span>
                    <span className="text-neutral-500 block text-[10px] mt-0.5 select-all">{w.path}</span>
                  </div>
                  <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
