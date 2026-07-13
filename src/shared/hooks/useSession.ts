"use client";

import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "pf_session_id";

/**
 * Returns a stable session ID for this browser session.
 * Automatically fires a cleanup beacon when the user closes the tab.
 */
export function useSession(): string {
  const sessionId = useRef<string>("");

  if (typeof window !== "undefined" && !sessionId.current) {
    // Re-use existing session ID if the page was just refreshed
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      sessionId.current = existing;
    } else {
      const id = uuidv4();
      sessionStorage.setItem(SESSION_KEY, id);
      sessionId.current = id;
    }
  }

  useEffect(() => {
    const handleUnload = () => {
      const id = sessionStorage.getItem(SESSION_KEY);
      if (!id) return;

      // sendBeacon is fire-and-forget; works even when page is unloading
      navigator.sendBeacon(
        "/api/cleanup",
        JSON.stringify({ sessionId: id })
      );
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return sessionId.current;
}
