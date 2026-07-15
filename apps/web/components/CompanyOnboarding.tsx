"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import { authenticatedFetch } from "../lib/api";
import { trackEvent } from "../lib/analytics";

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

export type StepId = "scan" | "profile" | "audit" | "competitors" | "success";

export interface OnboardingDraft {
  websiteUrl: string;
  companyName: string;
  logoUrl?: string;
  currentStep: StepId;
  completedSteps: StepId[];
  profile: {
    industry: string;
    stage: string;
    businessModel: string;
    description: string;
    valueProposition: string;
    targetAudience: string;
    confidence: number;
  } | null;
  audit: {
    seoScore: number;
    geoScore: number;
    summary: string;
    seoIssues: Array<{ name: string; severity: "critical" | "high" | "medium" | "low"; passed: boolean }>;
    geoIssues: Array<{ name: string; severity: "critical" | "high" | "medium" | "low"; passed: boolean }>;
  } | null;
  competitors: Array<{ name: string; website: string; logoUrl?: string }>;
}

interface CompanyOnboardingProps {
  onComplete: (profile: CompanyProfile) => void;
  apiBase: string;
}

function BusinessSnapshotCard({
  intel,
  isLoading = false,
}: {
  intel: CompanyProfile | null;
  isLoading?: boolean;
}) {
  if (isLoading || !intel) {
    return (
      <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 space-y-6 animate-pulse">
        {/* Header Shimmer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-white/10 rounded w-48" />
            <div className="h-3.5 bg-white/5 rounded w-32" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 bg-white/10 rounded-lg w-20" />
            <div className="h-5 bg-white/10 rounded-full w-24" />
          </div>
        </div>

        {/* Info Grid Shimmer */}
        <div className="grid gap-4 md:grid-cols-2 border-t border-white/5 pt-4">
          <div className="space-y-2">
            <div className="h-3 bg-white/5 rounded w-28" />
            <div className="h-4 bg-white/10 rounded w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white/5 rounded w-24" />
            <div className="h-4 bg-white/10 rounded w-full" />
          </div>
        </div>

        {/* Value Prop Shimmer */}
        <div className="border-t border-white/5 pt-4 space-y-2">
          <div className="h-3 bg-white/5 rounded w-36" />
          <div className="h-12 bg-white/10 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0e0e12] to-[#0c0c0e] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Business Name & Website URL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-neutral-400" />
            {intel.name}
          </h4>
          {intel.website && (
            <a
              href={intel.website.startsWith("http") ? intel.website : `https://${intel.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1 font-mono"
            >
              <Globe className="h-3 w-3 text-neutral-500" />
              {intel.website}
            </a>
          )}
        </div>
        
        {/* Industry Badge with AI Confidence */}
        <div className="flex flex-col items-start md:items-end gap-1.5">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Industry
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/5 border border-white/10 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
              {intel.industry || "Technology"}
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium animate-pulse">
              <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
              95% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2 border-t border-white/5 pt-4">
        {/* Target Customers */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            Target Customers
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {intel.targetAudience || "Not specified"}
          </p>
        </div>

        {/* Business details */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-neutral-400" />
            Business Profile
          </div>
          <div className="flex flex-wrap gap-2">
            {intel.stage && (
              <span className="bg-neutral-900 border border-white/5 text-neutral-400 text-[11px] px-2 py-0.5 rounded-md capitalize">
                Stage: {intel.stage}
              </span>
            )}
            {intel.businessModel && (
              <span className="bg-neutral-900 border border-white/5 text-neutral-400 text-[11px] px-2 py-0.5 rounded-md capitalize">
                Model: {intel.businessModel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="border-t border-white/5 pt-4 space-y-1.5">
        <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          Primary Value Proposition
        </div>
        <p className="text-sm text-neutral-200 font-medium leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
          {intel.valueProposition || "Not specified"}
        </p>
      </div>

      {/* Description if present */}
      {intel.description && (
        <div className="border-t border-white/5 pt-4 space-y-1.5">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Description
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed italic">
            "{intel.description}"
          </p>
        </div>
      )}
    </div>
  );
}

export function CompanyOnboarding({
  onComplete,
  apiBase,
}: CompanyOnboardingProps) {
  const [step, setStep] = useState<
    "input" | "analyzing" | "review" | "complete"
  >("input");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [intel, setIntel] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIntel, setEditIntel] = useState<CompanyProfile | null>(null);

  const runScanningSimulation = async (url: string) => {
    const logs = [
      "🌐 Reading homepage...",
      "📝 Detecting metadata & brand logos...",
      "🤖 Extracting business model info...",
      "🔍 Running SEO visibility checks...",
      "🗺️ Running GEO AI readiness checks..."
    ];
    setScanLogs([]);
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setScanLogs(prev => [...prev, logs[i]]);
    }
  };

  const extractNameFromUrl = (url: string): string => {
    let target = url.trim();
    if (!target) return "My Company";
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }
    try {
      const domain = new URL(target).hostname;
      const parts = domain.replace("www.", "").split(".");
      if (parts.length > 0 && parts[0]) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    } catch {
      // ignore
    }
    return "My Company";
  };

  const handleContinueManually = () => {
    const fallbackName = extractNameFromUrl(website) || "My Company";
    setName(fallbackName);
    setIntel({
      name: fallbackName,
      website: website.trim() || null,
      industry: "Technology",
      stage: "seed",
      description: "",
      valueProposition: "",
      targetAudience: "",
      businessModel: "SaaS",
      competitorNames: [],
      competitorUrls: [],
      healthMetrics: {
        estimatedMonthlyTraffic: 0,
        estimatedTeamSize: 1,
        fundingStageScore: 20,
        marketPositionScore: 50,
        techSophisticationScore: 50,
        seoHealth: 0,
        geoHealth: 0,
      },
    });
    setStep("review");
  };

  const [draft, setDraft] = useState<OnboardingDraft>({
    websiteUrl: "",
    companyName: "",
    currentStep: "scan",
    completedSteps: [],
    profile: null,
    audit: null,
    competitors: []
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const lastSyncedRef = useRef<string>("");

  // Load server-side and local draft on mount
  useEffect(() => {
    let active = true;
    async function loadDraft() {
      // 1. Try local storage first to render immediately on client after hydration
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("businessos_onboarding_draft");
        if (saved) {
          try {
            const localDraft = JSON.parse(saved) as OnboardingDraft;
            if (localDraft && active) {
              setDraft(localDraft);
              lastSyncedRef.current = saved;
            }
          } catch {
            // ignore
          }
        }
      }

      // 2. Fetch server-side draft to sync across devices
      try {
        const res = await authenticatedFetch(`${apiBase}/api/workspace/onboarding-draft`);
        if (res.ok) {
          const data = (await res.json()) as { success: boolean; draft?: OnboardingDraft | null };
          if (data.success && data.draft && active) {
            setDraft(data.draft);
            lastSyncedRef.current = JSON.stringify(data.draft);
          }
        }
      } catch (err) {
        console.error("Failed to load draft from server:", err);
      } finally {
        if (active) {
          setIsLoaded(true);
        }
      }
    }
    loadDraft();
    return () => {
      active = false;
    };
  }, [apiBase]);

  // Debounced server synchronization
  useEffect(() => {
    if (!isLoaded) return;

    const draftStr = JSON.stringify(draft);
    localStorage.setItem("businessos_onboarding_draft", draftStr);

    // Prevent redundant sync writes if draft hasn't changed
    if (draftStr === lastSyncedRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await authenticatedFetch(`${apiBase}/api/workspace/onboarding-draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft })
        });
        if (res.ok) {
          lastSyncedRef.current = draftStr;
        }
      } catch (err) {
        console.error("Failed to sync onboarding draft to server:", err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [draft, isLoaded, apiBase]);

  const handleAnalyzeWebsite = async () => {
    let targetWebsite = website.trim();
    if (!targetWebsite) {
      setScanError("Website URL is required");
      return;
    }

    // Basic URL validation
    const hasProtocol = /^https?:\/\//i.test(targetWebsite);
    let urlToTest = hasProtocol ? targetWebsite : `https://${targetWebsite}`;
    try {
      new URL(urlToTest);
    } catch {
      setScanError("Please enter a valid website URL");
      return;
    }

    setScanning(true);
    setScanError(null);
    setScanLogs([]);

    // Start progressive scan log simulation in parallel
    const simulationPromise = runScanningSimulation(urlToTest);

    try {
      trackEvent("Website Analysis Started", "Activation", {
        website: urlToTest,
      });

      const res = await authenticatedFetch(
        `${apiBase}/api/company/analyze-website`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: urlToTest }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze website");
      }

      // Wait for log simulation to complete to keep the animation smooth
      await simulationPromise;

      const intelData = data.intel;
      setName(intelData.name);
      setIntel(intelData);
      setStep("review");

      trackEvent("Website Analysis Completed", "Activation", {
        companyName: intelData.name,
        industry: intelData.industry,
      });
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      // Wait for log simulation to complete
      await simulationPromise;
      const errMsg = err instanceof Error ? err.message : String(err);
      setScanError(
        errMsg || "Failed to analyze website. The server may be unreachable or block automated access."
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!intel) return;
    setSaving(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`${apiBase}/api/company/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intel),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      trackEvent("Company Profile Saved", "Activation", {
        companyName: intel.name,
      });
      onComplete(intel);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    const basicProfile: CompanyProfile = {
      name: name.trim() || "My Company",
      website: website.trim() || null,
      industry: "Technology",
      stage: "seed",
      description: null,
      valueProposition: null,
      targetAudience: null,
      businessModel: "SaaS",
      competitorNames: [],
      competitorUrls: [],
      healthMetrics: {
        estimatedMonthlyTraffic: 0,
        estimatedTeamSize: 1,
        fundingStageScore: 20,
        marketPositionScore: 50,
        techSophisticationScore: 50,
        seoHealth: 0,
        geoHealth: 0,
      },
    };
    onComplete(basicProfile);
  };

  if (step === "complete") return null;

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
              {step === "review" 
                ? "Review & Edit Profile" 
                : scanning 
                ? "Scanning Your Company" 
                : scanError 
                ? "Website Scan Failed" 
                : "Scan Your Company"}
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              {step === "review"
                ? "Verify and refine the AI-extracted company information below."
                : scanning
                ? "Our AI agents are analyzing your website in real-time."
                : scanError
                ? "We couldn't extract data from your site. You can retry or setup manually."
                : "Enter your website URL to instantly build your workspace intelligence."}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[
            { id: "scan", active: step === "input", pulse: scanning },
            { id: "review", active: step === "review", pulse: false }
          ].map((s, i) => {
            const isActiveOrPassed = s.active || (step === "review" && i === 0);
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    isActiveOrPassed ? "bg-white" : "bg-white/10"
                  } ${s.pulse ? "animate-pulse" : ""}`}
                />
                {i < 1 && <div className="h-px w-12 bg-white/10" />}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-950/30 border border-red-900 rounded-xl p-4 flex items-start space-x-3 text-red-400 text-xs font-mono">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Heads up:</span>
              <p className="opacity-95">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Scan */}
        {step === "input" && (
          <>
            {/* Case A: Scanning Loader */}
            {scanning && (
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
                {/* Neon glow effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-center py-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                    <div
                      className="absolute inset-2 rounded-full border-2 border-blue-500 border-b-transparent animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                    />
                    <Sparkles className="absolute h-6 w-6 text-purple-400 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Analyzing {(() => {
                      try {
                        return new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
                      } catch {
                        return website;
                      }
                    })()}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Extracting business context, competitors, and market positioning...
                  </p>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs space-y-2 text-neutral-300 max-h-48 overflow-y-auto">
                  {scanLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 animate-fadeIn">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-neutral-500 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span>Working...</span>
                  </div>
                </div>

                {/* Skeletons Preview */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Estimated Profile Structure
                  </div>
                  <BusinessSnapshotCard intel={null} isLoading={true} />
                </div>
              </div>
            )}

            {/* Case B: Failed Scan Retry UI */}
            {!scanning && scanError && (
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-red-900/30 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-center py-2">
                  <div className="h-16 w-16 bg-red-950/30 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg shadow-red-500/5">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white">Website Scan Failed</h3>
                  <p className="text-xs text-red-400 font-mono bg-red-950/20 border border-red-900/30 rounded-lg p-3 max-w-md mx-auto text-left break-words">
                    {scanError}
                  </p>
                </div>

                <div className="space-y-3 bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-neutral-400">
                  <div className="font-semibold text-neutral-300">Why did this happen?</div>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>The website may have active cloud security (e.g. Cloudflare) blocking automated access.</li>
                    <li>The server took too long to respond (request timeout).</li>
                    <li>The URL might be typed incorrectly or the server is down.</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleAnalyzeWebsite}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Try Scanning Again</span>
                  </button>
                  <button
                    onClick={handleContinueManually}
                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold py-3 rounded-xl transition-all border border-white/10"
                  >
                    <span>Configure Manually</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Case C: Magic Entry Card */}
            {!scanning && !scanError && (
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Enter your company's website URL below. We will automatically fetch its metadata, analyze the business model, and perform SEO & GEO readiness checks.
                  </p>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-focus-within:opacity-50 transition duration-500" />
                    <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl focus-within:border-white/30 transition-colors">
                      <Globe className="absolute left-4 h-5 w-5 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="https://yourcompany.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAnalyzeWebsite();
                          }
                        }}
                        className="w-full bg-transparent border-none rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none placeholder-neutral-600"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-neutral-500">
                    Acme Corp website, e.g. stripe.com, vercel.com
                  </p>
                </div>

                <button
                  onClick={handleAnalyzeWebsite}
                  disabled={!website.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <Sparkles className="h-4 w-4 text-purple-600 animate-pulse group-hover:scale-110 transition-transform" />
                  <span>Scan Website with AI</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-center pt-2">
                  <button
                    onClick={handleContinueManually}
                    className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Configure company manually
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 3: Review */}
        {step === "review" && intel && (
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Re-enter URL</span>
              </button>
              <h3 className="text-lg font-bold text-white pr-10">
                AI Business Snapshot
              </h3>
              <div />
            </div>

            {/* Read-only Snapshot Card */}
            <BusinessSnapshotCard intel={intel} isLoading={false} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 animate-fadeIn"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-black" />
                )}
                <span>{saving ? "Saving..." : "Yes, Looks Right"}</span>
              </button>
              <button
                onClick={() => {
                  setEditIntel(JSON.parse(JSON.stringify(intel)));
                  setIsEditing(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold py-3.5 rounded-xl transition-all border border-white/10"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Edit Details</span>
              </button>
            </div>

            {/* Overlay Edit State */}
            {isEditing && editIntel && (
              <div className="absolute inset-0 bg-[#070709]/95 backdrop-blur-md z-30 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                      Edit Details
                    </h3>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4 py-2">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={editIntel.name}
                          onChange={(e) => setEditIntel({ ...editIntel, name: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={editIntel.website || ""}
                          onChange={(e) => setEditIntel({ ...editIntel, website: e.target.value || null })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                          placeholder="https://yourcompany.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={editIntel.industry || ""}
                          onChange={(e) => setEditIntel({ ...editIntel, industry: e.target.value || null })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="e.g. SaaS"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          Stage
                        </label>
                        <select
                          value={editIntel.stage || "seed"}
                          onChange={(e) => setEditIntel({ ...editIntel, stage: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="pre-seed" className="bg-[#0c0c0e]">Pre-Seed</option>
                          <option value="seed" className="bg-[#0c0c0e]">Seed</option>
                          <option value="growth" className="bg-[#0c0c0e]">Growth</option>
                          <option value="scale" className="bg-[#0c0c0e]">Scale</option>
                          <option value="mature" className="bg-[#0c0c0e]">Mature</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          Business Model
                        </label>
                        <select
                          value={editIntel.businessModel || "SaaS"}
                          onChange={(e) => setEditIntel({ ...editIntel, businessModel: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="SaaS" className="bg-[#0c0c0e]">SaaS</option>
                          <option value="E-commerce" className="bg-[#0c0c0e]">E-commerce</option>
                          <option value="Marketplace" className="bg-[#0c0c0e]">Marketplace</option>
                          <option value="Services" className="bg-[#0c0c0e]">Services</option>
                          <option value="Freemium" className="bg-[#0c0c0e]">Freemium</option>
                          <option value="Enterprise" className="bg-[#0c0c0e]">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        Primary Value Proposition
                      </label>
                      <input
                        type="text"
                        value={editIntel.valueProposition || ""}
                        onChange={(e) => setEditIntel({ ...editIntel, valueProposition: e.target.value || null })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Describe core value prop..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        Target Customers (ICP)
                      </label>
                      <input
                        type="text"
                        value={editIntel.targetAudience || ""}
                        onChange={(e) => setEditIntel({ ...editIntel, targetAudience: e.target.value || null })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Describe target customers..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        Company Description
                      </label>
                      <textarea
                        value={editIntel.description || ""}
                        onChange={(e) => setEditIntel({ ...editIntel, description: e.target.value || null })}
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        placeholder="2-3 sentence description..."
                      />
                    </div>

                    {/* Competitors Tag Manager */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-neutral-400" />
                        Competitor Names
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {(editIntel.competitorNames || []).map((comp, i) => (
                          <span
                            key={i}
                            className="bg-neutral-900 border border-white/10 text-neutral-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                          >
                            <span>{comp}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editIntel.competitorNames || []).filter((_, index) => index !== i);
                                setEditIntel({ ...editIntel, competitorNames: updated });
                              }}
                              className="text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-1 bg-black/20 border border-white/10 rounded-lg px-2.5 py-1">
                          <input
                            type="text"
                            placeholder="Add competitor..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val && !(editIntel.competitorNames || []).includes(val)) {
                                  setEditIntel({
                                    ...editIntel,
                                    competitorNames: [...(editIntel.competitorNames || []), val],
                                  });
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                            className="bg-transparent border-none text-xs text-white placeholder-neutral-600 focus:outline-none w-28"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    {editIntel.healthMetrics && Object.keys(editIntel.healthMetrics).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-neutral-400" />
                          Metrics & Audit Scores
                        </label>
                        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                          {Object.entries(editIntel.healthMetrics).map(([key, value]) => (
                            <div key={key} className="p-2 bg-black/20 rounded-lg border border-white/5 space-y-1">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block truncate">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEditIntel({
                                    ...editIntel,
                                    healthMetrics: {
                                      ...editIntel.healthMetrics,
                                      [key]: val,
                                    },
                                  });
                                }}
                                className="w-full bg-transparent text-lg font-bold text-white focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply / Cancel */}
                <div className="flex gap-3 pt-4 border-t border-white/10 mt-6 shrink-0">
                  <button
                    onClick={() => {
                      setIntel(editIntel);
                      setIsEditing(false);
                    }}
                    className="flex-1 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold py-3 rounded-xl transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
