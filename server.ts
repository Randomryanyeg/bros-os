import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

interface CustomSocket extends Socket {
  username?: string;
  room?: string;
}
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { spawn } from 'child_process';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();

// ... existing imports
import { spawn } from 'child_process';
import path from 'path';

// ... (existing socket/mailer setup) ...

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PROJECTS_DIR = path.join(process.cwd(), 'projects');

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('register', (data: { username: string }) => {
    socket.join(data.username);
    console.log(`User registered: ${data.username}`);
  });

  socket.on('admin_command', (data: { targetSocketId?: string; command: string; payload?: unknown }) => {
    // Relay to target or broadcast
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit('command', data);
    } else {
      io.emit('command', data);
    }
  });

  socket.on('chat_message', (data: unknown) => {
    io.emit('chat_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Mailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user',
    pass: process.env.SMTP_PASS || 'etherealpass'
  }
});

const MAILER_LOGS_FILE = path.join(process.cwd(), 'server', 'data', 'mailer_logs.json');

interface MailLog {
  date: string;
  to: string;
  subject: string;
  body: string;
}

async function logEmail(to: string, subject: string, body: string) {
  let logs: MailLog[] = [];
  try {
    if (await fs.pathExists(MAILER_LOGS_FILE)) logs = await fs.readJson(MAILER_LOGS_FILE);
  } catch (error) {
    logger.error('Failed to read mailer logs', error);
  }
  logs.unshift({ date: new Date().toISOString(), to, subject, body });
  if (logs.length > 50) logs = logs.slice(0, 50);
  await fs.ensureDir(path.parse(MAILER_LOGS_FILE).dir);
  await fs.writeJson(MAILER_LOGS_FILE, logs, { spaces: 2 });
}
// --- Enhanced Error Handling & Logging ---
const logger = {
  info: (msg: string, meta?: unknown) => console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  error: (msg: string, meta?: unknown) => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
};

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack, path: req.path });
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    }
  });
});

// ... inside startServer
  // app.use(vite.middlewares);
  // ...
  // app.use(errorHandler); // Place this after all routes
// ...

app.use(cors());
app.use(express.json());

