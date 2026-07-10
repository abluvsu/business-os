#!/usr/bin/env node
/**
 * ADR Validation Script
 * Validates Architecture Decision Records against the canonical template
 * Checks format, compliance checkboxes, cross-references, and anti-patterns
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const ADR_TEMPLATE_PATH = path.join(ROOT, "templates", "ADR_TEMPLATE.md");
const DECISIONS_PATH = path.join(ROOT, "company", "DECISIONS.md");

const REQUIRED_SECTIONS = [
  "Context",
  "Decision",
  "Rationale",
  "Consequences",
  "Alternatives considered",
  "Compliance & principles check",
  "References",
];

const PRINCIPLES = [
  "Conversation First",
  "Local First",
  "Founder Control",
  "Context Before AI",
  "Cost First",
  "Zero Vendor Lock-in",
  "Compliance by Design",
  "Everything should feel simple",
];

const VALID_STATUSES = ["Proposed", "Accepted", "Deprecated", "Superseded"];
const VALID_CATEGORIES = [
  "Engineering",
  "Product",
  "Operations",
  "Security",
  "Architecture",
  "UX",
  "Branding",
  "Marketing",
  "Compliance",
];

function findADRFiles() {
  const adrFiles = [];

  // Search common locations
  const searchDirs = [
    "docs/architecture",
    "docs/adr",
    "architecture",
    "adr",
    "company", // DECISIONS.md has compact ADRs
    ".",
  ];

  for (const dir of searchDirs) {
    const fullPath = path.join(ROOT, dir);
    if (!fs.existsSync(fullPath)) continue;

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      if (/ADR-\d+.*\.md$/.test(file) || file === "DECISIONS.md") {
        adrFiles.push(path.join(fullPath, file));
      }
    }
  }

  return adrFiles;
}

function parseADR(content, filePath) {
  const adrs = [];

  // Check if it's DECISIONS.md (compact format)
  if (filePath.endsWith("DECISIONS.md")) {
    const compactADRRegex =
      /### ADR-\d+: (.*?)\n\n- \*\*Status\*\*: (.*?)\n- \*\*Date\*\*: (.*?)\n- \*\*Deciders\*\*: (.*?)\n- \*\*Category\*\*: (.*?)\n\n(.*?)(?=\n### ADR-\d+:|$)/gs;

    let match;
    while ((match = compactADRRegex.exec(content)) !== null) {
      adrs.push({
        title: match[1].trim(),
        status: match[2].trim(),
        date: match[3].trim(),
        deciders: match[4].trim(),
        category: match[5].trim(),
        body: match[6].trim(),
        isCompact: true,
        sourceFile: filePath,
      });
    }
  } else {
    // Full ADR format
    const headerMatch = content.match(/## ADR-(\d+): (.+)/);
    if (!headerMatch) return adrs;

    const frontMatter = {};
    const fmRegex = /-\s*\*\*(Status|Date|Deciders|Category)\*\*:\s*(.+)/g;
    let fmMatch;
    while ((fmMatch = fmRegex.exec(content)) !== null) {
      frontMatter[fmMatch[1]] = fmMatch[2].trim();
    }

    adrs.push({
      number: headerMatch[1],
      title: headerMatch[2].trim(),
      status: frontMatter.Status || "Unknown",
      date: frontMatter.Date || "Unknown",
      deciders: frontMatter.Deciders || "Unknown",
      category: frontMatter.Category || "Unknown",
      body: content,
      isCompact: false,
      sourceFile: filePath,
    });
  }

  return adrs;
}

function validateADR(adr) {
  const errors = [];
  const warnings = [];

  // Validate status
  if (!VALID_STATUSES.includes(adr.status)) {
    errors.push(
      `Invalid status: "${adr.status}". Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(adr.category)) {
    warnings.push(
      `Category "${adr.category}" not in standard list: ${VALID_CATEGORIES.join(", ")}`,
    );
  }

  // Validate date format
  if (adr.date !== "Unknown" && !/^\d{4}-\d{2}-\d{2}$/.test(adr.date)) {
    warnings.push(`Date "${adr.date}" should be YYYY-MM-DD format`);
  }

  // Check for TODO markers in accepted ADRs
  if (
    adr.status === "Accepted" &&
    (adr.body.includes("_TODO_") || adr.body.includes("TODO:"))
  ) {
    warnings.push("Accepted ADR contains TODO markers");
  }

  if (!adr.isCompact) {
    // Validate full format sections
    for (const section of REQUIRED_SECTIONS) {
      const sectionRegex = new RegExp(
        `###?\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );
      if (!sectionRegex.test(adr.body)) {
        errors.push(`Missing required section: "${section}"`);
      }
    }

    // Validate compliance checkboxes
    for (const principle of PRINCIPLES) {
      const checkboxRegex = new RegExp(
        `-\\s*\\[[xX]?\\]\\s*${principle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );
      if (!checkboxRegex.test(adr.body)) {
        errors.push(
          `Missing compliance checkbox for principle: "${principle}"`,
        );
      }
    }

    // Check decision is one clear sentence (not a list of maybes)
    const decisionSection =
      adr.body.split(/###?\s+Decision/i)[1]?.split(/###?/)[0] || "";
    if (
      decisionSection.includes("We considered") ||
      decisionSection.includes("We might") ||
      decisionSection.includes("We could")
    ) {
      warnings.push(
        "Decision section should state what we WILL do, not what we considered",
      );
    }

    // Check rationale names rejected alternative
    const rationaleSection =
      adr.body.split(/###?\s+Rationale/i)[1]?.split(/###?/)[0] || "";
    if (
      !rationaleSection.toLowerCase().includes("rejected") &&
      !rationaleSection.toLowerCase().includes("alternative")
    ) {
      warnings.push(
        "Rationale should name the rejected alternative and why it lost",
      );
    }

    // Check for anti-patterns
    if (
      adr.body.includes("Because of the hydration mismatch") ||
      adr.body.includes("SSR boundary")
    ) {
      warnings.push(
        "Context uses jargon - should explain the force, not the acronym",
      );
    }
  }

  return { errors, warnings };
}

function validateCrossReferences(adrs) {
  const errors = [];
  const warnings = [];

  // Check DECISIONS.md references all ADRs
  if (fs.existsSync(DECISIONS_PATH)) {
    const decisionsContent = fs.readFileSync(DECISIONS_PATH, "utf8");

    for (const adr of adrs) {
      if (!adr.isCompact) {
        const refPattern = new RegExp(
          `ADR-${adr.number.padStart(3, "0")}`,
          "i",
        );
        if (!refPattern.test(decisionsContent)) {
          warnings.push(
            `ADR-${adr.number.padStart(3, "0")} not referenced in company/DECISIONS.md`,
          );
        }
      }
    }
  }

  // Check for duplicate ADR numbers
  const numbers = adrs.filter((a) => !a.isCompact).map((a) => a.number);
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  if (duplicates.length > 0) {
    errors.push(
      `Duplicate ADR numbers: ${[...new Set(duplicates)].join(", ")}`,
    );
  }

  return { errors, warnings };
}

function main() {
  console.log("📋 ADR Validation\n");

  const adrFiles = findADRFiles();

  if (adrFiles.length === 0) {
    console.log("No ADR files found. This is OK for early stages.");
    process.exit(0);
  }

  console.log(`Found ${adrFiles.length} ADR file(s):`);
  adrFiles.forEach((f) => console.log(`  - ${path.relative(ROOT, f)}`));
  console.log("");

  let allADRs = [];
  let hasErrors = false;
  let hasWarnings = false;

  for (const file of adrFiles) {
    const content = fs.readFileSync(file, "utf8");
    const adrs = parseADR(content, file);

    for (const adr of adrs) {
      allADRs.push(adr);

      console.log(`\n${"=".repeat(60)}`);
      console.log(`Validating: ${adr.title} (${adr.status})`);
      console.log(`${"=".repeat(60)}`);

      const { errors, warnings } = validateADR(adr);

      if (errors.length > 0) {
        hasErrors = true;
        console.log("\n❌ ERRORS:");
        errors.forEach((e) => console.log(`  ✗ ${e}`));
      }

      if (warnings.length > 0) {
        hasWarnings = true;
        console.log("\n⚠️  WARNINGS:");
        warnings.forEach((w) => console.log(`  ⚠ ${w}`));
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log("\n✅ Valid");
      }
    }
  }

  // Cross-reference validation
  console.log("\n\n🔗 Cross-Reference Validation:");
  const { errors: refErrors, warnings: refWarnings } =
    validateCrossReferences(allADRs);

  if (refErrors.length > 0) {
    hasErrors = true;
    refErrors.forEach((e) => console.log(`  ✗ ${e}`));
  }
  if (refWarnings.length > 0) {
    hasWarnings = true;
    refWarnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }
  if (refErrors.length === 0 && refWarnings.length === 0) {
    console.log("  ✅ Cross-references valid");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total ADRs validated: ${allADRs.length}`);
  console.log(`Errors: ${hasErrors ? "YES" : "NO"}`);
  console.log(`Warnings: ${hasWarnings ? "YES" : "NO"}`);

  if (hasErrors) {
    console.log("\n❌ VALIDATION FAILED: Fix errors before committing");
    process.exit(1);
  } else if (hasWarnings) {
    console.log(
      "\n⚠️  VALIDATION PASSED WITH WARNINGS: Consider addressing warnings",
    );
    process.exit(0);
  } else {
    console.log("\n✅ ALL ADRs VALID");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
