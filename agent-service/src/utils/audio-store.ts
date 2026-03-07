/**
 * In-memory audio segment store.
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

class AudioStore {
  private segments = new Map<string, Map<number, StoredSegment>>();
  private assembled = new Map<string, AssembledAudio>();

  set(jobId: string, segment: StoredSegment): void {
    if (!this.segments.has(jobId)) {
      this.segments.set(jobId, new Map());
    }
    this.segments.get(jobId)!.set(segment.index, segment);
  }

  get(jobId: string, index: number): StoredSegment | undefined {
    return this.segments.get(jobId)?.get(index);
  }

  getAll(jobId: string): StoredSegment[] {
    const map = this.segments.get(jobId);
    if (!map) return [];
    return Array.from(map.values()).sort((a, b) => a.index - b.index);
  }

  count(jobId: string): number {
    return this.segments.get(jobId)?.size ?? 0;
  }

  setAssembled(jobId: string, audio: AssembledAudio): void {
    this.assembled.set(jobId, audio);
  }

  getAssembled(jobId: string): AssembledAudio | undefined {
    return this.assembled.get(jobId);
  }

  clear(jobId: string): void {
    this.segments.delete(jobId);
    this.assembled.delete(jobId);
  }

  stats(): { activeJobs: number; totalSegments: number } {
    let totalSegments = 0;
    for (const map of this.segments.values()) {
      totalSegments += map.size;
    }
    return {
      activeJobs: this.segments.size,
      totalSegments,
    };
  }
}

export const audioStore = new AudioStore();
