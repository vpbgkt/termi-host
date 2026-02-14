# Configuration Guide

termi-host uses a flexible configuration system with multiple layers:

## Configuration Files

### `config/default.json`
The default configuration that ships with termi-host. **Do not modify this file.**

### `config/local.json`
Your local configuration overrides. This file is gitignored and safe for local customizations.

To create your local config:
```bash
cp config/local.json.example config/local.json
```

## Configuration Options

### Server Settings

```json
{
  "server": {
    "port": 3000,      // Server port
    "host": "0.0.0.0"  // Bind address (0.0.0.0 = all interfaces)
  }
}
```

### Terminal Settings

```json
{
  "terminal": {
    "shell": "bash",       // Shell to use (bash, zsh, sh, etc.)
    "cols": 80,            // Terminal columns
    "rows": 24,            // Terminal rows
    "scrollback": 1000,    // Scrollback buffer size
    "cwd": null            // Working directory (null = user home)
  }
}
```

### Authentication Settings

```json
{
  "authentication": {
    "enabled": false,      // Enable/disable authentication
    "username": "admin",   // Username for login
    "password": "changeme" // Password for login
  }
}
```

⚠️ **Security Warning**: If authentication is enabled, always use a strong password!

## Environment Variables

You can override any configuration using environment variables:

```bash
# Server
export PORT=8080
export HOST=127.0.0.1

# Terminal
export SHELL=/bin/zsh
export TERMINAL_COLS=120
export TERMINAL_ROWS=30

# Authentication
export AUTH_ENABLED=true
export AUTH_USERNAME=myuser
export AUTH_PASSWORD=mypassword
```

## Security Best Practices

1. **Never commit** `config/local.json` to version control
2. **Use authentication** when exposing to network
3. **Use HTTPS** in production (reverse proxy recommended)
4. **Strong passwords** - minimum 16 characters
5. **Firewall rules** - restrict access to trusted IPs
