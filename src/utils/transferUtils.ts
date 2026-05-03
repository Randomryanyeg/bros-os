// Utility functions for e-transfer realism
import { PendingTransfer } from '../shared/types';

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateAmount = (amountStr: string, maxDaily = 3000): { isValid: boolean; error: string } => {
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { isValid: false, error: 'Amount must be positive' };
  if (amount > maxDaily) return { isValid: false, error: `Amount exceeds daily limit of $${maxDaily}` };
  return { isValid: true, error: '' };
};

export const generateRequestLink = (txId: string, recipientEmail: string): string => {
  return `scotia://request/${txId}?email=${encodeURIComponent(recipientEmail)}`;
};

export const fuzzyMatchTransfer = (transfers: PendingTransfer[], query: string): PendingTransfer[] => {
  return transfers.filter(t => 
    t.recipientName.toLowerCase().includes(query.toLowerCase()) || 
    t.recipientEmail.toLowerCase().includes(query.toLowerCase()) ||
    t.id.includes(query)
  );
};

