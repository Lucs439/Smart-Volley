import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import json
from datetime import datetime

class SimpleVolleyballAnalyzer:
    """Version simplifiée de l'analyseur de volleyball"""
    
    def __init__(self):
        print("🤖 Chargement du modèle YOLO...")
        # Le modèle sera téléchargé automatiquement au premier lancement
        self.model = YOLO('yolov8n.pt')  # Version nano (plus rapide)
        print("✅ Modèle chargé")
        
    def analyze_video(self, video_path: str, output_dir: str = "analysis_output"):
        """Analyse basique d'une vidéo"""
        print(f"🎥 Analyse de {video_path}...")
        
        # Créer le dossier de sortie
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        # Ouvrir la vidéo
        cap = cv2.VideoCapture(video_path)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"📊 Vidéo: {fps} FPS, {total_frames} frames")
        
        # Résultats
        results = {
            "video_path": video_path,
            "fps": fps,
            "total_frames": total_frames,
            "detections": []
        }
        
        # Analyser une frame sur 30 (1 par seconde)
        frame_count = 0
        people_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Analyser seulement certaines frames
            if frame_count % 30 == 0:
                # Détecter les personnes
                detections = self.model(frame, classes=[0])  # 0 = person
                
                for r in detections:
                    boxes = r.boxes
                    if boxes is not None:
                        people_in_frame = len(boxes)
                        people_count += people_in_frame
                        
                        results["detections"].append({
                            "frame": frame_count,
                            "time": frame_count / fps,
                            "people_count": people_in_frame
                        })
                        
                        print(f"⏱️  {frame_count/fps:.1f}s - {people_in_frame} joueurs détectés")
            
            frame_count += 1
            
            # Limiter à 10 secondes pour les tests
            if frame_count > fps * 10:
                print("⚠️  Analyse limitée à 10 secondes pour la démo")
                break
        
        cap.release()
        
        # Statistiques finales
        avg_people = people_count / len(results["detections"]) if results["detections"] else 0
        results["summary"] = {
            "average_players_detected": round(avg_people, 1),
            "analysis_duration": frame_count / fps,
            "frames_analyzed": len(results["detections"])
        }
        
        # Sauvegarder les résultats
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        result_file = output_dir / f"analysis_{timestamp}.json"
        
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Analyse terminée!")
        print(f"📄 Résultats sauvés dans {result_file}")
        print(f"👥 Moyenne de {avg_people:.1f} joueurs détectés par frame")
        
        return results

# Test direct
if __name__ == "__main__":
    analyzer = SimpleVolleyballAnalyzer()
    
    # Tester avec une vidéo
    video_path = "test_video.mp4"  # Remplacez par votre vidéo
    
    if Path(video_path).exists():
        analyzer.analyze_video(video_path)
    else:
        print(f"❌ Vidéo {video_path} non trouvée")
        print("💡 Placez une vidéo de test dans le dossier et relancez")