import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { ScotiaAccount } from '../shared/types';
import StatementView from '../components/StatementView';

interface StatementsListViewProps {
  accounts: Record<string, ScotiaAccount>;
  onBack: () => void;
  theme?: 'light' | 'dark';
  currentUser?: Record<string, unknown>;
}

const StatementsListView: React.FC<StatementsListViewProps> = ({ accounts, onBack, currentUser }) => {
  const [selectedStatement, setSelectedStatement] = React.useState<{ month: string; year: number; accountName: string } | null>(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const generateStatements = () => {
    const items: { month: string; monthIdx: number; year: number }[] = [];
    for (let year = currentYear; year >= currentYear - 1; year--) {
      const startMonth = year === currentYear ? currentMonth : 11;
      for (let month = startMonth; month >= 0; month--) {
        items.push({
          month: months[month],
          monthIdx: month,
          year: year
        });
      }
    }
    return items;
  };

  const statements = generateStatements();
  const accountNames = Object.keys(accounts);
  const [activeAccount, setActiveAccount] = React.useState(accountNames[0] || '');

  if (selectedStatement) {
    return (
      <StatementView 
        accountName={selectedStatement.accountName}
        account={accounts[selectedStatement.accountName]}
        onClose={() => setSelectedStatement(null)}
        displayName={currentUser?.settings?.displayName}
        annualIncome={currentUser?.settings?.annualIncome}
      />
    );
  }

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[100] flex flex-col font-sans bg-[#F8F9FA] text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight text-gray-900">Statements</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {/* Account Selector */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400">Select Account</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {accountNames.map(name => (
              <button
                key={name}
                onClick={() => setActiveAccount(name)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${activeAccount === name ? 'bg-[#ED0711] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400">Available Statements</p>
          <div className="rounded-2xl border overflow-hidden bg-white border-gray-100">
            {statements.map((s, idx) => (
              <button
                key={`${s.month}-${s.year}`}
                onClick={() => setSelectedStatement({ month: s.month, year: s.year, accountName: activeAccount })}
                className={`w-full flex items-center gap-4 px-6 py-5 active:bg-gray-50 transition-colors ${idx !== statements.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50">
                  <FileText size={20} className="text-[#ED0711]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[15px] text-gray-900">{s.month} {s.year}</p>
                  <p className="text-xs text-gray-500">Monthly Statement</p>
                </div>
                <Download size={18} className="text-gray-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatementsListView;
