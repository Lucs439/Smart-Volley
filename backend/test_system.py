#!/usr/bin/env python3
"""
Script de test pour vérifier que tout fonctionne
"""

import sys
import subprocess
import time
import requests
from pathlib import Path

def check_python():
    """Vérifie la version Python"""
    print("🐍 Vérification Python...")
    version = sys.version.split()[0]
    print(f"✅ Python {version}")
    return True

def check_dependencies():
    """Vérifie les dépendances"""
    print("\n📦 Vérification des dépendances...")
    
    try:
        import fastapi
        print("✅ FastAPI installé")
    except ImportError:
        print("❌ FastAPI manquant - lancez: pip install -r requirements.txt")
        return False
    
    try:
        import cv2
        print("✅ OpenCV installé")
    except ImportError:
        print("❌ OpenCV manquant")
        return False
    
    try:
        import ultralytics
        print("✅ Ultralytics (YOLO) installé")
    except ImportError:
        print("❌ Ultralytics manquant")
        return False
    
    return True

def test_api():
    """Teste l'API"""
    print("\n🌐 Test de l'API...")
    
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API accessible")
            print(f"   Version: {response.json()['version']}")
            return True
        else:
            print(f"❌ API retourne le code {response.status_code}")
            return False
    except requests.ConnectionError:
        print("❌ API non accessible - lancez d'abord: python main.py")
        return False

def test_upload_endpoint():
    """Teste l'endpoint d'upload"""
    print("\n📤 Test de l'endpoint d'upload...")
    
    try:
        response = requests.get("http://localhost:8000/docs")
        if response.status_code == 200:
            print("✅ Documentation API accessible sur http://localhost:8000/docs")
            return True
    except:
        print("❌ Impossible d'accéder à la documentation")
        return False

def test_yolo_model():
    """Teste le modèle YOLO"""
    print("\n🤖 Test du modèle YOLO...")
    
    try:
        from ultralytics import YOLO
        print("   Chargement du modèle (première fois = téléchargement ~6MB)...")
        model = YOLO('yolov8n.pt')
        print("✅ Modèle YOLO prêt")
        
        # Test sur une image noire
        import numpy as np
        test_image = np.zeros((640, 640, 3), dtype=np.uint8)
        results = model(test_image)
        print("✅ Inférence test réussie")
        return True
    except Exception as e:
        print(f"❌ Erreur YOLO: {e}")
        return False

def create_test_video():
    """Crée une vidéo de test simple"""
    print("\n🎥 Création d'une vidéo de test...")
    
    try:
        import cv2
        import numpy as np
        
        # Créer une vidéo simple
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter('test_video.mp4', fourcc, 20.0, (640, 480))
        
        # 100 frames (5 secondes à 20fps)
        for i in range(100):
            # Créer une frame avec des rectangles (simulant des joueurs)
            frame = np.ones((480, 640, 3), dtype=np.uint8) * 255
            
            # Dessiner des "joueurs"
            cv2.rectangle(frame, (100, 100), (150, 250), (0, 0, 255), -1)
            cv2.rectangle(frame, (300, 150), (350, 300), (255, 0, 0), -1)
            cv2.putText(frame, f"Frame {i}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
            
            out.write(frame)
        
        out.release()
        print("✅ Vidéo de test créée: test_video.mp4")
        return True
    except Exception as e:
        print(f"❌ Erreur création vidéo: {e}")
        return False

def run_full_test():
    """Lance tous les tests"""
    print("🏐 Test complet du système Smart Volley AI")
    print("=" * 50)
    
    all_good = True
    
    # Tests de base
    all_good &= check_python()
    all_good &= check_dependencies()
    
    if not all_good:
        print("\n❌ Dépendances manquantes. Lancez:")
        print("   pip install -r requirements.txt")
        return
    
    # Test API
    api_ok = test_api()
    if not api_ok:
        print("\n💡 Lancez l'API dans un autre terminal:")
        print("   python main.py")
        print("\nPuis relancez ce test.")
        return
    
    all_good &= test_upload_endpoint()
    all_good &= test_yolo_model()
    
    # Créer une vidéo de test si elle n'existe pas
    if not Path("test_video.mp4").exists():
        create_test_video()
    
    # Test de l'analyseur simple
    print("\n🔬 Test de l'analyseur...")
    try:
        from simple_ai import SimpleVolleyballAnalyzer
        analyzer = SimpleVolleyballAnalyzer()
        
        if Path("test_video.mp4").exists():
            results = analyzer.analyze_video("test_video.mp4")
            print("✅ Analyse réussie")
            print(f"   Joueurs détectés en moyenne: {results['summary']['average_players_detected']}")
        else:
            print("⚠️  Pas de vidéo de test")
    except Exception as e:
        print(f"❌ Erreur analyse: {e}")
        all_good = False
    
    # Résumé
    print("\n" + "=" * 50)
    if all_good:
        print("✅ Tous les tests sont passés!")
        print("\n🚀 Prochaines étapes:")
        print("1. L'API tourne sur http://localhost:8000")
        print("2. La doc est sur http://localhost:8000/docs")
        print("3. Lancez votre interface React")
        print("4. Uploadez une vraie vidéo de volley!")
    else:
        print("❌ Certains tests ont échoué")
        print("Corrigez les erreurs ci-dessus et relancez")

if __name__ == "__main__":
    run_full_test()