const DESCRIPTIONS = [
    'Starbucks', 'Winners', 'Walmart', 'Amazon.ca', 'Shell', 'Tim Hortons',
    'Interac e-Transfer', 'Payroll Deposit', 'Monthly Fee',
    'Netflix', 'Spotify', 'Loblaws', 'Canadian Tire',
    'Uber', 'Uber Eats', 'DoorDash', 'Apple.com/Bill',
    'Rogers Communications', 'Bell Mobility', 'Enbridge Gas',
    'Service Charge', 'Interest Credit', 'ATM Withdrawal'
];
const CATEGORIES = [
    'Shopping', 'Dining', 'Deposit', 'Bills', 'Transfer', 'Payment'
];
export const generateRandomTransactions = (count = 15, targetBalance) => {
    const transactions = [];
    const now = new Date();
    let currentSum = 0;
    for (let i = 0; i < count; i++) {
        const date = new Date(now);
        // Spread transactions over the last 60 days
        date.setDate(now.getDate() - Math.floor(Math.random() * 60));
        // Randomize time
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
        const isDeposit = description.includes('Deposit') ||
            description.includes('Interest') ||
            (description.includes('e-Transfer') && Math.random() > 0.7);
        let amount;
        if (isDeposit) {
            amount = Math.floor(Math.random() * 3000) + 100 + (Math.random());
        }
        else {
            amount = -(Math.floor(Math.random() * 200) + 5 + (Math.random()));
        }
        // Round to 2 decimal places
        amount = Math.round(amount * 100) / 100;
        currentSum += amount;
        transactions.push({
            id: Math.random().toString(36).substring(2, 15),
            date: date.toISOString(),
            description,
            amount,
            status: 'Completed',
            category: isDeposit ? 'Deposit' : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
        });
    }
    if (targetBalance !== undefined) {
        const diff = targetBalance - currentSum;
        if (transactions.length > 0) {
            transactions[0].amount = Math.round((transactions[0].amount + diff) * 100) / 100;
            if (transactions[0].amount > 0) {
                transactions[0].description = 'Payroll Deposit';
                transactions[0].category = 'Deposit';
            }
            else {
                transactions[0].description = 'Online Bill Payment';
                transactions[0].category = 'Bills';
            }
        }
    }
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
