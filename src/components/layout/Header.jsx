import React from 'react';
import UploadIconSvg from "../../assets/icons/Upload.svg";

const Header = ({ 
  activeTab, 
  setActiveTab, 
  isConfigured, 
  setShowConfigModal, 
  onUploadClick 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center justify-between h-10">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setActiveTab('Match 1')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 h-10 ${
              activeTab === 'Match 1' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📄</span>
            <span>Match 1</span>
          </button>
          <button 
            onClick={() => setActiveTab('Match 2')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 h-10 ${
              activeTab === 'Match 2' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>📄</span>
            <span>Match 2</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {isConfigured && (
            <span className="text-sm text-green-600 font-medium">✓ Match configuré</span>
          )}
          <button 
            onClick={() => setShowConfigModal(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2 h-10"
          >
            <span>⚙️</span>
            <span>Configurer</span>
          </button>
          <button 
            onClick={onUploadClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 h-10"
          >
            <img src={UploadIconSvg} alt="Upload" className="w-5 h-5" />
            <span>Upload Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header; 