# termi-host

<div align="center">

![termi-host logo](https://img.shields.io/badge/termi--host-Web%20Terminal-4ec9b0?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**Free and Open Source Web-Based Terminal Access**

*Access your VPS/server terminal from any browser, anywhere in the world*

[**🚀 Live Demo**](http://159.65.151.238:3000) | [**📖 Documentation**](docs/CONFIGURATION.md) | [**🔧 Troubleshooting**](docs/TROUBLESHOOTING.md) | [**🐛 Report Bug**](https://github.com/vpbgkt/termi-host/issues) | [**✨ Request Feature**](https://github.com/vpbgkt/termi-host/issues)

</div>

---

## 🎯 What is termi-host?

**termi-host** is a free, open-source web-based terminal solution that lets you access your server terminal through any web browser. No SSH client installation needed. Perfect for:

- 📱 Accessing servers from mobile devices
- 📺 Using terminals on smart TVs
- 💻 Managing servers from public computers without SSH clients
- 🌍 Remote server administration from anywhere
- 🎓 Educational environments and coding tutorials
- 🏢 Team collaboration and pair programming

## ✨ Key Features

### 🌟 Core Features
- 🌐 **Browser-Based Terminal**: No SSH client needed - works in Chrome, Firefox, Safari, Edge
- 🔒 **Optional Authentication**: Built-in password protection (configurable)
- ⚡ **Real-time Communication**: WebSocket-based for instant command execution
- 🎨 **Modern UI**: Beautiful terminal interface powered by xterm.js
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🚀 **Lightweight**: Minimal resource footprint (~50MB RAM)
- 🔧 **Easy Configuration**: JSON-based config with environment variable support
- 🐚 **Multi-Shell Support**: Works with bash, zsh, sh, and more
- 🎯 **Zero Dependencies**: Just Node.js - no database or additional services needed

### 🛠️ Technical Features
- 📦 **Easy Deployment**: Single command installation
- 🔄 **Auto-Reconnect**: Automatic reconnection on network issues
- 🖥️ **PTY Support**: Full pseudo-terminal with proper signal handling
- 🎨 **Terminal Colors**: Full ANSI color support
- ⌨️ **Special Keys**: All keyboard shortcuts work (Ctrl+C, Ctrl+Z, etc.)
- 📐 **Dynamic Resize**: Terminal auto-resizes with browser window
- 🔐 **SELinux Compatible**: Works with security-enhanced Linux
- 📊 **Systemd Integration**: Run as a system service with auto-restart

## 🚀 Quick Start

### Automated Installation (Recommended)

The easiest way to get started is using our automated installation script:

```bash
# Clone and install with one command
git clone https://github.com/vpbgkt/termi-host.git && cd termi-host && bash install.sh
```

The script will:
- ✅ Check your Node.js version (and install Node.js 20 if needed)
- ✅ Install build tools required for node-pty
- ✅ Install all npm dependencies automatically
- ✅ Create default configuration file
- ✅ Generate secure session secret

Then start the server:
```bash
npm start
```

### Manual Installation

If you prefer manual installation:

```bash
# 1. Clone the repository
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host

# 2. Run the installation script
bash install.sh

# 3. Start the server
npm start
```

**That's it!** Open your browser to:
- Local: `http://localhost:3000`
- Remote: `http://YOUR_SERVER_IP:3000`

**Default Login:**
- Username: `admin`
- Password: `changeme` (⚠️ CHANGE THIS!)

## 📦 Installation

### Automated Installation Script

**The easiest and recommended method:**

```bash
# Clone and run installation script
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host
bash install.sh
```

The `install.sh` script will:
1. ✅ Detect your operating system
2. ✅ Check Node.js version (requires >= 18.0.0)
3. ✅ Offer to install Node.js 20 LTS if needed
4. ✅ Install build tools (gcc, make, python3) if missing
5. ✅ Install all npm dependencies
6. ✅ Create default configuration with secure session secret
7. ✅ Display next steps and access information

**Supported Operating Systems:**
- Ubuntu/Debian
- CentOS/RHEL/AlmaLinux/Rocky Linux
- Fedora
- Other Linux distributions (with manual Node.js installation)

### Manual Installation

If you already have Node.js >= 18.0.0 and build tools installed:

```bash
# Clone repository
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host

# Install dependencies
npm install

# Create configuration (optional, will use defaults)
cp config/local.json.example config/local.json

# Start server
npm start
```

### Prerequisites (Manual Setup)

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Operating System**: Linux, macOS, or Windows with WSL
- **Build tools** (for node-pty compilation):
  - Linux: `build-essential python3 make gcc g++`
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools

### Install Build Tools Manually

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

### Install as System Service (Linux)

**Using the installation script (recommended):**

```bash
sudo bash install.sh --service
```

This will automatically:
- Create systemd service file
- Enable service to start on boot
- Start the service immediately
- Display service status and management commands

**Manual service installation:**

```bash
# Create systemd service
sudo tee /etc/systemd/system/termi-host.service > /dev/null <<EOF
[Unit]
Description=termi-host Web Terminal
Documentation=https://github.com/vpbgkt/termi-host
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
ExecStart=$(which node) $(pwd)/src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable termi-host
sudo systemctl start termi-host

# Check status
sudo systemctl status termi-host
```

**Service Management Commands:**
```bash
# Start service
sudo systemctl start termi-host

# Stop service
sudo systemctl stop termi-host

# Restart service
sudo systemctl restart termi-host

# Check status
sudo systemctl status termi-host

# View logs
sudo journalctl -u termi-host -f
```

## ⚙️ Configuration

termi-host can be configured via JSON files or environment variables.

### Basic Configuration

Create a local configuration file:

```bash
cp config/local.json.example config/local.json
```

Edit `config/local.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "terminal": {
    "shell": "bash",
    "cols": 80,
    "rows": 24
  },
  "authentication": {
    "enabled": false,
    "username": "admin",
    "password": "changeme"
  }
}
```

### Environment Variables

```bash
PORT=8080 AUTH_ENABLED=true AUTH_PASSWORD=secret npm start
```

See [Configuration Guide](docs/CONFIGURATION.md) for detailed options.

## ❓ Troubleshooting

Having issues? Check our [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for:
- Node.js version problems
- Build tool errors
- Module not found errors
- Connection issues
- And more...

Common quick fixes:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Use automated installer
bash install.sh

# Check logs (if running as service)
sudo journalctl -u termi-host -f
```

## 🔒 Security

⚠️ **Authentication is now ENABLED by default!**

**Default credentials (CHANGE THESE!):**
- Username: `admin`
- Password: `changeme`

**To change credentials:**

1. Create `config/local.json`:
   ```json
   {
     "authentication": {
       "enabled": true,
       "username": "your-username",
       "password": "your-strong-password",
       "sessionSecret": "generate-random-string-here"
     }
   }
   ```

2. Restart the server:
   ```bash
   npm start
   # OR if using systemd:
   sudo systemctl restart termi-host
   ```

**Generate a secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Example: Secure Setup with nginx

```nginx
server {
    listen 443 ssl;
    server_name terminal.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📖 Documentation

- [Configuration Guide](docs/CONFIGURATION.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Security Best Practices](docs/SECURITY.md) (Coming Soon)
- [API Documentation](docs/API.md) (Coming Soon)

## 🤝 Contributing

Contributions are welcome! This project aims to have implementations in multiple languages (Python, Go, Rust, etc.).

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines (Coming Soon).

## 🗺️ Roadmap

- [x] Core terminal functionality
- [x] WebSocket communication
- [x] Configuration system
- [ ] Authentication implementation
- [ ] Multi-session support
- [ ] File upload/download
- [ ] Terminal recording
- [ ] Python implementation
- [ ] Go implementation
- [ ] Docker image
- [ ] npm package

## 🌟 Use Cases

- **Remote Server Management**: Access your VPS from anywhere
- **DevOps & SysAdmin**: Quick server access without SSH client
- **Education**: Teaching Linux/command-line to students
- **IoT & Embedded**: Access Raspberry Pi and embedded devices
- **Emergency Access**: When you don't have your SSH keys
- **Mobile Administration**: Manage servers from your phone
- **Team Collaboration**: Share terminal access with team members
- **Customer Support**: Help users debug issues remotely

## 🔍 Keywords

web terminal, browser terminal, online terminal, web ssh, browser ssh, remote terminal access, web-based terminal, online ssh client, terminal emulator, xterm.js, node-pty, websocket terminal, cloud terminal, vps terminal, server terminal, linux terminal browser, terminal web interface, ssh web client, web console, remote shell access

## 📊 Comparison

| Feature | termi-host | ttyd | wetty | shellinabox |
|---------|-----------|------|-------|-------------|
| Installation | ⭐ Easy | Medium | Medium | Medium |
| Dependencies | Node.js only | C/libwebsockets | Node.js | C/OpenSSL |
| Authentication | ✅ Optional | ✅ Yes | ✅ Yes | ✅ Yes |
| Configuration | ✅ JSON/Env | Command-line | Command-line | Command-line |
| WebSocket | ✅ Yes | ✅ Yes | ✅ Yes | No |
| Mobile Support | ✅ Excellent | Good | Good | Fair |
| Active Development | ✅ Active | Active | Active | Inactive |

## 🤝 Contributing

Contributions are welcome! We're planning implementations in multiple languages.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Roadmap:**
- [x] Node.js implementation
- [ ] Python implementation
- [ ] Go implementation
- [ ] Rust implementation
- [ ] Docker image
- [ ] npm package
- [ ] Multi-session support
- [ ] File upload/download

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**Free and open source forever!** ❤️

## 👥 Author & Contributors

Created with ❤️ by [@vpbgkt](https://github.com/vpbgkt)

Want to contribute? Check out [CONTRIBUTING.md](CONTRIBUTING.md)!

## 🔗 Links & Resources

- 🏠 [GitHub Repository](https://github.com/vpbgkt/termi-host)
- 🐛 [Report Issues](https://github.com/vpbgkt/termi-host/issues)
- 💬 [Discussions](https://github.com/vpbgkt/termi-host/discussions)
- 📦 [npm Package](https://www.npmjs.com/package/termi-host) (Coming Soon)
- 🎥 [Video Tutorial](https://github.com/vpbgkt/termi-host) (Coming Soon)

## ⭐ Show Your Support

If you find termi-host useful, please consider:
- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** to help improve
- 💡 **Suggest features** you'd like to see
- 📢 **Share** with others who might find it useful
- 🤝 **Contribute** code or documentation

## 🌟 Acknowledgments

- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [node-pty](https://github.com/microsoft/node-pty) - PTY bindings for Node.js
- [Express](https://expressjs.com/) - Web framework
- [ws](https://github.com/websockets/ws) - WebSocket library

---

⚡ **Built with ❤️ for developers who need terminal access anywhere**
