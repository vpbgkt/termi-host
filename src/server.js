const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
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

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting for login attempts (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', loginLimiter);

// Session configuration with timeout
const SESSION_SECRET = config.get('authentication.sessionSecret') || 'termi-host-secret-' + Math.random().toString(36);

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: true,  // Changed to true to ensure session is saved
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 30 * 60 * 1000 // 30 minutes session timeout
  }
};

app.use(session(sessionConfig));

// Auth routes
app.use('/api/auth', authRouter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Terminal instance (single session for now)
let terminal = null;

// WebSocket upgrade handler with authentication
server.on('upgrade', (request, socket, head) => {
  // Parse cookies first
  const cookieParser = require('cookie-parser');
  cookieParser()(request, {}, () => {
    // Then parse session using SAME config as HTTP server
    const sessionParser = session(sessionConfig);

    sessionParser(request, {}, () => {
      console.log('WebSocket upgrade - Session check:', {
        hasSession: !!request.session,
        sessionID: request.sessionID,
        isAuthenticated: request.session?.authenticated,
        authEnabled: AUTH_ENABLED,
        cookie: request.headers.cookie
      });

      if (AUTH_ENABLED && (!request.session || !request.session.authenticated)) {
        console.log('WebSocket upgrade denied - not authenticated');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      console.log('WebSocket upgrade accepted - authenticated');
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected (authenticated)');
  
  let ptyProcess = null;

  // Spawn PTY for this connection (lightweight)
  try {
    const cwd = CWD || process.env.HOME || '/';
    console.log(`Spawning shell: ${SHELL} in ${cwd}`);
    
    ptyProcess = pty.spawn(SHELL, [], {
      name: 'xterm-color',
      cols: TERMINAL_COLS,
      rows: TERMINAL_ROWS,
      cwd: cwd,
      env: process.env
    });
    
    console.log(`PTY spawned successfully with PID: ${ptyProcess.pid}`);

    // PTY output -> WebSocket (with buffering for performance)
    let buffer = '';
    let bufferTimeout = null;

    ptyProcess.on('data', (data) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      } catch (ex) {
        console.error('Error sending PTY data to WebSocket:', ex);
      }
    });

    // Handle PTY exit
    ptyProcess.on('exit', (code, signal) => {
      console.log(`Terminal exited with code ${code}, signal ${signal}`);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('\r\n\x1b[1;31mTerminal session ended.\x1b[0m\r\n');
        ws.close();
      }
    });

  } catch (err) {
    console.error('Error spawning PTY:', err);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('\r\n\x1b[1;31mError: Failed to start terminal session.\x1b[0m\r\n');
      ws.close();
    }
    return;
  }

  // WebSocket input -> PTY
  ws.on('message', (message) => {
    try {
      const data = message.toString();
      
      // Check if it's a resize message
      if (data.startsWith('{"type":"resize"')) {
        const msg = JSON.parse(data);
        if (msg.cols && msg.rows && ptyProcess) {
          ptyProcess.resize(msg.cols, msg.rows);
          console.log(`Terminal resized to ${msg.cols}x${msg.rows}`);
        }
      } else if (data.startsWith('{"type":"theme"')) {
        // Theme change message (no action needed server-side)
        return;
      } else {
        // Regular terminal input
        if (ptyProcess) {
          ptyProcess.write(data);
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Client disconnected');
    // Clean up PTY process
    if (ptyProcess) {
      ptyProcess.kill();
      ptyProcess = null;
    }
  });

  // Handle WebSocket errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    if (ptyProcess) {
      ptyProcess.kill();
      ptyProcess = null;
    }
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
