#!/bin/bash

echo "🚀 Starting StyleHub E-commerce Website..."
echo "=========================================="

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if ports are available
check_port() {
    if lsof -i :$1 >/dev/null 2>&1; then
        echo "❌ Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
if ! check_port 3000; then
    echo "   Please stop the process using port 3000 and try again"
    exit 1
fi

if ! check_port 5001; then
    echo "   Please stop the process using port 5001 and try again"
    exit 1
fi

echo "✅ Ports 3000 and 5001 are available"

# Start backend server
echo ""
echo "🔧 Starting backend server on port 5001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! lsof -i :5001 >/dev/null 2>&1; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend server started successfully"

# Start frontend server
echo ""
echo "🎨 Starting frontend server on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if ! lsof -i :3000 >/dev/null 2>&1; then
    echo "❌ Frontend failed to start"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend server started successfully"

echo ""
echo "🎉 StyleHub is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🔗 Health Check: http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop
wait

