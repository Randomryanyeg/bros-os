
import React from 'react';
import { HomeIcon, MoveMoneyTabIcon, AdvicePlusIcon, ScenePlusIcon, MoreMenuIcon } from './ScotiaIcons';

interface TabNavigationProps {
  theme?: 'light' | 'dark';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', l: 'Home', Comp: HomeIcon },
  { id: 'transfers', l: 'Move money', Comp: MoveMoneyTabIcon },
  { id: 'advice', l: 'Advice+', Comp: AdvicePlusIcon },
  { id: 'scene', l: 'Scene+', Comp: ScenePlusIcon },
  { id: 'more', l: 'More', Comp: MoreMenuIcon }
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  // Force white background as requested ("not blac")
  const bgClass = 'bg-white';
  const borderClass = 'border-gray-100';
  const activeTabClass = 'text-[#ED0711]';
  const inactiveTabClass = 'text-gray-400';

  return (
    <div className={`${bgClass} border-t ${borderClass} h-[60px] flex items-center justify-around z-[100] shrink-0 pb-safe shadow-[0_-1px_2px_rgba(0,0,0,0.03)]`}>
      {tabs.map((t) => {
        const isActive = activeTab === t.id;

        return (
          <button 
            key={t.id} 
            onClick={() => onTabChange(t.id)} 
            className={`flex flex-col items-center flex-1 pt-2 pb-1 transition-all relative outline-none h-full ${isActive ? activeTabClass : inactiveTabClass}`}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ED0711]" />
            )}
            <div className="flex flex-col items-center justify-center">
              <t.Comp 
                color={isActive ? "#ED0711" : "#94A3B8"} 
                size={22} 
                className={isActive && t.id === 'advice' ? '' : ''}
                style={t.id === 'transfers' ? { width: 22, height: 22, opacity: isActive ? 1 : 0.5 } : {}}
              />
              {t.l && (
                <span className={`text-[11px] mt-1 font-normal tracking-tight whitespace-nowrap ${isActive ? 'text-[#ED0711]' : 'text-slate-400'}`}>
                  {t.l}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
