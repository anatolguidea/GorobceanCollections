# 🗄️ Database Setup Guide

This guide will help you set up and configure the MongoDB database for the StyleHub e-commerce backend.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6.0 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install MongoDB

#### **macOS (using Homebrew)**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongosh --version
```

#### **Windows**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and start automatically

#### **Linux (Ubuntu/Debian)**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --version
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
# MongoDB URI (local development)
MONGODB_URI=mongodb://localhost:27017/stylehub

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Database

```bash
# Start MongoDB (if not running as a service)
mongod --dbpath /data/db

# Or connect to MongoDB shell
mongosh
```

### 5. Seed the Database

```bash
# Run the seed script to populate with sample data
npm run seed
```

This will create:
- **8 Product Categories** (T-Shirts, Jeans, Blazers, etc.)
- **4 Sample Products** with full details
- **3 Default Users** (including admin account)

### 6. Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🏗️ Database Schema

### **User Model** (`models/User.js`)
- **Authentication**: email, password (hashed), role
- **Profile**: firstName, lastName, phone, addresses
- **Preferences**: newsletter, marketing, size preferences
- **Wishlist**: array of product references
- **Timestamps**: createdAt, updatedAt

### **Product Model** (`models/Product.js`)
- **Basic Info**: name, description, price, category
- **Images**: multiple images with primary flag
- **Variants**: sizes, colors, inventory tracking
- **Features**: tags, features, care instructions, materials
- **Status**: new, sale, featured, active
- **Reviews**: rating system with user comments
- **SEO**: meta title, description, keywords

### **Category Model** (`models/Category.js`)
- **Hierarchy**: parent-child relationships
- **Content**: name, slug, description, image
- **Organization**: order, featured status
- **Attributes**: custom fields and filters
- **SEO**: meta information

### **Order Model** (`models/Order.js`)
- **Order Details**: order number, status, totals
- **Items**: product references with size, color, quantity
- **Payment**: method, status, transaction details
- **Shipping**: address, method, tracking
- **Timeline**: creation, processing, delivery dates

### **Cart Model** (`models/Cart.js`)
- **User Cart**: linked to user account
- **Items**: product selection with variants
- **Calculations**: subtotal, tax, shipping, discounts
- **Expiration**: automatic cleanup after 30 days

## 🔧 Database Operations

### **Connection Management**
```javascript
// Automatic connection with error handling
const connectDB = require('./config/database');
await connectDB();

// Connection events
mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', console.log);
```

### **CRUD Operations**
```javascript
// Create
const user = await User.create(userData);

// Read
const users = await User.find({ role: 'admin' });
const user = await User.findById(userId);

// Update
await User.findByIdAndUpdate(userId, updateData);

// Delete
await User.findByIdAndDelete(userId);
```

### **Advanced Queries**
```javascript
// Aggregation pipeline
const stats = await Order.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: null, total: { $sum: '$total' } } }
]);

// Text search
const products = await Product.search('cotton t-shirt');

// Population
const orders = await Order.find().populate('user').populate('items.product');
```

## 📊 Sample Data

### **Default Admin Account**
- **Email**: `admin@stylehub.com`
- **Password**: `admin123`
- **Role**: `admin`

### **Default User Accounts**
- **Email**: `john.doe@example.com`
- **Password**: `password123`
- **Role**: `user`

- **Email**: `jane.smith@example.com`
- **Password**: `password123`
- **Role**: `user`

## 🛠️ Database Maintenance

### **Backup and Restore**
```bash
# Backup database
mongodump --db stylehub --out ./backup

# Restore database
mongorestore --db stylehub ./backup/stylehub
```

### **Cleanup Scripts**
```bash
# Clean expired carts
node -e "require('./models/Cart').cleanExpired()"

# Reset database
npm run seed
```

### **Performance Optimization**
- **Indexes**: Automatically created for common queries
- **Connection Pooling**: Optimized for concurrent requests
- **Query Optimization**: Built-in Mongoose optimizations

## 🔒 Security Features

### **Data Validation**
- **Schema Validation**: MongoDB schema-level constraints
- **Input Sanitization**: Express-validator middleware
- **Type Safety**: Mongoose type checking

### **Authentication**
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure session management
- **Role-based Access**: User and admin permissions

### **Data Protection**
- **Sensitive Data**: Passwords excluded from queries
- **Input Limits**: Request size and rate limiting
- **CORS Protection**: Cross-origin request security

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Failed**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

#### **Authentication Error**
```bash
# Reset admin password
node -e "
const bcrypt = require('bcryptjs');
const User = require('./models/User');
bcrypt.hash('admin123', 12).then(hash => {
  User.findOneAndUpdate(
    { email: 'admin@stylehub.com' },
    { password: hash }
  ).then(() => console.log('Password reset'));
});
"
```

#### **Database Not Found**
```bash
# Create database manually
mongosh
use stylehub
db.createCollection('users')
exit

# Re-run seed script
npm run seed
```

### **Performance Issues**
```bash
# Check database size
mongosh stylehub --eval "db.stats()"

# Check indexes
mongosh stylehub --eval "db.users.getIndexes()"

# Monitor queries
mongosh stylehub --eval "db.setProfilingLevel(2)"
```

## 📚 Additional Resources

- **MongoDB Documentation**: [docs.mongodb.com](https://docs.mongodb.com/)
- **Mongoose Documentation**: [mongoosejs.com](https://mongoosejs.com/)
- **MongoDB Atlas**: [mongodb.com/atlas](https://www.mongodb.com/atlas) (Cloud hosting)
- **MongoDB Compass**: [mongodb.com/compass](https://www.mongodb.com/compass) (GUI client)

## 🎯 Next Steps

1. **Customize Data**: Modify seed script for your products
2. **Add Indexes**: Create custom indexes for your queries
3. **Set Up Monitoring**: Implement database health checks
4. **Backup Strategy**: Configure automated backups
5. **Production Setup**: Configure MongoDB Atlas or production instance

---

**Need Help?** Check the main README.md or create an issue in the repository.
