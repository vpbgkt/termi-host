# Troubleshooting Guide

This document helps you resolve common issues when installing and running termi-host.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Node.js Version Problems](#nodejs-version-problems)
3. [Build Tool Errors](#build-tool-errors)
4. [Module Not Found Errors](#module-not-found-errors)
5. [Server Won't Start](#server-wont-start)
6. [Connection Issues](#connection-issues)

---

## Installation Issues

### Error: Node.js version < 18.0.0

**Problem:** Your Node.js version is too old.

**Solution:**
```bash
# Use the automated install script
bash install.sh
# Answer 'y' when prompted to install Node.js 20

# OR manually install Node.js 20:

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL/AlmaLinux
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum remove -y nodejs npm  # Remove old version
sudo yum install -y nodejs
```

**Verify installation:**
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

## Build Tool Errors

### Error: "not found: make" or "not found: gcc"

**Problem:** Build tools required for node-pty are missing.

**Solution:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y build-essential python3 make g++

# CentOS/RHEL/AlmaLinux
sudo yum groupinstall -y "Development Tools"
sudo yum install -y python3 make gcc gcc-c++

# Fedora
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3 make gcc gcc-c++
```

**Then reinstall dependencies:**
```bash
cd termi-host
rm -rf node_modules
npm install
```

---

## Module Not Found Errors

### Error: "Cannot find module 'express'" or similar

**Problem:** Dependencies not installed.

**Solution:**
```bash
cd termi-host
npm install
```

### Error: "Error: Cannot find module 'node-pty'"

**Problem:** node-pty failed to compile.

**Solution:**
1. Install build tools (see above)
2. Clean and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Server Won't Start

### Error: "EADDRINUSE: address already in use :::3000"

**Problem:** Port 3000 is already in use.

**Solution 1: Change port**
```bash
# Edit config/local.json
{
  "server": {
    "port": 8080  # Change to different port
  }
}
```

**Solution 2: Kill process using port 3000**
```bash
# Find process ID
sudo lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Error: "EACCES: permission denied"

**Problem:** No permission to bind to port.

**Solution:**
- Use port > 1024 (e.g., 3000, 8080)
- OR run with sudo (not recommended for production)

---

## Connection Issues

### Can't access from browser

**Problem:** Firewall blocking connection.

**Solution:**
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw reload

# CentOS/RHEL/AlmaLinux  
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Cloud providers (AWS, DigitalOcean, etc.)
# Add inbound rule for port 3000 in security group/firewall settings
```

### WebSocket connection fails

**Problem:** Reverse proxy not configured properly.

**Solution:** If using nginx, ensure WebSocket support:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Authentication Issues

### Forgot password

**Solution:** Edit `config/local.json`:
```json
{
  "authentication": {
    "enabled": true,
    "username": "admin",
    "password": "new-password"
  }
}
```

Then restart the server:
```bash
npm start
# OR
sudo systemctl restart termi-host
```

### Session expires immediately

**Solution:** Generate new session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `config/local.json`:
```json
{
  "authentication": {
    "sessionSecret": "your-generated-secret"
  }
}
```

---

## Performance Issues

### High CPU usage

**Possible causes:**
- Too many concurrent sessions
- Infinite loop in terminal

**Solution:**
- Limit concurrent connections (configure rate limiting)
- Restart the server

### High memory usage

**Solution:**
- Restart the server periodically
- Use systemd service for auto-restart on crash

---

## SELinux Issues (CentOS/RHEL/AlmaLinux)

### Error: Permission denied with SELinux enabled

**Solution:**
```bash
# Temporarily disable SELinux (testing only)
sudo setenforce 0

# Permanently (not recommended)
sudo vi /etc/selinux/config
# Change SELINUX=enforcing to SELINUX=disabled

# Reboot
sudo reboot
```

---

## Still Having Issues?

1. **Check logs:**
   ```bash
   # If running as service
   sudo journalctl -u termi-host -f
   
   # If running manually
   npm start
   # Check error output
   ```

2. **Enable debug mode:**
   ```bash
   NODE_ENV=development npm start
   ```

3. **Report issue on GitHub:**
   - https://github.com/vpbgkt/termi-host/issues
   - Include:
     - Error message
     - OS and version
     - Node.js version
     - Steps to reproduce

---

## Quick Fixes Checklist

- [ ] Node.js >= 18.0.0 installed
- [ ] Build tools installed (gcc, make, python3)
- [ ] Dependencies installed (`npm install`)
- [ ] Port 3000 not in use
- [ ] Firewall allows port 3000
- [ ] Configuration file exists
- [ ] Correct file permissions

If all checked and still not working, see "Still Having Issues?" above.
