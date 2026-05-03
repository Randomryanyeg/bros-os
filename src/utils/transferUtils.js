export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
export const validateAmount = (amountStr, maxDaily = 3000) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0)
        return { isValid: false, error: 'Amount must be positive' };
    if (amount > maxDaily)
        return { isValid: false, error: `Amount exceeds daily limit of $${maxDaily}` };
    return { isValid: true, error: '' };
};
export const generateRequestLink = (txId, recipientEmail) => {
    return `scotia://request/${txId}?email=${encodeURIComponent(recipientEmail)}`;
};
export const fuzzyMatchTransfer = (transfers, query) => {
    return transfers.filter(t => t.recipientName.toLowerCase().includes(query.toLowerCase()) ||
        t.recipientEmail.toLowerCase().includes(query.toLowerCase()) ||
        t.id.includes(query));
};
