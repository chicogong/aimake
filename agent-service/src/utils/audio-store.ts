/**
 * In-memory audio segment store with bounded capacity and TTL cleanup.
 *
 * Each entry tracks lastTouched; a periodic sweeper drops jobs idle longer
 * than IDLE_TTL_MS. Per-job and global byte ceilings reject inserts that
 * would exceed the bound.
 */

interface StoredSegment {
  index: number;
  audioBase64: string;
  duration: number;
}

interface AssembledAudio {
  audioBase64: string;
  totalDuration: number;
}

interface JobEntry {
  segments: Map<number, StoredSegment>;
  bytes: number;
  lastTouched: number;
  assembled?: AssembledAudio;
}

export interface AudioStoreOptions {
  perJobByteLimit: number;
  totalByteLimit: number;
  idleTtlMs: number;
  sweepIntervalMs: number;
}

const DEFAULT_OPTIONS: AudioStoreOptions = {
  perJobByteLimit: 200 * 1024 * 1024,  // 200 MB per job
  totalByteLimit: 1024 * 1024 * 1024,  // 1 GB process-wide
  // TTL must exceed the maximum LLM-driven gap between assemble and upload.
  // The agent's overall maxTurns budget (~30 min) plus headroom keeps idle
  // jobs alive while still cleaning up after a process-wide stall.
  idleTtlMs: 2 * 60 * 60 * 1000,        // 2 h
  sweepIntervalMs: 10 * 60 * 1000,      // sweep every 10 min
};

export class AudioStoreCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioStoreCapacityError';
  }
}

export class AudioStore {
  private readonly jobs = new Map<string, JobEntry>();
  private readonly options: AudioStoreOptions;
  private totalBytes = 0;
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<AudioStoreOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  startSweeper(): void {
    if (this.sweepTimer) return;
    this.sweepTimer = setInterval(() => this.sweep(), this.options.sweepIntervalMs);
    this.sweepTimer.unref?.();
  }

  stopSweeper(): void {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
  }

  set(jobId: string, segment: StoredSegment): void {
    const entry = this.touch(jobId);
    const incomingBytes = segment.audioBase64.length;
    const previous = entry.segments.get(segment.index);
    const previousBytes = previous?.audioBase64.length ?? 0;
    const newJobBytes = entry.bytes - previousBytes + incomingBytes;
    const newTotalBytes = this.totalBytes - previousBytes + incomingBytes;

    if (newJobBytes > this.options.perJobByteLimit) {
      throw new AudioStoreCapacityError(
        `Job ${jobId} would exceed per-job audio limit (${this.options.perJobByteLimit} bytes)`
      );
    }
    if (newTotalBytes > this.options.totalByteLimit) {
      throw new AudioStoreCapacityError(
        `AudioStore would exceed total audio limit (${this.options.totalByteLimit} bytes)`
      );
    }

    entry.segments.set(segment.index, segment);
    entry.bytes = newJobBytes;
    this.totalBytes = newTotalBytes;
  }

  get(jobId: string, index: number): StoredSegment | undefined {
    return this.jobs.get(jobId)?.segments.get(index);
  }

  getAll(jobId: string): StoredSegment[] {
    const entry = this.jobs.get(jobId);
    if (!entry) return [];
    entry.lastTouched = Date.now();
    return Array.from(entry.segments.values()).sort((a, b) => a.index - b.index);
  }

  count(jobId: string): number {
    return this.jobs.get(jobId)?.segments.size ?? 0;
  }

  setAssembled(jobId: string, audio: AssembledAudio): void {
    const entry = this.touch(jobId);
    const incoming = audio.audioBase64.length;
    const previous = entry.assembled?.audioBase64.length ?? 0;
    const newJobBytes = entry.bytes - previous + incoming;
    const newTotalBytes = this.totalBytes - previous + incoming;

    if (newJobBytes > this.options.perJobByteLimit) {
      throw new AudioStoreCapacityError(
        `Job ${jobId} would exceed per-job audio limit while storing assembled output`
      );
    }
    if (newTotalBytes > this.options.totalByteLimit) {
      throw new AudioStoreCapacityError(
        'AudioStore would exceed total audio limit while storing assembled output'
      );
    }

    entry.assembled = audio;
    entry.bytes = newJobBytes;
    this.totalBytes = newTotalBytes;
  }

  getAssembled(jobId: string): AssembledAudio | undefined {
    const entry = this.jobs.get(jobId);
    if (!entry) return undefined;
    entry.lastTouched = Date.now();
    return entry.assembled;
  }

  clear(jobId: string): void {
    const entry = this.jobs.get(jobId);
    if (!entry) return;
    this.totalBytes -= entry.bytes;
    this.jobs.delete(jobId);
  }

  stats(): { activeJobs: number; totalSegments: number; totalBytes: number } {
    let totalSegments = 0;
    for (const entry of this.jobs.values()) {
      totalSegments += entry.segments.size;
    }
    return {
      activeJobs: this.jobs.size,
      totalSegments,
      totalBytes: this.totalBytes,
    };
  }

  /** Drop all entries that have been idle longer than the configured TTL. */
  sweep(now: number = Date.now()): number {
    let removed = 0;
    for (const [jobId, entry] of this.jobs) {
      if (now - entry.lastTouched > this.options.idleTtlMs) {
        this.totalBytes -= entry.bytes;
        this.jobs.delete(jobId);
        removed++;
      }
    }
    if (removed > 0) {
      console.warn(`[audio-store] swept ${removed} idle job(s)`);
    }
    return removed;
  }

  private touch(jobId: string): JobEntry {
    let entry = this.jobs.get(jobId);
    if (!entry) {
      entry = { segments: new Map(), bytes: 0, lastTouched: Date.now() };
      this.jobs.set(jobId, entry);
    } else {
      entry.lastTouched = Date.now();
    }
    return entry;
  }
}

export const audioStore = new AudioStore();
