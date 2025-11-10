'use client'

import { useState } from 'react'

interface TranscriptionResultsProps {
  transcription: string | null
  summary: string | null
  onReset: () => void
}

export default function TranscriptionResults({ transcription, summary, onReset }: TranscriptionResultsProps) {
  const [copied, setCopied] = useState<'transcription' | 'summary' | null>(null)

  const handleCopy = (text: string, type: 'transcription' | 'summary') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownloadTxt = () => {
    const content = `TRANSCRIPTION\n${'='.repeat(50)}\n\n${transcription}\n\n\nRÉSUMÉ EXÉCUTIF\n${'='.repeat(50)}\n\n${summary}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadMarkdown = () => {
    const content = `# Transcription\n\n${transcription}\n\n---\n\n# ${summary}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-8">
      {/* Success Message */}
      <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
        <p className="text-green-300 font-semibold">
          ✅ Transcription terminée avec succès !
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownloadTxt}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          📄 Télécharger (.txt)
        </button>
        <button
          onClick={handleDownloadMarkdown}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          📝 Télécharger (.md)
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
        >
          🔄 Nouvelle transcription
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">📊 Résumé exécutif</h2>
            <button
              onClick={() => handleCopy(summary, 'summary')}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              {copied === 'summary' ? '✅ Copié !' : '📋 Copier'}
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          </div>
        </div>
      )}

      {/* Transcription */}
      {transcription && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">📝 Transcription complète</h2>
            <button
              onClick={() => handleCopy(transcription, 'transcription')}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              {copied === 'transcription' ? '✅ Copié !' : '📋 Copier'}
            </button>
          </div>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {transcription}
          </div>
        </div>
      )}
    </div>
  )
}
