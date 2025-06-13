import React from 'react';

const LimitModal = ({ showLimitModal, setShowLimitModal }) => {
  if (!showLimitModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fichier trop volumineux
          </h3>
          <p className="text-gray-600 mb-6">
            Pour optimiser les temps de traitement, veuillez uploader une vidéo de <strong>25 MB maximum</strong> (environ 10 secondes en HD).
          </p>
          <button
            onClick={() => setShowLimitModal(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitModal; 