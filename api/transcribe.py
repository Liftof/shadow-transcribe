from http.server import BaseHTTPRequestHandler
import json
import os
import tempfile
import subprocess
from openai import OpenAI
from pathlib import Path

# Configuration OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Limite gratuite : 1 minute (60 secondes)
FREE_TIER_LIMIT_SECONDS = 60

# Taille maximale pour Whisper API : 25MB
MAX_WHISPER_FILE_SIZE = 25 * 1024 * 1024

def get_audio_duration(file_path):
    """
    Récupère la durée d'un fichier audio en secondes avec ffprobe.
    """
    try:
        cmd = [
            'ffprobe', '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip())
        return duration
    except Exception as e:
        print(f"Erreur lors de la récupération de la durée: {e}")
        return None

def split_audio_file(file_path, chunk_duration_seconds=300):
    """
    Découpe un fichier audio en chunks de durée spécifiée.
    Retourne une liste de chemins vers les fichiers temporaires créés.
    """
    chunks = []
    try:
        # Créer un dossier temporaire pour les chunks
        temp_dir = tempfile.mkdtemp()
        output_pattern = os.path.join(temp_dir, "chunk_%03d.mp3")

        # Utiliser ffmpeg pour découper le fichier
        cmd = [
            'ffmpeg', '-i', file_path,
            '-f', 'segment',
            '-segment_time', str(chunk_duration_seconds),
            '-c', 'copy',
            output_pattern
        ]

        subprocess.run(cmd, check=True, capture_output=True)

        # Récupérer tous les fichiers chunks créés
        chunk_files = sorted(Path(temp_dir).glob("chunk_*.mp3"))
        chunks = [str(f) for f in chunk_files]

        return chunks
    except Exception as e:
        print(f"Erreur lors du découpage audio: {e}")
        return []

def transcribe_audio(file_path):
    """
    Transcrit un fichier audio avec Whisper.
    Gère automatiquement le chunking si le fichier est trop volumineux.
    """
    try:
        file_size = os.path.getsize(file_path)

        # Si le fichier est trop gros, le découper
        if file_size > MAX_WHISPER_FILE_SIZE:
            chunks = split_audio_file(file_path)
            if not chunks:
                raise Exception("Impossible de découper le fichier audio")

            # Transcrire chaque chunk
            full_transcription = ""
            for i, chunk_path in enumerate(chunks):
                print(f"Transcription du chunk {i+1}/{len(chunks)}...")
                with open(chunk_path, "rb") as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="verbose_json",
                        timestamp_granularities=["segment"]
                    )
                    full_transcription += transcript.text + " "

                # Nettoyer le chunk
                os.remove(chunk_path)

            return full_transcription.strip()

        else:
            # Transcrire directement
            with open(file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"]
                )
                return transcript.text

    except Exception as e:
        raise Exception(f"Erreur lors de la transcription: {str(e)}")

def generate_summary(transcription):
    """
    Génère un résumé exécutif de la transcription avec GPT-4.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant qui résume des transcriptions de réunions professionnelles en français. Génère un résumé structuré et concis."
                },
                {
                    "role": "user",
                    "content": f"""Voici la transcription d'une réunion. Génère un résumé exécutif en français avec:

1. Points clés (3-5 bullet points maximum)
2. Prochaines actions (si mentionnées)

Transcription:
{transcription}

Format souhaité:
## Points clés
- Point 1
- Point 2
- Point 3

## Prochaines actions
- Action 1
- Action 2
"""
                }
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        raise Exception(f"Erreur lors de la génération du résumé: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """
        Endpoint POST pour recevoir un fichier audio et retourner transcription + résumé.
        """
        try:
            # Lire le corps de la requête
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Pour l'instant, on suppose que le fichier est envoyé en tant que body brut
            # Dans une version production, il faudrait parser multipart/form-data

            # Sauvegarder temporairement le fichier
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tmp_file.write(post_data)
                tmp_file_path = tmp_file.name

            # Vérifier la durée
            duration = get_audio_duration(tmp_file_path)
            if duration is None:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Impossible de lire le fichier audio. Format non supporté?"
                }).encode())
                os.remove(tmp_file_path)
                return

            # Vérifier la limite gratuite
            if duration > FREE_TIER_LIMIT_SECONDS:
                self.send_response(403)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Fichier trop long ({int(duration)}s). Limite gratuite: {FREE_TIER_LIMIT_SECONDS}s. Pour les fichiers plus longs, contactez-nous.",
                    "duration": duration
                }).encode())
                os.remove(tmp_file_path)
                return

            # Transcrire
            transcription = transcribe_audio(tmp_file_path)

            # Générer le résumé
            summary = generate_summary(transcription)

            # Nettoyer le fichier temporaire
            os.remove(tmp_file_path)

            # Retourner le résultat
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "transcription": transcription,
                "summary": summary,
                "duration": duration
            }, ensure_ascii=False).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": str(e)
            }).encode())

    def do_OPTIONS(self):
        """
        Gestion des requêtes OPTIONS pour CORS.
        """
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
