// Terminal themes for customization
const themes = {
  default: {
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
  'matrix': {
    background: '#000000',
    foreground: '#00FF00',
    cursor: '#00FF00',
    black: '#000000',
    red: '#008F11',
    green: '#00FF00',
    yellow: '#003B00',
    blue: '#006400',
    magenta: '#228B22',
    cyan: '#32CD32',
    white: '#00FF00',
    brightBlack: '#003300',
    brightRed: '#005500',
    brightGreen: '#00FF00',
    brightYellow: '#00CC00',
    brightBlue: '#004400',
    brightMagenta: '#007700',
    brightCyan: '#00AA00',
    brightWhite: '#CCFFCC'
  },
  'cyberpunk': {
    background: '#0b0c15',
    foreground: '#00ff9f',
    cursor: '#f700ff',
    black: '#120b10',
    red: '#ff2a6d',
    green: '#00ff9f',
    yellow: '#f8f4a6',
    blue: '#005678',
    magenta: '#b026ff',
    cyan: '#05d9e8',
    white: '#d1d5db',
    brightBlack: '#5c5c5c',
    brightRed: '#ff5c8a',
    brightGreen: '#5af78e',
    brightYellow: '#fff9c4',
    brightBlue: '#0084b4',
    brightMagenta: '#d670d6',
    brightCyan: '#8be9fd',
    brightWhite: '#ffffff'
  },
  'midnight': {
    background: '#000000',
    foreground: '#ffffff',
    cursor: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0066ff',
    magenta: '#cc00cc',
    cyan: '#00ffff',
    white: '#d0d0d0',
    brightBlack: '#808080',
    brightRed: '#ff0000',
    brightGreen: '#33ff33',
    brightYellow: '#ffff33',
    brightBlue: '#0066ff',
    brightMagenta: '#cc00cc',
    brightCyan: '#00ffff',
    brightWhite: '#ffffff'
  },
  'gruvbox': {
    background: '#282828',
    foreground: '#ebdbb2',
    cursor: '#ebdbb2',
    black: '#282828',
    red: '#cc241d',
    green: '#98971a',
    yellow: '#d79921',
    blue: '#458588',
    magenta: '#b16286',
    cyan: '#689d6a',
    white: '#a89984',
    brightBlack: '#928374',
    brightRed: '#fb4934',
    brightGreen: '#b8bb26',
    brightYellow: '#fabd2f',
    brightBlue: '#83a598',
    brightMagenta: '#d3869b',
    brightCyan: '#8ec07c',
    brightWhite: '#ebdbb2'
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bbbbbb',
    brightBlack: '#555555',
    brightRed: '#ff5555',
    brightGreen: '#50fa7b',
    brightYellow: '#f1fa8c',
    brightBlue: '#bd93f9',
    brightMagenta: '#ff79c6',
    brightCyan: '#8be9fd',
    brightWhite: '#ffffff'
  },
  monokai: {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5'
  },
  'one-dark': {
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    black: '#282c34',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#e5c07b',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
    brightBlack: '#5c6370',
    brightRed: '#e06c75',
    brightGreen: '#98c379',
    brightYellow: '#e5c07b',
    brightBlue: '#61afef',
    brightMagenta: '#c678dd',
    brightCyan: '#56b6c2',
    brightWhite: '#ffffff'
  },
  solarized: {
    background: '#002b36',
    foreground: '#839496',
    cursor: '#839496',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3'
  }
};

// Get saved theme or default
function getSavedTheme() {
  return localStorage.getItem('terminal-theme') || 'default';
}

// Save theme preference
function saveTheme(themeName) {
  localStorage.setItem('terminal-theme', themeName);
}

// Apply theme to terminal
function applyTheme(terminal, themeName) {
  const theme = themes[themeName] || themes.default;
  terminal.options.theme = theme;
  document.body.style.background = theme.background;
  saveTheme(themeName);
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { themes, getSavedTheme, saveTheme, applyTheme };
}
