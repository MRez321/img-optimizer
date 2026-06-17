import { useEffect, useRef } from 'react';

export const useHeartbeat = (
  sessionId: string | null,
  sendHeartbeat: (sessionId: string) => void,
  intervalMs = 30000
) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sessionId) {
      intervalRef.current = setInterval(() => sendHeartbeat(sessionId), intervalMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, sendHeartbeat, intervalMs]);
};
