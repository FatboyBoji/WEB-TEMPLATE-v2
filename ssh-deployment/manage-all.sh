#!/bin/bash

# Configuration
BACKEND_SCRIPT="./manage-backend.sh"
FRONTEND_SCRIPT="./manage-server.sh"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure both scripts are executable
chmod +x "$BACKEND_SCRIPT" "$FRONTEND_SCRIPT"

# Function to display header
show_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

# Start both services
start_all() {
    show_header "Starting Backend Service"
    $BACKEND_SCRIPT start
    
    # Wait for backend to initialize
    echo -e "\n${YELLOW}Waiting 10 seconds for backend to initialize...${NC}"
    sleep 10
    
    show_header "Starting Frontend Service"
    $FRONTEND_SCRIPT start
    
    show_header "Status of All Services"
    check_status
}

# Stop both services
stop_all() {
    show_header "Stopping Frontend Service"
    $FRONTEND_SCRIPT stop
    
    show_header "Stopping Backend Service"
    $BACKEND_SCRIPT stop
    
    show_header "Status of All Services"
    check_status
}

# Restart both services
restart_all() {
    show_header "Restarting All Services"
    stop_all
    echo -e "\n${YELLOW}Waiting 5 seconds before starting services...${NC}"
    sleep 5
    start_all
}

# Check status of both services
check_status() {
    show_header "Backend Service Status"
    # Check if backend is running on its port (55600)
    if lsof -i:55600 >/dev/null 2>&1; then
        echo -e "${GREEN}Backend is running${NC}"
    else
        echo -e "${RED}Backend is not running${NC}"
    fi

    echo ""
    
    show_header "Frontend Service Status"
    $FRONTEND_SCRIPT status
}

# Command handling
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        check_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0