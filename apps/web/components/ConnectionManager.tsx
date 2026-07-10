"use client";

import React, { useState } from "react";
import Nango from "@nangohq/frontend";
import {
  Link,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Instagram,
  Mail,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { authenticatedFetch } from "../lib/api";

interface ConnectionManagerProps {
  apiBase: string;
  activeWorkspace: any;
  connectorStatus: any;
  onRefresh: () => void;
}

export function ConnectionManager({
  apiBase,
  activeWorkspace,
  connectorStatus,
  onRefresh,
}: ConnectionManagerProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleConnectProvider = async (
    providerConfigKey: string,
    friendlyName: string,
  ) => {
    if (!activeWorkspace) {
      setError("Please create and open a workspace first.");
      return;
    }

    // Auto-generate stable connection ID and display names
    const connectionId = `conn-${activeWorkspace.name.toLowerCase().replace(/\s+/g, "-")}-${providerConfigKey}`;
    const displayName = `${activeWorkspace.name} ${friendlyName}`;

    setConnectingId(providerConfigKey);
    setError(null);
    setSuccessMsg(null);

    try {
      console.log(
        `📡 [Nango Session] Requesting short-lived session token from backend for connection ID: ${connectionId}...`,
      );

      // 1. Get Nango Session Token from Fastify backend (which queries Nango Cloud securely using the Secret API Key)
      const tokenRes = await authenticatedFetch(`${apiBase}/api/connectors/nango/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId,
          providerConfigKey,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(
          tokenData.error || "Failed to generate connection session token.",
        );
      }

      const sessionToken = tokenData.token;
      console.log(
        "✅ [Nango Session] Token received. Initializing Connect UI popup...",
      );

      // 2. Instantiate Nango with the session token
      const nango = new Nango({
        connectSessionToken: sessionToken,
      });

      // 3. Open the Nango Connect UI using the session token and listen for the connect event
      const connectUI = nango.openConnectUI({
        sessionToken: sessionToken,
        onEvent: async (event) => {
          console.log(
            `📥 [Nango Connect UI] Event received: ${event.type}`,
            event,
          );

          if (event.type === "connect") {
            console.log(
              "✅ [Nango Connect UI] Authorized successfully. Registering source context in SQLite...",
            );

            try {
              const connectRes = await authenticatedFetch(
                `${apiBase}/api/connectors/nango/connect`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    connectionId,
                    providerConfigKey,
                    displayName,
                  }),
                },
              );

              const connectData = await connectRes.json();
              if (!connectRes.ok || !connectData.success) {
                throw new Error(
                  connectData.error ||
                    "Failed to register active connection in workspace database.",
                );
              }

              setSuccessMsg(
                `Successfully connected to ${friendlyName}! Real-time data sync has started.`,
              );
              onRefresh();
            } catch (err: any) {
              setError(err.message || "Failed to persist connection state.");
            } finally {
              connectUI.close();
              setConnectingId(null);
            }
          } else if (event.type === "close") {
            console.log("⚠️ [Nango Connect UI] Closed by user.");
            connectUI.close();
            setConnectingId(null);
          } else if (event.type === "error") {
            const errMessage =
              event.payload?.errorMessage || "Unknown authorization failure.";
            console.error("❌ [Nango Connect UI] Error callback:", errMessage);
            setError(errMessage);
            connectUI.close();
            setConnectingId(null);
          }
        },
      });
    } catch (err: any) {
      console.error(`❌ Integration error for ${friendlyName}:`, err);
      setError(
        err.message || `Could not initiate connection to ${friendlyName}.`,
      );
      setConnectingId(null);
    }
  };

  // Helper checking if a connector state is active
  const getStatusInfo = (providerKey: string) => {
    const statusObj =
      connectorStatus?.[
        providerKey === "instagram-posts"
          ? "instagram"
          : providerKey === "gmail-threads"
            ? "gmail"
            : "google_ads"
      ];
    const isConnected =
      statusObj?.state === "connected" || statusObj?.state === "ready";
    const lastSync = statusObj?.lastSync;
    return { isConnected, lastSync };
  };

  const connectors = [
    {
      id: "instagram-posts",
      title: "Instagram Organic Feed",
      description:
        "Sync your marketing posts, reaches, impressions, and conversions.",
      icon: Instagram,
      color: "text-pink-400 hover:border-pink-500/40",
    },
    {
      id: "gmail-threads",
      title: "Gmail Inbound Sales",
      description:
        "Track customer leads, queries, and conversations automatically.",
      icon: Mail,
      color: "text-red-400 hover:border-red-500/40",
    },
    {
      id: "google-ads",
      title: "Google Ads Campaigns",
      description:
        "Analyze search impressions, budgets, clicks, and conversion rates.",
      icon: TrendingUp,
      color: "text-blue-400 hover:border-blue-500/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert panels */}
      {error && (
        <div className="bg-red-950/30 border border-red-900 rounded-xl p-4 flex items-start space-x-3 text-red-400 text-xs font-mono">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Connection Failed:</span>
            <p className="opacity-95">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-4 flex items-start space-x-3 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-emerald-300" />
          <div className="space-y-1">
            <span className="font-bold">Success:</span>
            <p className="opacity-95">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Dynamic Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {connectors.map((item) => {
          const { isConnected, lastSync } = getStatusInfo(item.id);
          const Icon = item.icon;
          const isProcessing = connectingId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-[#0b0c10] border border-neutral-800 rounded-2xl p-6 transition-all duration-200 shadow-xl flex flex-col justify-between min-h-[220px] ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8 text-neutral-300" />

                  {isConnected ? (
                    <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold uppercase">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">
                      Disconnected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="space-y-3">
                {isConnected && lastSync && (
                  <p className="text-[10px] font-mono text-neutral-500">
                    Last Synced: {new Date(lastSync).toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => handleConnectProvider(item.id, item.title)}
                  disabled={isProcessing}
                  className={`w-full font-mono text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer ${
                    isConnected
                      ? "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                      : "bg-sky-600 hover:bg-sky-500 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>CONNECTING...</span>
                    </>
                  ) : isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>RECONNECT SERVICE</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4" />
                      <span>CONNECT ACCOUNT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
