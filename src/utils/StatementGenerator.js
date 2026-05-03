import { getSystemConfig, EDMONTON_BILLERS, EDMONTON_MERCHANTS } from '../shared/constants';
export const generateStatementHTML = (accountName, account, month, year) => {
    const config = getSystemConfig();
    const holderName = config.scotia_config.account_holder.toUpperCase();
    const addressLines = (config.scotia_config.address || "3037 DRUMLOCH AVE\nOAKVILLE ON\nL5C 3W5").split('\n');
    const employment = config.scotia_config.employment || {
        employer: "GOVERNMENT OF ALBERTA",
        job_title: "Analyst",
        annual_income: 85000
    };
    const employerName = employment.employer.toUpperCase();
    const netBiMonthly = ((employment.annual_income || 85000) / 12 / 2) * 0.76;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const fmtShortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fmtMoney = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // --- Transaction Generation ---
    const transactions = [];
    let runningBalance = Math.floor(Math.random() * 5000) + 2000;
    const openingBalance = runningBalance;
    const payDates = [15, endDate.getDate() === 31 ? 30 : 28];
    const billDates = [1, 2, 14, 20, 26];
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    for (let d = 1; d <= endDate.getDate(); d++) {
        const curr = new Date(year, month, d);
        if (payDates.includes(d)) {
            runningBalance += netBiMonthly;
            totalDeposits += netBiMonthly;
            transactions.push({
                dateStr: fmtShortDate(curr),
                descMain: "Deposit",
                descSub: employerName + " PAYROLL",
                withdrawal: "",
                deposit: fmtMoney(netBiMonthly),
                balance: runningBalance,
                dateObj: curr
            });
        }
        if (billDates.includes(d)) {
            const billAmt = Math.random() * 200 + 50;
            runningBalance -= billAmt;
            totalWithdrawals += billAmt;
            const biller = EDMONTON_BILLERS[Math.floor(Math.random() * EDMONTON_BILLERS.length)];
            transactions.push({
                dateStr: fmtShortDate(curr),
                descMain: "Bill Payment",
                descSub: biller,
                withdrawal: fmtMoney(billAmt),
                deposit: "",
                balance: runningBalance,
                dateObj: curr
            });
        }
        const dailyTxCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < dailyTxCount; i++) {
            const posAmt = Math.random() * 80 + 5;
            runningBalance -= posAmt;
            totalWithdrawals += posAmt;
            const merchant = EDMONTON_MERCHANTS[Math.floor(Math.random() * EDMONTON_MERCHANTS.length)];
            transactions.push({
                dateStr: fmtShortDate(curr),
                descMain: "Point of sale purchase",
                descSub: merchant,
                withdrawal: fmtMoney(posAmt),
                deposit: "",
                balance: runningBalance,
                dateObj: curr
            });
        }
    }
    // Ensure minimum 70 transactions for solid 3+ pages
    while (transactions.length < 70) {
        const d = Math.floor(Math.random() * 28) + 1;
        const curr = new Date(year, month, d);
        const extraAmt = Math.random() * 30 + 2;
        runningBalance -= extraAmt;
        transactions.push({
            dateStr: fmtShortDate(curr),
            descMain: "Point of sale purchase",
            descSub: "TIM HORTONS #" + Math.floor(Math.random() * 9000),
            withdrawal: fmtMoney(extraAmt),
            deposit: "",
            balance: 0,
            dateObj: curr
        });
    }
    transactions.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    let bal = openingBalance;
    transactions.forEach(t => {
        const dep = t.deposit ? parseFloat(t.deposit.replace(/,/g, '')) : 0;
        const wid = t.withdrawal ? parseFloat(t.withdrawal.replace(/,/g, '')) : 0;
        bal = bal + dep - wid;
        t.balance = bal;
    });
    const closingBalance = bal;
    // Pagination Configuration
    const PAGE_1_MAX_ROWS = 14; // Reduced to prevent overlap on summary page
    const PAGE_N_MAX_ROWS = 28; // Reduced for more breathing room
    const pages = [];
    const remaining = [...transactions];
    pages.push(remaining.splice(0, PAGE_1_MAX_ROWS));
    while (remaining.length > 0) {
        pages.push(remaining.splice(0, PAGE_N_MAX_ROWS));
    }
    const totalPages = pages.length;
    const logoSVG = `<svg viewBox="0 0 80.73 89.45" style="width: 38px; height: 38px; display:block;"><path fill="#ED0711" d="M65.68,16.68H40.37A28,28,0,0,0,12.49,41.61h0A28.06,28.06,0,0,1,37,0H80.73Z"/><path fill="#ED0711" d="M15.05,72.78H40.37A28.06,28.06,0,0,0,68.25,47.85h0a28,28,0,0,1-24.56,41.6H0Z"/><circle fill="#ED0711" cx="40.37" cy="44.73" r="22.53"/></svg>`;
    const barcodeHTML = `
    <div class="barcode-container">
        ${Array(55).fill(0).map(() => {
        const h = Math.random() > 0.5 ? '4px' : '2px';
        return `<div style="height:${h}; width:100%; background:#000; margin-bottom:2px;"></div>`;
    }).join('')}
    </div>
  `;
    const renderPage = (rows, pageNum) => {
        const isFirst = pageNum === 1;
        const isLast = pageNum === totalPages;
        let tableRows = '';
        if (isFirst) {
            tableRows += `
            <tr class="tx-row opening-row">
                <td class="col-date bold">${fmtShortDate(startDate)}</td>
                <td class="col-desc bold">Opening Balance</td>
                <td class="col-w"></td>
                <td class="col-d"></td>
                <td class="col-b bold">${fmtMoney(openingBalance)}</td>
            </tr>
          `;
        }
        rows.forEach(t => {
            tableRows += `
            <tr class="tx-row">
                <td class="col-date">${t.dateStr}</td>
                <td class="col-desc">
                    <div class="desc-main">${t.descMain}</div>
                    ${t.descSub ? `<div class="desc-sub">${t.descSub}</div>` : ''}
                </td>
                <td class="col-w">${t.withdrawal}</td>
                <td class="col-d">${t.deposit}</td>
                <td class="col-b bold">${fmtMoney(t.balance)}</td>
            </tr>
          `;
        });
        return `
        <div class="page ${pageNum > 1 ? 'page-break' : ''}">
            ${barcodeHTML}
            
            <div class="content-wrapper">
                <!-- HEADER -->
                <div class="header">
                    <div class="header-left">
                        <div class="logo-row">
                            ${logoSVG}
                            <span class="logo-text">Scotiabank</span>
                            <sup class="logo-tm">®</sup>
                        </div>
                        ${isFirst ? `
                        <div class="bank-address">
                            40 KING ST WEST, 1ST MEZZANINE SOUTH<br>
                            TORONTO ONTARIO M5H 1H1
                        </div>
                        ` : ''}
                    </div>
                    <div class="header-right">
                        <div class="black-bar">Day-to-Day Banking</div>
                        ${!isFirst ? `
                             <div class="page-n-meta">
                                <span class="bold">${holderName}</span><br>
                                Your ${accountName} account<br>
                                ${fmtDate(startDate)} to ${fmtDate(endDate)}
                                <span style="float:right; font-weight:700;">23549 02637 29</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- PAGE 1 INFO -->
                ${isFirst ? `
                    <div class="info-grid">
                        <div class="info-left">
                            <div class="stmt-date">STATEMENT DATE: ${fmtDate(endDate)}</div>
                            <div class="branch-code">01731</div>
                            <div class="client-address">
                                ${holderName}<br>
                                ${addressLines.join('<br>')}
                            </div>
                        </div>
                        <div class="info-right">
                            <div class="account-meta">
                                Your account number:<br>
                                <span class="acc-num-large">23549 02637 29</span>
                                <br><br>
                                Questions?<br>
                                <span class="bold">Call 1 800 4-SCOTIA</span><br>
                                (1 800 472-6842)<br><br>
                                For online account access:<br>
                                <span class="bold">www.scotiabank.com</span>
                            </div>
                        </div>
                    </div>

                    <!-- SUMMARY -->
                    <div class="section-header">Your ${accountName} account summary</div>
                    <table class="summary-table">
                        <tr>
                            <td>Opening Balance on ${fmtDate(startDate)}</td>
                            <td class="text-right bold">$${fmtMoney(openingBalance)}</td>
                        </tr>
                        <tr>
                            <td class="indent">Minus total withdrawals</td>
                            <td class="text-right">$${fmtMoney(totalWithdrawals)}</td>
                        </tr>
                        <tr>
                            <td class="indent">Plus total deposits</td>
                            <td class="text-right">$${fmtMoney(totalDeposits)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Closing Balance on ${fmtDate(endDate)}</td>
                            <td class="text-right bold">$${fmtMoney(closingBalance)}</td>
                        </tr>
                    </table>

                    <div class="section-header top-gap">Here's what happened in your account this statement period</div>
                ` : `
                    <div class="section-header top-gap">Here's what happened in your account (continued)</div>
                `}

                <!-- TX TABLE -->
                <table class="tx-table">
                    <thead>
                        <tr>
                            <th class="col-date">Date</th>
                            <th class="col-desc">Transactions</th>
                            <th class="col-w">Amounts<br>withdrawn ($)</th>
                            <th class="col-d">Amounts<br>deposited ($)</th>
                            <th class="col-b">Balance ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="cutoff-line"></div>
            </div>

            <!-- FOOTER -->
            <div class="footer-container">
                <div class="footer-line"></div>
                <div class="footer">
                    <div class="footer-text">
                        ${!isLast ? 'continued on next page' : ''}
                    </div>
                    <div class="page-num">Page ${pageNum} of ${totalPages}</div>
                </div>
            </div>
        </div>
      `;
    };
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Account Statement</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            @page { size: letter; margin: 0; }
            body {
                margin: 0; padding: 0;
                background: #fff;
                font-family: 'Inter', sans-serif;
                color: #000;
                -webkit-print-color-adjust: exact;
            }
            .page {
                position: relative;
                width: 8.5in;
                height: 11in;
                overflow: hidden;
                box-sizing: border-box;
            }
            .page-break { page-break-before: always; }
            
            /* Vertical Barcode */
            .barcode-container {
                position: absolute;
                left: 15px;
                top: 250px;
                width: 20px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            /* Main Content Container */
            .content-wrapper {
                padding: 40px 40px 0 60px;
                height: 9.6in; /* Buffer before footer line at ~10.2in */
                position: relative;
            }

            .cutoff-line {
                width: 100%;
                border-bottom: 1px solid #eee;
                margin-top: 10px;
            }

            /* Headers */
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .header-left { padding-top: 5px; }
            .logo-row { display: flex; align-items: center; gap: 8px; }
            .logo-text { font-size: 22px; font-weight: 700; color: #000; letter-spacing: -0.5px; }
            .logo-tm { font-size: 10px; vertical-align: top; margin-top: -8px; }
            .bank-address { margin-top: 10px; font-size: 7px; line-height: 1.3; font-weight: 400; text-transform: uppercase; }

            .header-right { width: 45%; text-align: right; }
            .black-bar {
                background: #000; color: #fff; font-weight: 700; font-size: 13px;
                padding: 6px 12px; text-align: right; margin-bottom: 10px;
            }
            .page-n-meta { font-size: 10px; text-align: left; line-height: 1.4; margin-top: 5px; }

            /* Page 1 Info */
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 25px; }
            .info-left { width: 50%; }
            .stmt-date { font-size: 9px; margin-bottom: 10px; }
            .branch-code { font-size: 9px; margin-bottom: 10px; }
            .client-address { font-size: 11px; font-weight: 700; text-transform: uppercase; line-height: 1.3; }
            .info-right { width: 40%; text-align: right; }
            .account-meta { font-size: 9px; line-height: 1.3; text-align: left; margin-left: auto; width: 180px; }
            .acc-num-large { font-size: 12px; font-weight: 700; }
            .bold { font-weight: 700; }

            /* Summary */
            .section-header { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .summary-table td { font-size: 9px; padding: 2px 0; }
            .summary-table .indent { padding-left: 15px; }
            .summary-table .text-right { text-align: right; }
            .total-row td { border-top: 1px solid #000; border-bottom: 2px solid #000; padding: 4px 0; font-size: 10px; }
            .top-gap { margin-top: 25px; }

            /* Transaction Table */
            .tx-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .tx-table th {
                font-size: 8px; font-weight: 700; text-align: right;
                border-bottom: 1px solid #000; padding-bottom: 4px; vertical-align: bottom;
            }
            .tx-table th.col-date, .tx-table th.col-desc { text-align: left; }
            .tx-row td { font-size: 9px; padding: 5px 0; border-bottom: 1px dotted #ccc; vertical-align: top; overflow: hidden; }
            .opening-row td { border-bottom: 1px dotted #000; font-weight: 700; padding: 8px 0; }
            
            .col-date { width: 65px; white-space: nowrap; font-weight: 700; }
            .col-desc { width: 260px; }
            .col-w { width: 85px; text-align: right; }
            .col-d { width: 85px; text-align: right; }
            .col-b { width: 95px; text-align: right; font-weight: 700; }
            
            .desc-main { font-weight: 500; text-transform: uppercase; }
            .desc-sub { font-size: 8px; margin-top: 1px; text-transform: uppercase; opacity: 0.8; }

            /* Footer */
            .footer-container {
                position: absolute;
                bottom: 30px;
                left: 60px;
                right: 40px;
            }
            .footer-line {
                width: 100%;
                border-top: 1px solid #000;
                margin-bottom: 5px;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                font-size: 9px;
            }
            .footer-text { font-style: italic; }
            .page-num { font-weight: 500; }

        </style>
    </head>
    <body>
        ${pages.map((rows, i) => renderPage(rows, i + 1)).join('')}
        <script>
            window.onload = function() { window.print(); }
        </script>
    </body>
    </html>
  `;
};
