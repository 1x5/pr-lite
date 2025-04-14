#!/bin/bash

# Check if port 3000 is in use
echo "Checking for processes on port 3000..."
if lsof -i :3000 -t >/dev/null; then
    echo "Port 3000 is in use. Attempting to kill the process..."
    kill -9 $(lsof -i :3000 -t)
    sleep 2
    if lsof -i :3000 -t >/dev/null; then
        echo "Failed to kill the process. Please close the application using port 3000 manually."
        exit 1
    fi
    echo "Process killed successfully."
else
    echo "Port 3000 is already free"
fi

# Start the project
echo "Starting the project..."
npm start 