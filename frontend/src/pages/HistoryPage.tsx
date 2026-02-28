/**
 * History Page — Shows all generation jobs
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import {
  Clock,
  FileAudio,
  Loader2,
  Search,
  Filter,
  Trash2,
  Radio,
  BookOpen,
  Film,
  GraduationCap,
  Mic,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { jobsApi } from '@/services/api';
import { formatDuration, formatDate } from '@/lib/utils';
import { toastHelpers } from '@/hooks/useToast';
import type { Job, ApiResponse, ContentType } from '@/types';

const TYPE_ICONS: Record<ContentType, typeof Radio> = {
  podcast: Radio,
  audiobook: BookOpen,
  voiceover: Film,
  education: GraduationCap,
  tts: Mic,
};

const TYPE_LABELS: Record<ContentType, string> = {
  podcast: '播客',
  audiobook: '有声书',
  voiceover: '配音',
  education: '教育',
  tts: 'TTS',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-muted-foreground',
  classifying: 'text-blue-500',
  extracting: 'text-blue-500',
  analyzing: 'text-blue-500',
  scripting: 'text-blue-500',
  synthesizing: 'text-orange-500',
  assembling: 'text-orange-500',
  completed: 'text-green-600',
  failed: 'text-destructive',
};

export function HistoryPage() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const pageSize = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', page, typeFilter],
    queryFn: () =>
      jobsApi.list({
        page,
        pageSize,
        contentType: typeFilter || undefined,
      }),
    enabled: isSignedIn,
  });

  const jobs: Job[] = (data as ApiResponse<Job[]> | undefined)?.data || [];
  const total =
    (data as (ApiResponse<Job[]> & { meta?: { total?: number } }) | undefined)?.meta?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toastHelpers.success('删除成功');
    },
    onError: () => {
      toastHelpers.error('删除失败', '请稍后重试');
    },
  });

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FileAudio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">登录查看历史记录</h2>
        <p className="text-muted-foreground">登录后可以查看和管理你的生成记录</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">历史记录</h1>
          <p className="text-muted-foreground">共 {total} 条记录</p>
        </div>
        <Link to="/">
          <Button variant="gradient">新建任务</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">全部类型</option>
          <option value="podcast">播客</option>
          <option value="audiobook">有声书</option>
          <option value="voiceover">配音</option>
          <option value="education">教育</option>
          <option value="tts">TTS</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>加载失败，请刷新页面重试</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <FileAudio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">暂无记录</h3>
          <p className="text-muted-foreground">创建你的第一个声音内容吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const TypeIcon = TYPE_ICONS[job.contentType] || Mic;
            const isInProgress = !['completed', 'failed'].includes(job.status);

            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Type icon */}
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">
                          {job.title || `${TYPE_LABELS[job.contentType]} 任务`}
                        </h4>
                        <span className="flex-shrink-0 px-2 py-0.5 text-xs bg-muted rounded">
                          {TYPE_LABELS[job.contentType]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {/* Status */}
                        <span className={`flex items-center gap-1 ${STATUS_COLORS[job.status] || ''}`}>
                          {job.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                          {job.status === 'failed' && <XCircle className="h-3 w-3" />}
                          {isInProgress && <Loader2 className="h-3 w-3 animate-spin" />}
                          {job.status === 'completed' ? '完成' : job.status === 'failed' ? '失败' : `${job.progress}%`}
                        </span>
                        {job.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(job.duration)}
                          </span>
                        )}
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link to={`/jobs/${job.id}${job.streamToken ? `?token=${job.streamToken}` : ''}`}>
                        <Button variant="ghost" size="icon" title="查看详情">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('确定要删除吗？')) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                        title="删除"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
