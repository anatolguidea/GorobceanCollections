const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Database connection
const connectDB = require('../config/database');

// Sample data
const categories = [
  {
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Comfortable and stylish t-shirts for everyday wear',
    image: {
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop',
      alt: 'T-Shirts Collection'
    },
    isFeatured: true,
    order: 1
  },
  {
    name: 'Jeans',
    slug: 'jeans',
    description: 'Classic denim jeans in various fits and washes',
    image: {
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop',
      alt: 'Jeans Collection'
    },
    isFeatured: true,
    order: 2
  },
  {
    name: 'Blazers',
    slug: 'blazers',
    description: 'Sophisticated blazers for professional and casual occasions',
    image: {
      url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=400&fit=crop',
      alt: 'Blazers Collection'
    },
    isFeatured: true,
    order: 3
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    description: 'Elegant dresses for every season and occasion',
    image: {
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=400&fit=crop',
      alt: 'Dresses Collection'
    },
    isFeatured: true,
    order: 4
  },
  {
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Cozy hoodies perfect for casual and athletic wear',
    image: {
      url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop',
      alt: 'Hoodies Collection'
    },
    order: 5
  },
  {
    name: 'Pants',
    slug: 'pants',
    description: 'Versatile pants including chinos, slacks, and casual styles',
    image: {
      url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=400&fit=crop',
      alt: 'Pants Collection'
    },
    order: 6
  },
  {
    name: 'Polo Shirts',
    slug: 'polo-shirts',
    description: 'Classic polo shirts for a smart casual look',
    image: {
      url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=400&fit=crop',
      alt: 'Polo Shirts Collection'
    },
    order: 7
  },
  {
    name: 'Jackets',
    slug: 'jackets',
    description: 'Stylish jackets for layering and protection',
    image: {
      url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=400&fit=crop',
      alt: 'Jackets Collection'
    },
    order: 8
  }
];

