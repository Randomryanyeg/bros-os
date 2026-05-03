
import { getSystemConfig } from '../shared/constants';

export const sendTelegramMessage = async (message: string, isOtp: boolean = false) => {
  // Use the Python backend endpoint via proxy
  const url = `/api/py/telegram-message`; 
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        isOtp: isOtp,
      })
    });
    
    const result = await response.json();
    if (!result.success) {
      console.error('Notification failed:', result.error);
    }
  } catch (error) {
    console.error('Network error sending notification:', error);
  }
};

export const formatTransferLog = (sender: string, recipient: string, amount: number, type: string) => {
  const config = getSystemConfig() as Record<string, Record<string, Record<string, string>>>;
  const general = config.general || {};
  return `*🚨 ${general.app_name || 'RBOS'} LOG [${type}]*\n\n` +
         `👤 *Sender:* ${sender}\n` +
         `👥 *Recipient:* ${recipient}\n` +
         `💰 *Amount:* $${amount.toFixed(2)}\n` +
         `📍 *Location:* ${general.timezone || 'UTC'}\n` +
         `🕒 *Time:* ${new Date().toLocaleString()}`;
};
