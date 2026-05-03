
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScotiaLogoSVG, AlertIcon } from '../../components/ScotiaIcons';
import { TransferStage } from '../../shared/types';

interface ProcessingOverlayProps {
    stage: TransferStage;
    error?: string;
    onRetry: () => void;
    onAbort: () => void;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ stage, error, onRetry, onAbort }) => {
    return (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[1000] flex flex-col items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                {stage === 'sending' && (
                    <motion.div 
                        key="sending" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="relative flex items-center justify-center"
                    >
                        {/* Spinning Ring */}
                        <motion.div 
                            className="absolute w-24 h-24 border-4 border-gray-200 border-t-[#ED0711] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Center Logo */}
                        <div className="relative z-10 p-4">
                            <ScotiaLogoSVG className="w-10 h-10" color="#ED0711" />
                        </div>
                    </motion.div>
                )}
                
                {stage === 'completed' && (
                    <motion.div 
                        key="success" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.div 
                            layoutId="success-checkmark"
                            className="w-20 h-20 bg-[#008751] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,135,81,0.2)]"
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </motion.div>
                    </motion.div>
                )}

                {stage === 'error' && (
                    <motion.div 
                        key="error" 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center text-center max-w-xs relative z-10 p-6"
                    >
                        <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-6 text-[#ED0711] shadow-xl">
                            <AlertIcon size={40} color="#ED0711" />
                        </div>
                        <h2 className="text-[#333333] font-normal text-xl mb-2">Transfer Failed</h2>
                        <p className="text-gray-500 text-[15px] mb-4">
                            {error || "We could not complete your request at this time."}
                        </p>
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-6 text-left w-full">
                                <p className="text-[#ED0711] text-xs font-mono break-words">
                                    Debug Info: {error}
                                </p>
                                <p className="text-[#ED0711]/80 text-xs mt-2">
                                    Tip: Check the SMTP Debugger in the Settings app to verify your mailer configuration.
                                </p>
                            </div>
                        )}
                        <div className="w-full space-y-3">
                            <button 
                                onClick={onRetry} 
                                className="w-full py-3.5 bg-[#ED0711] text-white font-bold rounded-lg transition-all active:scale-95 shadow-md"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={onAbort} 
                                className="w-full py-3.5 bg-gray-100 text-[#333333] font-bold rounded-lg transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProcessingOverlay;
