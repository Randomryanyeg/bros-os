import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShoppingBag, CreditCard, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { useBank, PurchasedCard } from '../shared/BankContext';

interface RedeemStoreViewProps {
  onBack: () => void;
  onViewCards: () => void;
}

const COMPANIES = [
  { name: 'Dollarama', color: '#006A4E', logo: 'DOLLARAMA' },
  { name: 'Winners', color: '#ED0711', logo: 'WINNERS' },
  { name: 'Marshalls', color: '#004B8D', logo: 'Marshalls' },
  { name: 'HomeSense', color: '#75203B', logo: 'HomeSense' },
  { name: 'Starbucks', color: '#00704A', logo: 'STARBUCKS' },
  { name: 'Amazon', color: '#232F3E', logo: 'amazon' },
];

const POINTS_PER_CARD = 2000; // $20 = 2000 points

const DOLLARAMA_ICON = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaExjx1DOdg3VFYQBmcQhGBqf7dpDQx7nvXw&s";

export default function RedeemStoreView({ onBack, onViewCards }: RedeemStoreViewProps) {
  const { user, updateUser } = useBank();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalPoints = quantity * POINTS_PER_CARD;
  const canAfford = (user?.scenePoints || 0) >= totalPoints;

  const calculateLuhnCheckDigit = (number: string): number => {
    let sum = 0;
    let shouldDouble = true;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (10 - (sum % 10)) % 10;
  };

  const generateCardNumber = () => {
    const prefix = "637717060000";
    const min = 100000;
    const max = 950999;
    const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
    const baseNumber = prefix + randomVal.toString();
    const checkDigit = calculateLuhnCheckDigit(baseNumber);
    return baseNumber + checkDigit;
  };

  const handleRedeem = async () => {
    if (!canAfford || isProcessing || !user) return;

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCards: PurchasedCard[] = [];
    for (let i = 0; i < quantity; i++) {
      newCards.push({
        id: Math.random().toString(36).substr(2, 9),
        company: selectedCompany.name,
        balance: 20,
        cardNumber: generateCardNumber(),
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        purchaseDate: new Date().toISOString(),
      });
    }

    await updateUser({
      scenePoints: user.scenePoints - totalPoints,
      purchasedCards: [...(user.purchasedCards || []), ...newCards],
    });

    setIsProcessing(false);
    setShowSuccess(true);
  };

  return (
    <div className="absolute inset-0 z-[150] bg-[#F4F7F9] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="font-bold text-xl text-gray-900">Redeem Points</h1>
        </div>
        <button onClick={onViewCards} className="p-2 rounded-full bg-[#ED0711]/10 text-[#ED0711] active:scale-95 transition-transform">
          <ShoppingBag size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Points Summary */}
        <div className="bg-[#ED0711] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Available Scene+ Points</p>
            <h2 className="text-3xl font-bold">{(user?.scenePoints || 0).toLocaleString()}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShoppingBag size={120} />
          </div>
        </div>

        {/* Company Selection */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 ml-1">Select eCard</h3>
          <div className="grid grid-cols-2 gap-4">
            {COMPANIES.map((company) => (
              <button
                key={company.name}
                onClick={() => setSelectedCompany(company)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedCompany.name === company.name
                    ? 'border-[#ED0711] bg-white shadow-md scale-[1.02]'
                    : 'border-transparent bg-white/50 text-gray-400'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden"
                  style={{ backgroundColor: company.color }}
                >
                  {company.name === 'Dollarama' ? (
                    <img src={DOLLARAMA_ICON} alt="Dollarama" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <CreditCard size={24} />
                  )}
                </div>
                <span className={`font-bold text-sm ${selectedCompany.name === company.name ? 'text-gray-900' : ''}`}>
                  {company.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Quantity</h3>
              <p className="text-xs text-gray-500">1 - 50 cards per purchase</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per card</span>
              <span className="font-bold text-gray-900">{POINTS_PER_CARD.toLocaleString()} pts</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">Total Cost</span>
              <span className="font-bold text-[#ED0711]">{totalPoints.toLocaleString()} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-white border-t border-gray-100 pb-10">
        <button
          disabled={!canAfford || isProcessing}
          onClick={handleRedeem}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
            !canAfford 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-[#ED0711] text-white'
          }`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={22} />
              {canAfford ? `Redeem ${totalPoints.toLocaleString()} Points` : 'Insufficient Points'}
            </>
          )}
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Redemption Successful!</h2>
                <p className="text-gray-500 mt-2">
                  You have successfully redeemed {quantity} {selectedCompany.name} eCard{quantity > 1 ? 's' : ''}.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <button 
                  onClick={onViewCards}
                  className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                >
                  View My Cards
                </button>
                <button 
                  onClick={() => { setShowSuccess(false); setQuantity(1); }}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
