import React from 'react';
import { ChevronLeft, CreditCard, ChevronRight, PlusCircle } from 'lucide-react';
import { useBank, PurchasedCard } from '../shared/BankContext';

interface MyCardsViewProps {
  onBack: () => void;
  onSelectCard: (card: PurchasedCard) => void;
  onRedeemMore: () => void;
}

const DOLLARAMA_ICON = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaExjx1DOdg3VFYQBmcQhGBqf7dpDQx7nvXw&s";

export default function MyCardsView({ onBack, onSelectCard, onRedeemMore }: MyCardsViewProps) {
  const { user } = useBank();
  const cards = user?.purchasedCards || [];

  const activeCards = cards.filter(c => !c.isRedeemed);
  const redeemedCards = cards.filter(c => c.isRedeemed);

  const getCompanyColor = (company: string, isRedeemed?: boolean) => {
    if (isRedeemed) return '#9CA3AF'; // Gray for redeemed
    const colors: Record<string, string> = {
      'Dollarama': '#006A4E',
      'Winners': '#ED0711',
      'Marshalls': '#004B8D',
      'HomeSense': '#75203B',
      'Starbucks': '#00704A',
      'Amazon': '#232F3E',
    };
    return colors[company] || '#ED0711';
  };

  const renderCardRow = (card: PurchasedCard) => (
    <button
      key={card.id}
      onClick={() => onSelectCard(card)}
      className={`w-full rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all border ${card.isRedeemed ? 'bg-gray-50 border-gray-100 opacity-75' : 'bg-white border-gray-50'}`}
    >
      <div className="flex items-center gap-4">
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden ${card.isRedeemed ? 'grayscale' : ''}`}
          style={{ backgroundColor: getCompanyColor(card.company, card.isRedeemed) }}
        >
          {card.company === 'Dollarama' ? (
            <img src={DOLLARAMA_ICON} alt="Dollarama" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <CreditCard size={24} />
          )}
        </div>
        <div className="text-left">
          <h3 className={`font-bold ${card.isRedeemed ? 'text-gray-500' : 'text-gray-900'}`}>{card.company}</h3>
          <p className="text-xs text-gray-400">
            Purchased {new Date(card.purchaseDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`font-bold ${card.isRedeemed ? 'text-gray-400' : 'text-gray-900'}`}>${card.balance.toFixed(2)}</p>
          {card.isRedeemed && <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Redeemed</span>}
        </div>
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </button>
  );

  return (
    <div className="absolute inset-0 z-[140] bg-[#F4F7F9] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="font-bold text-xl text-gray-900">My eCards</h1>
        </div>
        <button onClick={onRedeemMore} className="p-2 rounded-full bg-[#ED0711]/10 text-[#ED0711] active:scale-95 transition-transform">
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pt-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <CreditCard size={48} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">No cards yet</h2>
              <p className="text-gray-500 mt-2 max-w-[240px]">
                Redeem your Scene+ points for eCards from your favorite stores.
              </p>
            </div>
            <button 
              onClick={onRedeemMore}
              className="px-8 py-3 bg-[#ED0711] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Redeem Points
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {activeCards.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Active Cards</h2>
                <div className="space-y-3">
                  {activeCards.map(renderCardRow)}
                </div>
              </div>
            )}

            {redeemedCards.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Redeemed History</h2>
                <div className="space-y-3">
                  {redeemedCards.map(renderCardRow)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
