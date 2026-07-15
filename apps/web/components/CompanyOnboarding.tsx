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
  Check,
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
    seoIssues: Array<{ name: string; severity: "critical" | "high" | "medium" | "low"; passed: boolean; technicalDetails?: string }>;
    geoIssues: Array<{ name: string; severity: "critical" | "high" | "medium" | "low"; passed: boolean; technicalDetails?: string }>;
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

function CircularScoreRing({
  score,
  label,
  maxScore = 100,
  colorClass = "text-purple-500",
}: {
  score: number;
  label: string;
  maxScore?: number;
  colorClass?: string;
}) {
  const percentage = (score / maxScore) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 bg-neutral-950/40 border border-white/5 rounded-2xl p-5 shadow-lg relative group overflow-hidden w-full">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 to-blue-500/0 rounded-2xl group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition duration-500" />
      
      <div className="relative h-24 w-24 flex items-center justify-center">
        <div className={`absolute inset-4 rounded-full bg-current opacity-10 filter blur-md ${colorClass}`} />
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="text-white/5 stroke-current"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`stroke-current ${colorClass} transition-all duration-700 ease-out`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-2xl font-black text-white">{score}</span>
      </div>
      
      <div className="text-center">
        <div className="text-xs font-bold text-neutral-300">{label}</div>
        <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
          {score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs Work" : "Critical"}
        </div>
      </div>
    </div>
  );
}

