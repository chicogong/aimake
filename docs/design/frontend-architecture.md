# AIMake 前端组件架构

> 创建日期: 2026-01-09技术栈: React 18 + TypeScript + Vite + Tailwind CSS

---

## 一、项目结构

```
src/
├── main.tsx                 # 入口文件
├── App.tsx                  # 根组件 + 路由
├── index.css                # 全局样式
│
├── components/              # 通用组件
│   ├── ui/                  # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Slider.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   │
│   ├── audio/               # 音频相关组件
│   │   ├── AudioPlayer.tsx
│   │   ├── Waveform.tsx
│   │   ├── VoiceCard.tsx
│   │   └── VoiceSelector.tsx
│   │
│   ├── layout/              # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   │
│   └── shared/              # 业务通用组件
│       ├── QuotaBar.tsx
│       ├── AudioCard.tsx
│       └── EmptyState.tsx
│
├── pages/                   # 页面组件
│   ├── Home/                # 首页
│   ├── Create/              # 创建页面
│   │   ├── index.tsx
│   │   ├── TTSCreate.tsx
│   │   └── PodcastCreate.tsx
│   ├── Library/             # 音频库
│   ├── Settings/            # 设置
│   ├── Pricing/             # 定价
│   └── Auth/                # 认证
│       ├── Login.tsx
│       └── Register.tsx
│
├── hooks/                   # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useAudio.ts
│   ├── useTTS.ts
│   ├── useQuota.ts
│   └── useToast.ts
│
├── stores/                  # Zustand 状态
│   ├── authStore.ts
│   ├── audioStore.ts
│   └── uiStore.ts
│
├── services/                # API 服务
│   ├── api.ts               # Axios 实例
│   ├── authService.ts
│   ├── ttsService.ts
│   ├── podcastService.ts
│   └── userService.ts
│
├── types/                   # TypeScript 类型
│   ├── user.ts
│   ├── audio.ts
│   ├── voice.ts
│   └── api.ts
│
├── utils/                   # 工具函数
│   ├── format.ts
│   ├── storage.ts
│   └── validation.ts
│
└── constants/               # 常量
    ├── routes.ts
    └── config.ts
```

---

## 二、组件层次图

```
App
├── Router
│   ├── AuthProvider
│   │   ├── PublicRoutes
│   │   │   ├── HomePage
│   │   │   ├── PricingPage
│   │   │   ├── LoginPage
│   │   │   └── RegisterPage
│   │   │
│   │   └── ProtectedRoutes
│   │       ├── AppLayout
│   │       │   ├── Header
│   │       │   │   ├── Logo
│   │       │   │   ├── Navigation
│   │       │   │   └── UserMenu
│   │       │   │
│   │       │   ├── Sidebar (optional)
│   │       │   │
│   │       │   └── MainContent
│   │       │       ├── CreatePage
│   │       │       │   ├── ModeSelector
│   │       │       │   ├── TTSCreate
│   │       │       │   │   ├── TextInput
│   │       │       │   │   ├── VoiceSelector
│   │       │       │   │   ├── ParamsPanel
│   │       │       │   │   └── PreviewPlayer
│   │       │       │   │
│   │       │       │   └── PodcastCreate
│   │       │       │       ├── SourceInput
│   │       │       │       ├── RoleConfig
│   │       │       │       ├── StyleSelector
│   │       │       │       └── ProgressView
│   │       │       │
│   │       │       ├── LibraryPage
│   │       │       │   ├── FilterBar
│   │       │       │   ├── AudioList
│   │       │       │   │   └── AudioCard (multiple)
│   │       │       │   └── Pagination
│   │       │       │
│   │       │       └── SettingsPage
│   │       │           ├── ProfileSection
│   │       │           ├── SubscriptionSection
│   │       │           └── APIKeysSection
│   │       │
│   │       └── QuotaBar (fixed)
│   │
│   └── ToastContainer
```

---

## 三、核心组件设计

### 3.1 AudioPlayer 组件

```tsx
// components/audio/AudioPlayer.tsx

interface AudioPlayerProps {
  src: string;
  title?: string;
  duration?: number;
  showWaveform?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

export function AudioPlayer({
  src,
  title,
  duration,
  showWaveform = false,
  onTimeUpdate,
  onEnded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          onTimeUpdate?.(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          setTotalDuration(e.currentTarget.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />

      {title && <div className="text-sm font-medium mb-2">{title}</div>}

      <div className="flex items-center gap-3">
        {/* 播放按钮 */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* 进度条 */}
        <div className="flex-1">
          {showWaveform ? (
            <Waveform
              audioUrl={src}
              currentTime={currentTime}
              duration={totalDuration}
              onSeek={handleSeek}
            />
          ) : (
            <Slider value={currentTime} max={totalDuration} onChange={handleSeek} />
          )}
        </div>

        {/* 时间显示 */}
        <div className="text-sm text-gray-500 w-24 text-right">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
}
```

