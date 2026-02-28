/**
 * JobDetailPage — Real-time SSE progress + audio result
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Play, Pause, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useJobStream } from '@/hooks/useJobStream';
import { jobsApi } from '@/services/api';
import type { JobDetail, JobStatus } from '@/types';
import { formatDuration } from '@/lib/utils';

const STAGE_LABELS: Record<string, string> = {
  pending: '等待中',
  classifying: '分析内容类型',
  extracting: '提取内容',
  analyzing: '分析要点',
  scripting: '生成脚本',
  synthesizing: '语音合成',
  assembling: '拼接音频',
  completed: '完成',
  failed: '失败',
};

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const streamToken = searchParams.get('token');

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const stream = useJobStream(id ?? null, streamToken);

  // Fetch job detail on mount
  useEffect(() => {
    if (!id) return;
    jobsApi.getDetail(id).then((res: unknown) => {
      const response = res as { data: JobDetail };
      setJob(response.data);
    }).catch(() => {
      // Job might not exist yet
    });
  }, [id]);

  // Update job data when stream completes
  useEffect(() => {
    if (stream.status === 'completed' && id) {
      jobsApi.getDetail(id).then((res: unknown) => {
        const response = res as { data: JobDetail };
        setJob(response.data);
      });
    }
  }, [stream.status, id]);

  const currentStatus = stream.status !== 'pending' ? stream.status : (job?.status || 'pending');
  const currentProgress = stream.progress > 0 ? stream.progress : (job?.progress || 0);
  const currentStage = stream.currentStage || job?.currentStage;
  const audioUrl = stream.audioUrl || job?.audioUrl;
  const duration = stream.duration || job?.duration;

  const isTerminal = currentStatus === 'completed' || currentStatus === 'failed';

  const handlePlayPause = () => {
    if (!audioUrl || !id) return;

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
      return;
    }

    // Create download URL (use the job download endpoint)
    const downloadUrl = `/api/jobs/${id}/download`;
    const audio = new Audio(downloadUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
    setAudioElement(audio);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back link */}
      <Link
        to="/history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回历史记录
      </Link>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">
            {job?.title || '生成中...'}
          </h1>
          {job?.contentType && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {job.contentType}
            </span>
          )}
        </div>

        {/* Progress section */}
        {!isTerminal && (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {STAGE_LABELS[currentStage || currentStatus] || currentStatus}
              </span>
              <span className="text-sm text-muted-foreground">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {stream.isConnected ? '实时更新中...' : '连接中...'}
            </div>
          </div>
        )}

        {/* Completed */}
        {currentStatus === 'completed' && (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">生成完成</span>
            </div>

            {/* Audio player */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="h-12 w-12 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <div className="flex-1">
                <p className="text-sm font-medium">{job?.title || '音频'}</p>
                {duration && (
                  <p className="text-xs text-muted-foreground">
                    时长: {formatDuration(duration)}
                  </p>
                )}
              </div>
              {id && (
                <a href={`/api/jobs/${id}/download`}>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                </a>
              )}
            </div>

            {/* Script preview */}
            {job?.script && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  查看脚本
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(JSON.parse(job.script), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Failed */}
        {currentStatus === 'failed' && (
          <div className="bg-card border border-destructive/20 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">生成失败</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {stream.error?.message || job?.error?.message || '未知错误'}
            </p>
            <Link to="/">
              <Button variant="outline" size="sm" className="mt-2">
                重新生成
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