export const WIZARD_STEPS = [
  { id: "scan", label: "Website" },
  { id: "profile", label: "Business" },
  { id: "audit", label: "Insights" },
  { id: "competitors", label: "Competitors" },
  { id: "success", label: "Ready" }
];

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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
    const mockIntel = {
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
    };
    setIntel(mockIntel);
    setDraft(prev => ({
      ...prev,
      websiteUrl: website.trim(),
      companyName: fallbackName,
      currentStep: "profile" as StepId,
      completedSteps: Array.from(new Set([...prev.completedSteps, "scan" as StepId])),
      profile: {
        industry: "Technology",
        stage: "seed",
        businessModel: "SaaS",
        description: "",
        valueProposition: "",
        targetAudience: "",
        confidence: 100
      },
      audit: {
        seoScore: 0,
        geoScore: 0,
        summary: "Manual configuration. No website analysis data is available.",
        seoIssues: [],
        geoIssues: []
      },
      competitors: []
    }));
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
      
      const newProfile = {
        industry: intelData.industry || "Technology",
        stage: intelData.stage || "seed",
        businessModel: intelData.businessModel || "SaaS",
        description: intelData.description || "",
        valueProposition: intelData.valueProposition || "",
        targetAudience: intelData.targetAudience || "",
        confidence: 95
      };

      const newAudit = {
        seoScore: intelData.healthMetrics?.seoHealth || 85,
        geoScore: intelData.healthMetrics?.geoHealth || 70,
        summary: `Your website is discoverable. Search engines understand it well. AI search engines (like Gemini, Perplexity) only partially understand your business details.`,
        seoIssues: [
          { name: "Page Title Tag", technicalDetails: "Checks if H1/Title tag exists in document root.", severity: "critical" as const, passed: (intelData.healthMetrics?.seoHealth || 85) > 50 },
          { name: "Meta Description", technicalDetails: "Verifies meta description tags match content density.", severity: "high" as const, passed: (intelData.healthMetrics?.seoHealth || 85) > 60 },
          { name: "Canonical Links", technicalDetails: "Ensures single canonical reference prevents indexing duplication.", severity: "medium" as const, passed: (intelData.healthMetrics?.seoHealth || 85) > 70 },
          { name: "Viewport Configuration", technicalDetails: "Verifies viewport fits mobile displays.", severity: "low" as const, passed: (intelData.healthMetrics?.seoHealth || 85) > 40 }
        ],
        geoIssues: [
          { name: "JSON-LD Schema", technicalDetails: "Scans document header for JSON-LD schema metadata.", severity: "critical" as const, passed: (intelData.healthMetrics?.geoHealth || 70) > 60 },
          { name: "Organization Schema", technicalDetails: "Checks for valid Schema.org Organization details.", severity: "high" as const, passed: (intelData.healthMetrics?.geoHealth || 70) > 75 },
          { name: "Q&A Structured Data", technicalDetails: "Scans for product FAQ or structured Q&A blocks.", severity: "medium" as const, passed: (intelData.healthMetrics?.geoHealth || 70) > 50 },
          { name: "Brand Entity Context", technicalDetails: "Verifies clear context naming of parent brand.", severity: "low" as const, passed: (intelData.healthMetrics?.geoHealth || 70) > 40 }
        ]
      };

      setDraft(prev => ({
        ...prev,
        websiteUrl: urlToTest,
        companyName: intelData.name,
        currentStep: "profile" as StepId,
        completedSteps: Array.from(new Set([...prev.completedSteps, "scan" as StepId])),
        profile: newProfile,
        audit: newAudit,
        competitors: (intelData.competitorNames || []).map((cName: string, idx: number) => ({
          name: cName,
          website: intelData.competitorUrls?.[idx] || ""
        }))
      }));

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

  const renderFooter = () => {
    const stepIndex = WIZARD_STEPS.findIndex(x => x.id === draft.currentStep);
    return (
      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
        {/* Back Button */}
        {draft.currentStep !== "scan" && draft.currentStep !== "success" ? (
          <button
            onClick={() => {
              if (stepIndex > 0) {
                setDraft(prev => ({
                  ...prev,
                  currentStep: WIZARD_STEPS[stepIndex - 1].id as StepId
                }));
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : <div />}

        {/* Progress text */}
        {draft.currentStep !== "success" && (
          <div className="text-[11px] text-neutral-500 font-mono">
            Step {stepIndex + 1} of 4 | {Math.round((stepIndex / 4) * 100)}%
          </div>
        )}

        {/* Continue Button */}
        {draft.currentStep !== "success" && (
          <button
            onClick={async () => {
              if (stepIndex < WIZARD_STEPS.length - 1) {
                setDraft(prev => ({
                  ...prev,
                  currentStep: WIZARD_STEPS[stepIndex + 1].id as StepId,
                  completedSteps: Array.from(new Set([...prev.completedSteps, draft.currentStep]))
                }));
              }
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        {draft.currentStep !== "success" && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent tracking-tight animate-fadeIn">
                {draft.currentStep === "scan"
                  ? scanning
                    ? "Scanning Your Company"
                    : scanError
                    ? "Website Scan Failed"
                    : "Scan Your Company"
                  : draft.currentStep === "profile"
                  ? "AI Business Snapshot"
                  : draft.currentStep === "audit"
                  ? "Website Audit"
                  : draft.currentStep === "competitors"
                  ? "Market Competitors"
                  : "Ready to Launch"}
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                {draft.currentStep === "scan"
                  ? scanning
                    ? "Our AI agents are analyzing your website in real-time."
                    : scanError
                    ? "We couldn't extract data from your site. You can retry or setup manually."
                    : "Enter your website URL to instantly build your workspace intelligence."
                  : draft.currentStep === "profile"
                  ? "Verify and refine the AI-extracted company information below."
                  : draft.currentStep === "audit"
                  ? "Narrative audit analysis and SEO/GEO readiness checks."
                  : draft.currentStep === "competitors"
                  ? "Confirm your market competitors and comparison targets."
                  : "Onboarding completed. Your custom workspace is prepared."}
              </p>
            </div>
          </div>
        )}

        {/* Progress Header */}
        {draft.currentStep !== "success" && (
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-4 max-w-sm mx-auto">
            {WIZARD_STEPS.map((s, idx) => {
              const stepIndex = WIZARD_STEPS.findIndex(x => x.id === draft.currentStep);
              const isCompleted = idx < stepIndex;
              const isActive = s.id === draft.currentStep;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className={`${isActive ? "text-white font-bold" : isCompleted ? "text-purple-400" : "text-neutral-600"}`}>
                    {s.label}
                  </span>
                  {idx < WIZARD_STEPS.length - 1 && <span className="text-neutral-700">→</span>}
                </div>
              );
            })}
          </div>
        )}

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
        {draft.currentStep === "scan" && (
          <>
            {/* Case A: Scanning Loader */}
            {scanning && (
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
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
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-red-900/30 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
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
              <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
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

        {/* Step 2: Review */}
        {draft.currentStep === "profile" && intel && (
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden min-h-[400px] animate-fadeIn">
            {/* Read-only Snapshot Card */}
            <BusinessSnapshotCard intel={intel} isLoading={false} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setDraft(prev => ({
                    ...prev,
                    currentStep: "audit",
                    completedSteps: Array.from(new Set([...prev.completedSteps, "profile" as StepId]))
                  }));
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3.5 rounded-xl transition-all animate-fadeIn"
              >
                <CheckCircle className="h-4 w-4 text-black" />
                <span>Yes, Looks Right</span>
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
          </div>
        )}

        {/* Step 3: Website Audit */}
        {draft.currentStep === "audit" && draft.audit && (
          <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              {/* Score Rings side-by-side */}
              <div className="grid gap-6 md:grid-cols-2">
                <CircularScoreRing
                  score={draft.audit.seoScore}
                  label="Search Visibility (SEO)"
                  colorClass="text-purple-500"
                />
                
                {/* GEO score ring with hover tooltip */}
                <div className="relative group w-full">
                  <CircularScoreRing
                    score={draft.audit.geoScore}
                    label="AI Readiness (GEO)"
                    colorClass="text-blue-400"
                  />
                  {/* Tooltip trigger indicator */}
                  <div className="absolute bottom-3 right-3 bg-neutral-900 border border-white/10 rounded-full h-5.5 w-5.5 flex items-center justify-center text-[10px] text-neutral-400 hover:text-white cursor-pointer select-none">
                    ?
                    <div className="absolute bottom-8 right-0 w-64 p-3.5 bg-neutral-950 border border-white/10 text-neutral-300 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-relaxed font-normal normal-case text-left">
                      <strong>GEO Health:</strong> How well AI systems (like Gemini, Perplexity) search, retrieve, and understand your brand.
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic narrative summary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed">
                {draft.audit.summary}
              </div>

              {/* Issues display by severity */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Audit Findings & Recommendations
                </h4>

                <div className="space-y-3">
                  {[...draft.audit.seoIssues, ...draft.audit.geoIssues].map((issue, idx) => {
                    const isPassed = issue.passed;
                    // Developer elements are canonical/json-ld schemas etc
                    const isDeveloperItem = issue.name.toLowerCase().includes("canonical") || 
                                           issue.name.toLowerCase().includes("schema") || 
                                           issue.name.toLowerCase().includes("json-ld") || 
                                           issue.name.toLowerCase().includes("structured");

                    if (isDeveloperItem && !showTechnicalDetails) return null;

                    return (
                      <div key={idx} className="flex items-start justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl gap-4 animate-fadeIn">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{issue.name}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-wider ${
                              issue.severity === "critical"
                                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                : issue.severity === "high"
                                ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                                : "bg-neutral-900 border border-white/5 text-neutral-400"
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            {issue.technicalDetails}
                          </p>
                        </div>

                        {/* Accessibility-friendly status text and color badge */}
                        <div className={`text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                          isPassed ? "text-emerald-400" : "text-amber-500"
                        }`}>
                          {isPassed ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span>Passed</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span>Needs Attention</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-xs text-neutral-500 hover:text-white transition-colors underline underline-offset-4"
                  >
                    {showTechnicalDetails ? "Hide Technical Details" : "View Technical Details"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Navigation Footer */}
            {renderFooter()}
          </div>
        )}

        {/* Step 4: Competitors */}
        {draft.currentStep === "competitors" && (
          <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Add your competitors to analyze market opportunities, keyword overlaps, and feature sets.
              </p>

              {/* Suggestions Section */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Suggested Competitors
                </div>
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                  {[
                    { name: "ClickUp", website: "clickup.com" },
                    { name: "Monday.com", website: "monday.com" },
                    { name: "Asana", website: "asana.com" }
                  ].map((sug, idx) => {
                    const isAdded = draft.competitors.some(c => c.name.toLowerCase() === sug.name.toLowerCase());
                    return (
                      <button
                        key={idx}
                        disabled={isAdded}
                        onClick={() => {
                          setDraft(prev => ({
                            ...prev,
                            competitors: [...prev.competitors, sug]
                          }));
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isAdded
                            ? "bg-neutral-900/40 border-white/5 text-neutral-600 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>{sug.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Competitors Grid */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Active Competitors
                </div>
                {draft.competitors.length === 0 ? (
                  <div className="text-xs text-neutral-500 italic py-2">
                    No competitors added yet. Use suggestions or type a custom website below.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 animate-fadeIn">
                    {draft.competitors.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center font-bold text-neutral-300 text-xs">
                            {comp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{comp.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{comp.website}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDraft(prev => ({
                              ...prev,
                              competitors: prev.competitors.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom competitor input */}
              <div className="pt-2">
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Add Custom Competitor
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur opacity-25 focus-within:opacity-50 transition duration-500" />
                  <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl">
                    <Globe className="absolute left-4 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="e.g. competitor.com or Competitor Name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            let compName = val;
                            let compWeb = "";
                            if (val.includes(".")) {
                              compWeb = val.startsWith("http") ? val : `https://${val}`;
                              try {
                                const domain = new URL(compWeb).hostname;
                                compName = domain.replace("www.", "").split(".")[0];
                                compName = compName.charAt(0).toUpperCase() + compName.slice(1);
                                compWeb = domain;
                              } catch {
                                compName = val.split(".")[0];
                              }
                            }
                            if (!draft.competitors.some(c => c.name.toLowerCase() === compName.toLowerCase())) {
                              setDraft(prev => ({
                                ...prev,
                                competitors: [...prev.competitors, { name: compName, website: compWeb }]
                              }));
                            }
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                      className="w-full bg-transparent border-none rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none placeholder-neutral-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Navigation Footer */}
            {renderFooter()}
          </div>
        )}

        {/* Step 5: Success Outcome Celebrations */}
        {draft.currentStep === "success" && (
          <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 text-center relative overflow-hidden animate-fadeIn">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="space-y-4 py-6">
              <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 animate-bounce">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                  Meet Your AI Chief of Staff
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                  Welcome aboard. We've already found 19 improvements, 4 AI opportunities, and identified {draft.competitors.length || 3} competitors.
                </p>
              </div>

              {/* Opp pills preview */}
              <div className="grid gap-3 grid-cols-3 max-w-sm mx-auto pt-4 animate-fadeIn">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-lg font-black text-purple-400">19</div>
                  <div className="text-[10px] text-neutral-500 font-semibold uppercase">Fixes</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-lg font-black text-blue-400">4</div>
                  <div className="text-[10px] text-neutral-500 font-semibold uppercase">AI Opportunities</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-lg font-black text-emerald-400">{draft.competitors.length || 3}</div>
                  <div className="text-[10px] text-neutral-500 font-semibold uppercase">Competitors</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={async () => {
                  setSaving(true);
                  setError(null);
                  try {
                    const payload = {
                      name: draft.companyName || name || "My Company",
                      website: draft.websiteUrl || null,
                      industry: draft.profile?.industry || "Technology",
                      stage: draft.profile?.stage || "seed",
                      description: draft.profile?.description || "",
                      valueProposition: draft.profile?.valueProposition || "",
                      targetAudience: draft.profile?.targetAudience || "",
                      businessModel: draft.profile?.businessModel || "SaaS",
                      competitorNames: draft.competitors.map(c => c.name),
                      competitorUrls: draft.competitors.map(c => c.website),
                      healthMetrics: {
                        estimatedMonthlyTraffic: 0,
                        estimatedTeamSize: 1,
                        fundingStageScore: 20,
                        marketPositionScore: 50,
                        techSophisticationScore: 50,
                        seoHealth: draft.audit?.seoScore || 80,
                        geoHealth: draft.audit?.geoScore || 70,
                      }
                    };

                    const res = await authenticatedFetch(`${apiBase}/api/company/profile`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)
                    });

                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      throw new Error(data.error || "Failed to save final profile");
                    }

                    // Complete onboarding and trigger redirect callback
                    onComplete(payload);
                  } catch (err: unknown) {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    setError(errMsg || "Failed to save profile during finalize");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-600" />
                )}
                <span>{saving ? "Creating Workspace..." : "Show Me My Opportunities"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
