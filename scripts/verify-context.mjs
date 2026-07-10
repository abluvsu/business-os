#!/usr/bin/env node
/**
 * Company Context Compliance Check
 * Verifies all outputs align with COMPANY_CONTEXT.md principles and vocabulary
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const BANNED_WORDS = [
  "revolutionary",
  "cutting-edge",
  "ai-powered",
  "best-in-class",
  "game-changing",
  "disruptive",
  "groundbreaking",
  "innovative",
  "next-generation",
  "state-of-the-art",
  "world-class",
  "seamless",
  "effortless",
  "magical",
  "unparalleled",
];

const REQUIRED_VOCABULARY = {
  "Business OS": "the local-first AI workspace",
  Founder: "our user; a solo founder running their own marketing",
  Connector: "a read-only link to one of the founder's accounts",
  Conversation: "the primary way the founder interacts with the workspace",
  Insight: "a plain-language explanation of what the founder's data means",
  Chart: "a single, focused visualization supporting a conversation or insight",
  Report: "a shareable summary the founder can take away",
  Context: "the accumulated understanding of the founder's business",
  "Local First": "data stays on the founder's machine by default",
  "Founder Control": "the founder owns their data and decisions at all times",
  "Zero Vendor Lock-in": "the founder can export their data and leave anytime",
  MVP: "the current stage; validate with real users before expanding",
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];
  const warnings = [];

  // Check for banned words
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = content.match(regex);
    if (matches) {
      warnings.push(`Banned word "${word}" found ${matches.length} time(s)`);
    }
  }

  // Check vocabulary usage (in marketing/docs)
  if (
    filePath.includes("marketing") ||
    filePath.includes("docs") ||
    filePath.includes("company")
  ) {
    for (const [term, definition] of Object.entries(REQUIRED_VOCABULARY)) {
      // Just check if key terms appear at all in marketing docs
      if (
        !content.toLowerCase().includes(term.toLowerCase()) &&
        [
          "ICP.md",
          "POSITIONING.md",
          "MESSAGING.md",
          "BRAND_FOUNDATION.md",
        ].some((f) => filePath.includes(f))
      ) {
        warnings.push(
          `Key vocabulary term "${term}" not found in marketing document`,
        );
      }
    }
  }

  // Check for hardcoded secrets patterns
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{32,}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /AIza[a-zA-Z0-9_-]{35}/,
    /Bearer\s+[a-zA-Z0-9_-]{20,}/,
    /password\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      errors.push(`Potential secret/credential detected in ${filePath}`);
    }
  }

  return { errors, warnings };
}

function main() {
  console.log("📋 Verifying Company Context compliance...\n");

  const filesToCheck = [];

  // Collect all markdown and source files
  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          !["node_modules", ".git", ".next", "dist", ".husky"].includes(
            entry.name,
          )
        ) {
          collectFiles(fullPath);
        }
      } else if (/\.(md|ts|tsx|js|jsx|json)$/.test(entry.name)) {
        filesToCheck.push(fullPath);
      }
    }
  }

  collectFiles(ROOT);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of filesToCheck) {
    const relPath = path.relative(ROOT, file);
    const { errors, warnings } = checkFile(file);

    if (errors.length > 0) {
      console.log(`\n❌ ${relPath}:`);
      errors.forEach((e) => console.log(`  ✗ ${e}`));
      totalErrors += errors.length;
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  ${relPath}:`);
      warnings.forEach((w) => console.log(`  ⚠ ${w}`));
      totalWarnings += warnings.length;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`SUMMARY: ${totalErrors} errors, ${totalWarnings} warnings`);

  if (totalErrors > 0) {
    console.log("\n❌ COMPLIANCE CHECK FAILED");
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log("\n⚠️  COMPLIANCE PASSED WITH WARNINGS");
    process.exit(0);
  } else {
    console.log("\n✅ ALL COMPLIANCE CHECKS PASSED");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
