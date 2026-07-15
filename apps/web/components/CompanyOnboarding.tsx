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
    if (!name.trim()) {
      setError("Company name is required");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setStep("analyzing");

    try {
      const intelData: Partial<CompanyProfile> = {
        name: name.trim(),
        website: website.trim() || null,
      };

      if (website.trim()) {
        trackEvent("Website Analysis Started", "Activation", {
          companyName: name,
        });

        let targetWebsite = website.trim();
        if (!/^https?:\/\//i.test(targetWebsite)) {
          targetWebsite = `https://${targetWebsite}`;
        }

        const res = await authenticatedFetch(
          `${apiBase}/api/company/analyze-website`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ website: targetWebsite }),
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to analyze website");
        }

        intelData.industry = data.intel.industry;
        intelData.stage = data.intel.stage;
        intelData.description = data.intel.description;
        intelData.valueProposition = data.intel.valueProposition;
        intelData.targetAudience = data.intel.targetAudience;
        intelData.businessModel = data.intel.businessModel;
        intelData.competitorNames = data.intel.competitorNames || [];
        intelData.competitorUrls = data.intel.competitorUrls || [];
        intelData.healthMetrics = data.intel.healthMetrics || {};

        trackEvent("Website Analysis Completed", "Activation", {
          companyName: name,
          industry: data.intel.industry,
        });
      } else {
        intelData.industry = "Technology";
        intelData.stage = "seed";
        intelData.businessModel = "SaaS";
        intelData.description = `${name.trim()} operates in the technology sector.`;
        intelData.valueProposition = "Providing innovative software solutions.";
        intelData.targetAudience = "Businesses and developers.";
        intelData.competitorNames = [];
        intelData.competitorUrls = [];
        intelData.healthMetrics = {
          estimatedMonthlyTraffic: 0,
          estimatedTeamSize: 1,
          fundingStageScore: 20,
          marketPositionScore: 50,
          techSophisticationScore: 50,
          seoHealth: 0,
          geoHealth: 0,
        };
      }

      setIntel(intelData as CompanyProfile);
      setStep("review");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(
        err.message ||
          "Failed to analyze website. You can continue without it.",
      );
      setIntel({
        name: name.trim(),
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
    } finally {
      setAnalyzing(false);
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
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
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
              Tell us about your company
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              We&apos;ll use this to personalize your BusinessOS experience and
              provide relevant insights.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {["input", "analyzing", "review"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  step === s || (step === "review" && i < 2)
                    ? "bg-white"
                    : "bg-white/10"
                } ${step === "analyzing" && i === 1 ? "animate-pulse" : ""}`}
              />
              {i < 2 && <div className="h-px w-12 bg-white/10" />}
            </div>
          ))}
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

        {/* Step 1: Input */}
        {step === "input" && (
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  Company Website{" "}
                  <span className="text-neutral-500">(optional)</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors pl-12"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  We&apos;ll analyze your site to understand your business,
                  competitors, and market position.
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeWebsite}
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
              <span>Analyze & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === "analyzing" && (
          <div className="bg-[#0c0c0e] border border-white/10 p-8 rounded-2xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <div
                  className="absolute inset-4 rounded-full border-4 border-purple-500 border-b-transparent animate-spin"
                  style={{ animationDirection: "reverse" }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Analyzing your website...
              </h3>
              <p className="text-sm text-neutral-400">
                Extracting business context, competitors, and market position
              </p>
            </div>
            <div className="flex justify-center gap-6 text-xs text-neutral-500 font-mono">
              <span>Fetching content...</span>
              <span>AI Analysis...</span>
              <span>Structuring data...</span>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && intel && (
          <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Re-enter URL</span>
              </button>
              <h3 className="text-lg font-bold text-white pr-10">
                Review & Edit Profile
              </h3>
              <div />
            </div>

            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Company Name
                </label>
                <input
                  type="text"
                  value={intel.name}
                  onChange={(e) => setIntel({ ...intel, name: e.target.value })}
                  className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white font-medium focus:outline-none transition-colors py-0.5 text-sm"
                />
              </div>
              <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Website URL
                </label>
                <input
                  type="url"
                  value={intel.website || ""}
                  onChange={(e) => setIntel({ ...intel, website: e.target.value || null })}
                  className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-blue-400 font-mono text-sm focus:outline-none transition-colors py-0.5"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            {/* AI Extracted Info */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-purple-400" />
                Company Intelligence Details
              </h4>
              
              <div className="grid gap-3 md:grid-cols-3">
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={intel.industry || ""}
                    onChange={(e) => setIntel({ ...intel, industry: e.target.value || null })}
                    className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5"
                    placeholder="e.g. SaaS"
                  />
                </div>
                
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Stage
                  </label>
                  <select
                    value={intel.stage || "seed"}
                    onChange={(e) => setIntel({ ...intel, stage: e.target.value })}
                    className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5"
                  >
                    <option value="pre-seed" className="bg-[#0c0c0e] text-white">Pre-Seed</option>
                    <option value="seed" className="bg-[#0c0c0e] text-white">Seed</option>
                    <option value="growth" className="bg-[#0c0c0e] text-white">Growth</option>
                    <option value="scale" className="bg-[#0c0c0e] text-white">Scale</option>
                    <option value="mature" className="bg-[#0c0c0e] text-white">Mature</option>
                  </select>
                </div>

                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Business Model
                  </label>
                  <select
                    value={intel.businessModel || "SaaS"}
                    onChange={(e) => setIntel({ ...intel, businessModel: e.target.value })}
                    className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5"
                  >
                    <option value="SaaS" className="bg-[#0c0c0e] text-white">SaaS</option>
                    <option value="E-commerce" className="bg-[#0c0c0e] text-white">E-commerce</option>
                    <option value="Marketplace" className="bg-[#0c0c0e] text-white">Marketplace</option>
                    <option value="Services" className="bg-[#0c0c0e] text-white">Services</option>
                    <option value="Freemium" className="bg-[#0c0c0e] text-white">Freemium</option>
                    <option value="Enterprise" className="bg-[#0c0c0e] text-white">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Value Proposition
                  </label>
                  <input
                    type="text"
                    value={intel.valueProposition || ""}
                    onChange={(e) => setIntel({ ...intel, valueProposition: e.target.value || null })}
                    className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5"
                    placeholder="Describe core value prop..."
                  />
                </div>
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Target Audience (ICP)
                  </label>
                  <input
                    type="text"
                    value={intel.targetAudience || ""}
                    onChange={(e) => setIntel({ ...intel, targetAudience: e.target.value || null })}
                    className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5"
                    placeholder="Describe ICP/audience..."
                  />
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5">
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Company Description
                </label>
                <textarea
                  value={intel.description || ""}
                  onChange={(e) => setIntel({ ...intel, description: e.target.value || null })}
                  rows={2}
                  className="w-full bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors py-0.5 resize-none"
                  placeholder="2-3 sentence description..."
                />
              </div>

              {/* Competitors Tag Manager */}
              <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3 text-neutral-400" />
                  Competitor Names
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {(intel.competitorNames || []).map((comp, i) => (
                    <span
                      key={i}
                      className="bg-neutral-900 border border-white/10 text-neutral-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <span>{comp}</span>
                      <button
                        onClick={() => {
                          const updated = (intel.competitorNames || []).filter((_, index) => index !== i);
                          setIntel({ ...intel, competitorNames: updated });
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
                          if (val && !(intel.competitorNames || []).includes(val)) {
                            setIntel({
                              ...intel,
                              competitorNames: [...(intel.competitorNames || []), val],
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
              {intel.healthMetrics && Object.keys(intel.healthMetrics).length > 0 && (
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-neutral-400" />
                    Metrics & Audit Scores
                  </label>
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    {Object.entries(intel.healthMetrics).map(([key, value]) => (
                      <div key={key} className="p-2 bg-black/20 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider block truncate">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setIntel({
                              ...intel,
                              healthMetrics: {
                                ...intel.healthMetrics,
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-black" />
                )}
                <span>{saving ? "Saving..." : "Save & Continue"}</span>
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold py-3 rounded-xl transition-all border border-white/10"
              >
                <Shield className="h-4 w-4 text-neutral-400" />
                <span>Skip for now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
