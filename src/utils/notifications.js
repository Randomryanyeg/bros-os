import { getSystemConfig } from '../shared/constants';
export const sendTelegramMessage = async (message, isOtp = false) => {
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
    }
    catch (error) {
        console.error('Network error sending notification:', error);
    }
};
export const formatTransferLog = (sender, recipient, amount, type) => {
    const config = getSystemConfig();
    return `*🚨 ${config.general?.app_name || 'RBOS'} LOG [${type}]*\n\n` +
        `👤 *Sender:* ${sender}\n` +
        `👥 *Recipient:* ${recipient}\n` +
        `💰 *Amount:* $${amount.toFixed(2)}\n` +
        `📍 *Location:* ${config.general?.timezone || 'UTC'}\n` +
        `🕒 *Time:* ${new Date().toLocaleString()}`;
};
