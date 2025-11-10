import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Configuration
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB - Whisper API limit

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Get audio duration using browser's Audio API info from file metadata
 * Since we're in a serverless environment, we'll need to use ffprobe or similar
 * For now, we'll skip duration check and implement it later with a proper solution
 */
async function getAudioDuration(file: File): Promise<number | null> {
  // TODO: Implement proper duration check
  // For now, return null to skip the check
  return null
}

/**
 * Transcribe audio file using OpenAI Whisper API
 */
async function transcribeAudio(file: File): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'text',
    })

    return transcription
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error(`Erreur lors de la transcription: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Generate executive summary using GPT-4
 */
async function generateSummary(transcription: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant qui résume des transcriptions de réunions professionnelles en français. Génère un résumé structuré et concis.',
        },
        {
          role: 'user',
          content: `Voici la transcription d'une réunion. Génère un résumé exécutif en français avec:

1. Points clés (3-5 bullet points maximum)
2. Prochaines actions (si mentionnées)

Transcription:
${transcription}

Format souhaité:
## Points clés
- Point 1
- Point 2
- Point 3

## Prochaines actions
- Action 1
- Action 2`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0].message.content || 'Résumé non disponible'
  } catch (error) {
    console.error('Summary generation error:', error)
    throw new Error(`Erreur lors de la génération du résumé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check Content-Type
    const contentType = request.headers.get('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type doit être multipart/form-data' },
        { status: 400 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('audio') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier audio fourni' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)}MB). Maximum: 25MB. Pour les fichiers plus volumineux, contactez-nous.` },
        { status: 413 }
      )
    }

    // Check file type based on extension (more reliable than MIME type)
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.mp4', '.mpeg', '.mpga', '.webm']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Format de fichier non supporté: ${fileExtension}. Formats acceptés: MP3, WAV, M4A, OGG, FLAC, AAC` },
        { status: 400 }
      )
    }

    console.log('File received:', file.name, file.type, file.size)

    // Note: Duration check temporarily disabled
    // In production, implement server-side duration check using ffprobe or similar

    // Transcribe the audio
    console.log('Starting transcription...')
    const transcription = await transcribeAudio(file)
    console.log('Transcription complete')

    // Generate summary
    console.log('Generating summary...')
    const summary = await generateSummary(transcription)
    console.log('Summary complete')

    // Return results
    return NextResponse.json({
      transcription,
      summary,
      duration: null, // Duration check disabled for now
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue lors du traitement' },
      { status: 500 }
    )
  }
}

// Enable CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
