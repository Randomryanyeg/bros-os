import React from 'react';
import { Apple, Search, Wifi, Battery, Folder, Globe, Mail, Music, Settings, Trash2 } from 'lucide-react';

export default function MacOSLayout() {
  return (
    <div className="flex-1 h-full w-full bg-[#1c1c1e] bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: 'url(https://picsum.photos/seed/macos/1920/1080)' }}>
      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4 text-xs font-medium text-white">
          <Apple className="w-4 h-4" />
          <span className="font-bold">Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Window</span>
          <span>Help</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-white">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Search className="w-4 h-4" />
          <div className="flex flex-col items-end">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-2 px-2 z-50">
        <DockIcon icon={<Folder className="text-blue-400" />} label="Finder" />
        <DockIcon icon={<Globe className="text-blue-500" />} label="Safari" />
        <DockIcon icon={<Mail className="text-blue-600" />} label="Mail" />
        <DockIcon icon={<Music className="text-pink-500" />} label="Music" />
        <DockIcon icon={<Settings className="text-gray-400" />} label="Settings" />
        <div className="w-[1px] h-10 bg-white/20 mx-1" />
        <DockIcon icon={<Trash2 className="text-gray-300" />} label="Trash" />
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 right-4 flex flex-col gap-8">
        <DesktopIcon icon={<Folder className="text-blue-400" />} label="Macintosh HD" />
        <DesktopIcon icon={<Folder className="text-blue-400" />} label="Documents" />
      </div>
    </div>
  );
}

function DockIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="relative group">
      <div className="w-12 h-12 flex items-center justify-center hover:scale-125 transition-transform cursor-pointer origin-bottom">
        {icon}
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function DesktopIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded cursor-pointer group">
      <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] text-white text-center font-medium drop-shadow-md">{label}</span>
    </div>
  );
}
