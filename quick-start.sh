#!/bin/bash

echo "========================================"
echo "   SAFE PAWS - QUICK START SCRIPT"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js is installed"
node --version
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "[WARNING] .env file not found!"
    echo "Creating .env from template..."
    cat > .env << 'EOF'
# Database (Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@example.com

# Server
PORT=3000
NODE_ENV=development
EOF
    echo "[CREATED] .env file created. Please edit it with your credentials."
    echo ""
    
    # Try to open with default editor
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit .env file manually with your credentials"
        echo "Press Enter after editing..."
        read
    fi
fi

echo "[OK] .env file exists"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies!"
        exit 1
    fi
    echo "[OK] Dependencies installed"
    echo ""
else
    echo "[OK] Dependencies already installed"
    echo ""
fi

# Start the server
echo "========================================"
echo "   STARTING SAFE PAWS SERVER"
echo "========================================"
echo ""
echo "Server will start on: http://localhost:3000"
echo "Dashboard available at: http://localhost:3000/dashboard.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "========================================"
echo ""

npm start