const products = [
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Experience ultimate comfort with our Premium Cotton T-Shirt. Made from 100% organic cotton, this versatile piece features a modern fit that\'s perfect for everyday wear.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'T-Shirts',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop',
        alt: 'Premium Cotton T-Shirt - White',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=700&fit=crop',
        alt: 'Premium Cotton T-Shirt - Black'
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Gray', hex: '#808080', inStock: true }
    ],
    inventory: [
      { size: 'XS', color: 'White', quantity: 50, reserved: 0 },
      { size: 'S', color: 'White', quantity: 75, reserved: 0 },
      { size: 'M', color: 'White', quantity: 100, reserved: 0 },
      { size: 'L', color: 'White', quantity: 75, reserved: 0 },
      { size: 'XL', color: 'White', quantity: 50, reserved: 0 },
      { size: 'XXL', color: 'White', quantity: 25, reserved: 0 },
      { size: 'XS', color: 'Black', quantity: 45, reserved: 0 },
      { size: 'S', color: 'Black', quantity: 70, reserved: 0 },
      { size: 'M', color: 'Black', quantity: 90, reserved: 0 },
      { size: 'L', color: 'Black', quantity: 70, reserved: 0 },
      { size: 'XL', color: 'Black', quantity: 45, reserved: 0 },
      { size: 'XXL', color: 'Black', quantity: 20, reserved: 0 },
      { size: 'XS', color: 'Navy', quantity: 40, reserved: 0 },
      { size: 'S', color: 'Navy', quantity: 65, reserved: 0 },
      { size: 'M', color: 'Navy', quantity: 85, reserved: 0 },
      { size: 'L', color: 'Navy', quantity: 65, reserved: 0 },
      { size: 'XL', color: 'Navy', quantity: 40, reserved: 0 },
      { size: 'XXL', color: 'Navy', quantity: 20, reserved: 0 },
      { size: 'XS', color: 'Gray', quantity: 35, reserved: 0 },
      { size: 'S', color: 'Gray', quantity: 60, reserved: 0 },
      { size: 'M', color: 'Gray', quantity: 80, reserved: 0 },
      { size: 'L', color: 'Gray', quantity: 60, reserved: 0 },
      { size: 'XL', color: 'Gray', quantity: 35, reserved: 0 },
      { size: 'XXL', color: 'Gray', quantity: 15, reserved: 0 }
    ],
    tags: ['cotton', 'comfortable', 'casual', 'basic', 'organic'],
    features: [
      '100% organic cotton',
      'Breathable and lightweight',
      'Modern fit design',
      'Machine washable',
      'Pre-shrunk fabric',
      'Reinforced stitching'
    ],
    care: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not bleach',
      'Iron on low if needed',
      'Wash with like colors'
    ],
    materials: ['100% Organic Cotton'],
    isNewArrival: false,
    isSale: true,
    isFeatured: true,
    salePercentage: 25,
    rating: { average: 4.8, count: 124 }
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Classic slim fit jeans with a modern twist. Perfect stretch denim that provides comfort and style for any occasion.',
    price: 79.99,
    category: 'Jeans',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop',
        alt: 'Slim Fit Jeans - Blue',
        isPrimary: true
      }
    ],
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: [
      { name: 'Blue', hex: '#0000FF', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Gray', hex: '#808080', inStock: true }
    ],
    inventory: [
      { size: '28', color: 'Blue', quantity: 30, reserved: 0 },
      { size: '30', color: 'Blue', quantity: 45, reserved: 0 },
      { size: '32', color: 'Blue', quantity: 60, reserved: 0 },
      { size: '34', color: 'Blue', quantity: 45, reserved: 0 },
      { size: '36', color: 'Blue', quantity: 30, reserved: 0 },
      { size: '38', color: 'Blue', quantity: 15, reserved: 0 },
      { size: '28', color: 'Black', quantity: 25, reserved: 0 },
      { size: '30', color: 'Black', quantity: 40, reserved: 0 },
      { size: '32', color: 'Black', quantity: 55, reserved: 0 },
      { size: '34', color: 'Black', quantity: 40, reserved: 0 },
      { size: '36', color: 'Black', quantity: 25, reserved: 0 },
      { size: '38', color: 'Black', quantity: 15, reserved: 0 },
      { size: '28', color: 'Gray', quantity: 20, reserved: 0 },
      { size: '30', color: 'Gray', quantity: 35, reserved: 0 },
      { size: '32', color: 'Gray', quantity: 50, reserved: 0 },
      { size: '34', color: 'Gray', quantity: 35, reserved: 0 },
      { size: '36', color: 'Gray', quantity: 20, reserved: 0 },
      { size: '38', color: 'Gray', quantity: 10, reserved: 0 }
    ],
    tags: ['jeans', 'denim', 'slim-fit', 'stretch', 'casual'],
    features: [
      'Premium stretch denim',
      'Slim fit design',
      'Comfortable stretch',
      'Classic 5-pocket style',
      'Durable construction'
    ],
    care: [
      'Machine wash cold',
      'Turn inside out',
      'Use mild detergent',
      'Hang to dry',
      'Iron on low if needed'
    ],
    materials: ['98% Cotton', '2% Elastane'],
    isNewArrival: true,
    isSale: false,
    isFeatured: true,
    rating: { average: 4.6, count: 89 }
  },
  {
    name: 'Casual Blazer',
    description: 'A sophisticated casual blazer that transitions seamlessly from office to evening events. Made from premium wool blend fabric.',
    price: 99.99,
    category: 'Blazers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=700&fit=crop',
        alt: 'Casual Blazer - Navy',
        isPrimary: true
      }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Gray', hex: '#808080', inStock: true }
    ],
    inventory: [
      { size: 'S', color: 'Navy', quantity: 25, reserved: 0 },
      { size: 'M', color: 'Navy', quantity: 35, reserved: 0 },
      { size: 'L', color: 'Navy', quantity: 30, reserved: 0 },
      { size: 'XL', color: 'Navy', quantity: 20, reserved: 0 },
      { size: 'S', color: 'Black', quantity: 20, reserved: 0 },
      { size: 'M', color: 'Black', quantity: 30, reserved: 0 },
      { size: 'L', color: 'Black', quantity: 25, reserved: 0 },
      { size: 'XL', color: 'Black', quantity: 15, reserved: 0 },
      { size: 'S', color: 'Gray', quantity: 15, reserved: 0 },
      { size: 'M', color: 'Gray', quantity: 25, reserved: 0 },
      { size: 'L', color: 'Gray', quantity: 20, reserved: 0 },
      { size: 'XL', color: 'Gray', quantity: 10, reserved: 0 }
    ],
    tags: ['blazer', 'formal', 'casual', 'wool', 'professional'],
    features: [
      'Premium wool blend fabric',
      'Unlined construction',
      'Single button closure',
      'Patch pockets',
      'Modern fit'
    ],
    care: [
      'Dry clean only',
      'Store on hanger',
      'Avoid direct sunlight',
      'Professional pressing recommended'
    ],
    materials: ['70% Wool', '30% Polyester'],
    isNewArrival: false,
    isSale: false,
    isFeatured: true,
    rating: { average: 4.9, count: 67 }
  },
  {
    name: 'Summer Dress',
    description: 'A beautiful summer dress perfect for warm weather. Lightweight fabric with a flattering silhouette.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Dresses',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop',
        alt: 'Summer Dress - Floral',
        isPrimary: true
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Floral', hex: '#FF69B4', inStock: true },
      { name: 'Blue', hex: '#0000FF', inStock: true },
      { name: 'Pink', hex: '#FFC0CB', inStock: true }
    ],
    inventory: [
      { size: 'XS', color: 'Floral', quantity: 40, reserved: 0 },
      { size: 'S', color: 'Floral', quantity: 60, reserved: 0 },
      { size: 'M', color: 'Floral', quantity: 80, reserved: 0 },
      { size: 'L', color: 'Floral', quantity: 60, reserved: 0 },
      { size: 'XL', color: 'Floral', quantity: 40, reserved: 0 },
      { size: 'XS', color: 'Blue', quantity: 35, reserved: 0 },
      { size: 'S', color: 'Blue', quantity: 55, reserved: 0 },
      { size: 'M', color: 'Blue', quantity: 75, reserved: 0 },
      { size: 'L', color: 'Blue', quantity: 55, reserved: 0 },
      { size: 'XL', color: 'Blue', quantity: 35, reserved: 0 },
      { size: 'XS', color: 'Pink', quantity: 30, reserved: 0 },
      { size: 'S', color: 'Pink', quantity: 50, reserved: 0 },
      { size: 'M', color: 'Pink', quantity: 70, reserved: 0 },
      { size: 'L', color: 'Pink', quantity: 50, reserved: 0 },
      { size: 'XL', color: 'Pink', quantity: 30, reserved: 0 }
    ],
    tags: ['dress', 'summer', 'floral', 'casual', 'lightweight'],
    features: [
      'Lightweight fabric',
      'Floral print',
      'Adjustable straps',
      'Side pockets',
      'Machine washable'
    ],
    care: [
      'Machine wash cold',
      'Gentle cycle',
      'Tumble dry low',
      'Iron on low if needed'
    ],
    materials: ['100% Polyester'],
    isNewArrival: false,
    isSale: true,
    isFeatured: true,
    salePercentage: 25,
    rating: { average: 4.7, count: 156 }
  },
  {
    name: 'Premium Hoodie',
    description: 'Ultra-soft premium hoodie perfect for casual wear. Features a comfortable fit and high-quality materials.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'Hoodies',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=700&fit=crop',
        alt: 'Premium Hoodie - Gray',
        isPrimary: true
      }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Gray', hex: '#808080', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Burgundy', hex: '#800020', inStock: true }
    ],
    inventory: [
      { size: 'S', color: 'Gray', quantity: 45, reserved: 0 },
      { size: 'M', color: 'Gray', quantity: 65, reserved: 0 },
      { size: 'L', color: 'Gray', quantity: 80, reserved: 0 },
      { size: 'XL', color: 'Gray', quantity: 65, reserved: 0 },
      { size: 'XXL', color: 'Gray', quantity: 40, reserved: 0 },
      { size: 'S', color: 'Black', quantity: 40, reserved: 0 },
      { size: 'M', color: 'Black', quantity: 60, reserved: 0 },
      { size: 'L', color: 'Black', quantity: 75, reserved: 0 },
      { size: 'XL', color: 'Black', quantity: 60, reserved: 0 },
      { size: 'XXL', color: 'Black', quantity: 35, reserved: 0 },
      { size: 'S', color: 'Navy', quantity: 35, reserved: 0 },
      { size: 'M', color: 'Navy', quantity: 55, reserved: 0 },
      { size: 'L', color: 'Navy', quantity: 70, reserved: 0 },
      { size: 'XL', color: 'Navy', quantity: 55, reserved: 0 },
      { size: 'XXL', color: 'Navy', quantity: 30, reserved: 0 },
      { size: 'S', color: 'Burgundy', quantity: 30, reserved: 0 },
      { size: 'M', color: 'Burgundy', quantity: 50, reserved: 0 },
      { size: 'L', color: 'Burgundy', quantity: 65, reserved: 0 },
      { size: 'XL', color: 'Burgundy', quantity: 50, reserved: 0 },
      { size: 'XXL', color: 'Burgundy', quantity: 25, reserved: 0 }
    ],
    tags: ['hoodie', 'casual', 'comfortable', 'warm', 'premium'],
    features: [
      'Ultra-soft cotton blend',
      'Comfortable fit',
      'Kangaroo pocket',
      'Adjustable hood',
      'Ribbed cuffs and hem'
    ],
    care: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not bleach',
      'Iron on low if needed'
    ],
    materials: ['80% Cotton', '20% Polyester'],
    isNewArrival: true,
    isSale: true,
    isFeatured: true,
    salePercentage: 28,
    rating: { average: 4.5, count: 89 }
  },
  {
    name: 'Classic Polo Shirt',
    description: 'Timeless polo shirt with a modern fit. Perfect for both casual and smart-casual occasions.',
    price: 34.99,
    category: 'Polo Shirts',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=700&fit=crop',
        alt: 'Classic Polo Shirt - White',
        isPrimary: true
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF', inStock: true },
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Red', hex: '#FF0000', inStock: true },
      { name: 'Green', hex: '#008000', inStock: true }
    ],
    inventory: [
      { size: 'XS', color: 'White', quantity: 40, reserved: 0 },
      { size: 'S', color: 'White', quantity: 60, reserved: 0 },
      { size: 'M', color: 'White', quantity: 80, reserved: 0 },
      { size: 'L', color: 'White', quantity: 60, reserved: 0 },
      { size: 'XL', color: 'White', quantity: 40, reserved: 0 },
      { size: 'XXL', color: 'White', quantity: 20, reserved: 0 },
      { size: 'XS', color: 'Navy', quantity: 35, reserved: 0 },
      { size: 'S', color: 'Navy', quantity: 55, reserved: 0 },
      { size: 'M', color: 'Navy', quantity: 75, reserved: 0 },
      { size: 'L', color: 'Navy', quantity: 55, reserved: 0 },
      { size: 'XL', color: 'Navy', quantity: 35, reserved: 0 },
      { size: 'XXL', color: 'Navy', quantity: 15, reserved: 0 },
      { size: 'XS', color: 'Red', quantity: 30, reserved: 0 },
      { size: 'S', color: 'Red', quantity: 50, reserved: 0 },
      { size: 'M', color: 'Red', quantity: 70, reserved: 0 },
      { size: 'L', color: 'Red', quantity: 50, reserved: 0 },
      { size: 'XL', color: 'Red', quantity: 30, reserved: 0 },
      { size: 'XXL', color: 'Red', quantity: 15, reserved: 0 },
      { size: 'XS', color: 'Green', quantity: 25, reserved: 0 },
      { size: 'S', color: 'Green', quantity: 45, reserved: 0 },
      { size: 'M', color: 'Green', quantity: 65, reserved: 0 },
      { size: 'L', color: 'Green', quantity: 45, reserved: 0 },
      { size: 'XL', color: 'Green', quantity: 25, reserved: 0 },
      { size: 'XXL', color: 'Green', quantity: 10, reserved: 0 }
    ],
    tags: ['polo', 'classic', 'smart-casual', 'comfortable', 'versatile'],
    features: [
      'Classic polo design',
      'Breathable fabric',
      'Three-button placket',
      'Ribbed collar',
      'Side vents'
    ],
    care: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not bleach',
      'Iron on low if needed'
    ],
    materials: ['100% Cotton Pique'],
    isNewArrival: false,
    isSale: false,
    isFeatured: true,
    rating: { average: 4.4, count: 112 }
  },
  {
    name: 'Casual Jacket',
    description: 'Stylish casual jacket perfect for layering. Features a modern design with practical details.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Jackets',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=700&fit=crop',
        alt: 'Casual Jacket - Black',
        isPrimary: true
      }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Olive', hex: '#808000', inStock: true },
      { name: 'Brown', hex: '#8B4513', inStock: true }
    ],
    inventory: [
      { size: 'S', color: 'Black', quantity: 30, reserved: 0 },
      { size: 'M', color: 'Black', quantity: 45, reserved: 0 },
      { size: 'L', color: 'Black', quantity: 40, reserved: 0 },
      { size: 'XL', color: 'Black', quantity: 25, reserved: 0 },
      { size: 'S', color: 'Olive', quantity: 25, reserved: 0 },
      { size: 'M', color: 'Olive', quantity: 40, reserved: 0 },
      { size: 'L', color: 'Olive', quantity: 35, reserved: 0 },
      { size: 'XL', color: 'Olive', quantity: 20, reserved: 0 },
      { size: 'S', color: 'Brown', quantity: 20, reserved: 0 },
      { size: 'M', color: 'Brown', quantity: 35, reserved: 0 },
      { size: 'L', color: 'Brown', quantity: 30, reserved: 0 },
      { size: 'XL', color: 'Brown', quantity: 15, reserved: 0 }
    ],
    tags: ['jacket', 'casual', 'layering', 'stylish', 'practical'],
    features: [
      'Modern casual design',
      'Multiple pockets',
      'Adjustable fit',
      'Durable construction',
      'Water-resistant finish'
    ],
    care: [
      'Spot clean only',
      'Do not machine wash',
      'Store in cool, dry place',
      'Professional cleaning recommended'
    ],
    materials: ['100% Polyester'],
    isNewArrival: true,
    isSale: true,
    isFeatured: true,
    salePercentage: 25,
    rating: { average: 4.3, count: 67 }
  },
  {
    name: 'Formal Pants',
    description: 'Elegant formal pants perfect for professional settings. Features a tailored fit and premium fabric.',
    price: 69.99,
    category: 'Pants',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=700&fit=crop',
        alt: 'Formal Pants - Charcoal',
        isPrimary: true
      }
    ],
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: [
      { name: 'Charcoal', hex: '#36454F', inStock: true },
      { name: 'Navy', hex: '#000080', inStock: true },
      { name: 'Black', hex: '#000000', inStock: true }
    ],
    inventory: [
      { size: '28', color: 'Charcoal', quantity: 25, reserved: 0 },
      { size: '30', color: 'Charcoal', quantity: 35, reserved: 0 },
      { size: '32', color: 'Charcoal', quantity: 45, reserved: 0 },
      { size: '34', color: 'Charcoal', quantity: 40, reserved: 0 },
      { size: '36', color: 'Charcoal', quantity: 30, reserved: 0 },
      { size: '38', color: 'Charcoal', quantity: 20, reserved: 0 },
      { size: '40', color: 'Charcoal', quantity: 15, reserved: 0 },
      { size: '28', color: 'Navy', quantity: 20, reserved: 0 },
      { size: '30', color: 'Navy', quantity: 30, reserved: 0 },
      { size: '32', color: 'Navy', quantity: 40, reserved: 0 },
      { size: '34', color: 'Navy', quantity: 35, reserved: 0 },
      { size: '36', color: 'Navy', quantity: 25, reserved: 0 },
      { size: '38', color: 'Navy', quantity: 15, reserved: 0 },
      { size: '40', color: 'Navy', quantity: 10, reserved: 0 },
      { size: '28', color: 'Black', quantity: 15, reserved: 0 },
      { size: '30', color: 'Black', quantity: 25, reserved: 0 },
      { size: '32', color: 'Black', quantity: 35, reserved: 0 },
      { size: '36', color: 'Black', quantity: 20, reserved: 0 },
      { size: '38', color: 'Black', quantity: 10, reserved: 0 },
      { size: '40', color: 'Black', quantity: 5, reserved: 0 }
    ],
    tags: ['pants', 'formal', 'professional', 'tailored', 'premium'],
    features: [
      'Tailored fit design',
      'Premium wool blend',
      'Side pockets',
      'Back pocket',
      'Adjustable waistband'
    ],
    care: [
      'Dry clean only',
      'Store on hanger',
      'Avoid direct sunlight',
      'Professional pressing recommended'
    ],
    materials: ['65% Wool', '35% Polyester'],
    isNewArrival: false,
    isSale: false,
    isFeatured: true,
    rating: { average: 4.6, count: 78 }
  }
];

