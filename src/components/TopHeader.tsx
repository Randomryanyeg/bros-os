
import React, { useState, useEffect } from 'react';
import { BackIcon, ScotiaLogoSVG, SearchIcon } from './ScotiaIcons';
import { useBank } from '../shared/BankContext';

interface TopHeaderProps {
  theme?: 'light' | 'dark';
  onBack?: () => void;
  title?: string;
  rightElement?: React.ReactNode;
  onChat?: () => void;
  onNotification?: () => void;
  greeting?: string | null;
  showCenterLogo?: boolean;
  red?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ theme = 'light', onBack, title, rightElement, onChat, greeting, showCenterLogo, red = false }) => {
  const { toggleAdminPanel } = useBank();
  const isDark = false;
  const bgClass = red ? 'bg-scotia-red' : (isDark ? 'bg-black' : 'bg-white');
  const textColor = red ? 'text-white' : (isDark ? 'text-white' : 'text-gray-900');
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (tapCount >= 5) {
      const pin = prompt('Enter Admin PIN:');
      if (pin === '6969') {
        toggleAdminPanel();
      }
      setTapCount(0);
    }
  }, [tapCount, toggleAdminPanel]);

  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
    setTimeout(() => setTapCount(0), 2000);
  };

  return (
    <div className={`${bgClass} pt-12 pb-6 px-6 flex flex-col shrink-0 relative z-50 ${!red && !isDark ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3 z-10 overflow-hidden">
          {onBack ? (
            <button onClick={onBack} className="p-1 active:scale-90 transition-transform -ml-1">
              <BackIcon color={isDark || red ? 'white' : '#1A1A1A'} size={20} />
            </button>
          ) : null}
          <button onClick={handleLogoTap} className="focus:outline-none">
            <ScotiaLogoSVG color={red ? 'white' : '#d11f26'} className="w-8 h-8" />
          </button>
          {title && <h1 className={`${textColor} font-bold text-[17px] ml-1 truncate`}>{title}</h1>}
        </div>
        
        {showCenterLogo && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <button onClick={handleLogoTap} className="focus:outline-none">
                    <ScotiaLogoSVG color={red ? 'white' : '#d11f26'} className="w-8 h-8" />
                </button>
            </div>
        )}

        <div className="flex items-center gap-4 z-10">
          {rightElement ? rightElement : (
            <button 
                onClick={onChat}
                className={`${textColor} active:scale-90 transition-transform`}
            >
                <SearchIcon size={24} color="currentColor" />
            </button>
          )}
        </div>
      </div>
      
      {greeting && (
        <div className="mt-6">
          <h1 className={`${textColor} text-xl font-bold`}>{greeting}</h1>
        </div>
      )}
    </div>
  );
};

export default TopHeader;
