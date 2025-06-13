import React from 'react';
import LogoSvg from "../../assets/icons/Logo.svg";
import HomeIconSvg from "../../assets/icons/Home Icon.svg";
import SettingIconSvg from "../../assets/icons/Setting Icon.svg";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 h-10">
          <img src={LogoSvg} alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900">Smart Volley</span>
        </div>
      </div>

      <nav className="p-6 space-y-2">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
          <img src={HomeIconSvg} alt="Home" className="w-5 h-5" />
          <span>Home</span>
        </div>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer">
          <img src={SettingIconSvg} alt="Settings" className="w-5 h-5" />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 