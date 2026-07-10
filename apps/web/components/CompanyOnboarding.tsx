"use client";

import { useState, useEffect } from "react";
import { Globe, Sparkles, Loader2, CheckCircle, AlertCircle, ArrowRight, Building2, TrendingUp, Users, Zap, Shield } from "lucide-react";
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

interface CompanyOnboardingProps {
  onComplete: (profile: CompanyProfile) => void;
  apiBase: string;
}

export function CompanyOnboarding({ onComplete, apiBase }: CompanyOnboardingProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "review" | "complete">("input");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [intel, setIntel] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
        trackEvent("Website Analysis Started", "Activation", { companyName: name });

        const res = await authenticatedFetch(`${apiBase}/api/company/analyze-website`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: website.trim() }),
        });

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
      }

      setIntel(intelData as CompanyProfile);
      setStep("review");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze website. You can continue without it.");
      setIntel({
        name: name.trim(),
        website: website.trim() || null,
        industry: null,
        stage: null,
        description: null,
        valueProposition: null,
        targetAudience: null,
        businessModel: null,
        competitorNames: [],
        competitorUrls: [],
        healthMetrics: {},
      });
      setStep("review");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!intel) return;

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

      trackEvent("Company Profile Saved", "Activation", { companyName: intel.name });
      onComplete(intel);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  const handleSkip = () => {
    const basicProfile: CompanyProfile = {
      name: name.trim(),
      website: website.trim() || null,
      industry: null,
      stage: null,
      description: null,
      valueProposition: null,
      targetAudience: null,
      businessModel: null,
      competitorNames: [],
      competitorUrls: [],
      healthMetrics: {},
    };
    onComplete(basicProfile);
  };

  const getStageColor = (stage: string | null) => {
    switch (stage?.toLowerCase()) {
      case "pre-seed": return "text-yellow-400 bg-yellow-400/10";
      case "seed": return "text-green-400 bg-green-400/10";
      case "growth": return "text-blue-400 bg-blue-400/10";
      case "scale": return "text-purple-400 bg-purple-400/10";
      default: return "text-neutral-400 bg-neutral-400/10";
    }
  };

  const getStageIcon = (stage: string | null) => {
    switch (stage?.toLowerCase()) {
      case "pre-seed": return <Sparkles className="h-3 w-3" />;
      case "seed": return <Zap className="h-3 w-3" />;
      case "growth": return <TrendingUp className="h-3 w-3" />;
      case "scale": return <Building2 className="h-3 w-3" />;
      default: return <Building2 className="h-3 w-3" />;
    }
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
              We&apos;ll use this to personalize your BusinessOS experience and provide relevant insights.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {["input", "analyzing", "review"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full transition-all ${
                (step === s || (step === "review" && i < 2)) ? "bg-white" : "bg-white/10"
              } ${step === "analyzing" && i === 1 ? "animate-pulse" : ""}`} />
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
                  Company Website <span className="text-neutral-500">(optional)</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors pl-12"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  We&apos;ll analyze your site to understand your business, competitors, and market position.
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeWebsite}
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
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
                <div className="absolute inset-4 rounded-full border-4 border-purple-500 border-b-transparent animate-spin" style={{ animationDirection: "reverse" }} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Analyzing your website...</h3>
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
            <h3 className="text-lg font-bold text-white text-center">Review your company profile</h3>

            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Company Name</label>
                <p className="text-white font-medium">{intel.name}</p>
              </div>
              {intel.website && (
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Website</label>
                  <a href={intel.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-mono flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {intel.website}
                  </a>
                </div>
              )}
            </div>

            {/* AI Extracted Info */}
            {(intel.industry || intel.stage || intel.businessModel) && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  AI-Extracted Intelligence
                </h4>
                <div className="grid gap-3 md:grid-cols-3">
                  {intel.industry && (
                    <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Industry</label>
                      <p className="text-white text-sm">{intel.industry}</p>
                    </div>
                  )}
                  {intel.stage && (
                    <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Stage</label>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono ${getStageColor(intel.stage)}`}>
                        {getStageIcon(intel.stage)}
                        {intel.stage}
                      </span>
                    </div>
                  )}
                  {intel.businessModel && (
                    <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Business Model</label>
                      <p className="text-white text-sm capitalize">{intel.businessModel.toLowerCase()}</p>
                    </div>
                  )}
                </div>

                {(intel.valueProposition || intel.targetAudience) && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {intel.valueProposition && (
                      <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Value Proposition</label>
                        <p className="text-white text-sm">{intel.valueProposition}</p>
                      </div>
                    )}
                    {intel.targetAudience && (
                      <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Target Audience</label>
                        <p className="text-white text-sm">{intel.targetAudience}</p>
                      </div>
                    )}
                  </div>
                )}

                {intel.competitorNames && intel.competitorNames.length > 0 && (
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Detected Competitors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {intel.competitorNames.slice(0, 5).map((comp, i) => (
                        <span key={i} className="bg-neutral-800 border border-white/10 text-neutral-300 text-xs px-2 py-1 rounded">
                          {comp}
                        </span>
                      ))}
                      {intel.competitorNames.length > 5 && (
                        <span className="text-neutral-500 text-xs">+{intel.competitorNames.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}

                {intel.healthMetrics && Object.keys(intel.healthMetrics).length > 0 && (
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Health Metrics (Estimated)
                    </label>
                    <div className="grid gap-2 md:grid-cols-3">
                      {Object.entries(intel.healthMetrics).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-black/20 rounded-lg">
                          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toFixed(0) : value}</p>
                          <p className="text-xs text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm font-semibold py-3 rounded-xl transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Save & Continue</span>
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold py-3 rounded-xl transition-all border border-white/10"
              >
                <Shield className="h-4 w-4" />
                <span>Skip for now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}