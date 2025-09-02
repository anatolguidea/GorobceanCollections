#!/bin/bash

echo "🧹 Clearing sample products from database..."
echo "This will remove all products and keep only admin and user accounts."
echo ""

# Navigate to backend directory
cd backend

# Run the clear products script
node scripts/clear-products.js

echo ""
echo "✅ Product cleanup completed!"
echo "You can now add products manually through the admin dashboard."
