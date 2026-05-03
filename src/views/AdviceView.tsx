import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Lightbulb, Search, ChevronLeft } from 'lucide-react';

interface AdviceViewProps {
  onBack: () => void;
  onAction: (action: string) => void;
  theme?: 'light' | 'dark';
}

const AdviceView: React.FC<AdviceViewProps> = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-[100] flex flex-col font-sans bg-white text-[#1A1A1A]`}
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between shrink-0 bg-white border-b border-gray-50">
        <div className="w-10"></div>
        <h1 className="text-[18px] font-bold tracking-tight text-gray-900 flex items-center gap-0.5">
          Advice<span className="text-[14px] mt-[-4px]">+</span>
        </h1>
        <button className="p-2 -mr-2 active:scale-95 transition-transform">
          <Search size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Subheader Text */}
        <div className="px-8 py-8 text-center space-y-4">
          <p className="text-[15px] text-gray-700 leading-snug font-medium">
            Your saving, budgeting, and investing dashboard. Scotia Smart Money tools put you in control.
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-[2px] bg-[#ED0711]" />
          </div>
        </div>

        {/* Insights Section */}
        <div className="space-y-4">
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-500 fill-yellow-500" />
              <h3 className="font-bold text-[16px] text-gray-900">Insights (5)</h3>
            </div>
            <div className="flex items-center gap-4">
              <ChevronLeft size={20} className="text-gray-300" />
              <span className="text-[12px] font-bold text-gray-900 tracking-widest">1 OF 5</span>
              <ChevronRight size={20} className="text-gray-900" />
            </div>
          </div>

          {/* Horizontal Scroll Cards */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
            {/* Card 1 */}
            <div className="min-w-[280px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="h-32 bg-[#FFB380] relative flex items-center justify-center p-4">
                {/* Simplified Illustration */}
                <div className="w-full h-full bg-white/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                   <div className="absolute top-4 left-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full" />
                   </div>
                   <div className="w-32 h-2 bg-white/60 rounded-full mb-2" />
                   <div className="w-24 h-2 bg-white/60 rounded-full" />
                   <div className="absolute bottom-4 right-4 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs italic">i</div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SEP 12</span>
                <h4 className="font-bold text-[16px] text-gray-900 mb-2">Upcoming transaction</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  Take a look at your upcoming activities from Sep 14 to Oct 13.
                </p>
                <button className="mt-auto w-full py-3 border-t border-gray-100 text-[#005F8F] font-bold text-[14px] active:bg-gray-50 transition-colors">
                  View details
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="min-w-[280px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="h-32 bg-[#008751] relative flex items-center justify-center p-4">
                <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
                   <div className="grid grid-cols-2 gap-2">
                      <div className="w-6 h-8 bg-purple-400 rounded-sm" />
                      <div className="w-6 h-8 bg-yellow-400 rounded-sm" />
                      <div className="w-6 h-8 bg-blue-400 rounded-sm" />
                      <div className="w-6 h-8 bg-emerald-400 rounded-sm" />
                   </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SEP 11</span>
                <h4 className="font-bold text-[16px] text-gray-900 mb-2">Deposit</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  So far this month your deposits are significantly higher than...
                </p>
                <button className="mt-auto w-full py-3 border-t border-gray-100 text-[#005F8F] font-bold text-[14px] active:bg-gray-50 transition-colors">
                  View details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Section */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[18px] text-gray-900">Cashflow</h3>
              <ChevronRight size={24} className="text-[#005F8F]" />
            </div>
            <div className="grid grid-cols-2 gap-8 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-100" />
              <div>
                <p className="text-[12px] text-gray-600 mb-2">Average net cashflow</p>
                <p className="text-[20px] font-bold text-gray-900">$2,705.43</p>
              </div>
              <div className="pl-4">
                <p className="text-[12px] text-gray-600 mb-2">Net cashflow in Sep</p>
                <p className="text-[20px] font-bold text-gray-900">$1,543.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create your budget Section */}
        <div className="px-6 mt-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between overflow-hidden relative">
            <div className="flex-1 z-10">
              <h3 className="font-bold text-[18px] text-gray-900 mb-2">Create your budget</h3>
              <p className="text-[13px] text-gray-600 leading-snug pr-8">
                A budget can help keep you on track and avoid overspending
              </p>
            </div>
            <div className="flex items-center gap-4 z-10">
               <ChevronRight size={24} className="text-[#005F8F]" />
            </div>
            {/* Background Illustration Placeholder */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
               <div className="w-32 h-20 bg-gray-900 rounded-lg rotate-[-15deg]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdviceView;
