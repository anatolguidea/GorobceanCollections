# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Port Already in Use

**Error**: `Port 3000 is already in use` or `Port 5001 is already in use`

**Solution**:
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5001

# Kill the process using the port
kill -9 <PID>

# Or use the port kill command
npx kill-port 3000 5001
```

### 2. Backend Server Won't Start

**Error**: `Route.post() requires a callback function but got a [object Object]`

**Solution**: This usually means there's a middleware import issue. Check that all route files import middleware correctly:

```javascript
// Correct import
const { auth } = require('../middleware/auth');

// Wrong import
const auth = require('../middleware/auth');
```

### 3. Frontend Shows Loading Spinner Forever

**Possible Causes**:
- Backend server is not running
- CORS issues
- Network connectivity problems

**Solution**:
1. Ensure backend is running on port 5001
2. Check browser console for errors
3. Verify API endpoints are accessible

### 4. Module Not Found Errors

**Error**: `Cannot find module 'express'` or similar

**Solution**:
```bash
# Install dependencies
npm install

# For backend specifically
cd backend
npm install
```

### 5. Permission Denied Errors

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Make scripts executable (macOS/Linux)
chmod +x setup.sh
chmod +x start.sh

# Or run with sudo if necessary
sudo npm install
```

### 6. Node.js Version Issues

**Error**: `SyntaxError: Unexpected token` or similar

**Solution**: Ensure you have Node.js 18+ installed:
```bash
node --version

# If version is below 18, update Node.js
# Visit: https://nodejs.org/
```

### 7. Environment Variables Not Loading

**Error**: `JWT_SECRET is not defined`

**Solution**:
1. Copy the environment template:
   ```bash
   cd backend
   cp env.example .env
   ```
2. Edit `.env` file with your values
3. Restart the server

### 8. Database Connection Issues

**Error**: `MongoDB connection failed`

**Solution**: 
- For development, the app uses mock data by default
- If you want to use MongoDB, install and start MongoDB service
- Update the `.env` file with your MongoDB URI

### 9. Frontend Build Errors

**Error**: `Build failed` or TypeScript errors

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### 10. Slow Performance

**Symptoms**: Slow loading, laggy animations

**Solution**:
1. Check if both servers are running on correct ports
2. Ensure you're not running multiple instances
3. Check system resources (CPU, memory)
4. Clear browser cache

## 🔧 Quick Fix Commands

```bash
# Stop all servers
pkill -f "next dev"
pkill -f "node.*server.js"

# Clear caches
rm -rf .next
rm -rf node_modules package-lock.json

# Reinstall everything
npm install
cd backend && npm install

# Start fresh
./start.sh  # macOS/Linux
start.bat   # Windows
```

## 📱 Testing Your Setup

### 1. Test Backend API
```bash
curl http://localhost:5001/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "StyleHub API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Test Frontend
```bash
curl http://localhost:3000
```
Expected response: HTML content with loading spinner

### 3. Test API Endpoints
```bash
# Get products
curl http://localhost:5001/api/products

# Get categories
curl http://localhost:5001/api/categories
```

## 🆘 Still Having Issues?

1. **Check the logs**: Look at terminal output for error messages
2. **Verify ports**: Ensure no other services are using ports 3000 or 5001
3. **Check Node.js version**: Must be 18 or higher
4. **Clear everything**: Use the quick fix commands above
5. **Check file permissions**: Ensure scripts are executable

## 📞 Getting Help

- Check the main README.md for setup instructions
- Review the console output for specific error messages
- Ensure all dependencies are properly installed
- Verify both servers are running on the correct ports

---

**Remember**: The app uses mock data by default, so you don't need a database to get started!

