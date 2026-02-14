# termi-host

> Access your terminal from anywhere through a web browser

**termi-host** is an open-source web-based terminal hosting solution that allows you to access your VPS terminal through any web browser without installing additional software. Perfect for accessing your terminal on TVs, tablets, public computers, or any device with a browser.

## ✨ Features

- 🌐 **Web-based Access**: Access your terminal from any browser
- 🔒 **Optional Authentication**: Secure your terminal with password/token authentication
- 🎨 **Modern Interface**: Built with xterm.js for a full-featured terminal experience
- ⚡ **Real-time**: WebSocket-based communication for instant response
- 🔧 **Configurable**: Easy configuration through JSON files
- 🚀 **Lightweight**: Minimal resource usage, perfect for VPS environments
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host

# Install dependencies
npm install

# Start the server
npm start
```

Then open your browser to `http://localhost:3000`

## 📦 Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Linux, macOS, or Windows with WSL

### Install from npm (Coming Soon)

```bash
npm install -g termi-host
termi-host
```

### Install from Source

```bash
git clone https://github.com/vpbgkt/termi-host.git
cd termi-host
npm install
npm start
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

## 🔐 Security

⚠️ **IMPORTANT**: termi-host exposes terminal access through a web interface. 

**Security Best Practices:**

1. **Enable authentication** in production
2. **Use HTTPS** (via reverse proxy like nginx)
3. **Use strong passwords** (16+ characters)
4. **Restrict access** with firewall rules
5. **Don't expose to public internet** without authentication

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

## 📜 License

ISC

## 👤 Author

Created by [@vpbgkt](https://github.com/vpbgkt)

## 🔗 Links

- [GitHub Repository](https://github.com/vpbgkt/termi-host)
- [Report Issues](https://github.com/vpbgkt/termi-host/issues)
- [npm Package](https://www.npmjs.com/package/termi-host) (Coming Soon)

## 🌟 Acknowledgments

- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [node-pty](https://github.com/microsoft/node-pty) - PTY bindings for Node.js
- [Express](https://expressjs.com/) - Web framework
- [ws](https://github.com/websockets/ws) - WebSocket library

---

⚡ **Built with ❤️ for developers who need terminal access anywhere**
