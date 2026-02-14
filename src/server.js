const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');
const os = require('os');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Get configuration
const PORT = config.get('server.port');
const HOST = config.get('server.host');
const SHELL = config.get('terminal.shell') || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');
const TERMINAL_COLS = config.get('terminal.cols');
const TERMINAL_ROWS = config.get('terminal.rows');
const CWD = config.get('terminal.cwd') || process.env.HOME;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Terminal instance (single session for now)
let terminal = null;

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');

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
  console.log(`🔐 Authentication: ${config.get('authentication.enabled') ? 'Enabled' : 'Disabled'}`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});
