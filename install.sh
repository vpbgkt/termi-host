#!/bin/bash

# termi-host Installation Script
# This script automatically checks and installs all required dependencies

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}$1${NC}"
    echo "=============================================="
    echo ""
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
    elif [ -f /etc/debian_version ]; then
        OS="debian"
    else
        OS=$(uname -s)
    fi
    print_info "Detected OS: $OS"
}

# Check if running as root (for system package installations)
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_warning "Some installation steps may require sudo privileges"
        SUDO="sudo"
    else
        SUDO=""
    fi
}

# Check Node.js version
check_node() {
    print_info "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed"
        return 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    # Compare versions
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_warning "Node.js version $NODE_VERSION is installed, but version >= $REQUIRED_VERSION is required"
        return 1
    fi
    
    print_success "Node.js version $NODE_VERSION is installed"
    return 0
}

# Install Node.js
install_node() {
    print_header "Installing Node.js 20 LTS"
    
    case $OS in
        ubuntu|debian)
            print_info "Installing Node.js via NodeSource repository..."
            $SUDO apt-get update
            $SUDO apt-get install -y curl
            curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
            $SUDO apt-get install -y nodejs
            ;;
        centos|rhel|almalinux|rocky)
            print_info "Installing Node.js via NodeSource repository..."
            curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO bash -
            print_info "Removing old Node.js version..."
            $SUDO yum remove -y nodejs npm
            print_info "Installing Node.js 20..."
            $SUDO yum install -y nodejs
            ;;
        fedora)
            print_info "Installing Node.js via NodeSource repository..."
            curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO bash -
            print_info "Removing old Node.js version..."
            $SUDO dnf remove -y nodejs npm
            print_info "Installing Node.js 20..."
            $SUDO dnf install -y nodejs
            ;;
        *)
            print_error "Unsupported OS for automatic Node.js installation"
            print_info "Please install Node.js 18 or higher manually from https://nodejs.org/"
            exit 1
            ;;
    esac
    
    print_success "Node.js installed successfully"
}

# Check and install build tools
install_build_tools() {
    print_header "Installing Build Tools"
    
    case $OS in
        ubuntu|debian)
            print_info "Installing build-essential and python3..."
            $SUDO apt-get update
            $SUDO apt-get install -y build-essential python3 make g++
            ;;
        centos|rhel|almalinux|rocky)
            print_info "Installing Development Tools and python3..."
            $SUDO yum groupinstall -y "Development Tools"
            $SUDO yum install -y python3 make gcc gcc-c++
            ;;
        fedora)
            print_info "Installing Development Tools and python3..."
            $SUDO dnf groupinstall -y "Development Tools"
            $SUDO dnf install -y python3 make gcc gcc-c++
            ;;
        *)
            print_warning "Unknown OS. Skipping build tools installation."
            print_info "You may need to install build tools manually if node-pty fails to compile"
            ;;
    esac
    
    print_success "Build tools installed successfully"
}

# Install npm dependencies
install_npm_dependencies() {
    print_header "Installing npm Dependencies"
    
    print_info "Running npm install..."
    npm install
    
    print_success "npm dependencies installed successfully"
}

# Create default configuration
create_default_config() {
    print_header "Creating Default Configuration"
    
    if [ ! -f "config/local.json" ]; then
        print_info "Creating config/local.json..."
        
        # Generate random session secret
        SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        cat > config/local.json << EOF
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
    "enabled": true,
    "username": "admin",
    "password": "admin",
    "sessionSecret": "$SESSION_SECRET"
  }
}
EOF
        print_success "Configuration file created at config/local.json"
        print_warning "Default credentials: username=admin, password=admin"
        print_warning "PLEASE CHANGE THE PASSWORD in config/local.json!"
    else
        print_info "Configuration file already exists, skipping..."
    fi
}

# Display final instructions
show_completion_message() {
    print_header "Installation Complete!"
    
    echo ""
    echo -e "${GREEN}✓ termi-host has been successfully installed!${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Start the server:"
    echo -e "   ${BLUE}npm start${NC}"
    echo ""
    echo "2. Access the terminal in your browser:"
    echo -e "   ${BLUE}http://localhost:3000${NC}"
    echo -e "   ${BLUE}http://$(hostname -I | awk '{print $1}'):3000${NC}"
    echo ""
    echo "3. Login with default credentials:"
    echo -e "   Username: ${YELLOW}admin${NC}"
    echo -e "   Password: ${YELLOW}admin${NC}"
    echo ""
    echo -e "${RED}⚠ IMPORTANT: Change the default password in config/local.json${NC}"
    echo ""
    echo "Optional: Install as a system service"
    echo -e "   ${BLUE}sudo bash install.sh --service${NC}"
    echo ""
}

# Install as systemd service
install_service() {
    print_header "Installing systemd Service"
    
    if [ "$EUID" -ne 0 ]; then
        print_error "Installing as a service requires root privileges"
        print_info "Please run: sudo bash install.sh --service"
        exit 1
    fi
    
    INSTALL_DIR=$(pwd)
    NODE_PATH=$(which node)
    
    print_info "Creating systemd service file..."
    
    cat > /etc/systemd/system/termi-host.service << EOF
[Unit]
Description=termi-host Web Terminal
Documentation=https://github.com/vpbgkt/termi-host
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_PATH $INSTALL_DIR/src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    print_info "Reloading systemd daemon..."
    systemctl daemon-reload
    
    print_info "Enabling termi-host service..."
    systemctl enable termi-host
    
    print_info "Starting termi-host service..."
    systemctl start termi-host
    
    sleep 2
    
    print_success "Service installed and started successfully"
    print_info "Service status:"
    systemctl status termi-host --no-pager -l
    
    echo ""
    echo "Service commands:"
    echo -e "  Start:   ${BLUE}sudo systemctl start termi-host${NC}"
    echo -e "  Stop:    ${BLUE}sudo systemctl stop termi-host${NC}"
    echo -e "  Restart: ${BLUE}sudo systemctl restart termi-host${NC}"
    echo -e "  Status:  ${BLUE}sudo systemctl status termi-host${NC}"
    echo -e "  Logs:    ${BLUE}sudo journalctl -u termi-host -f${NC}"
}

# Main installation process
main() {
    print_header "termi-host Installation Script"
    
    # Check for service installation flag
    if [ "$1" = "--service" ] || [ "$1" = "-s" ]; then
        install_service
        exit 0
    fi
    
    # Detect OS and check privileges
    detect_os
    check_root
    
    # Check Node.js
    if ! check_node; then
        read -p "Do you want to install Node.js 20 LTS? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_node
        else
            print_error "Node.js >= 18.0.0 is required. Please install it manually."
            exit 1
        fi
    fi
    
    # Check and install build tools
    print_info "Checking for build tools..."
    if ! command -v gcc &> /dev/null || ! command -v make &> /dev/null; then
        read -p "Build tools are required for node-pty. Install them? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_build_tools
        else
            print_warning "Skipping build tools installation. node-pty may fail to compile."
        fi
    else
        print_success "Build tools already installed"
    fi
    
    # Install npm dependencies
    install_npm_dependencies
    
    # Create default configuration
    create_default_config
    
    # Show completion message
    show_completion_message
}

# Run main function
main "$@"
