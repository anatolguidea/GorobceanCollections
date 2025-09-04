# StyleHub - Premium Clothing Brand E-commerce Website

A modern, full-stack e-commerce website for a premium clothing brand built with Next.js frontend and Node.js backend.

## 🚀 Features

### Frontend (Next.js)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Animations**: Smooth animations using Framer Motion
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Component-based Architecture**: Reusable React components
- **SEO Optimized**: Meta tags and structured data
- **Performance**: Optimized images and lazy loading

### Backend (Node.js)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication**: JWT-based user authentication and authorization
- **Validation**: Input validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and security middleware
- **Modular Architecture**: Organized routes and middleware

### E-commerce Features
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, update, remove items with real-time calculations
- **User Management**: Registration, login, profile management
- **Order Management**: Complete order lifecycle with tracking
- **Category Management**: Organized product categorization
- **Search & Filtering**: Product search and advanced filtering
- **Responsive Design**: Mobile and desktop optimized

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger
- **Compression**: Response compression

## 📁 Project Structure

```
ClothingStore/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── shop/                    # Product catalog
│   │   └── page.tsx            # Shop page
│   ├── products/                # Product details
│   │   └── [id]/               # Dynamic product routes
│   │       └── page.tsx        # Product detail page
│   ├── cart/                    # Shopping cart
│   │   └── page.tsx            # Cart page
│   ├── checkout/                # Checkout process
│   │   └── page.tsx            # Checkout page
│   ├── account/                 # User account
│   │   └── page.tsx            # Account page
│   ├── categories/              # Product categories
│   │   └── page.tsx            # Categories page
│   ├── about/                   # About page
│   │   └── page.tsx            # About page
│   └── contact/                 # Contact page
│       └── page.tsx            # Contact page
├── components/                   # React components
│   ├── Header.tsx               # Navigation header
│   ├── Hero.tsx                 # Hero section
│   ├── FeaturedProducts.tsx     # Featured products
│   ├── Categories.tsx           # Product categories
│   ├── Newsletter.tsx           # Newsletter signup
│   └── Footer.tsx               # Footer
├── backend/                      # Node.js backend
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product management
│   │   ├── categories.js        # Category management
│   │   ├── cart.js              # Shopping cart
│   │   ├── orders.js            # Order management
│   │   └── users.js             # User management
│   ├── middleware/              # Custom middleware
│   │   └── auth.js              # Authentication middleware
│   ├── models/                  # Database models
│   │   ├── User.js              # User schema and model
│   │   ├── Product.js           # Product schema and model
│   │   ├── Category.js          # Category schema and model
│   │   ├── Order.js             # Order schema and model
│   │   └── Cart.js              # Cart schema and model
│   ├── config/                  # Configuration files
│   │   └── database.js          # Database connection
│   ├── scripts/                 # Utility scripts
│   │   └── seed.js              # Database seeding
│   ├── server.js                # Main server file
│   ├── package.json             # Backend dependencies
│   ├── env.example              # Environment variables template
│   └── DATABASE.md              # Database documentation
├── package.json                  # Frontend dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── start.sh                     # Startup script (macOS/Linux)
├── start.bat                    # Startup script (Windows)
├── setup.sh                     # Setup script (macOS/Linux)
├── setup.bat                    # Setup script (Windows)
├── TROUBLESHOOTING.md           # Troubleshooting guide
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Quick Start (Recommended)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd ClothingStore
   chmod +x start.sh setup.sh  # macOS/Linux only
   ```

2. **Run the setup script**
   ```bash
   # macOS/Linux
   ./setup.sh
   
   # Windows
   setup.bat
   ```

3. **Start both servers**
   ```bash
   # macOS/Linux
   ./start.sh
   
   # Windows
   start.bat
   ```

4. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5001](http://localhost:5001)

### Manual Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **API will be available at**
   [http://localhost:5001](http://localhost:5001)

6. **Database is ready to use**
   - MongoDB connection is automatically established
   - Run `npm run seed` to populate with sample data
   - Check server logs for database connection status

### Database Setup

1. **Install MongoDB**
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **Linux**: `sudo apt install mongodb`

2. **Start MongoDB service**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongodb
   ```

3. **Seed the database with initial data**
   ```bash
   cd backend
   npm run seed
   ```

4. **Verify database connection**
   - Check server logs for "✅ MongoDB Connected"
   - Visit [http://localhost:5001/health](http://localhost:5001/health)

📚 **For detailed database documentation, see [backend/DATABASE.md](backend/DATABASE.md)**

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Database Configuration (for future MongoDB integration)
MONGODB_URI=mongodb://localhost:27017/stylehub

# Other services (configure as needed)
CLOUDINARY_CLOUD_NAME=your-cloud-name
STRIPE_SECRET_KEY=your-stripe-secret-key
```

## 📱 Available Routes

### Frontend Routes
- `/` - Homepage
- `/shop` - Product catalog
- `/categories` - Product categories
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - User orders
- `/profile` - User profile
- `/about` - About page
- `/contact` - Contact page

### Backend API Routes

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

#### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/featured/featured` - Get featured products

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/cart/count` - Get cart item count

#### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/:id/tracking` - Get order tracking

#### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/stats/overview` - Get user statistics (Admin)

## 🎨 Design System

### Colors
- **Primary**: Orange (#f27522) - Brand color
- **Secondary**: Gray (#64748b) - Text and UI elements
- **Accent**: Purple (#d946ef) - Highlights and CTAs

### Typography
- **Display Font**: Poppins - Headings and titles
- **Body Font**: Inter - Body text and UI elements

### Components
- **Buttons**: Primary, secondary, and outline variants
- **Cards**: Product cards with hover effects
- **Forms**: Input fields with validation states
- **Navigation**: Responsive header with mobile menu

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet Security**: Security headers and middleware

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative deployment option
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Backend Deployment
- **Railway**: Easy Node.js deployment
- **Heroku**: Traditional hosting option
- **DigitalOcean**: VPS hosting
- **Environment Variables**: Configure production values

## 🔮 Future Enhancements

- **Database Integration**: ✅ MongoDB with Mongoose (Complete)
- **Payment Processing**: Stripe integration
- **Image Upload**: Cloudinary integration
- **Email Notifications**: Nodemailer setup
- **Admin Dashboard**: React admin interface
- **Real-time Chat**: Socket.io integration
- **Analytics**: Google Analytics integration
- **PWA**: Progressive Web App features
- **Dark Mode**: Theme switching capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer**: Next.js, React, TypeScript
- **Backend Developer**: Node.js, Express, API Development
- **UI/UX Designer**: Tailwind CSS, Framer Motion
- **DevOps**: Deployment and infrastructure

## 📞 Support

For support and questions:
- Email: hello@stylehub.com
- Documentation: [docs.stylehub.com](https://docs.stylehub.com)
- Issues: [GitHub Issues](https://github.com/stylehub/clothing-store/issues)

---

**StyleHub** - Elevate Your Style Every Day ✨
