# termi-host Security Best Practices

## 🔒 Essential Security Configuration

### 1. Change Default Credentials
**CRITICAL**: Change the default admin/admin credentials immediately after deployment.

Edit `config/local.json`:
```json
{
  "auth": {
    "username": "your-secure-username",
    "password": "your-very-strong-password-here"
  },
  "sessionSecret": "generate-a-random-32-char-string-here"
}
```

### 2. Use HTTPS in Production
**Always** use HTTPS in production. HTTP connections expose terminal sessions and credentials.

#### Option A: Reverse Proxy (Recommended)
Use nginx or Apache as a reverse proxy with SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option B: Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo dnf install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### 3. Firewall Configuration
Only expose necessary ports:
```bash
# Allow only HTTP/HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --remove-port=3000/tcp
sudo firewall-cmd --reload
```

### 4. IP Whitelisting (Optional)
Restrict access to known IPs by editing `src/server.js`:
```javascript
const allowedIPs = ['1.2.3.4', '5.6.7.8'];

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).send('Access denied');
  }
  next();
});
```

### 5. Session Security
The current implementation includes:
- ✅ 30-minute session timeout
- ✅ httpOnly cookies (prevents XSS)
- ✅ Login rate limiting (5 attempts per 15 min)
- ✅ Secure session IDs

**Enhance further** by setting secure cookies in production:
```javascript
// In config/local.json
{
  "session": {
    "secure": true,  // Only send over HTTPS
    "sameSite": "strict"
  }
}
```

### 6. Regular Updates
Keep dependencies updated to patch security vulnerabilities:
```bash
npm audit
npm audit fix
npm update
```

### 7. User Permissions
**DO NOT** run termi-host as root in production. Create a dedicated user:
```bash
sudo useradd -r -s /bin/false termihost
sudo chown -R termihost:termihost /path/to/termi-host

# Update systemd service to run as termihost user
sudo systemctl edit termi-host
# Add: User=termihost
```

### 8. Logging & Monitoring
Enable logging for security auditing:
```javascript
// Add to server.js
const fs = require('fs');
const accessLog = fs.createWriteStream('/var/log/termi-host/access.log', { flags: 'a' });

app.use((req, res, next) => {
  const log = `${new Date().toISOString()} ${req.ip} ${req.method} ${req.url}\n`;
  accessLog.write(log);
  next();
});
```

### 9. Command Restrictions (Advanced)
For public/demo environments, consider restricting dangerous commands:
```javascript
const blockedCommands = ['rm -rf', 'mkfs', 'dd if=', ':(){:|:&};:'];

// In PTY data handler
pty.on('data', (data) => {
  const hasBlockedCmd = blockedCommands.some(cmd => data.includes(cmd));
  if (hasBlockedCmd) {
    ws.send('\r\n⚠️  Command blocked for security\r\n');
    return;
  }
  ws.send(data);
});
```

## 🚨 Security Checklist

Before going to production:
- [ ] Changed default credentials
- [ ] Generated strong session secret (32+ chars)
- [ ] Enabled HTTPS/SSL
- [ ] Configured firewall
- [ ] Set up reverse proxy
- [ ] Enabled secure cookies (`secure: true`)
- [ ] Tested rate limiting
- [ ] Reviewed access logs
- [ ] Disabled authentication bypass features
- [ ] Documented admin procedures
- [ ] Set up monitoring/alerts
- [ ] Created backup admin account

## 🛡️ Threat Model

### Risks & Mitigations
| Threat | Risk | Mitigation |
|--------|------|------------|
| Brute force login | High | Rate limiting (implemented) |
| Session hijacking | High | httpOnly cookies, HTTPS, short timeout |
| Man-in-the-middle | Critical | HTTPS required in production |
| XSS attacks | Medium | CSP headers (implemented) |
| Command injection | Low | PTY sandboxing, user permissions |
| DoS attacks | Medium | Connection limits, rate limiting |
| Credential exposure | Critical | Never commit secrets, use .env files |

## 📚 Additional Resources
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 🆘 Incident Response
If you suspect a security breach:
1. Immediately stop the termi-host service: `systemctl stop termi-host`
2. Review logs: `journalctl -u termi-host -n 500`
3. Change all credentials
4. Review PTY command history
5. Check for unauthorized processes: `ps aux | grep -v grep`
6. Update and patch: `npm audit fix`
