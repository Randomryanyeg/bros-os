/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, HelpCircle, Info } from 'lucide-react';

interface ModalOptions {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

let modalCallback: (options: ModalOptions) => void = () => {};

export const showAlert = (title: string, message: string) => {
  return new Promise<void>((resolve) => {
    modalCallback({
      title,
      message,
      type: 'alert',
      onConfirm: () => resolve(),
      onCancel: () => resolve()
    });
  });
};

export const showConfirm = (title: string, message: string) => {
  return new Promise<boolean>((resolve) => {
    modalCallback({
      title,
      message,
      type: 'confirm',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
};

export const showPrompt = (title: string, message: string, defaultValue: string = '') => {
  return new Promise<string | null>((resolve) => {
    modalCallback({
      title,
      message,
      type: 'prompt',
      defaultValue,
      onConfirm: (val) => resolve(val || null),
      onCancel: () => resolve(null)
    });
  });
};

export default function CustomModal() {
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    modalCallback = (opt) => {
      setOptions(opt);
      setInputValue(opt.defaultValue || '');
    };
  }, []);

  if (!options) return null;

  const handleConfirm = () => {
    options.onConfirm(inputValue);
    setOptions(null);
  };

  const handleCancel = () => {
    options.onCancel();
    setOptions(null);
  };

  const Icon = options.type === 'alert' ? AlertCircle : options.type === 'confirm' ? HelpCircle : Info;
  const iconColor = options.type === 'alert' ? 'text-red-500' : options.type === 'confirm' ? 'text-blue-500' : 'text-gray-500';

  return (
    <AnimatePresence>
      {options && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full bg-gray-50 ${iconColor}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{options.title}</h3>
              </div>
              
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                {options.message}
              </p>

              {options.type === 'prompt' && (
                <input 
                  autoFocus
                  type="text"
                  className="w-full p-4 bg-gray-100 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
              )}

              <div className="flex gap-3">
                {(options.type === 'confirm' || options.type === 'prompt') && (
                  <button 
                    onClick={handleCancel}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-900 font-bold rounded-xl active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 bg-black text-white font-bold rounded-xl active:scale-95 transition-transform"
                >
                  {options.type === 'alert' ? 'OK' : 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