const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'user',
    phone: '+15551234567',
    addresses: [
      {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      marketing: false,
      sizePreference: 'M',
      favoriteCategories: ['T-Shirts', 'Jeans']
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'user',
    phone: '+15559876543',
    addresses: [
      {
        type: 'home',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      marketing: true,
      sizePreference: 'S',
      favoriteCategories: ['Dresses', 'Blazers']
    }
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stylehub.com',
    password: 'admin123',
    role: 'admin',
    phone: '+15550000000',
    addresses: [
      {
        type: 'work',
        address: '789 Business Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: false,
      marketing: false,
      sizePreference: 'L',
      favoriteCategories: []
    }
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    // Create categories
    console.log('📂 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    // Create products
    console.log('👕 Creating products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);
    
    // Create users
    console.log('👥 Creating users...');
    for (const userData of users) {
      await User.create(userData);
    }
    console.log(`✅ Created ${users.length} users`);
    
    // Update category product counts
    console.log('📊 Updating category product counts...');
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: category.name });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Users: ${users.length}`);
    console.log('\n🔑 Default Admin Account:');
    console.log('   Email: admin@stylehub.com');
    console.log('   Password: admin123');
    console.log('\n🔑 Default User Accounts:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');
    console.log('   Email: jane.smith@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run seed:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase };
