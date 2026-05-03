import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, Monitor, Folder, Settings, Power, User } from 'lucide-react';

export default function WindowsLayout() {
  const [isStartOpen, setIsStartOpen] = useState(false);

  return (
    <div className="flex-1 h-full w-full bg-[#0078d4] bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: 'url(https://picsum.photos/seed/windows11/1920/1080)' }}>
      {/* Desktop Icons */}
      <div className="p-4 grid grid-cols-1 gap-4 w-24">
        <DesktopIcon icon={<Folder className="text-yellow-400" />} label="This PC" />
        <DesktopIcon icon={<Folder className="text-blue-400" />} label="Recycle Bin" />
        <DesktopIcon icon={<Monitor className="text-gray-200" />} label="Network" />
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md border-t border-white/20 flex items-center justify-center px-4 z-50">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsStartOpen(!isStartOpen)}
            className="p-2 hover:bg-white/50 rounded transition-colors"
          >
            <LayoutGrid className="w-6 h-6 text-blue-600" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-white/50 border-none rounded-full pl-9 pr-4 py-1 text-sm w-48 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button className="p-2 hover:bg-white/50 rounded transition-colors">
              <Folder className="w-5 h-5 text-yellow-600" />
            </button>
            <button className="p-2 hover:bg-white/50 rounded transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* System Tray */}
        <div className="absolute right-4 flex items-center gap-4 text-xs font-medium text-gray-700">
          <div className="flex flex-col items-end">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Start Menu */}
      {isStartOpen && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[500px] h-[600px] bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-8 z-40"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold text-gray-600">Pinned</h2>
            <button className="text-xs text-blue-600 hover:underline">All apps &gt;</button>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <StartIcon icon={<Folder className="text-blue-500" />} label="Edge" />
            <StartIcon icon={<Folder className="text-yellow-500" />} label="Word" />
            <StartIcon icon={<Folder className="text-blue-600" />} label="Excel" />
            <StartIcon icon={<Folder className="text-orange-500" />} label="PowerPoint" />
            <StartIcon icon={<Folder className="text-purple-500" />} label="OneNote" />
            <StartIcon icon={<Folder className="text-blue-400" />} label="Mail" />
            <StartIcon icon={<Folder className="text-green-500" />} label="Photos" />
            <StartIcon icon={<Folder className="text-gray-500" />} label="Settings" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/5 border-t border-black/5 flex items-center justify-between px-8 rounded-b-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Power className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function DesktopIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded cursor-pointer group">
      <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] text-white text-center font-medium drop-shadow-md">{label}</span>
    </div>
  );
}

function StartIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-gray-50 transition-colors">
        {icon}
      </div>
      <span className="text-[11px] text-gray-700 text-center">{label}</span>
    </div>
  );
}
