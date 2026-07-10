#!/usr/bin/env node
/**
 * Documentation Freshness Check
 * Ensures critical documentation stays current and consistent
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const CRITICAL_DOCS = [
  {
    path: "company/COMPANY_CONTEXT.md",
    maxAgeDays: 30,
    description: "Company constitution",
  },
  {
    path: "company/COMPANY_MANIFEST.md",
    maxAgeDays: 30,
    description: "Mission & principles",
  },
  {
    path: "company/DECISIONS.md",
    maxAgeDays: 7,
    description: "Decision register (updated per ADR)",
  },
  { path: "spec.md", maxAgeDays: 14, description: "System specification" },
  {
    path: "docs/architecture/DOMAIN_MODEL.md",
    maxAgeDays: 14,
    description: "Canonical domain model",
  },
  {
    path: "docs/architecture/TRUST_PIPELINE.md",
    maxAgeDays: 14,
    description: "Trust pipeline RFC",
  },
  {
    path: "templates/ADR_TEMPLATE.md",
    maxAgeDays: 60,
    description: "ADR template standard",
  },
];

const MARKETING_DOCS = [
  "marketing/01_customer/ICP.md",
  "marketing/01_customer/CUSTOMER_PROBLEMS.md",
  "marketing/02_product_marketing/POSITIONING.md",
  "marketing/02_product_marketing/VALUE_PROPOSITION.md",
  "marketing/03_copywriting/MESSAGING.md",
];

function checkFileAge(filePath, maxAgeDays) {
  const fullPath = path.join(ROOT, filePath);
  try {
    const stats = fs.statSync(fullPath);
    const ageDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    return {
      exists: true,
      path: filePath,
      ageDays: Math.round(ageDays * 10) / 10,
      stale: ageDays > maxAgeDays,
      maxAgeDays,
    };
  } catch {
    return { exists: false, path: filePath, stale: true, maxAgeDays };
  }
}

function checkVocabularyConsistency() {
  const contextPath = path.join(ROOT, "company", "COMPANY_CONTEXT.md");
  if (!fs.existsSync(contextPath)) {
    return { errors: ["COMPANY_CONTEXT.md not found"], warnings: [] };
  }

  const content = fs.readFileSync(contextPath, "utf8");
  const glossaryMatch = content.match(
    /## 17\. Company Vocabulary[\s\S]*?(?=## 18|\n$)/,
  );
  if (!glossaryMatch) {
    return {
      errors: ["Glossary section (## 17) not found in COMPANY_CONTEXT.md"],
      warnings: [],
    };
  }

  const terms = [];
  const termRegex = /\*\*([^*]+)\*\*\s*-\s*([^\n]+)/g;
  let match;
  while ((match = termRegex.exec(glossaryMatch[0])) !== null) {
    terms.push({ term: match[1].trim(), definition: match[2].trim() });
  }

  const warnings = [];
  const keyDocs = [
    "spec.md",
    "docs/architecture/DOMAIN_MODEL.md",
    "docs/architecture/TRUST_PIPELINE.md",
  ];

  for (const doc of keyDocs) {
    const docPath = path.join(ROOT, doc);
    if (!fs.existsSync(docPath)) continue;
    const docContent = fs.readFileSync(docPath, "utf8");

    for (const { term } of terms) {
      if (term.length <= 3) continue;

      const variations = [
        term,
        term.toLowerCase(),
        term.replace(/\s+/g, "-"),
        term.replace(/\s+/g, "_"),
      ];

      const found = variations.some((v) =>
        new RegExp(
          `\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i",
        ).test(docContent),
      );

      if (!found) {
        warnings.push(
          `${doc}: Glossary term "${term}" not found (may use different terminology)`,
        );
      }
    }
  }

  return { errors: [], warnings };
}

function checkCrossReferences() {
  const errors = [];
  const warnings = [];

  // Check DECISIONS.md references valid ADRs
  const decisionsPath = path.join(ROOT, "company", "DECISIONS.md");
  if (fs.existsSync(decisionsPath)) {
    const content = fs.readFileSync(decisionsPath, "utf8");
    const adrRefs = content.match(/ADR-\d+/g) || [];

    for (const ref of adrRefs) {
      const num = ref.match(/\d+/)[0].padStart(3, "0");
      const expectedFile = `ADR-${num}.md`;
      let found = false;

      const searchDirs = [
        "docs/architecture",
        "docs/adr",
        "architecture",
        "company",
        ".",
      ];
      for (const dir of searchDirs) {
        const fullPath = path.join(ROOT, dir, expectedFile);
        if (fs.existsSync(fullPath)) {
          found = true;
          break;
        }
      }

      if (!found) {
        warnings.push(
          `DECISIONS.md references ${ref} but ${expectedFile} not found`,
        );
      }
    }
  }

  // Check spec.md references DOMAIN_MODEL and TRUST_PIPELINE
  const specPath = path.join(ROOT, "spec.md");
  if (fs.existsSync(specPath)) {
    const content = fs.readFileSync(specPath, "utf8");
    if (
      !content.includes("DOMAIN_MODEL") &&
      !content.includes("domain model")
    ) {
      warnings.push("spec.md should reference DOMAIN_MODEL.md");
    }
    if (
      !content.includes("TRUST_PIPELINE") &&
      !content.includes("trust pipeline")
    ) {
      warnings.push("spec.md should reference TRUST_PIPELINE.md");
    }
  }

  return { errors, warnings };
}

function checkSprintDocs() {
  const errors = [];
  const warnings = [];
  const operationsDir = path.join(ROOT, "operations");

  if (!fs.existsSync(operationsDir)) {
    return { errors: ["operations/ directory not found"], warnings: [] };
  }

  const files = fs.readdirSync(operationsDir);
  const sprintFiles = files.filter((f) => f.match(/^SPRINT_\d+\.md$/));

  if (sprintFiles.length === 0) {
    warnings.push("No sprint files found in operations/");
    return { errors, warnings };
  }

  const sprintNums = sprintFiles
    .map((f) => parseInt(f.match(/\d+/)[0]))
    .sort((a, b) => b - a);
  const latest = sprintNums[0];
  const reviewFile = `SPRINT_${String(latest).padStart(3, "0")}_REVIEW.md`;

  if (!files.includes(reviewFile)) {
    warnings.push(
      `Latest sprint (${latest}) missing review file: ${reviewFile}`,
    );
  }

  return { errors, warnings };
}

async function main() {
  console.log("🔍 Checking documentation freshness and consistency...\n");

  let allValid = true;
  let totalWarnings = 0;

  // Check critical docs age
  console.log("📋 Critical Documents:");
  for (const doc of CRITICAL_DOCS) {
    const result = checkFileAge(doc.path, doc.maxAgeDays);
    if (!result.exists) {
      console.log(`  ❌ ${doc.path} - MISSING (${doc.description})`);
      allValid = false;
    } else if (result.stale) {
      console.log(
        `  ⚠️  ${doc.path} - STALE (${result.ageDays} days old, max ${result.maxAgeDays}) - ${doc.description}`,
      );
      totalWarnings++;
    } else {
      console.log(
        `  ✅ ${doc.path} - Fresh (${result.ageDays} days old) - ${doc.description}`,
      );
    }
  }

  // Check marketing docs exist
  console.log("\n📈 Marketing Documents:");
  for (const doc of MARKETING_DOCS) {
    const fullPath = path.join(ROOT, doc);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${doc}`);
    } else {
      console.log(`  ⚠️  ${doc} - MISSING`);
      totalWarnings++;
    }
  }

  // Vocabulary consistency
  console.log("\n📖 Vocabulary Consistency:");
  const vocabCheck = checkVocabularyConsistency();
  vocabCheck.errors.forEach((e) => {
    console.log(`  ❌ ${e}`);
    allValid = false;
  });
  vocabCheck.warnings.forEach((w) => {
    console.log(`  ⚠️  ${w}`);
    totalWarnings++;
  });
  if (vocabCheck.errors.length === 0 && vocabCheck.warnings.length === 0) {
    console.log("  ✅ All glossary terms found in key documents");
  }

  // Cross references
  console.log("\n🔗 Cross-References:");
  const refCheck = checkCrossReferences();
  refCheck.errors.forEach((e) => {
    console.log(`  ❌ ${e}`);
    allValid = false;
  });
  refCheck.warnings.forEach((w) => {
    console.log(`  ⚠️  ${w}`);
    totalWarnings++;
  });
  if (refCheck.errors.length === 0 && refCheck.warnings.length === 0) {
    console.log("  ✅ All cross-references valid");
  }

  // Sprint docs
  console.log("\n🏃 Sprint Documentation:");
  const sprintCheck = checkSprintDocs();
  sprintCheck.errors.forEach((e) => {
    console.log(`  ❌ ${e}`);
    allValid = false;
  });
  sprintCheck.warnings.forEach((w) => {
    console.log(`  ⚠️  ${w}`);
    totalWarnings++;
  });
  if (sprintCheck.errors.length === 0 && sprintCheck.warnings.length === 0) {
    console.log("  ✅ Sprint docs complete");
  }

  console.log("\n" + "=".repeat(50));
  if (allValid && totalWarnings === 0) {
    console.log("✅ All documentation checks passed!");
  } else if (allValid) {
    console.log(
      `⚠️  Documentation valid but ${totalWarnings} warning(s) found`,
    );
  } else {
    console.log("❌ Documentation validation failed");
  }

  return allValid;
}

main()
  .then((valid) => {
    process.exit(valid ? 0 : 1);
  })
  .catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  });