### 3.2 VoiceSelector 组件

```tsx
// components/audio/VoiceSelector.tsx

interface Voice {
  id: string;
  name: string;
  nameZh: string;
  gender: 'male' | 'female' | 'neutral';
  previewUrl: string;
  isPremium: boolean;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selectedId: string;
  onSelect: (voiceId: string) => void;
  showPremiumLock?: boolean;
}

export function VoiceSelector({
  voices,
  selectedId,
  onSelect,
  showPremiumLock = true,
}: VoiceSelectorProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePreview = (voice: Voice) => {
    if (previewingId === voice.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = voice.previewUrl;
        audioRef.current.play();
        setPreviewingId(voice.id);
      }
    }
  };

  return (
    <div className="space-y-3">
      <audio ref={audioRef} onEnded={() => setPreviewingId(null)} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => !voice.isPremium && onSelect(voice.id)}
            className={cn(
              'relative p-3 rounded-lg border-2 cursor-pointer transition-all',
              selectedId === voice.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300',
              voice.isPremium && showPremiumLock && 'opacity-60'
            )}
          >
            {/* Premium 标记 */}
            {voice.isPremium && (
              <div className="absolute top-2 right-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Pro
                </span>
              </div>
            )}

            {/* 音色信息 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🧑'}
              </div>
              <div>
                <div className="font-medium text-sm">{voice.nameZh}</div>
                <div className="text-xs text-gray-500">{voice.name}</div>
              </div>
            </div>

            {/* 试听按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(voice);
              }}
              className="w-full py-1.5 text-sm text-gray-600 hover:text-blue-500 flex items-center justify-center gap-1"
            >
              {previewingId === voice.id ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  停止
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  试听
                </>
              )}
            </button>

            {/* 选中标记 */}
            {selectedId === voice.id && (
              <div className="absolute top-2 left-2">
                <CheckIcon className="w-5 h-5 text-blue-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 TTSCreate 页面组件

```tsx
// pages/Create/TTSCreate.tsx

export function TTSCreate() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('openai-alloy');
  const [speed, setSpeed] = useState(1.0);
  const [emotion, setEmotion] = useState('neutral');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);

  const { quota, refreshQuota } = useQuota();
  const { showToast } = useToast();
  const { data: voices } = useVoices();

  const estimatedDuration = useMemo(() => {
    // 估算：中文每分钟约 200 字
    return Math.ceil((text.length / 200) * 60);
  }, [text]);

  const canGenerate = useMemo(() => {
    return text.length > 0 && text.length <= 5000 && quota.remaining >= estimatedDuration;
  }, [text, quota, estimatedDuration]);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const result = await ttsService.generate({
        text,
        voiceId,
        params: { speed, emotion },
      });

      setGeneratedAudio(result);
      refreshQuota();
      showToast('音频生成成功！', 'success');
    } catch (error) {
      showToast(error.message || '生成失败，请重试', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 标题 */}
      <h1 className="text-2xl font-bold">创建音频</h1>

      {/* 文本输入 */}
      <Card>
        <Card.Header>
          <div className="flex justify-between">
            <span>输入文本</span>
            <span className="text-sm text-gray-500">{text.length} / 5000 字</span>
          </div>
        </Card.Header>
        <Card.Body>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在这里输入你想要转换的文字..."
            className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            maxLength={5000}
          />
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm">
              上传文件
            </Button>
            <Button variant="ghost" size="sm">
              粘贴链接
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* 音色选择 */}
      <Card>
        <Card.Header>选择音色</Card.Header>
        <Card.Body>
          <VoiceSelector voices={voices || []} selectedId={voiceId} onSelect={setVoiceId} />
        </Card.Body>
      </Card>

      {/* 参数设置 */}
      <Card>
        <Card.Header>音频设置</Card.Header>
        <Card.Body className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">语速: {speed}x</label>
            <Slider min={0.5} max={2.0} step={0.1} value={speed} onChange={setSpeed} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">情感</label>
            <Select
              value={emotion}
              onChange={setEmotion}
              options={[
                { value: 'neutral', label: '自然' },
                { value: 'happy', label: '开心' },
                { value: 'sad', label: '悲伤' },
                { value: 'excited', label: '激动' },
              ]}
            />
          </div>
        </Card.Body>
      </Card>

      {/* 生成按钮 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">预计时长: {formatDuration(estimatedDuration)}</div>
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          loading={isGenerating}
          size="lg"
        >
          {isGenerating ? '生成中...' : '生成音频'}
        </Button>
      </div>

      {/* 预览 */}
      {generatedAudio && (
        <Card>
          <Card.Header>生成结果</Card.Header>
          <Card.Body>
            <AudioPlayer
              src={generatedAudio.audioUrl}
              duration={generatedAudio.duration}
              showWaveform
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="primary"
                onClick={() => downloadFile(generatedAudio.audioUrl, 'audio.mp3')}
              >
                下载 MP3
              </Button>
              <Button variant="secondary">保存到音频库</Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 额度显示 */}
      <QuotaBar used={quota.used} limit={quota.limit} resetAt={quota.resetAt} />
    </div>
  );
}
```

### 3.4 QuotaBar 组件

```tsx
// components/shared/QuotaBar.tsx

