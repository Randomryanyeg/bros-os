
export interface UserSettings {
  interacWarningEnabled: boolean;
  attentionItemsEnabled: boolean;
  transferLimit: number;
  dailyLimit?: number;
  overdraftLimit?: number;
  maintenanceMode?: boolean;
  phpmailerSenderName?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  telegramToken?: string;
  annualIncome?: number;
  displayName?: string;
  memberSince?: string;
  occupation?: string;
  adminPin?: string;
  phoneNumber?: string;
  address?: string;
  employerName?: string;
  jobTitle?: string;
}

export interface PurchasedCard {
  id: string;
  company: string;
  balance: number;
  cardNumber: string;
  pin: string;
  purchaseDate: string;
  isRedeemed?: boolean;
}

export interface User {
  username: string;
  securityWord: string;
  accounts: ScotiaAccountMap;
  contacts: Contact[];
  settings: UserSettings;
  pendingTransfers?: PendingTransfer[];
  scenePoints: number;
  purchasedCards: PurchasedCard[];
}

export interface ScotiaTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status?: 'Pending' | 'Completed' | 'Cancelled' | 'Refunded' | 'Failed' | 'Sent';
  category?: 'Income' | 'Bills' | 'Shopping' | 'Dining' | 'Transfer' | 'Deposit' | 'Payment';
}

export interface ScotiaAccount {
  type: 'banking' | 'credit';
  balance: number;
  pending?: number;
  available?: number;
  points: number;
  history: ScotiaTransaction[];
  transactions?: ScotiaTransaction[];
  accountNumber?: string;
  onHold?: number;
}

export type ScotiaAccountMap = Record<string, ScotiaAccount>;

export interface PendingTransfer {
  id: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  date: string;
  securityQuestion?: string;
  securityAnswer?: string;
  status: 'Sent' | 'Pending' | 'Deposited' | 'Expired' | 'Failed' | 'Cancelled';
  link?: string;
  fromAccountName?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isFavorite?: boolean;
  autodeposit?: boolean;
  defaultQuestion?: string;
  defaultAnswer?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface GlobalSettings {
  general: {
    overdraftLimit: number;
    transferLimit: number;
    dailyLimit: number;
    maintenanceMode: boolean;
    app_url?: string;
    encryption_key?: string;
    sender_name?: string;
    bank_name?: string;
    bank_logo?: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    senderName: string;
  };
  telegram: {
    token: string;
    chatId: string;
  };
}

export interface AdminUser extends Partial<User> {
  enabled?: boolean;
  autoDeleteAt?: string | null;
}

export type TransferStage = 'sending' | 'completed' | 'error';

export type OSType = 'windows' | 'macos' | 'ios' | 'android';
