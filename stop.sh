#!/bin/bash

# 🛑 STOP ALL SERVICES

echo "🛑 Stopping HR Management System services..."
echo ""

# Stop backend
if [ -f /tmp/hr-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/hr-backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    else
        echo "⚠️  Backend was not running"
    fi
    rm /tmp/hr-backend.pid
else
    # Try to find and kill process on port 3000
    if lsof -ti:3000 >/dev/null 2>&1; then
        kill -9 $(lsof -ti:3000)
        echo "✅ Backend stopped (port 3000)"
    fi
fi

# Stop frontend
if [ -f /tmp/hr-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/hr-frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo "⚠️  Frontend was not running"
    fi
    rm /tmp/hr-frontend.pid
else
    # Try to find and kill process on port 5173
    if lsof -ti:5173 >/dev/null 2>&1; then
        kill -9 $(lsof -ti:5173)
        echo "✅ Frontend stopped (port 5173)"
    fi
fi

echo ""
echo "✨ All services stopped"
