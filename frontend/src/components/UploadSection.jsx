import React from 'react';
import UploadIconSvg from "../assets/icons/Upload.svg";

const UploadSection = ({
  isConfigured,
  selectedFile,
  handleFileSelect,
  handleRemoveFile,
  handleUpload,
  isUploading,
  uploadStatus
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src={UploadIconSvg} alt="Upload" className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analysez votre match de volley
        </h3>
        <p className="text-gray-600">
          Uploadez une vidéo de match pour obtenir des statistiques détaillées sur les performances de votre équipe
        </p>
        <p className="text-sm text-orange-600 mt-1">
          ⚠️ Limite: 25 MB maximum (~10 secondes en HD)
        </p>
        {!isConfigured && (
          <p className="text-sm text-blue-600 mt-2">
            💡 Configurez d'abord les équipes avant de lancer l'analyse
          </p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFile && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg relative">
          <button
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
            title="Supprimer le fichier"
          >
            ×
          </button>
          <p className="text-sm text-gray-700 pr-8">
            <strong>Fichier sélectionné:</strong> {selectedFile.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? 'Analyse en cours...' : 'Commencer l\'analyse'}
      </button>

      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-lg ${
          uploadStatus.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadSection; 