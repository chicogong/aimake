/**
 * useJobStream — SSE hook for real-time job progress.
 *
 * Reconnects with exponential backoff (max 5 attempts) when the underlying
 * EventSource errors. Reconnect counter resets after a successful onopen.
 * Terminal events (`complete`, `error`) close the stream and skip reconnect.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobStatus, SSEEvent } from '@/types';
import { getJobStreamUrl } from '@/services/api';

interface JobStreamState {
  status: JobStatus;
  progress: number;
  currentStage: string | null;
  audioUrl: string | null;
  duration: number | null;
  script: string | null;
  error: { code: string; message: string } | null;
  isConnected: boolean;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export function useJobStream(jobId: string | null, streamToken: string | null) {
  const [state, setState] = useState<JobStreamState>({
    status: 'pending',
    progress: 0,
    currentStage: null,
    audioUrl: null,
    duration: null,
    script: null,
    error: null,
    isConnected: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const terminatedRef = useRef(false);

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    terminatedRef.current = true;
    closeStream();
    setState((prev) => ({ ...prev, isConnected: false }));
  }, [closeStream]);

  useEffect(() => {
    if (!jobId || !streamToken) return;

    terminatedRef.current = false;
    let attempt = 0;

    const connect = () => {
      if (terminatedRef.current) return;

      const es = new EventSource(getJobStreamUrl(jobId, streamToken));
      eventSourceRef.current = es;

      es.onopen = () => {
        attempt = 0;
        setState((prev) => ({ ...prev, isConnected: true }));
      };

      const safeParse = (raw: string): SSEEvent | null => {
        try {
          return JSON.parse(raw) as SSEEvent;
        } catch {
          console.warn('[stream] dropping malformed SSE payload');
          return null;
        }
      };

      es.addEventListener('progress', (e) => {
        const data = safeParse(e.data);
        if (data?.type === 'progress') {
          setState((prev) => ({
            ...prev,
            status: data.status,
            progress: data.progress,
            currentStage: data.currentStage,
          }));
        }
      });

      es.addEventListener('script_update', (e) => {
        const data = safeParse(e.data);
        if (data?.type === 'script_update') {
          setState((prev) => ({ ...prev, script: data.script }));
        }
      });

      es.addEventListener('complete', (e) => {
        const data = safeParse(e.data);
        if (data?.type === 'complete') {
          setState((prev) => ({
            ...prev,
            status: 'completed',
            progress: 100,
            currentStage: 'completed',
            audioUrl: data.audioUrl,
            duration: data.duration,
            isConnected: false,
          }));
          terminatedRef.current = true;
          closeStream();
        }
      });

      es.addEventListener('error', (e) => {
        if (!(e instanceof MessageEvent) || !e.data) return;
        const data = safeParse(e.data);
        if (data?.type === 'error') {
          setState((prev) => ({
            ...prev,
            status: 'failed',
            error: { code: data.code, message: data.message },
            isConnected: false,
          }));
          terminatedRef.current = true;
          closeStream();
        }
      });

      // Native EventSource error (no payload) → connection lost. Reconnect.
      es.onerror = () => {
        setState((prev) => ({ ...prev, isConnected: false }));
        if (terminatedRef.current) return;

        es.close();
        eventSourceRef.current = null;

        if (attempt >= MAX_RECONNECT_ATTEMPTS) {
          setState((prev) => ({
            ...prev,
            error: prev.error ?? { code: 'STREAM_LOST', message: '连接已断开，请刷新页面' },
          }));
          return;
        }

        const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, attempt);
        attempt += 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      terminatedRef.current = true;
      closeStream();
    };
  }, [jobId, streamToken, closeStream]);

  return { ...state, disconnect };
}
