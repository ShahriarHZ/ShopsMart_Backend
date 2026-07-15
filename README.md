# 🛒 ShopSmart AI — Backend

The backend API for **ShopSmart AI**, a full-stack AI-powered e-commerce platform built with **Node.js, Express, TypeScript, and MongoDB**. The project follows a clean layered architecture (**Controller → Service → Repository → Model**) to ensure scalability, maintainability, and separation of concerns.

## 🌐 Live Links

- **Live API:** https://shopsmart-backend-1-j5zu.onrender.com
- **Frontend Repository:** https://github.com/ShahriarHZ/ShopsMart_Frontend
- **Backend Repository:** https://github.com/ShahriarHZ/ShopsMart_Backend

> ⚠️ This API is hosted on Render's free tier. After periods of inactivity, the server may sleep. The first request can take 30–60 seconds while the server wakes up.

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript (Strict Mode)

### Database
- MongoDB Atlas
- Mongoose

### Authentication & Security
- JWT (Access & Refresh Tokens)
- bcrypt Password Hashing
- Role-Based Access Control (RBAC)
- Helmet
- CORS
- Rate Limiting
- Mongo Sanitization
- XSS Protection

### Payments
- Stripe Checkout

### Media Management
- Cloudinary
- Multer

### Validation
- Zod

### Real-Time Ready
- Socket.IO

---

## ✨ Features

### 🔐 Authentication
- User Registration
- Login & Logout
- Refresh Tokens
- Forgot Password
- Reset Password
- Role-Based Authorization (Customer/Admin)

### 📦 Products
- Full CRUD Operations
- Product Search
- Filtering & Sorting
- Pagination
- Image Uploads
- Related Products

### 🗂 Categories
- Create, Read, Update, Delete
- Parent/Child Category Support

### 🛒 Cart
- Add Items
- Update Quantity
- Remove Items
- Persistent User Cart

### ❤️ Wishlist
- Add/Remove Products
- Move Items to Cart

### 🎟 Coupons
- Percentage Discounts
- Fixed Amount Discounts
- Usage Limits
- Expiration Dates
- Minimum Purchase Requirements

### 💳 Checkout & Payments
- Stripe Checkout Sessions
- Webhook-Based Order Fulfillment
- Client Confirmation Fallback
- Automatic Stock Updates

### 📋 Orders
- Order History
- Status Tracking

Order Lifecycle:

```text
Pending
   ↓
Confirmed
   ↓
Packed
   ↓
Shipped
   ↓
Out For Delivery
   ↓
Delivered
```

Alternative Statuses:

```text
Cancelled
Refunded
```

### ⭐ Reviews & Ratings
- One Review Per User Per Product
- Automatic Rating Aggregation
- Rating Distribution Analytics

### 📊 Admin Dashboard
- Revenue Analytics
- Best Selling Products
- Low Stock Alerts
- Out-of-Stock Monitoring
- Inline Restocking
- Order Management

### 👤 User Profiles
- Update Profile Information
- Avatar Upload
- Change Password

---

## 📁 Project Structure

```text
src/
├── config/          # Environment validation, DB, Cloudinary, Stripe
├── controllers/     # Request handling layer
├── services/        # Business logic
├── repositories/    # Database access layer
├── models/          # Mongoose schemas
├── middleware/      # Auth, validation, uploads, error handling
├── validators/      # Zod schemas
├── routes/          # API routes
├── utils/           # Helpers and shared utilities
├── scripts/         # Seeding and utility scripts
├── app.ts           # Express application setup
└── server.ts        # Entry point
```

---

## ⚙️ Local Development Setup

### Clone Repository

```bash
git clone https://github.com/ShahriarHZ/ShopsMart_Backend.git
cd ShopsMart_Backend
```

### Install Dependencies

```bash
npm install
```

### Environment Configuration

```bash
cp .env.example .env
```

### Run Development Server

```bash
npm run dev
```

Server URL:

```text
http://localhost:5000
```

Health Check:

```http
GET /health
```

---

## 🌱 Database Seeding

### Create Initial Admin

```bash
npm run seed:admin
```

Uses:

```env
ADMIN_EMAIL=admin@shopsmart.ai
ADMIN_PASSWORD=ChangeMe123
```

### Import Sample Products

```bash
npm run seed:products
```

Data Source:

```text
src/data/products.seed.json
```

---
## 📚 API Overview

### Base URL

```http
/api/v1
```

| Resource | Endpoints |
|-----------|-----------|
| Auth | `/auth/register` |
| | `/auth/login` |
| | `/auth/logout` |
| | `/auth/refresh-token` |
| | `/auth/forgot-password` |
| | `/auth/reset-password/:token` |
| Products | `/products` |
| | `/products/slug/:slug` |
| | `/products/:id` |
| Categories | `/categories` |
| Cart | `/cart` |
| | `/cart/items` |
| | `/cart/coupon` |
| Wishlist | `/wishlist/:productId` |
| Checkout | `/checkout/create-session` |
| | `/checkout/confirm-session` |
| | `/checkout/webhook` |
| Orders | `/orders` |
| | `/orders/:id` |
| Reviews | `/products/:productId/reviews` |
| | `/reviews/:id` |
| Coupons | `/coupons` |
| Admin | `/admin/dashboard` |
| | `/admin/orders` |
| Users | `/users/me` |
| | `/users/me/avatar` |
| | `/users/me/password` |

---

## 🚀 Deployment

Hosted on **Render**.

### Build Command

```bash
npm install --include=dev && npm run build
```

### Start Command

```bash
npm start
```

---

## 📄 License

This project was developed as a learning and portfolio project to demonstrate full-stack backend development, scalable architecture, authentication, payment integration, and production-ready API design.

---

### 👨‍💻 Author

**Md. Shahriar Hossain Zisan**

- GitHub: https://github.com/ShahriarHZ
- LinkedIn: https://www.linkedin.com/in/shahriarhossain-zisan/

⭐ If you found this project helpful, consider giving it a star on GitHub.