interface QuotaBarProps {
  used: number; // 已用秒数
  limit: number; // 总额度秒数
  resetAt: string; // 重置时间
}

export function QuotaBar({ used, limit, resetAt }: QuotaBarProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);

  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">本月额度: {formatDuration(remaining)} 剩余</span>
            <span className="text-gray-400">
              {formatDuration(used)} / {formatDuration(limit)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', getColor())}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{formatDate(resetAt)} 重置</div>
        </div>

        {percentage >= 80 && (
          <Button variant="primary" size="sm">
            升级 Pro
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 四、状态管理

### 4.1 Auth Store

```tsx
// stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authService.login(email, password);
          set({ token, user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authService.register(email, password, name);
          set({ token, user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (data) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

### 4.2 Audio Store

```tsx
// stores/audioStore.ts

import { create } from 'zustand';

interface AudioItem {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  duration: number;
  voiceId: string;
  createdAt: string;
}

interface AudioState {
  items: AudioItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;

  fetchLibrary: (page?: number) => Promise<void>;
  addItem: (item: AudioItem) => void;
  removeItem: (id: string) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  items: [],
  isLoading: false,
  currentPage: 1,
  totalPages: 1,

  fetchLibrary: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { items, totalPages } = await audioService.getLibrary(page);
      set({ items, currentPage: page, totalPages });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: (item) => {
    set((state) => ({ items: [item, ...state.items] }));
  },

  removeItem: async (id) => {
    await audioService.delete(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
```

---

## 五、Hooks 设计

### 5.1 useTTS Hook

```tsx
// hooks/useTTS.ts

interface UseTTSOptions {
  onSuccess?: (audio: GeneratedAudio) => void;
  onError?: (error: Error) => void;
}

interface UseTTSReturn {
  generate: (params: TTSParams) => Promise<void>;
  isGenerating: boolean;
  progress: number;
  audio: GeneratedAudio | null;
  error: Error | null;
  reset: () => void;
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio, setAudio] = useState<GeneratedAudio | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (params: TTSParams) => {
      setIsGenerating(true);
      setProgress(0);
      setError(null);

      try {
        // 模拟进度
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 10, 90));
        }, 200);

        const result = await ttsService.generate(params);

        clearInterval(progressInterval);
        setProgress(100);
        setAudio(result);
        options.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setAudio(null);
    setError(null);
    setProgress(0);
  }, []);

  return { generate, isGenerating, progress, audio, error, reset };
}
```

### 5.2 useQuota Hook

```tsx
// hooks/useQuota.ts

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  plan: string;
}

export function useQuota() {
  const [quota, setQuota] = useState<QuotaInfo>({
    used: 0,
    limit: 600,
    remaining: 600,
    resetAt: '',
    plan: 'free',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    try {
      const data = await userService.getUsage();
      setQuota({
        ...data,
        remaining: data.limit - data.used,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const checkQuota = useCallback(
    (duration: number) => {
      return quota.remaining >= duration;
    },
    [quota.remaining]
  );

  return {
    quota,
    isLoading,
    refreshQuota: fetchQuota,
    checkQuota,
    isExceeded: quota.remaining <= 0,
    isLow: quota.remaining < 60, // 少于1分钟
  };
}
```

---

## 六、API 服务层

```tsx
// services/api.ts

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export { api };

// services/ttsService.ts

export const ttsService = {
  generate: async (params: TTSParams): Promise<GeneratedAudio> => {
    return api.post('/tts/generate', params);
  },

  getVoices: async (): Promise<Voice[]> => {
    return api.get('/tts/voices');
  },
};

// services/podcastService.ts

export const podcastService = {
  create: async (params: PodcastParams): Promise<{ jobId: string }> => {
    return api.post('/podcast/generate', params);
  },

  getStatus: async (jobId: string): Promise<PodcastJob> => {
    return api.get(`/podcast/${jobId}`);
  },

  // 轮询状态
  pollStatus: (jobId: string, onProgress: (job: PodcastJob) => void) => {
    const interval = setInterval(async () => {
      const job = await podcastService.getStatus(jobId);
      onProgress(job);

      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  },
};
```

---

## 七、路由配置

```tsx
// App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 需要登录的页面 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<Navigate to="/app/create" />} />
            <Route path="/app/create" element={<CreatePage />} />
            <Route path="/app/library" element={<LibraryPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

// ProtectedRoute 组件
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

---

_文档持续更新中..._
