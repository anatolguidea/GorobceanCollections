# Admin Dashboard Guide

## Overview
The admin dashboard provides comprehensive management capabilities for your clothing store, including product management, user management, order tracking, and analytics.

## Access
- **URL**: `/admin`
- **Default Admin Account**: 
  - Email: `admin@stylehub.com`
  - Password: `admin123`

## Features

### 🏠 Dashboard
- **Overview Statistics**: Total products, users, orders, and revenue
- **Quick Actions**: Add new products, manage existing ones
- **Recent Products**: View latest additions to your catalog
- **Analytics**: Placeholder for future charts and insights

### 📦 Product Management

#### View All Products (`/admin/products`)
- **Product List**: Complete catalog with search and filtering
- **Product Details**: Name, category, price, status, creation date
- **Actions**: View, Edit, Delete products
- **Search & Filter**: By name, category, and other attributes

#### Add New Product (`/admin/products/new`)
- **Basic Information**: Name, description, price, category
- **Sizes & Colors**: Multiple size options and color variants
- **Inventory Management**: Automatic inventory generation
- **Images**: Multiple image support with primary image selection
- **Product Flags**: Active, featured, new arrival, sale status
- **Additional Details**: Tags, materials, features, care instructions

#### Edit Product (`/admin/products/[id]/edit`)
- **Full Editing**: Modify all product attributes
- **Real-time Updates**: Changes saved immediately
- **Validation**: Form validation with error handling

#### Delete Products
- **Confirmation Modal**: Prevents accidental deletions
- **Permanent Removal**: Products cannot be recovered

### 👥 User Management (`/admin/users`)

#### View All Users
- **User List**: Complete user database
- **User Details**: Name, email, role, join date
- **Role Management**: Admin and user roles

#### Add New Users
- **User Creation**: First name, last name, email, password
- **Role Assignment**: Set as admin or regular user
- **Validation**: Email uniqueness and password requirements

#### Edit Users
- **Profile Updates**: Modify user information
- **Password Changes**: Optional password updates
- **Role Changes**: Promote/demote user roles

#### Delete Users
- **Safe Deletion**: Confirmation required
- **Admin Protection**: Cannot delete your own account

### 🛒 Order Management (`/admin/orders`)

#### View All Orders
- **Order List**: Complete order history
- **Order Details**: Customer info, items, total, status
- **Status Tracking**: Pending, processing, shipped, delivered, cancelled

#### Update Order Status
- **Status Management**: Change order status in real-time
- **Status Options**: 
  - Pending → Processing → Shipped → Delivered
  - Cancelled (at any stage)
- **Customer Communication**: Status updates for tracking

## Database Management

### Clear Sample Data
To remove all sample products and keep only admin and user accounts:

```bash
# Run the cleanup script
./clear-products.sh

# Or manually
cd backend
node scripts/clear-products.js
```

This will:
- ✅ Remove all sample products
- ✅ Keep admin account (`admin@stylehub.com`)
- ✅ Keep user accounts (`john.doe@example.com`, `jane.smith@example.com`)
- ✅ Clear any other sample data

### Add Products Manually
After clearing sample data, add products through:
1. **Admin Dashboard** → **Products** → **Add Product**
2. **Complete Product Form** with all required fields
3. **Generate Inventory** for size/color combinations
4. **Save Product** to add to catalog

## Security Features

### Authentication
- **JWT Tokens**: Secure authentication system
- **Admin Verification**: Role-based access control
- **Session Management**: Automatic token validation

### Authorization
- **Admin-Only Routes**: Protected admin endpoints
- **User Permissions**: Role-based functionality access
- **Secure Operations**: All admin actions require authentication

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Orders
- `GET /api/orders` - List all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Best Practices

### Product Management
1. **Complete Information**: Fill all required fields
2. **Quality Images**: Use high-resolution product photos
3. **Accurate Inventory**: Keep stock levels updated
4. **Regular Updates**: Maintain product information

### User Management
1. **Role Assignment**: Only grant admin access when necessary
2. **Password Security**: Encourage strong passwords
3. **User Monitoring**: Regularly review user accounts

### Order Management
1. **Status Updates**: Keep customers informed
2. **Quick Processing**: Update status promptly
3. **Communication**: Notify customers of changes

## Troubleshooting

### Common Issues

#### Dashboard Not Loading
- Check if you're logged in as admin
- Verify JWT token is valid
- Check browser console for errors

#### Cannot Add/Edit Products
- Ensure you have admin privileges
- Check all required fields are filled
- Verify backend server is running

#### User Management Issues
- Confirm admin role permissions
- Check email uniqueness
- Validate password requirements

### Getting Help
1. **Check Console**: Browser developer tools for errors
2. **Verify Backend**: Ensure server is running on port 5001
3. **Database Connection**: Confirm MongoDB connection
4. **Token Validity**: Check if JWT token is expired

## Future Enhancements

### Planned Features
- **Analytics Dashboard**: Sales charts and metrics
- **Bulk Operations**: Mass product/user updates
- **Advanced Filtering**: More search and filter options
- **Export Functionality**: Data export capabilities
- **Notification System**: Real-time updates and alerts

### Customization
- **Theme Options**: Customizable admin interface
- **Role Permissions**: Granular access control
- **Workflow Automation**: Automated order processing
- **Integration**: Third-party service connections

---

**Note**: This admin dashboard is designed for store administrators. Regular users cannot access these features and will be redirected to the main site.
