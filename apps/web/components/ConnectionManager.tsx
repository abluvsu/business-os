"use client";

import React, { useState, useEffect, useRef } from "react";
import Nango from "@nangohq/frontend";
import {
  Link,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Key,
} from "lucide-react";

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
  const [publicKey, setPublicKey] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [providerConfigKey, setProviderConfigKey] = useState("instagram-posts");
  const [connectionId, setConnectionId] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nangoRef = useRef<Nango | null>(null);

  // Initialize Nango client side
  useEffect(() => {
    if (typeof window !== "undefined" && publicKey) {
      nangoRef.current = new Nango({
        publicKey: publicKey,
      });
    }
  }, [publicKey]);

  // Set default connection ID when workspace updates
  useEffect(() => {
    if (activeWorkspace) {
      setConnectionId(
        `conn-${activeWorkspace.name.toLowerCase().replace(/\s+/g, "-")}-${providerConfigKey}`,
      );
      setDisplayName(
        `${activeWorkspace.name} ${providerConfigKey.toUpperCase()}`,
      );
    }
  }, [activeWorkspace, providerConfigKey]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !publicKey ||
      !apiKey ||
      !providerConfigKey ||
      !connectionId ||
      !displayName
    ) {
      setError("Please fill in all Nango integration credentials.");
      return;
    }

    if (!nangoRef.current) {
      setError("Nango SDK not initialized. Please verify your Public Key.");
      return;
    }

    setConnecting(true);
    setError(null);
    setSuccess(false);

    try {
      console.log(
        `⚡ [Nango] Triggering OAuth popup for provider: ${providerConfigKey}, connection: ${connectionId}...`,
      );

      // 1. Trigger the live OAuth flow popup
      await nangoRef.current.auth(providerConfigKey, connectionId);

      console.log(
        "✅ [Nango] OAuth verification successful. Registering connection in local SQLite...",
      );

      // 2. Save credentials and connection mapping in local Fastify database
      const res = await fetch(`${apiBase}/api/connectors/nango/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId,
          providerConfigKey,
          displayName,
          apiKey,
          baseUrl: "https://api.nango.dev",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Failed to register connection on local backend.",
        );
      }

      setSuccess(true);
      onRefresh();
    } catch (err: any) {
      console.error("❌ Nango Connection Failure:", err);
      setError(
        err.message || "OAuth window was closed or authorization failed.",
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl p-6 shadow-2xl text-white">
      <div className="flex items-center space-x-3 mb-6">
        <Key className="h-6 w-6 text-sky-400" />
        <h2 className="text-lg font-bold font-mono tracking-tight">
          Nango Live Connections
        </h2>
      </div>

      <form onSubmit={handleConnect} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Nango Public Key
            </label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="pk_prod_..."
              className="w-full bg-[#12131a] border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Nango Secret API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="dk_prod_..."
              className="w-full bg-[#12131a] border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Provider Config Key
            </label>
            <select
              value={providerConfigKey}
              onChange={(e) => setProviderConfigKey(e.target.value)}
              className="w-full bg-[#12131a] border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            >
              <option value="instagram-posts">instagram-posts</option>
              <option value="gmail-threads">gmail-threads</option>
              <option value="github">github</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Connection ID
            </label>
            <input
              type="text"
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              placeholder="e.g. conn-acme-insta"
              className="w-full bg-[#12131a] border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Acme Instagram Feed"
              className="w-full bg-[#12131a] border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900 rounded-lg p-3 flex items-start space-x-3 text-red-400 text-xs font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/30 border border-emerald-900 rounded-lg p-3 flex items-start space-x-3 text-emerald-400 text-xs font-mono">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Connection verified and registered. Live delta sync worker will
              begin pulling updates shortly!
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={connecting}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {connecting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>LAUNCHING OAUTH POPUP...</span>
            </>
          ) : (
            <>
              <Link className="h-4 w-4" />
              <span>AUTHENTICATE CONNECTION</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
