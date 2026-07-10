"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Activity,
  CheckCircle2,
  Instagram,
  Globe,
  ArrowRight,
  Database,
  BarChart3,
  Loader2,
  PieChart,
  Mail,
  TrendingUp,
} from "lucide-react";
import ConversationArea from "../components/conversation-area";
import VisualizationPanel, {
  ChartConfig,
} from "../components/visualization-panel";
import { trackEvent } from "../lib/analytics";
import { ConnectionManager } from "../components/ConnectionManager";
import { Dashboard } from "../components/Dashboard";
import { useLiveSync } from "../hooks/useLiveSync";
import { useAuth, UserButton, SignIn } from "@clerk/nextjs";
import { setTokenResolver, authenticatedFetch } from "../lib/api";
import { CompanyOnboarding } from "../components/CompanyOnboarding";

interface Workspace {
  path: string;
  name: string;
  version: number;
  owner: string;
  databasePath: string;
  schemaVersion: string;
  status: string;
}

interface ConnectorStatuses {
  instagram?: { state: string; message: string; lastSync: string | null };
  gmail?: { state: string; message: string; lastSync: string | null };
  google_ads?: { state: string; message: string; lastSync: string | null };
}

interface HealthData {
  acquisition: { totalSessions: number };
  activation: { workspacesCreated: number; instasConnected: number };
  engagement: { totalQuestions: number };
  friction: { mostAbandoned: string | null; abandonReason: string | null };
  ttfi: { averageSeconds: number | null };
}