// --- PRODUCTION SERVING ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// Handle .php extensions by stripping them
app.use((req, res, next) => {
  if (req.path.endsWith('.php')) {
    const query = req.url.split('?')[1];
    req.url = req.path.slice(0, -4) + (query ? `?${query}` : '');
  }
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROJECTS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

interface Project {
  id: string;
  name: string;
  status: 'idle' | 'building' | 'running' | 'error';
  url?: string;
  logs: string[];
  port: number;
}

const projects: Record<string, Project> = {};

app.get('/api/projects', (req, res) => {
  res.json(Object.values(projects));
});

app.get('/api/admin/global-settings', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const data = await fs.readJson(path.join(process.cwd(), 'server', 'data', 'PROJECTSARAH.json'));
    res.json(data.settings);
  } catch {
    logger.error('Failed to read settings');
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.get('/api/admin/master-stats', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const users = await readDB(USERS_FILE, {});
    const activeConnections = io.engine.clientsCount;
    const totalUsers = Object.keys(users).length;
    const pendingApprovals = Object.values(users).filter((u: unknown) => (u as { isApproved?: boolean }).isApproved === false).length;
    
    res.json({
      activeConnections,
      totalUsers,
      pendingApprovals,
      uptime: process.uptime()
    });
  } catch {
    logger.error('Failed to fetch master stats');
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/health', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

app.get('/api/admin/sessions.php', (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Assuming io.sockets.adapter.rooms maps rooms to sockets
  // This needs to be adapted based on how sessions are tracked
  const sessions = Array.from(io.sockets.sockets.values()).map((socket: Socket) => {
    const s = socket as CustomSocket;
    return {
      id: s.id,
      username: s.username || 'Unknown',
      ip: s.handshake.address,
      lastSeen: new Date().toISOString(),
      currentPath: '/'
    };
  });
  res.json({ sessions });
});

app.post('/api/admin/sessions/purge', (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  io.emit('reload');
  res.json({ success: true, message: 'All sessions forced to reload' });
});

app.post('/api/admin/users/surgical-update', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const { username, updates } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  
  try {
    const users = await readDB(USERS_FILE, {});
    const lowerUsername = username.toLowerCase();
    if (users[lowerUsername]) {
      users[lowerUsername] = { ...users[lowerUsername], ...updates };
      await writeDB(USERS_FILE, users);
      io.emit('user_updated', { type: 'updated', username: username });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch {
    logger.error('Failed to surgically update user');
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/api/admin/users/create', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const userData = req.body;
  if (!userData.username || !userData.password) return res.status(400).json({ error: 'Missing username/password' });
  
  try {
    const users = await readDB(USERS_FILE, {});
    const lowerUsername = userData.username.toLowerCase();
    if (users[lowerUsername]) return res.status(400).json({ error: 'User already exists' });
    
    users[lowerUsername] = {
      username: userData.username,
      password: userData.password,
      isApproved: true,
      profile: userData.profile || {},
      accounts: userData.accounts || {},
      settings: userData.settings || {}
    };
    await writeDB(USERS_FILE, users);
    io.emit('user_updated', { type: 'created', username: userData.username });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/admin/users/delete', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  
  try {
    const users = await readDB(USERS_FILE, {});
    const lowerUsername = username.toLowerCase();
    if (users[lowerUsername]) {
      delete users[lowerUsername];
      await writeDB(USERS_FILE, users);
      io.emit('user_updated', { type: 'deleted', username: username });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/api/admin/global-settings', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const filePath = path.join(process.cwd(), 'server', 'data', 'PROJECTSARAH.json');
    const data = await fs.readJson(filePath);
    data.settings = req.body;
    await fs.writeJson(filePath, data, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to save settings', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.post('/api/socket/emit', (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { event, data, room } = req.body;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
  res.json({ success: true });
});

app.post('/api/mailer', async (req, res) => {
  const token = req.headers['x-auth-token'] || req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { recipient_email, subject, body, deposit_payload } = req.body;
  
  try {
    let emailBody = body || '';
    if (deposit_payload) {
      emailBody = `Hello ${deposit_payload.senderName},\n\nYou have received a transfer of ${deposit_payload.amount}. Reference: ${deposit_payload.timestamp}`;
    }

    await logEmail(recipient_email, subject, emailBody);
    
    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'admin@example.com',
        to: recipient_email,
        subject: subject,
        text: emailBody
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Relay mailer error:', error);
    res.status(500).json({ success: false, error: 'Relay failed' });
  }
});

app.get('/api/check_user.php', async (req, res) => {
  const username = req.query.username as string;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      const exists = !!users[username.toLowerCase()];
      res.json({ exists });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    logger.error('Failed to read users file', error);
    res.status(500).json({ error: 'Failed to read users file' });
  }
});

app.post('/api/user/update', async (req, res) => {
  const token = req.query.token;
  if (token !== 'projectsarah') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { username, data } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Missing username' });

  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      const lowerUsername = username.toLowerCase();
      if (users[lowerUsername]) {
        // Update user data
        if (data.password) {
            users[lowerUsername].password = data.password;
        }
        await fs.writeJson(USERS_FILE, users, { spaces: 2 });
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } else {
      res.status(404).json({ success: false, message: 'User database not found' });
    }
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/check_security_answer', async (req, res) => {
  const { username, answer } = req.body;
  if (!username || !answer) return res.status(400).json({ error: 'Missing username or answer' });
  
  try {
    // In a real app, load the user file and check the answer against their securityAnswer
    // For now, allow 'SARAH' for the demo/prototype
    const isCorrect = answer.toUpperCase() === 'SARAH';
    res.json({ success: true, isCorrect });
  } catch (error) {
    logger.error('Failed to verify security answer', error);
    res.status(500).json({ error: 'Failed to verify security answer' });
  }
});

app.post('/api/auth/reset-step-1', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  
  try {
    const users = await readDB(USERS_FILE, {});
    const lowerUsername = username.toLowerCase();
    const user = users[lowerUsername];
    
    if (user) {
      res.json({ 
        success: true, 
        securityQuestion: user.profile?.securityQuestion || 'What is your favorite color?' 
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch {
    logger.error('Failed to reset password step 1');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/reset-step-2', async (req, res) => {
  const { username, answer, newPassword } = req.body;
  if (!username || !answer || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  
  try {
    const users = await readDB(USERS_FILE, {});
    const lowerUsername = username.toLowerCase();
    const user = users[lowerUsername];
    
    if (user) {
      const actualAnswer = user.profile?.securityAnswer || '';
      if (actualAnswer.toLowerCase() === answer.toLowerCase()) {
        user.password = newPassword;
        await writeDB(USERS_FILE, users);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, message: 'Incorrect answer' });
      }
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch {
    logger.error('Failed to reset password step 2');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Simple user store for mock backend
const USERS_FILE = path.join(process.cwd(), 'server', 'data', 'users.json');
const TRANSACTIONS_FILE = path.join(process.cwd(), 'server', 'data', 'transactions.json');
const CONTACTS_FILE = path.join(process.cwd(), 'server', 'data', 'contacts.json');
const TRANSFERS_FILE = path.join(process.cwd(), 'server', 'data', 'transfers.json');
const CHATS_FILE = path.join(process.cwd(), 'server', 'data', 'support_chats.json');
const DEBUGGING_FILE = path.join(process.cwd(), 'server', 'data', 'debugging.json');

// Helper to init/read JSON db
async function readDB(file: string, defaultData: unknown = []) {
  try {
    if (await fs.pathExists(file)) {
      return await fs.readJson(file);
    }
  } catch (error) {
    logger.error(`Failed to read database file: ${file}`, error);
  }
  return defaultData;
}

// Helper to write JSON db
async function writeDB(file: string, data: unknown) {
  await fs.ensureDir(path.parse(file).dir);
  await fs.writeJson(file, data, { spaces: 2 });
}

app.get('/api/admin/db/:name', async (req, res) => {
  const { name } = req.params;
  const dbMap: Record<string, string> = {
    users: USERS_FILE,
    transactions: TRANSACTIONS_FILE,
    contacts: CONTACTS_FILE,
    transfers: TRANSFERS_FILE,
    chats: CHATS_FILE,
    debugging: DEBUGGING_FILE
  };
  if (!dbMap[name]) return res.status(404).json({ error: 'DB not found' });
  const data = await readDB(dbMap[name], name === 'users' ? {} : []);
  res.json(data);
});

app.post('/api/admin/db/:name', async (req, res) => {
  const { name } = req.params;
  const dbMap: Record<string, string> = {
    users: USERS_FILE,
    transactions: TRANSACTIONS_FILE,
    contacts: CONTACTS_FILE,
    transfers: TRANSFERS_FILE,
    chats: CHATS_FILE,
    debugging: DEBUGGING_FILE
  };
  if (!dbMap[name]) return res.status(404).json({ error: 'DB not found' });
  await writeDB(dbMap[name], req.body);
  res.json({ success: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { 
    username, 
    password, 
    firstName, 
    lastName, 
    email, 
    phone, 
    address, 
    workplace, 
    income, 
    securityQuestion, 
    securityAnswer, 
    accountType 
  } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    let users: Record<string, unknown> = {};
    if (fs.existsSync(USERS_FILE)) {
      users = await fs.readJson(USERS_FILE);
    }
    
    const lowerUsername = username.toLowerCase();
    if (users[lowerUsername] || lowerUsername === 'projectsarah') {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    // Create a new user profile with their fields
    users[lowerUsername] = { 
      username, 
      password,
      isApproved: false, // Wait for admin approval
      profile: {
        firstName,
        lastName,
        email,
        phone,
        address,
        workplace,
        income,
        securityQuestion,
        securityAnswer,
        accountType
      },
      // Give them a default account based on their selection
      accounts: {
        "Main": {
          id: `ACCT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: `${accountType} Account`,
          balance: 0,
          onHold: 0,
          history: []
        }
      },
      settings: {
        interacWarningEnabled: true,
        attentionItemsEnabled: true
      }
    };
    
    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    res.json({ success: true, message: 'User registered successfully. Waiting for admin approval.' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      const lowerUsername = username?.toLowerCase();
      if (users[lowerUsername] && (users[lowerUsername] as { password?: string }).password === password) {
        if ((users[lowerUsername] as { isApproved?: boolean }).isApproved === false) {
           return res.status(403).json({ success: false, message: 'Account pending admin approval' });
        }
        const userData = { ...(users[lowerUsername] as Record<string, unknown>) };
        delete userData.password;
        return res.json({ success: true, user: userData });
      }
    }
  } catch {
    // Silence error
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});
app.get('/api/admin/mailer/status', (req, res) => res.json({ php_version: '8.2', phpmailer_installed: true }));
app.get('/api/admin/mailer/logs', async (req, res) => {
  try {
    if (await fs.pathExists(MAILER_LOGS_FILE)) {
      const logs = await fs.readJson(MAILER_LOGS_FILE);
      return res.json({ logs });
    }
  } catch (error) {
    logger.error('Failed to read mailer logs for admin', error);
  }
  res.json({ logs: [] });
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      // Format users to an array as expected by frontend
      const usersArray = Object.values(users).map((u: unknown) => {
         const rest = { ...(u as Record<string, unknown>) };
         delete rest.password;
         return rest;
      });
      return res.json({ users: usersArray });
    }
  } catch (error) {
    logger.error('Failed to list users', error);
  }
  res.json({ users: [] });
});

app.post('/api/admin/users/approve', async (req, res) => {
  const { username } = req.body;
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      const lowerUsername = username?.toLowerCase();
      if (users[lowerUsername]) {
        users[lowerUsername].isApproved = true;
        await fs.writeJson(USERS_FILE, users, { spaces: 2 });

        const userEmail = users[lowerUsername].profile?.email;
        if (userEmail) {
          const defaultAcctId = Object.values(users[lowerUsername].accounts || {})[0]?.id || `ACCT-${Math.floor(1000 + Math.random() * 9000)}`;
          const emailSubject = "Your Account is Approved!";
          const emailHtml = `<p>Hello ${users[lowerUsername].profile?.firstName || username},</p>
<p>Your card is active with card number: <strong>${defaultAcctId}</strong></p>
<p>Please join our Telegram group to download the app: <a href="https://t.me/app_download_group">https://t.me/app_download_group</a></p>`;
          
          await logEmail(userEmail, emailSubject, emailHtml);
          try {
             if (process.env.SMTP_HOST) {
               await transporter.sendMail({
                 from: process.env.SMTP_FROM || 'admin@example.com',
                 to: userEmail,
                 subject: emailSubject,
                 html: emailHtml
               });
             }
          } catch { console.error('Failed to send mail'); }
        }

        return res.json({ success: true });
      }
    }
  } catch {
    //
  }
  res.status(400).json({ success: false });
});

app.post('/api/admin/users/decline', async (req, res) => {
  const { username } = req.body;
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = await fs.readJson(USERS_FILE);
      const lowerUsername = username?.toLowerCase();
      if (users[lowerUsername]) {
        const userEmail = users[lowerUsername].profile?.email;
        delete users[lowerUsername];
        await fs.writeJson(USERS_FILE, users, { spaces: 2 });
        
        if (userEmail) {
          const emailSubject = "Account Registration Declined";
          const emailHtml = `<p>Hello ${username},</p><p>We are sorry to inform you that your account registration has been declined.</p>`;
          await logEmail(userEmail, emailSubject, emailHtml);
          try {
             if (process.env.SMTP_HOST) {
               await transporter.sendMail({
                 from: process.env.SMTP_FROM || 'admin@example.com',
                 to: userEmail,
                 subject: emailSubject,
                 html: emailHtml
               });
             }
          } catch { console.error('Failed to send mail'); }
        }

        return res.json({ success: true });
      }
    }
  } catch {
    //
  }
  res.status(400).json({ success: false });
});

app.get('/api/admin/mailer/template-content', async (req, res) => {
  const templateName = req.query.template as string;
  const templatePath = path.join(process.cwd(), 'server', 'data', 'templates', `${templateName}.html`);
  try {
    if (await fs.pathExists(templatePath)) {
      const content = await fs.readFile(templatePath, 'utf-8');
      return res.json({ content });
    }
  } catch {
    //
  }
  res.json({ content: '' });
});

app.get('/api/admin/mailer/templates', async (req, res) => {
  const templatesDir = path.join(process.cwd(), 'server', 'data', 'templates');
  try {
    await fs.ensureDir(templatesDir);
    const files = await fs.readdir(templatesDir);
    return res.json({ templates: files.map(f => f.replace('.html', '')) });
  } catch {
    //
  }
  res.json({ templates: [] });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const projectId = path.parse(req.file.filename).name;
  const projectPath = path.join(PROJECTS_DIR, projectId);

  try {
    // Extract ZIP
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(projectPath, true);
    
    // Remove ZIP file
    await fs.remove(req.file.path);

    projects[projectId] = {
      id: projectId,
      name: projectId,
      status: 'idle',
      logs: [],
      port: 3001 + Object.keys(projects).length,
    };

    res.json(projects[projectId]);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Failed to extract project' });
  }
});

app.post('/api/projects/:id/build', async (req, res) => {
  const { id } = req.params;
  const project = projects[id];

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  project.status = 'building';
  project.logs.push('Starting build...');

  const projectPath = path.join(PROJECTS_DIR, id);

  // Run npm install
  const install = spawn('npm', ['install'], { cwd: projectPath });
  install.stdout.on('data', (data) => project.logs.push(data.toString()));
  install.stderr.on('data', (data) => project.logs.push(data.toString()));

  install.on('close', (code) => {
    if (code !== 0) {
      project.status = 'error';
      project.logs.push(`npm install failed with code ${code}`);
      return;
    }

    project.logs.push('npm install completed. Starting build...');
    
    // Run npm run build
    const build = spawn('npm', ['run', 'build'], { cwd: projectPath });
    build.stdout.on('data', (data) => project.logs.push(data.toString()));
    build.stderr.on('data', (data) => project.logs.push(data.toString()));

    build.on('close', (code) => {
      if (code !== 0) {
        project.status = 'error';
        project.logs.push(`npm run build failed with code ${code}`);
        return;
      }

      project.status = 'idle';
      project.logs.push('Build completed successfully.');
    });
  });

  res.json(project);
});

app.post('/api/projects/:id/start', async (req, res) => {
  const { id } = req.params;
  const project = projects[id];

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const projectPath = path.join(PROJECTS_DIR, id);
  const distPath = path.join(projectPath, 'dist');

  if (!fs.existsSync(distPath)) {
    return res.status(400).json({ error: 'Project must be built first' });
  }

  project.status = 'running';
  project.logs.push(`Starting server on port ${project.port}...`);

  // Start a simple static server for the build
  // We'll use npx serve -p {port} {distPath}
  const serve = spawn('npx', ['-y', 'serve', '-p', project.port.toString(), distPath]);
  
  serve.stdout.on('data', (data) => project.logs.push(data.toString()));
  serve.stderr.on('data', (data) => project.logs.push(data.toString()));

  // Start Cloudflare Tunnel
  project.logs.push('Starting Cloudflare Tunnel...');
  const tunnel = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://localhost:${project.port}`]);

  tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    project.logs.push(output);
    
    // Extract URL from cloudflared output
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      project.url = match[0];
      project.logs.push(`Tunnel established: ${project.url}`);
    }
  });

  tunnel.stderr.on('data', (data) => {
    const output = data.toString();
    project.logs.push(output);
    
    // Cloudflared often puts the URL in stderr
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      project.url = match[0];
      project.logs.push(`Tunnel established: ${project.url}`);
    }
  });

  res.json(project);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error(e);
    }
  });
}

startServer();
