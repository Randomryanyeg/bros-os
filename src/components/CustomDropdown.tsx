import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  subLabel?: string;
  key?: string;
}

interface CustomDropdownProps {
  label: string;
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  isLast?: boolean;
  theme?: 'light' | 'dark';
  extraOptions?: { label: string; value: string; icon?: React.ReactNode }[];
  onExtraClick?: (value: string) => void;
  searchable?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  isLast, 
  theme = 'dark',
  extraOptions = [],
  onExtraClick,
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const option = options.find(o => typeof o === 'string' ? o === value : o.value === value);
    if (typeof option === 'string') return option;
    return option?.label || value;
  };

  const filteredOptions = options.filter(option => {
    const label = typeof option === 'string' ? option : option.label;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 flex justify-between items-center ${isDark ? 'bg-[#1E1E1E] active:bg-white/5' : 'bg-white active:bg-gray-50'} transition-colors text-left`}
      >
        <div className="flex flex-col gap-0.5">
          <div className={`text-[13px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
          <div className={`text-[16px] font-bold ${value ? (isDark ? 'text-white' : 'text-[#1A1A1A]') : (isDark ? 'text-gray-500' : 'text-[#8C8C8C]')}`}>
            {getDisplayValue()}
          </div>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          {icon}
        </div>
      </button>
      
      {!isLast && (
        <div className={`mx-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`} />
      )}
      
      {isOpen && (
        <div className={`absolute top-full left-0 w-full ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-100'} border shadow-xl z-50 overflow-hidden max-h-96 flex flex-col rounded-b-xl`}>
          {searchable && (
            <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <div className={`relative flex items-center rounded-xl p-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <Search size={20} className="text-gray-500 ml-2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none ml-2 text-sm"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto">
            {extraOptions.map((extra) => (
              <button
                key={extra.value}
                onClick={() => {
                  onExtraClick?.(extra.value);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full p-4 text-left flex items-center gap-3 ${isDark ? 'text-[#ED0711] hover:bg-white/5 border-white/5' : 'text-[#ED0711] hover:bg-gray-50 border-gray-100'} transition-colors border-b font-bold`}
              >
                {extra.icon}
                {extra.label}
              </button>
            ))}
            
            {filteredOptions.map((option) => {
              const optLabel = typeof option === 'string' ? option : option.label;
              const optValue = typeof option === 'string' ? option : option.value;
              const optSub = typeof option === 'string' ? null : option.subLabel;
              const optKey = typeof option === 'string' ? option : (option.key || option.value);
              
              return (
                <button
                  key={optKey}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full p-4 text-left flex flex-col ${isDark ? 'text-white hover:bg-white/5 border-white/5' : 'text-[#1A1A1A] hover:bg-gray-50 border-gray-100'} transition-colors border-b last:border-0`}
                >
                  <div className="font-bold">{optLabel}</div>
                  {optSub && <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{optSub}</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


