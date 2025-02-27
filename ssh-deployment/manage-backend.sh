#!/bin/bash

# Configuration - UPDATED PATHS AND PORT
BACKEND_DIR="../backend"  # Path relative to ssh-deployment folder
PORT=55500  # Changed from 55600 to your desired port
PID_FILE="$BACKEND_DIR/.pid"
LOG_FILE="$BACKEND_DIR/backend.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Print timestamp for logs
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Log message to console and file
log() {
    local level=$1
    local message=$2
    local color=$NC
    
    case $level in
        "INFO") color=$GREEN ;;
        "WARN") color=$YELLOW ;;
        "ERROR") color=$RED ;;
        "DEBUG") color=$BLUE ;;
    esac
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null
    
    echo -e "${color}[$(timestamp)] [$level] $message${NC}"
    echo "[$(timestamp)] [$level] $message" >> "$LOG_FILE"
}

# Check if the server is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null; then
            return 0  # Running
        fi
    fi
    return 1  # Not running
}

# Check server status
check_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        local uptime=$(ps -p "$pid" -o etime= | tr -d ' ')
        local mem=$(ps -p "$pid" -o %mem= | tr -d ' ')
        local cpu=$(ps -p "$pid" -o %cpu= | tr -d ' ')
        
        log "INFO" "Backend server is running"
        log "INFO" "PID: $pid, Uptime: $uptime, Memory: $mem%, CPU: $cpu%"
        log "INFO" "Access API at: http://$(hostname -I | awk '{print $1}'):$PORT/api"
    else
        log "INFO" "Backend server is not running"
    fi
}

# Kill any process using our port
kill_port() {
    log "INFO" "Checking for processes on port ${PORT}..."
    local pid=$(lsof -t -i:$PORT 2>/dev/null)
    
    if [ -n "$pid" ]; then
        log "WARN" "Process $pid is using port $PORT. Terminating..."
        kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        sleep 2
        log "INFO" "Port $PORT is now available"
    else
        log "INFO" "No process found on port $PORT"
    fi
}

# Start the server
start_server() {
    # Check if already running
    if is_running; then
        log "WARN" "Server is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi

    # Ensure port is free
    kill_port
    
    # Navigate to backend directory
    mkdir -p "$(dirname "$LOG_FILE")"
    cd "$BACKEND_DIR" || {
        log "ERROR" "Failed to change to directory $BACKEND_DIR"
        return 1
    }
    
    log "INFO" "Installing dependencies..."
    npm install --no-audit --no-fund --silent || {
        log "ERROR" "Failed to install dependencies"
        return 1
    }
    
    log "INFO" "Generating Prisma client..."
    npx prisma generate || {
        log "ERROR" "Failed to generate Prisma client"
        return 1
    }
    
    log "INFO" "Building application..."
    npm run build --silent || {
        log "ERROR" "Build failed"
        return 1
    }
    
    log "INFO" "Copying environment files..."
    cp .env.production dist/.env.production || {
        log "WARN" "Failed to copy environment files"
    }
    
    log "INFO" "Verifying environment variables..."
    echo "DATABASE_URL from env: ${DATABASE_URL:-Not Set}"
    # Generate it directly to verify
    DB_URL="postgresql://${DB_USER:-u0155}:${DB_PASSWORD:-YcROFGC9lu}@${DB_HOST:-178.254.12.86}:${DB_PORT:-5000}/${DB_NAME:-postgres}?schema=public"
    log "INFO" "Generated DATABASE_URL: $DB_URL"
    # Export it directly
    export DATABASE_URL="$DB_URL"
    
    log "INFO" "Starting production server on port $PORT..."
    NODE_ENV=production PORT=$PORT nohup node -r dotenv/config dist/server.js dotenv_config_path=.env.production > "$LOG_FILE" 2>&1 &
    
    # Save PID
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # Check if server started successfully
    log "INFO" "Waiting for server to initialize..."
    sleep 5
    
    # Check if process is still running after startup
    if ps -p $pid > /dev/null; then
        log "INFO" "Server started successfully (PID: $pid)"
        log "INFO" "Access API at: http://$(hostname -I | awk '{print $1}'):$PORT/api"
        return 0
    else
        log "ERROR" "Server failed to start. Check logs at $LOG_FILE"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Stop the server
stop_server() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        log "INFO" "Stopping backend server (PID: $pid)..."
        
        # Try graceful shutdown first
        kill -15 $pid 2>/dev/null
        
        # Wait for process to exit
        local timeout=10
        local count=0
        while [ $count -lt $timeout ] && ps -p $pid > /dev/null; do
            sleep 1
            count=$((count+1))
        done
        
        # Force kill if still running
        if ps -p $pid > /dev/null; then
            log "WARN" "Server did not stop gracefully, forcing termination..."
            kill -9 $pid 2>/dev/null
        fi
        
        rm -f "$PID_FILE"
        log "INFO" "Server stopped"
    else
        log "INFO" "No running server detected"
    fi
    
    # Ensure port is free
    kill_port
}

# Show recent logs
show_logs() {
    local lines=${1:-50}
    if [ -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}Last $lines lines from server log:${NC}"
        tail -n $lines "$LOG_FILE"
    else
        log "ERROR" "No log file found at $LOG_FILE"
    fi
}

# Command handling
case "$1" in
    start)
        log "INFO" "Starting backend server..."
        start_server
        ;;
    stop)
        log "INFO" "Stopping backend server..."
        stop_server
        ;;
    restart)
        log "INFO" "Restarting backend server..."
        stop_server
        sleep 2
        start_server
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs "${2:-50}"
        ;;
    *)
        echo -e "${GREEN}Backend Server Management Script${NC}"
        echo -e "Usage: $0 {start|stop|restart|status|logs [lines]}"
        echo ""
        echo -e "  ${BLUE}start${NC}    - Start the backend server"
        echo -e "  ${BLUE}stop${NC}     - Stop the backend server"
        echo -e "  ${BLUE}restart${NC}  - Restart the backend server"
        echo -e "  ${BLUE}status${NC}   - Check server status"
        echo -e "  ${BLUE}logs${NC}     - Show recent log entries (default: 50 lines)"
        exit 1
        ;;
esac

exit 0 