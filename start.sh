#!/bin/bash

# 🚀 START ALL SERVICES
# This script starts backend and frontend in the background

PROJECT_ROOT="/Users/mac/Downloads/SaaS-HR-Management-Systems"

echo "🚀 Starting HR Management System..."
echo ""

# Start Backend
echo "📦 Starting Backend Server..."
cd "$PROJECT_ROOT/server"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: tail -f /tmp/backend.log"
echo ""

# Wait for backend to start
sleep 5

# Start Frontend
echo "🌐 Starting Frontend Client..."
cd "$PROJECT_ROOT/client_Salmon-HRIS"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: tail -f /tmp/frontend.log"
echo ""

# Wait for frontend to start
sleep 5

echo "🎉 Services started successfully!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔑 Login credentials:"
echo "   Admin:       admin@company.com / admin123"
echo "   Employee:    budi@company.com / password123"
echo "   Super Admin: superadmin@hrsystem.com / superadmin123"
echo ""
echo "📊 Check logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 Stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or run: ./stop.sh"
echo ""

# Save PIDs for later
echo "$BACKEND_PID" > /tmp/hr-backend.pid
echo "$FRONTEND_PID" > /tmp/hr-frontend.pid

echo "✨ Opening browser..."
sleep 3
open http://localhost:5173
