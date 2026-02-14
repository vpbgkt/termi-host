// Initialize xterm.js terminal
const terminal = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  theme: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#4ec9b0',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#e5e5e5'
  },
  allowProposedApi: true
});

// Fit addon for responsive terminal
const fitAddon = new FitAddon.FitAddon();
terminal.loadAddon(fitAddon);

// Open terminal in the DOM
terminal.open(document.getElementById('terminal'));
fitAddon.fit();

// Status elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

function setStatus(status) {
  statusIndicator.className = `status-${status}`;
  
  switch(status) {
    case 'connected':
      statusText.textContent = 'Connected';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected';
      break;
    case 'connecting':
      statusText.textContent = 'Connecting...';
      break;
  }
}

// WebSocket connection
let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
  setStatus('connecting');
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    setStatus('connected');
    reconnectAttempts = 0;
    
    // Send initial terminal size
    sendResize();
  };
  
  ws.onmessage = (event) => {
    // Write data from PTY to terminal
    terminal.write(event.data);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed');
    setStatus('disconnected');
    
    // Attempt to reconnect
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * reconnectAttempts, 5000);
      console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
      setTimeout(connect, delay);
    } else {
      terminal.write('\r\n\x1b[1;31mConnection lost. Refresh the page to reconnect.\x1b[0m\r\n');
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Terminal input -> WebSocket
terminal.onData((data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
});

// Send resize message
function sendResize() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({
      type: 'resize',
      cols: terminal.cols,
      rows: terminal.rows
    });
    ws.send(msg);
  }
}

// Handle terminal resize
window.addEventListener('resize', () => {
  fitAddon.fit();
  sendResize();
});

// Handle visibility change (refit when tab becomes visible)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      fitAddon.fit();
      sendResize();
    }, 100);
  }
});

// Focus terminal on click
document.getElementById('terminal-container').addEventListener('click', () => {
  terminal.focus();
});

// Auto-focus terminal on load
terminal.focus();

// Logout button
fetch('/api/auth/status')
  .then(res => res.json())
  .then(data => {
    if (data.authEnabled && data.authenticated) {
      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn.style.display = 'block';
      logoutBtn.onclick = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
      };
    }
  });

// Check authentication before connecting
fetch('/api/auth/status')
  .then(res => res.json())
  .then(data => {
    if (data.authEnabled && !data.authenticated) {
      window.location.href = '/login.html';
      return;
    }
    // Connect to server
    connect();
    // Show welcome message
    if (data.username) {
      terminal.write(`\x1b[1;32mWelcome, ${data.username}!\x1b[0m\r\n`);
    }
    terminal.write('\x1b[1;32mConnecting to terminal...\x1b[0m\r\n');
  })
  .catch(err => {
    terminal.write('\x1b[1;31mAuthentication check failed\x1b[0m\r\n');
  });
