/**
 * History Page
 * Shows user's audio generation history
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  Play,
  Pause,
  Download,
  Trash2,
  Clock,
  FileAudio,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { audiosApi } from '@/services/api';
import { formatDuration, formatDate, formatFileSize, truncateText } from '@/lib/utils';
import { toastHelpers } from '@/hooks/useToast';
import type { Audio, ApiResponse } from '@/types';

export function HistoryPage() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['audios', page, typeFilter, searchQuery],
    queryFn: () =>
      audiosApi.list({
        page,
        pageSize,
        type: typeFilter || undefined,
        search: searchQuery || undefined,
      }),
    enabled: isSignedIn,
  });

  const audios: Audio[] = (data as ApiResponse<{ items: Audio[] }> | undefined)?.data?.items || [];
  const total = (data as ApiResponse<{ items: Audio[] }> & { meta?: { total?: number } } | undefined)?.meta?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => audiosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audios'] });
      toastHelpers.success('删除成功');
    },
    onError: () => {
      toastHelpers.error('删除失败', '请稍后重试');
    },
  });

  const handlePlay = async (audio: Audio) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    if (playingId === audio.id) {
      setPlayingId(null);
      return;
    }

    const newAudio = new Audio(audio.url);
    setAudioElement(newAudio);
    setPlayingId(audio.id);

    newAudio.onended = () => setPlayingId(null);
    newAudio.onerror = () => {
      setPlayingId(null);
      toastHelpers.error('播放失败');
    };

    try {
      await newAudio.play();
    } catch {
      setPlayingId(null);
    }
  };

  const handleDownload = (audio: Audio) => {
    const link = document.createElement('a');
    link.href = audio.url;
    link.download = `${audio.title || 'audio'}.mp3`;
    link.click();
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FileAudio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">登录查看历史记录</h2>
        <p className="text-muted-foreground">登录后可以查看和管理你的音频生成记录</p>
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
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索文本内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">全部类型</option>
            <option value="tts">文字转语音</option>
            <option value="podcast">播客</option>
          </select>
        </div>
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
      ) : audios.length === 0 ? (
        <div className="text-center py-16">
          <FileAudio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">暂无记录</h3>
          <p className="text-muted-foreground">生成你的第一条语音吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {audios.map((audio) => (
            <Card key={audio.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(audio)}
                    className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    {playingId === audio.id ? (
                      <Pause className="h-5 w-5 text-primary" />
                    ) : (
                      <Play className="h-5 w-5 text-primary ml-0.5" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1 truncate">
                      {audio.title || truncateText(audio.text, 50)}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {audio.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(audio.duration)}
                      </span>
                      <span>{formatFileSize(audio.size)}</span>
                      <span className="px-2 py-0.5 bg-muted rounded">
                        {audio.voiceName}
                      </span>
                      <span>{formatDate(audio.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(audio)}
                      title="下载"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('确定要删除这条记录吗？')) {
                          deleteMutation.mutate(audio.id);
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
          ))}
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
