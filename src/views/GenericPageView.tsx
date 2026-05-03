import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Construction } from 'lucide-react';

interface GenericPageViewProps {
  title: string;
  onBack: () => void;
  theme?: 'light' | 'dark';
}

const GenericPageView: React.FC<GenericPageViewProps> = ({ title, onBack, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`absolute inset-0 flex flex-col z-[200] overflow-hidden ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'}`}
    >
      {/* Header */}
      <div className={`pt-12 pb-4 px-4 flex items-center border-b shrink-0 ${isDark ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        </button>
        <h1 className="font-bold text-[17px] ml-2">{title}</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${isDark ? 'bg-[#1E1E1E] border border-white/5' : 'bg-white border border-gray-200'}`}>
          <Construction size={48} className="text-[#ED0711]" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className={`max-w-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          We're currently redesigning the <span className="font-bold text-[#ED0711]">{title}</span> experience to bring you the best mobile banking features.
        </p>
        
        <div className="mt-12 space-y-4 w-full max-w-xs">
          <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-[#ED0711]"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">65% Complete</p>
        </div>

        <button 
          onClick={onBack}
          className="mt-12 px-8 py-3 bg-[#ED0711] text-white rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    </motion.div>
  );
};

export default GenericPageView;
