/**
 * useJobStream — SSE hook for real-time job progress
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
  error: { code: string; message: string } | null;
  isConnected: boolean;
}

export function useJobStream(jobId: string | null, streamToken: string | null) {
  const [state, setState] = useState<JobStreamState>({
    status: 'pending',
    progress: 0,
    currentStage: null,
    audioUrl: null,
    duration: null,
    error: null,
    isConnected: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, []);

  useEffect(() => {
    if (!jobId || !streamToken) return;

    const url = getJobStreamUrl(jobId, streamToken);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    es.addEventListener('progress', (e) => {
      const data: SSEEvent = JSON.parse(e.data);
      if (data.type === 'progress') {
        setState((prev) => ({
          ...prev,
          status: data.status,
          progress: data.progress,
          currentStage: data.currentStage,
        }));
      }
    });

    es.addEventListener('complete', (e) => {
      const data: SSEEvent = JSON.parse(e.data);
      if (data.type === 'complete') {
        setState((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          currentStage: 'completed',
          audioUrl: data.audioUrl,
          duration: data.duration,
        }));
        es.close();
      }
    });

    es.addEventListener('error', (e) => {
      if (e instanceof MessageEvent) {
        const data: SSEEvent = JSON.parse(e.data);
        if (data.type === 'error') {
          setState((prev) => ({
            ...prev,
            status: 'failed',
            error: { code: data.code, message: data.message },
          }));
          es.close();
        }
      }
    });

    es.onerror = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    return () => {
      es.close();
    };
  }, [jobId, streamToken]);

  return { ...state, disconnect };
}
