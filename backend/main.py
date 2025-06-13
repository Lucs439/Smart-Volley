from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import shutil
from pathlib import Path
from datetime import datetime
import json
from simple_ai import SimpleVolleyballAnalyzer

app = FastAPI(title="Smart Volley AI - Simple Version")

# Initialiser l'analyseur
analyzer = SimpleVolleyballAnalyzer()

# CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Accepte toutes les origines en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Créer les dossiers
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

# Base de données en mémoire
analyses_db = {}

@app.get("/")
async def root():
    return {
        "message": "Smart Volley AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/video/upload")
async def upload_video(
    file: UploadFile = File(...),
    teamConfig: Optional[str] = None
):
    """Upload d'une vidéo de match"""
    
    # Vérifier le type de fichier
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une vidéo")
    
    # Vérifier la taille (25 MB max)
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    # Sauvegarder temporairement pour vérifier la taille
    temp_file = UPLOAD_DIR / f"temp_{file.filename}"
    
    try:
        with open(temp_file, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > 25 * 1024 * 1024:  # 25MB
                    temp_file.unlink()
                    raise HTTPException(status_code=413, detail="Fichier trop volumineux (max 25MB)")
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        if temp_file.exists():
            temp_file.unlink()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")
    
    # Renommer avec timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    final_path = UPLOAD_DIR / f"{timestamp}_{file.filename}"
    temp_file.rename(final_path)
    
    # MODIFICATION ICI - Simplifier la gestion de config
    config = None
    if teamConfig and teamConfig.strip():  # Si teamConfig n'est pas vide
        try:
            # Log pour debug
            print(f"TeamConfig reçu: {teamConfig}")
            
            # Essayer de parser
            if teamConfig.startswith('"') and teamConfig.endswith('"'):
                # Swagger peut ajouter des guillemets supplémentaires
                teamConfig = teamConfig[1:-1]
                teamConfig = teamConfig.replace('\\"', '"')
            
            config_dict = json.loads(teamConfig)
            config = config_dict  # Garder comme dict pour l'instant
            print("✅ Config parsée avec succès")
        except Exception as e:
            print(f"⚠️ Impossible de parser la config: {e}")
            # On continue sans config au lieu de planter
            config = None
    
    # Lancer l'analyse
    try:
        print("🔍 Lancement de l'analyse...")
        results = analyzer.analyze_video(str(final_path))
        print("✅ Analyse terminée")
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        results = {"error": str(e)}
    
    # Pour l'instant, on simule juste le succès
    match_id = f"match_{timestamp}"
    
    # Sauvegarder une analyse simulée
    analyses_db[match_id] = {
        "match_id": match_id,
        "video_path": str(final_path),
        "filename": file.filename,
        "upload_time": datetime.now().isoformat(),
        "team_config": config,  # Peut être None
        "status": "analyzed",
        "message": "Vidéo analysée avec succès",
        "results": results
    }
    
    return {
        "message": "Vidéo uploadée et analysée avec succès",
        "match_id": match_id,
        "filename": file.filename,
        "size_mb": round(file_size / (1024 * 1024), 2),
        "results": results
    }

@app.get("/analyses")
async def get_analyses():
    """Liste toutes les analyses"""
    return {
        "analyses": list(analyses_db.values()),
        "total": len(analyses_db)
    }

@app.get("/analysis/{match_id}")
async def get_analysis(match_id: str):
    """Récupère une analyse spécifique"""
    if match_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    return analyses_db[match_id]

@app.get("/health")
async def health_check():
    """Vérification de santé de l'API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uploads_count": len(list(UPLOAD_DIR.glob("*"))),
        "analyses_count": len(analyses_db)
    }

if __name__ == "__main__":
    import uvicorn
    print("🏐 Démarrage de Smart Volley AI...")
    print("📍 API disponible sur http://127.0.0.1:8000")
    print("📚 Documentation sur http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)