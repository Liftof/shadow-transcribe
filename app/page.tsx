'use client'

import { useState } from 'react'
import AudioUploader from '@/components/AudioUploader'
import TranscriptionResults from '@/components/TranscriptionResults'

export default function Home() {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTranscriptionComplete = (data: { transcription: string; summary: string }) => {
    setTranscription(data.transcription)
    setSummary(data.summary)
    setIsProcessing(false)
  }

  const handleReset = () => {
    setTranscription(null)
    setSummary(null)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Vos réunions transcrites.<br />
              <span className="text-blue-400">Sous le radar.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              Uploadez votre audio, récupérez transcription + résumé exec.
            </p>
            <p className="text-lg text-slate-400">
              Aucune trace, aucune installation, aucun IT qui vous bloque.
            </p>
          </div>

          {/* Main Content - Upload or Results */}
          {!transcription ? (
            <>
              <AudioUploader
                onTranscriptionComplete={handleTranscriptionComplete}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />

              {/* Benefits Section */}
              <div className="mt-20 grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-white font-semibold mb-2">2 minutes chrono</h3>
                  <p className="text-slate-400">Upload → Transcription → Résumé</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="text-white font-semibold mb-2">Zéro stockage</h3>
                  <p className="text-slate-400">Vos fichiers sont supprimés immédiatement</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-white font-semibold mb-2">Pas de tracas</h3>
                  <p className="text-slate-400">Pas de compte, pas de login</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-3">💼</div>
                  <h3 className="text-white font-semibold mb-2">Fonctionne partout</h3>
                  <p className="text-slate-400">Même depuis le navigateur de la boîte</p>
                </div>
              </div>

              {/* Why Section */}
              <div className="mt-16 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Pourquoi ?</h2>
                <p className="text-slate-300 leading-relaxed">
                  Parce que votre DSI bloque Otter. Parce que vous ne pouvez pas installer de bot dans Teams.
                  Parce que vous avez juste besoin d'un compte-rendu de votre call client sans passer 3 heures à réécouter.
                </p>
              </div>
            </>
          ) : (
            <TranscriptionResults
              transcription={transcription}
              summary={summary}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Vos données : Traitées puis supprimées. Jamais stockées, jamais analysées, jamais utilisées pour autre chose.
          </p>
          <p className="text-slate-500 text-xs">
            Contact : <a href="mailto:contact@shadow-transcribe.com" className="text-blue-400 hover:text-blue-300">contact@shadow-transcribe.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
