const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');
const os = require('os');
const config = require('./config');
const { router: authRouter, requireAuth } = require('./auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Get configuration
const PORT = config.get('server.port');
const HOST = config.get('server.host');
const SHELL = config.get('terminal.shell') || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');
const TERMINAL_COLS = config.get('terminal.cols');
const TERMINAL_ROWS = config.get('terminal.rows');
const CWD = config.get('terminal.cwd') || process.env.HOME;
const AUTH_ENABLED = config.get('authentication.enabled');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.get('authentication.sessionSecret') || 'termi-host-secret-' + Math.random().toString(36),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Auth routes
app.use('/api/auth', authRouter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Terminal instance (single session for now)
let terminal = null;

// WebSocket upgrade handler with authentication
server.on('upgrade', (request, socket, head) => {
  const sessionParser = session({
    secret: config.get('authentication.sessionSecret') || 'termi-host-secret-' + Math.random().toString(36),
    resave: false,
    saveUninitialized: false
  });

  sessionParser(request, {}, () => {
    if (AUTH_ENABLED && (!request.session || !request.session.authenticated)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected (authenticated)');

  // Spawn PTY if not already running
  if (!terminal) {
    console.log(`Spawning shell: ${SHELL}`);
    terminal = pty.spawn(SHELL, [], {
      name: 'xterm-color',
      cols: TERMINAL_COLS,
      rows: TERMINAL_ROWS,
      cwd: CWD,
      env: process.env
    });

    // PTY output -> WebSocket
    terminal.on('data', (data) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      } catch (err) {
        console.error('Error sending to WebSocket:', err);
      }
    });

    // Handle PTY exit
    terminal.on('exit', (code, signal) => {
      console.log(`Terminal exited with code ${code}, signal ${signal}`);
      terminal = null;
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
  }

  // WebSocket input -> PTY
  ws.on('message', (message) => {
    try {
      const data = message.toString();
      
      // Check if it's a resize message
      if (data.startsWith('{"type":"resize"')) {
        const msg = JSON.parse(data);
        if (msg.cols && msg.rows && terminal) {
          terminal.resize(msg.cols, msg.rows);
          console.log(`Terminal resized to ${msg.cols}x${msg.rows}`);
        }
      } else {
        // Regular terminal input
        if (terminal) {
          terminal.write(data);
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Client disconnected');
    // Keep terminal alive for reconnection
    // In production, might want to kill after timeout
  });

  // Handle WebSocket errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing terminal...');
  if (terminal) {
    terminal.kill();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing terminal...');
  if (terminal) {
    terminal.kill();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║           termi-host Web Terminal              ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🐚 Shell: ${SHELL}`);
  console.log(`📝 Terminal size: ${TERMINAL_COLS}x${TERMINAL_ROWS}`);
  console.log(`🔐 Authentication: ${AUTH_ENABLED ? '✅ Enabled (Secure)' : '⚠️  Disabled (Insecure!)'}`);
  if (AUTH_ENABLED) {
    console.log(`👤 Username: ${config.get('authentication.username')}`);
  }
  console.log('');
  console.log('Press Ctrl+C to stop');
});
