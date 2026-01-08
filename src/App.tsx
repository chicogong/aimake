import { useState } from 'react'
import { AudioCard } from '../frontend-components/canvas/AudioCard'
import { PromptCard } from '../frontend-components/canvas/PromptCard'
import type { AudioCard as AudioCardType, PromptCard as PromptCardType } from '../frontend-types/card'

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 示例 Prompt Card
  const promptCard: PromptCardType = {
    id: 'prompt-1',
    type: 'prompt',
    title: '测试 Prompt',
    content: 'Tesla Cybertruck 采用 Kubernetes 云端架构。',
    position: { x: 100, y: 100 },
    size: { width: 320, height: 400 },
    settings: {
      voice: 'en-US-neural',
      speed: 1.0,
    },
    status: 'idle',
    selected: false,
    zIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // 示例 Audio Card
  const audioCard: AudioCardType = {
    id: 'audio-1',
    type: 'audio',
    position: { x: 500, y: 100 },
    size: { width: 320, height: 280 },
    content: {
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
      duration: 5.2,
      waveform: [
        0.2, 0.5, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4,
        0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.6, 0.4,
        0.5, 0.7, 0.8, 0.6, 0.4, 0.5, 0.7, 0.3,
      ],
      format: 'mp3',
      fileSize: 131072,
    },
    metadata: {
      generationTime: 542,
      rtf: 0.104,
      promptId: 'prompt-1',
      promptText: 'Tesla Cybertruck 采用 Kubernetes...',
    },
    status: 'ready',
    selected: false,
    zIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            aimake.cc
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            AI TTS with Perfect Pronunciation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            组件演示
          </h2>
          <p className="text-slate-600">
            以下是 PromptCard 和 AudioCard 组件的实际运行效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prompt Card */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Prompt Card
            </h3>
            <PromptCard
              card={promptCard}
              selected={selectedId === promptCard.id}
              onSelect={setSelectedId}
              onUpdate={(id, updates) => {
                console.log('Update:', id, updates)
              }}
              onDelete={(id) => {
                console.log('Delete:', id)
              }}
              onGenerate={(id) => {
                console.log('Generate:', id)
              }}
            />
          </div>

          {/* Audio Card */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Audio Card
            </h3>
            <AudioCard
              card={audioCard}
              selected={selectedId === audioCard.id}
              onSelect={setSelectedId}
              onDelete={(id) => {
                console.log('Delete:', id)
              }}
              onRegenerate={(promptId) => {
                console.log('Regenerate:', promptId)
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            💡 使用说明
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>点击卡片可以选中，查看键盘快捷键效果</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>AudioCard 支持 Space 播放/暂停，←→ 快进/快退</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>点击波形可以跳转到指定位置</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>所有组件都使用 Sonic Blue 设计系统</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400">
            &copy; 2026 aimake.cc. Built with ❤️ for creators worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