interface CompanyProfile {
  name: string;
  website: string | null;
  industry: string | null;
  stage: string | null;
  description: string | null;
  valueProposition: string | null;
  targetAudience: string | null;
  businessModel: string | null;
  competitorNames: string[];
  competitorUrls: string[];
  healthMetrics: Record<string, number>;
}

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export default function Home() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Bind global api token resolver
  useEffect(() => {
    if (hasClerk && getToken) {
      setTokenResolver(getToken);
    }
  }, [getToken]);

  const [loading, setLoading] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null,
  );
  const [connectorStatus, setConnectorStatus] =
    useState<ConnectorStatuses | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null,
  );
  const [companyProfileChecked, setCompanyProfileChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // ECharts States
  const [activeChart, setActiveChart] = useState<ChartConfig | null>(null);
  const [activeRecs, setActiveRecs] = useState<string[]>([]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<"database" | "visuals">(
    "database",
  );

  // Connector UI states
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [metaTokenInput, setMetaTokenInput] = useState("");

  // Setup UI states
  const [createName, setCreateName] = useState("");

  // Navigation state
  const [activeTab, setActiveTab] = useState<
    "workspace" | "connectors" | "health"
  >("workspace");

  // Track app open and handle OAuth popup callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conn = params.get("connected");
    if (conn === "instagram" || conn === "gmail" || conn === "google-ads") {
      window.close();
      return;
    }
    trackEvent("Application Opened", "Acquisition");
  }, []);

  // Check company profile after login
  useEffect(() => {
    const checkCompanyProfile = async () => {
      if (!hasClerk || !isSignedIn) {
        setCompanyProfileChecked(true);
        return;
      }

      try {
        const res = await authenticatedFetch(`${API_BASE}/api/company/profile`);
        const data = await res.json();
        if (data.success && data.profile) {
          setCompanyProfile(data.profile);
          setOnboardingComplete(true);
        }
        setCompanyProfileChecked(true);
      } catch (err) {
        console.error("Failed to check company profile:", err);
        setCompanyProfileChecked(true);
      }
    };

    checkCompanyProfile();
  }, [isSignedIn, isLoaded]);

  const checkStatus = async () => {
    try {
      const activeRes = await authenticatedFetch(
        `${API_BASE}/api/workspace/active`,
      ).catch(() => null);
      if (activeRes && activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveWorkspace(activeData.workspace);
      } else {
        setActiveWorkspace(null);
      }

      const connectorRes = await authenticatedFetch(
        `${API_BASE}/api/connectors/status`,
      ).catch(() => null);
      if (connectorRes && connectorRes.ok) {
        const connData = await connectorRes.json();
        setConnectorStatus(connData);
      }

      const healthRes = await authenticatedFetch(
        `${API_BASE}/api/analytics/health`,
      ).catch(() => null);
      if (healthRes && healthRes.ok) {
        const hData = await healthRes.json();
        setHealthData(hData);
      }
    } catch (err: any) {
      console.error("Connection failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to live SSE events from local Fastify server
  useLiveSync((data) => {
    console.log("🔄 SSE Update: sync completed!", data);
    setRefreshTrigger((prev) => prev + 1);
    checkStatus();
  }, API_BASE);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName) return;

    trackEvent("Workspace Creation Started", "Activation");

    try {
      const res = await authenticatedFetch(`${API_BASE}/api/workspace/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          owner: "Founder",
        }),
      });
      const data = await res.json();
      if (data.success) {
        trackEvent("Workspace Created", "Activation");
        setActiveWorkspace(data.workspace);
        setActiveTab("connectors");
        checkStatus();
      }
    } catch (err) {
      trackEvent("Workspace Creation Failed", "Friction");
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await authenticatedFetch(
        `${API_BASE}/api/connectors/${id}/disconnect`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        checkStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateVisualization = (
    chart: ChartConfig | null,
    recommendations: string[],
  ) => {
    setActiveChart(chart);
    setActiveRecs(recommendations);
  };

  const handleCompanyOnboardingComplete = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    setOnboardingComplete(true);
    trackEvent("Company Onboarding Completed", "Activation", {
      companyName: profile.name,
    });
  };

  // Guard dashboard screens if Clerk is active
  if (hasClerk && isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-neutral-200">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                BusinessOS
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                Your private multi-tenant business analyst. Connect your
                integrations, ask questions, get insights.
              </p>
            </div>
          </div>
          <div className="flex justify-center bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl">
            <SignIn routing="hash" />
          </div>
        </div>
      </div>
    );
  }

  if (loading || (hasClerk && !isLoaded)) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center flex-col">
        <Activity className="h-8 w-8 text-neutral-400 animate-pulse mb-3" />
        <p className="text-neutral-400 text-sm font-medium font-mono">
          Initializing BusinessOS
        </p>
      </div>
    );
  }

  // Show company onboarding if no profile exists and user is signed in
  if (hasClerk && isSignedIn && !companyProfileChecked) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-6">
        <Activity className="h-8 w-8 text-neutral-400 animate-pulse" />
      </div>
    );
  }

  if (hasClerk && isSignedIn && !onboardingComplete) {
    return (
      <CompanyOnboarding
        onComplete={handleCompanyOnboardingComplete}
        apiBase={API_BASE}
      />
    );
  }

  const isInstagramConnected =
    connectorStatus?.instagram?.state === "connected" ||
    connectorStatus?.instagram?.state === "ready";
  const isInstagramSyncing = connectorStatus?.instagram?.state === "syncing";
  const instagramMessage =
    connectorStatus?.instagram?.message || "Ready to connect";

  const isGmailConnected =
    connectorStatus?.gmail?.state === "connected" ||
    connectorStatus?.gmail?.state === "ready";
  const isGmailSyncing = connectorStatus?.gmail?.state === "syncing";
  const gmailMessage = connectorStatus?.gmail?.message || "Ready to connect";

  const isGoogleAdsConnected =
    connectorStatus?.google_ads?.state === "connected" ||
    connectorStatus?.google_ads?.state === "ready";
  const isGoogleAdsSyncing = connectorStatus?.google_ads?.state === "syncing";
  const googleAdsMessage =
    connectorStatus?.google_ads?.message || "Ready to connect";

  const isAnyConnected =
    isInstagramConnected || isGmailConnected || isGoogleAdsConnected;

  // ---------------------------------------------------------------------------
  // Empty State: Welcome Screen
  // ---------------------------------------------------------------------------
  if (!activeWorkspace) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-neutral-200">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                BusinessOS
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                Your private business analyst. Connect your data, ask questions,
                get insights.
              </p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all"
              >
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active Workspace Dashboard
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070709] flex flex-col font-sans">
      <header className="h-14 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-white" />
          <span className="font-bold text-sm tracking-tight text-white">
            BusinessOS
          </span>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-sm text-neutral-400">
            {activeWorkspace.name}
          </span>
        </div>
        {hasClerk && isSignedIn && (
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-white/5 bg-[#08080a] p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("connectors")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "connectors"
                ? "bg-white/10 text-white"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4" />
            Connectors
            {!isInstagramConnected && (
              <span className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("workspace")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "workspace"
                ? "bg-white/10 text-white"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analysis
          </button>

          {/* Dogfooding Analytics Tab */}
          <button
            onClick={() => {
              trackEvent("Health Dashboard Opened", "Engagement");
              setActiveTab("health");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mt-auto border ${
              activeTab === "health"
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : "bg-transparent border-transparent text-neutral-600 hover:text-purple-400 hover:bg-purple-500/5"
            }`}
          >
            <PieChart className="h-4 w-4" />
            Product Health
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden bg-[#09090b]">
          {/* CONNECTORS TAB */}
          {activeTab === "connectors" && (
            <main className="flex-1 overflow-y-auto p-12">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    Connect your data
                  </h1>
                  <p className="text-neutral-400">
                    Link your accounts to allow the AI to build your business
                    context.
                  </p>
                </div>
                <ConnectionManager
                  apiBase={API_BASE}
                  activeWorkspace={activeWorkspace}
                  connectorStatus={connectorStatus}
                  onRefresh={checkStatus}
                />
              </div>
            </main>
          )}

          {/* ANALYSIS TAB */}
          {activeTab === "workspace" && (
            <>
              <div className="flex-1 flex flex-col min-w-0 relative">
                {!isAnyConnected ? (
                  <div className="absolute inset-0 z-10 bg-[#070709]/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-[#0c0c0e] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm text-center">
                      <Database className="h-10 w-10 text-white/50 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">
                        No data available
                      </h3>
                      <p className="text-sm text-neutral-400 mb-6">
                        Connect your marketing accounts so I can analyze your
                        performance and provide actionable insights.
                      </p>
                      <button
                        onClick={() => setActiveTab("connectors")}
                        className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full"
                      >
                        Go to Connectors
                      </button>
                    </div>
                  </div>
                ) : null}
                <ConversationArea
                  onUpdateVisualization={handleUpdateVisualization}
                />
              </div>
              <div className="w-[30rem] bg-[#08080a] overflow-y-auto shrink-0 border-l border-white/5 flex flex-col">
                <div className="flex border-b border-neutral-800 p-2 bg-[#0b0c10]">
                  <button
                    onClick={() => setRightPanelTab("database")}
                    className={`flex-1 text-center py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                      rightPanelTab === "database"
                        ? "bg-white/10 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Live Database
                  </button>
                  <button
                    onClick={() => setRightPanelTab("visuals")}
                    className={`flex-1 text-center py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                      rightPanelTab === "visuals"
                        ? "bg-white/10 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    AI Analytics
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {rightPanelTab === "database" ? (
                    <Dashboard
                      apiBase={API_BASE}
                      refreshTrigger={refreshTrigger}
                    />
                  ) : (
                    <VisualizationPanel
                      chart={activeChart}
                      recommendations={activeRecs}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* PRODUCT HEALTH TAB (Founder Dogfooding) */}
          {activeTab === "health" && (
            <main className="flex-1 overflow-y-auto p-12 bg-[#050505]">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    BusinessOS Health
                  </h1>
                  <p className="text-neutral-400">
                    Internal Founder Dashboard tracking product usability and
                    TTFI.
                  </p>
                </div>

                {healthData ? (
                  <div className="space-y-8">
                    {/* Top Level KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5">
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2">
                          Total Sessions
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {healthData.acquisition.totalSessions}
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5">
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2">
                          Avg Time to First Insight
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {healthData.ttfi.averageSeconds
                            ? `${healthData.ttfi.averageSeconds.toFixed(1)}s`
                            : "No data"}
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5">
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2">
                          Questions Asked
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {healthData.engagement.totalQuestions}
                        </p>
                      </div>
                    </div>

                    {/* Friction Report */}
                    <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                      <h3 className="text-lg font-bold text-red-400 mb-2">
                        Friction Report
                      </h3>
                      <p className="text-sm text-neutral-400 mb-4">
                        Where are founders abandoning the journey?
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <span className="text-sm text-white">
                            Most Abandoned Screen
                          </span>
                          <span className="text-sm text-red-300 bg-red-500/10 px-3 py-1 rounded-full">
                            {healthData.friction.mostAbandoned || "None yet"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">
                            Primary Drop-off Reason
                          </span>
                          <span className="text-sm text-neutral-400">
                            {healthData.friction.abandonReason || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Fetching health data...
                  </div>
                )}
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
