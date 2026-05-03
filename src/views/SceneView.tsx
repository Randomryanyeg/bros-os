
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, ChevronRight, Tag } from 'lucide-react';
import { useBank } from '../shared/BankContext';

interface SceneViewProps {
  onBack: () => void;
  onAction: (action: string) => void;
}

const SceneView: React.FC<SceneViewProps> = ({ onBack }) => {
  const { user, updateUser } = useBank();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [viewState, setViewState] = useState<'main' | 'wallet' | 'barcode'>('main');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const DOLLARAMA_IMAGE = "https://www.giftcards.com/content/dam/bhn/live/nam/ca/en/catalog-assets/product-images/07675058430/07675058430_1031158_master.png/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg";
  const DOLLARAMA_ICON = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaExjx1DOdg3VFYQBmcQhGBqf7dpDQx7nvXw&s";

  const getCardImage = (company: string) => company === 'Dollarama' ? DOLLARAMA_IMAGE : "https://picsum.photos/seed/giftcard/400/250";

  const dollaramaCards = (user?.purchasedCards || []).filter(c => c.company === 'Dollarama' && !c.isRedeemed);
  const selectedCard = dollaramaCards.find(c => c.id === selectedCardId);

  const handleRedeemPoints = useCallback(async (company: string) => {
    if (!user) return;
    const cost = 2000; // $20 = 2000 points
    if (user.scenePoints < cost) {
      alert("Not enough points!");
      return;
    }

    const newCard = {
      id: Math.random().toString(36).substr(2, 9),
      company,
      balance: 20,
      cardNumber: Math.floor(Math.random() * 10000000000000000).toString(),
      pin: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      purchaseDate: new Date().toISOString(),
      isRedeemed: false
    };

    try {
      await updateUser({
        scenePoints: user.scenePoints - cost,
        purchasedCards: [newCard, ...(user.purchasedCards || [])]
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to redeem points:", error);
      alert("Failed to redeem points. Please try again.");
    }
  }, [user, updateUser]);

  const handleRedeemCard = useCallback(async (cardId: string) => {
    if (!user) return;
    const updatedCards = (user.purchasedCards || []).map(card => 
      card.id === cardId ? { ...card, isRedeemed: true, balance: 0 } : card
    );

    try {
      await updateUser({ purchasedCards: updatedCards });
      window.location.reload();
    } catch (error) {
      console.error("Failed to redeem card:", error);
      alert("Failed to redeem card. Please try again.");
    }
  }, [user, updateUser]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex flex-col font-sans bg-[#F4F7F9] text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between shrink-0 bg-white border-b border-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 active:scale-95 transition-transform">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-[18px] font-bold tracking-tight text-gray-900">Scene+</h1>
        <button className="p-2 -mr-2 active:scale-95 transition-transform">
          <HelpCircle size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F4F7F9]">
        {/* Black Points Section */}
        <div className="bg-black pt-10 pb-10 px-6 flex flex-col items-center text-center relative">
          <div className="flex gap-1 mb-6">
            <div className="w-3 h-3 bg-[#A855F7] rounded-full" />
            <div className="w-3 h-3 bg-[#EF4444] rounded-full" />
            <div className="w-3 h-3 bg-[#10B981] rounded-full" />
            <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
            <div className="w-3 h-3 bg-[#F472B6] rounded-full" />
          </div>

          <p className="text-white text-[15px] font-medium mb-1">Points balance</p>
          <h2 className="text-white text-[44px] font-bold mb-3 tracking-tight">
            {user?.scenePoints.toLocaleString() || "0"}
          </h2>
          <p className="text-gray-400 text-[13px] font-medium">
            Update: <span className="text-white font-bold">Last business day</span>
          </p>
        </div>

        {/* Membership Card */}
        <div className="px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <span className="text-gray-500 text-[15px]">Membership #</span>
              <span className="text-gray-900 font-bold text-[16px] tracking-tight">123422 223 333 444 4</span>
            </div>
            <button className="w-full p-5 flex items-center justify-between active:bg-gray-50 transition-colors">
              <span className="text-gray-500 text-[15px]">Points overview</span>
              <span className="text-[#00A4E4] font-bold text-[16px]">View</span>
            </button>
          </div>
        </div>

        {/* Purchased Cards Section */}
        {user?.purchasedCards && user.purchasedCards.filter(c => !c.isRedeemed).length > 0 && (
          <div className="mt-8 px-6">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">YOUR GIFT CARDS</h3>
            <div className="space-y-4">
              {user.purchasedCards.filter(c => !c.isRedeemed).map(card => (
                <div key={card.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                    <img src={getCardImage(card.company)} alt={card.company} className="w-24 h-16 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{card.company}</h4>
                      <p className="text-green-600 font-bold">${card.balance.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (card.company === 'Dollarama') {
                          setSelectedCardId(card.id);
                          setViewState('barcode');
                        } else {
                          handleRedeemCard(card.id);
                        }
                      }}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold active:scale-95 transition-transform"
                    >
                      REDEEM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redeemed Cards Section */}
        {user?.purchasedCards && user.purchasedCards.filter(c => c.isRedeemed).length > 0 && (
          <div className="mt-8 px-6">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">REDEEMED</h3>
            <div className="space-y-4">
              {user.purchasedCards.filter(c => c.isRedeemed).map(card => (
                <div key={card.id} className="bg-gray-100 rounded-xl p-4 border border-gray-200 opacity-75">
                  <div className="flex gap-4">
                    <img src={getCardImage(card.company)} alt={card.company} className="w-24 h-16 object-cover rounded-lg grayscale" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-400">{card.company}</h4>
                      <p className="text-gray-400 font-bold">$0.00</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-bold">
                      USED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ways to Redeem */}
        <div className="mt-8 bg-white">
          <div className="px-6 pt-8 pb-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em]">WAYS TO REDEEM</h3>
          </div>
          
          <div className="px-6 space-y-0">
            <button 
              onClick={() => {
                if (dollaramaCards.length > 0) {
                  setViewState('wallet');
                } else {
                  setShowGiftCardModal(true);
                }
              }}
              className="w-full py-6 flex items-center gap-5 text-left group active:opacity-70 transition-opacity border-b border-gray-100"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={DOLLARAMA_ICON} alt="Dollarama" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                 </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[17px] text-gray-900">Dollarama Gift Card</h4>
                <p className="text-[14px] text-gray-500">
                  {dollaramaCards.length > 0 ? `You have ${dollaramaCards.length} card${dollaramaCards.length > 1 ? 's' : ''}` : 'Redeem 2,000 points for $20'}
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full py-6 flex items-center gap-5 text-left group active:opacity-70 transition-opacity border-b border-gray-100">
              <div className="w-10 h-10 flex items-center justify-center relative">
                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-[18px] font-bold">$</span>
                 </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[17px] text-gray-900">Redeem credit</h4>
                <p className="text-[14px] text-gray-500">Up to $300 for 13,000 points</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Ways to Earn */}
        <div className="mt-4 bg-white pb-20">
          <div className="px-6 pt-8 pb-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em]">WAYS TO EARN</h3>
          </div>
          
          <div className="px-6">
            <button className="w-full py-6 flex items-center gap-5 text-left group active:opacity-70 transition-opacity">
              <div className="w-10 h-10 flex items-center justify-center">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Tag size={20} className="text-red-500" />
                 </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[17px] text-gray-900">Your offers</h4>
                <p className="text-[14px] text-gray-500">Explore ways to earn points faster</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Gift Card Purchase Modal */}
      <AnimatePresence>
        {showGiftCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] flex flex-col bg-white"
            onClick={() => setShowGiftCardModal(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="h-full w-full flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="pt-12 pb-4 px-6 flex items-center shrink-0 bg-white border-b border-gray-50">
                <button onClick={() => setShowGiftCardModal(false)} className="p-2 -ml-2 active:scale-95 transition-transform">
                  <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="flex-1 text-center text-[18px] font-bold tracking-tight text-gray-900 mr-8">Dollarama</h1>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-sm aspect-[1.6/1] rounded-2xl overflow-hidden shadow-xl mb-8 border border-gray-100">
                  <img src={DOLLARAMA_IMAGE} alt="Dollarama" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100 overflow-hidden shadow-sm">
                  <img src={DOLLARAMA_ICON} alt="Dollarama" className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dollarama Gift Card</h2>
                <p className="text-gray-500 text-center mb-10 text-[16px] leading-relaxed px-4">
                  Redeem 2,000 points for a $20 Dollarama e-Gift Card. Use it at any Dollarama location across Canada.
                </p>
                
                <div className="w-full space-y-4 mt-auto">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">Redemption Value</span>
                      <span className="text-gray-900 font-bold">$20.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Points Required</span>
                      <span className="text-[#00A4E4] font-bold">2,000 pts</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRedeemPoints('Dollarama')}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold text-[18px] active:scale-[0.98] transition-transform shadow-lg shadow-black/10"
                  >
                    Redeem Now
                  </button>
                  
                  <button 
                    onClick={() => setShowGiftCardModal(false)}
                    className="w-full py-5 text-gray-500 font-bold text-[17px] active:opacity-70 transition-opacity"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dollarama Wallet View */}
      <AnimatePresence>
        {viewState === 'wallet' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[300] bg-[#F4F7F9] flex flex-col"
          >
            <div className="pt-12 pb-4 px-6 flex items-center shrink-0 bg-white border-b border-gray-50">
              <button onClick={() => setViewState('main')} className="p-2 -ml-2 active:scale-95 transition-transform">
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <h1 className="flex-1 text-center text-[18px] font-bold tracking-tight text-gray-900 mr-8">Dollarama Wallet</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {dollaramaCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    setViewState('barcode');
                  }}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src={DOLLARAMA_IMAGE} alt="Dollarama" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900">Dollarama Card</h4>
                    <p className="text-green-600 font-bold">${card.balance.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Ending in {card.cardNumber.slice(-4)}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              ))}
              
              <button 
                onClick={() => {
                  setViewState('main');
                  setShowGiftCardModal(true);
                }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-bold text-sm hover:border-[#ED0711] hover:text-[#ED0711] transition-colors"
              >
                + Redeem another card
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode View */}
      <AnimatePresence>
        {viewState === 'barcode' && selectedCard && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[400] bg-[#F4F7F9] flex flex-col"
          >
            {/* Header */}
            <div className="pt-12 pb-4 px-6 flex items-center justify-between shrink-0 bg-white">
              <button onClick={() => setViewState('wallet')} className="p-2 -ml-2 active:scale-95 transition-transform">
                <ArrowLeft size={24} className="text-[#6B21A8]" />
              </button>
              <h1 className="text-[18px] font-bold tracking-tight text-gray-900">Dollarama</h1>
              <button className="p-2 -mr-2 active:scale-95 transition-transform">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                   <div className="w-3 h-3 bg-gray-200 rounded-full" />
                </div>
              </button>
            </div>

            {/* Purple Balance Bar */}
            <div className="bg-[#A855F7] py-3 px-6 flex justify-center items-center">
              <p className="text-white font-medium text-[15px]">Total Balance: <span className="font-bold">$20.00</span></p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
              <div className="p-8 flex flex-col items-center">
                {/* Card Image */}
                <div className="w-full max-w-[280px] aspect-[1.6/1] rounded-2xl overflow-hidden shadow-xl mb-6 border border-gray-100">
                  <img src={DOLLARAMA_IMAGE} alt="Dollarama" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Balance Display */}
                <div className="flex items-center gap-3 mb-10">
                  <span className="text-[32px] font-bold text-gray-900">$20.00</span>
                  <button className="p-2 bg-gray-100 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>

                {/* Barcode Section */}
                <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                    <button className="text-[#A855F7] text-[13px] font-medium underline">Barcode won't scan?</button>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[13px]">PIN:</span>
                      <span className="text-[#A855F7] font-bold text-[13px]">{selectedCard.pin}</span>
                      <button className="p-1 text-[#A855F7]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col items-center">
                    <img 
                      src={`https://bwipjs-api.metafloor.com/?bcid=pdf417&text=${selectedCard.cardNumber}&scale=2&rotate=N`} 
                      alt="Barcode" 
                      className="w-full h-32 object-contain mb-6"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="flex items-center gap-3">
                      <p className="text-[#A855F7] font-bold text-[17px] tracking-wider">
                        {selectedCard.cardNumber.replace(/(.{4})/g, '$1 ')}
                      </p>
                      <button className="p-1 text-[#A855F7]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="w-full grid grid-cols-3 gap-4 mt-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#A855F7]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">Edit Card</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#A855F7]">
                      <DollarSign size={24} />
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">Balance</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#A855F7]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">Buy Again</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SceneView;
// Force rebuild

