import { useEffect, useRef } from "react";

export function useLiveSync(
  onSyncComplete: (data: any) => void,
  apiBase: string,
) {
  const onSyncCompleteRef = useRef(onSyncComplete);
  onSyncCompleteRef.current = onSyncComplete;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let delay = 1000; // Standard reconnect delay

    const connect = () => {
      console.log(
        `📡 [useLiveSync] Connecting to SSE stream at ${apiBase}/api/events...`,
      );
      eventSource = new EventSource(`${apiBase}/api/events`);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          console.log(
            "📥 [useLiveSync] Live sync completed notification received:",
            parsed,
          );
          // Reset backoff delay on successful event
          delay = 1000;
          onSyncCompleteRef.current(parsed);
        } catch (err) {
          console.error(
            "❌ [useLiveSync] Failed to parse event stream chunk:",
            err,
          );
        }
      };

      eventSource.onerror = (err) => {
        console.error(
          "⚠️ [useLiveSync] SSE connection interrupted. Retrying...",
          err,
        );
        eventSource?.close();

        // Exponential backoff reconnect
        reconnectTimeout = setTimeout(() => {
          delay = Math.min(30000, delay * 2);
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [apiBase]);
}
