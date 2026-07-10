// -----------------------------------------------------------------------------
// Priority 2: Product Analytics Layer
// The nervous system of BusinessOS for Founder Dogfooding.
// -----------------------------------------------------------------------------

const API_BASE = "http://127.0.0.1:4000";

// Generate a session ID once per page load to group events together
const SESSION_ID = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export type EventCategory =
  "Acquisition" | "Activation" | "Engagement" | "Retention" | "Friction";

export const trackEvent = async (
  eventName: string,
  category: EventCategory,
  properties?: Record<string, any>,
) => {
  try {
    // We send this fire-and-forget so it never blocks UI execution
    fetch(`${API_BASE}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        eventName,
        category,
        properties,
      }),
    }).catch(() => {
      // Silently fail if server is unreachable
    });

    // Also log to console in dev mode so the Founder can see it working
    console.log(
      `📊 [Analytics] ${eventName} | Category: ${category}`,
      properties || "",
    );
  } catch (err) {
    // Fail silently to avoid breaking TTFI
  }
};
