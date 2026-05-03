import React from 'react';
import { Search, Folder, Settings, Globe, Mail, Music, Phone, MessageSquare, Camera, Play } from 'lucide-react';

export default function AndroidLayout() {

  return (
    <div className="h-full w-full bg-white bg-cover bg-center relative overflow-hidden flex flex-col items-center justify-between py-12" style={{ backgroundImage: 'url(https://picsum.photos/seed/android-light/1080/1920?blur=10)' }}>
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="text-xs font-bold text-gray-900">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-2 text-gray-900">
          <div className="w-4 h-4 rounded-full border border-gray-900/50" />
          <div className="w-4 h-4 rounded-full border border-gray-900/50" />
          <div className="w-4 h-4 rounded-full border border-gray-900/50" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-[90%] h-12 bg-white/60 backdrop-blur-xl rounded-full border border-gray-200 flex items-center px-4 gap-3 mt-8 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search your phone" 
          className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 flex-1 text-sm"
        />
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-8 w-full px-8 mb-auto mt-12">
        <AppIcon icon={<Globe className="text-blue-400" />} label="Chrome" />
        <AppIcon icon={<Mail className="text-red-400" />} label="Gmail" />
        <AppIcon icon={<Play className="text-blue-500" />} label="Play Store" />
        <AppIcon icon={<Camera className="text-gray-400" />} label="Camera" />
        <AppIcon icon={<Music className="text-orange-400" />} label="Music" />
        <AppIcon icon={<Folder className="text-yellow-500" />} label="Files" />
        <AppIcon icon={<Settings className="text-gray-500" />} label="Settings" />
      </div>

      {/* Dock */}
      <div className="w-full px-8 pb-8">
        <div className="grid grid-cols-4 gap-8">
          <AppIcon icon={<Phone className="text-green-500" />} label="Phone" />
          <AppIcon icon={<MessageSquare className="text-blue-400" />} label="Messages" />
          <AppIcon icon={<Globe className="text-blue-500" />} label="Browser" />
          <AppIcon icon={<Camera className="text-gray-400" />} label="Camera" />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/30 backdrop-blur-md flex items-center justify-center gap-16 z-50">
        <button className="w-4 h-4 border-2 border-gray-900/50 rounded-sm rotate-45" />
        <button className="w-5 h-5 border-2 border-gray-900/50 rounded-full" />
        <button className="w-4 h-4 border-2 border-gray-900/50 rounded-sm" />
      </div>
    </div>
  );
}

function AppIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-14 h-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/40 shadow-sm">
        {icon}
      </div>
      <span className="text-[10px] text-gray-900 text-center font-bold drop-shadow-sm">{label}</span>
    </div>
  );
}
