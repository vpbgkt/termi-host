# 🔐 How to Login to termi-host

## Step-by-Step Login Guide

### 1️⃣ Open the Terminal in Your Browser

Open your web browser and go to:
```
http://159.65.151.238:3000
```

### 2️⃣ You'll See the Login Page

The page will automatically redirect you to the login page because authentication is enabled.

**Login Screen Shows:**
- 🖥️ **termi-host** logo
- **Web Terminal Login** text
- Username field
- Password field  
- Login button

### 3️⃣ Enter Your Credentials

**Default Credentials:**
```
Username: admin
Password: changeme
```

⚠️ **IMPORTANT**: Change these default credentials immediately after first login!

### 4️⃣ Click "Login"

After entering your username and password, click the **Login** button.

### 5️⃣ Access Your Terminal

You'll be redirected to the terminal interface where you can:
- ✅ Execute commands
- ✅ See real-time output
- ✅ Use all terminal features (colors, cursor, etc.)
- ✅ Logout when done (button in top right)

---

## 🔒 How to Change Your Password

### Method 1: Using Configuration File (Recommended)

1. **Create local configuration:**
   ```bash
   cd /root/termi-host
   cp config/local.json.example config/local.json
   ```

2. **Edit the configuration:**
   ```bash
   nano config/local.json
   ```

3. **Update credentials:**
   ```json
   {
     "authentication": {
       "enabled": true,
       "username": "your-new-username",
       "password": "your-strong-password-here",
       "sessionSecret": "generate-random-string"
     }
   }
   ```

4. **Generate a secure session secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste it as your `sessionSecret`

5. **Restart the server:**
   ```bash
   systemctl restart termi-host
   ```

6. **Login with your new credentials!**

### Method 2: Using Environment Variables

```bash
export AUTH_USERNAME="your-username"
export AUTH_PASSWORD="your-password"
systemctl restart termi-host
```

---

## 🚨 Troubleshooting

### "Cannot GET /" Error
**Solution**: The server is running but files are missing
```bash
cd /root/termi-host
ls public/  # Should show: index.html, terminal.html, login.html, app.js, style.css
systemctl restart termi-host
```

### "Invalid credentials" Error
**Issue**: Wrong username or password
**Solution**: 
- Check your `config/local.json` file
- Use default: `admin` / `changeme`
- Restart server after config changes

### Page Keeps Redirecting
**Issue**: Authentication check failing
**Solution**:
```bash
# Check server logs
journalctl -u termi-host -f

# Restart server
systemctl restart termi-host
```

### Can't Access from Browser
**Issue**: Firewall or server not running
**Solution**:
```bash
# Check if server is running
systemctl status termi-host

# Check if port is open
curl http://localhost:3000

# Check firewall (SELinux should already be configured)
semanage port -l | grep 3000
```

---

## 📱 Accessing from Different Devices

### From Your Computer
```
http://159.65.151.238:3000
```

### From Mobile Phone
```
http://159.65.151.238:3000
```
- Works on iOS Safari, Android Chrome
- Use landscape mode for better experience

### From Tablet
```
http://159.65.151.238:3000
```
- Full terminal experience
- Supports external keyboards

---

## 🔐 Security Best Practices

1. **Change Default Password Immediately!**
   - Use at least 16 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Use Strong Session Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable HTTPS** (via nginx reverse proxy)
   - Encrypts all traffic
   - Protects credentials

4. **Restrict Access by IP** (optional)
   ```bash
   # Firewall rule example
   firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_IP" port port="3000" protocol="tcp" accept'
   ```

5. **Monitor Login Attempts**
   ```bash
   journalctl -u termi-host | grep "Login"
   ```

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Check server status | `systemctl status termi-host` |
| Restart server | `systemctl restart termi-host` |
| View logs | `journalctl -u termi-host -f` |
| Change password | Edit `config/local.json` |
| Generate secret | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

---

## ✅ After Successful Login

You'll see:
- **Top Left**: termi-host logo
- **Top Right**: Connection status + Logout button
- **Center**: Full terminal interface
- **Bottom**: Keyboard shortcuts help

**What you can do:**
```bash
# Run any command
ls -la

# Change directory
cd /var/log

# Edit files
nano myfile.txt

# Install packages (if you have sudo)
sudo yum install htop

# Run scripts
./my-script.sh

# And everything else a terminal can do!
```

---

**Need Help?**
- GitHub Issues: https://github.com/vpbgkt/termi-host/issues
- Documentation: Check README.md and ROADMAP.md

Happy terminal-ing! 🚀
