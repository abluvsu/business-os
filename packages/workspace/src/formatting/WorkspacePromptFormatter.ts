import { WorkspaceContext } from "../context/WorkspaceContextBuilder";

export class WorkspacePromptFormatter {
  static format(context: WorkspaceContext): string {
    const sections: string[] = [];

    if (context.company) {
      const c = context.company;
      const competitorStr = c.competitorNames 
        ? (Array.isArray(c.competitorNames) ? c.competitorNames : JSON.parse(c.competitorNames as any)).join(", ")
        : "None identified";
      
      sections.push(`=== BUSINESS SNAPSHOT ===
- Company Name: ${c.name}
- Website: ${c.website || "N/A"}
- Industry: ${c.industry || "N/A"}
- Stage: ${c.stage || "N/A"}
- Business Model: ${c.businessModel || "N/A"}
- Value Proposition: ${c.valueProposition || "N/A"}
- Target Audience: ${c.targetAudience || "N/A"}
- Description: ${c.description || "N/A"}
- Competitors: ${competitorStr}`);
    }

    if (context.policies.length > 0) {
      const policyLines = context.policies.map((p, idx) => {
        return `${idx + 1}. [${p.severity}] ${p.title}: "${p.rule}"`;
      });
      sections.push(`=== ACTIVE PERFORMANCE & BRAND POLICIES ===
${policyLines.join("\n")}

CRITICAL INSTRUCTION: You must strictly adhere to the above policies. If any user request or suggested action violates these rules, you MUST reject it or flag it with a warning explaining the violation details.`);
    }

    if (context.knowledge.length > 0) {
      const connectorLines = context.knowledge.map(k => {
        return `- ${k.displayName} (${k.connectorId}): ${k.status} (Last synced: ${k.lastSyncAt || "Never"})`;
      });
      sections.push(`=== INTEGRATED CONNECTORS ===
${connectorLines.join("\n")}`);
    }

    if (context.observations.length > 0) {
      const obsLines = context.observations.slice(-20).map(o => {
        const entityLabel = o.entityId ? ` (Entity ID: ${o.entityId})` : "";
        return `- [${o.date}] ${o.observationType}: ${o.value} ${o.currency || ""}${entityLabel}`;
      });
      sections.push(`=== RECENT PERFORMANCE OBSERVATIONS ===
${obsLines.join("\n")}`);
    }

    return sections.join("\n\n");
  }
}
