'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface AudioUploaderProps {
  onTranscriptionComplete: (data: { transcription: string; summary: string }) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export default function AudioUploader({ onTranscriptionComplete, isProcessing, setIsProcessing }: AudioUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setIsProcessing(true)
    setUploadProgress('Préparation du fichier...')

    try {
      // Créer le FormData
      const formData = new FormData()
      formData.append('audio', file)

      setUploadProgress('Envoi du fichier...')

      // Appeler l'API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la transcription')
      }

      setUploadProgress('Transcription terminée !')

      // Passer les résultats au composant parent
      onTranscriptionComplete({
        transcription: data.transcription,
        summary: data.summary,
      })
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsProcessing(false)
    }
  }, [onTranscriptionComplete, setIsProcessing])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800/50 hover:border-blue-400 hover:bg-slate-800/70'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {!isProcessing ? (
          <div className="space-y-4">
            <div className="text-6xl">🎤</div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Déposez votre fichier ici' : 'Glissez votre fichier audio ici'}
              </p>
              <p className="text-slate-400">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Formats acceptés : MP3, WAV, M4A, OGG, FLAC, AAC
              </p>
            </div>
            <div className="inline-block px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
              Essayer maintenant (gratuit jusqu'à 1 min)
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl animate-pulse">⏳</div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                {uploadProgress}
              </p>
              <p className="text-slate-400">
                Ceci peut prendre quelques secondes...
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400">
            <span className="font-semibold">Erreur :</span> {error}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
        <p className="text-blue-300 text-sm">
          <span className="font-semibold">Version gratuite :</span> Fichiers audio jusqu'à 1 minute.
          Pour des fichiers plus longs, contactez-nous.
        </p>
      </div>
    </div>
  )
}
