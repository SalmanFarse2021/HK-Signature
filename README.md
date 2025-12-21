# HK Signature - E-Commerce Platform

A modern, full-stack e-commerce platform for custom signature products, built with React, Node.js, and MongoDB. This platform features a customer-facing storefront, an admin dashboard for store management, and AI-powered custom design capabilities.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**HK Signature** is a comprehensive e-commerce solution designed for selling signature-based products. The platform enables customers to browse products, create custom designs using AI, place orders, and manage their profiles. Administrators can manage products, orders, customers, shipping settings, discounts, and content through a dedicated admin panel.

### Key Highlights

- **Customer Storefront**: Browse products, view details, add to cart, and checkout
- **Custom Design Tool**: AI-powered design generation for personalized products
- **Admin Dashboard**: Complete store management with analytics and insights
- **Secure Authentication**: JWT-based authentication with Google OAuth support
- **Payment Integration**: Stripe and Razorpay payment gateways
- **Email Notifications**: Automated order confirmations and updates
- **Cloud Storage**: Cloudinary integration for image management

---

## ✨ Features

### Customer Features

- **Product Browsing**: View latest collections, bestsellers, and filtered products
- **Product Search**: Advanced search with filters (category, price, etc.)
- **Custom Design**: AI-powered custom product design with image generation
- **Shopping Cart**: Add, remove, and update cart items
- **User Authentication**: Register, login, and Google OAuth integration
- **User Profile**: Manage personal information and view order history
- **Order Tracking**: Track order status and view order details
- **Responsive Design**: Mobile-first, fully responsive UI
- **Newsletter Subscription**: Stay updated with latest products and offers

### Admin Features

- **Dashboard Analytics**: Sales metrics, revenue charts, and key statistics
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View, update, and process customer orders
- **Customer Management**: View customer details and order history
- **Discount & Coupons**: Create and manage promotional codes
- **Shipping Settings**: Configure shipping zones and rates
- **Content Management**: Manage banners, pages, posts, and media
- **User Management**: Manage admin users and permissions

### Technical Features

- **RESTful API**: Well-structured backend API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for handling file uploads
- **Image Processing**: Cloudinary for image storage and optimization
- **Email Service**: Nodemailer for transactional emails
- **PDF Generation**: PDFKit for generating invoices
- **AI Integration**: Google Gemini for chatbot and HuggingFace for image generation
- **Security**: bcrypt password hashing, JWT tokens, input validation

---

## 🛠 Tech Stack

### Frontend (Customer & Admin)

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 4.1.17
- **Animations**: Framer Motion, Motion.js
- **Particles**: tsParticles for visual effects
- **Charts**: Recharts (Admin dashboard)
- **Rich Text Editor**: React Simple WYSIWYG (Admin)
- **HTTP Client**: Axios (Admin)
- **Notifications**: React Toastify

### Backend

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **File Upload**: Multer 2.0.2
- **Cloud Storage**: Cloudinary 2.8.0
- **Email**: Nodemailer 6.9.13
- **Payment**: Stripe 19.3.0, Razorpay 2.9.6
- **AI Services**: Google Gemini AI, HuggingFace Inference
- **PDF Generation**: PDFKit 0.13.0
- **Validation**: Validator 13.15.20
- **Environment**: dotenv 17.2.3

### Development Tools

- **Linting**: ESLint 9.36.0
- **Dev Server**: Nodemon 3.1.10
- **Version Control**: Git

---

## 📁 Project Structure

```
HK_Signature/
├── frontend/                 # Customer-facing storefront
│   ├── src/
│   │   ├── api/             # API integration
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CustomDesign.jsx
│   │   │   └── ...
│   │   ├── context/         # React Context providers
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Collection.jsx
│   │   │   ├── Product.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── PlaceOrder.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyProfile.jsx
│   │   │   └── ...
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── admin/                    # Admin dashboard
│   ├── src/
│   │   ├── components/      # Admin components
│   │   ├── pages/           # Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Admin environment variables
│   └── package.json
│
├── backend/                  # Node.js API server
│   ├── config/              # Configuration files
│   │   ├── mongodb.js       # MongoDB connection
│   │   └── cloudinary.js    # Cloudinary setup
│   ├── controller/          # Route controllers
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── aiController.js
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── adminAuth.js     # Admin authorization
│   │   └── multer.js        # File upload handling
│   ├── models/              # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   ├── couponModel.js
│   │   └── ...
│   ├── routes/              # API routes
│   │   ├── userRoute.js
│   │   ├── productRoute.js
│   │   ├── orderRoute.js
│   │   ├── aiRoute.js
│   │   └── ...
│   ├── services/            # Business logic services
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Environment template
│   ├── server.js            # Express server entry point
│   └── package.json
│
├── .gitignore
└── README.md                 # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

### Required API Keys & Services

You'll need accounts and API keys for the following services:

1. **MongoDB Atlas** - Database hosting
2. **Cloudinary** - Image storage and CDN
3. **Google OAuth** - Social authentication (optional)
4. **Stripe** - Payment processing
5. **Razorpay** - Alternative payment gateway
6. **Google Gemini AI** - AI chatbot and text generation
7. **HuggingFace** - AI image generation
8. **SMTP Service** - Email delivery (Gmail, SendGrid, etc.)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HK_Signature.git
cd HK_Signature
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Admin Dependencies

```bash
cd ../admin
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit `.env` and configure the following variables:

```env
# Server Configuration
PORT=4000
BACKEND_BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
DB_NAME=hk_signature

# Authentication (JWT)
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_SALT_ROUNDS=10

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=no-reply@yourstore.com

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Image Generation
IMAGE_PROVIDER=huggingface
HF_API_KEY=your_huggingface_token
HF_MODEL=black-forest-labs/FLUX.1-dev
```

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Create a `.env` file (if needed for API URL):

```env
VITE_API_URL=http://localhost:4000
```

### Admin Configuration

1. Navigate to the `admin` directory
2. Create/edit `.env` file:

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🏃 Running the Application

### Development Mode

#### 1. Start the Backend Server

```bash
cd backend
npm run server
```

The backend will run on `http://localhost:4000`

#### 2. Start the Frontend (Customer Storefront)

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 3. Start the Admin Dashboard

Open another terminal:

```bash
cd admin
npm run dev
```

The admin panel will run on `http://localhost:5174` (or next available port)

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
npm run preview
```

#### Build Admin

```bash
cd admin
npm run build
npm run preview
```

#### Start Backend in Production

```bash
cd backend
npm start
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/google/callback` | Google OAuth callback |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update user profile | Yes |
| POST | `/user/change-password` | Change password | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get single product | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create order | Yes |
| GET | `/orders` | Get user orders | Yes |
| GET | `/orders/:id` | Get order details | Yes |
| GET | `/orders/all` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |

### AI Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ai/generate-image` | Generate custom design | Yes |
| POST | `/ai/chat` | AI chatbot interaction | No |

### CMS Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cms/banners` | Get banners | No |
| POST | `/cms/banners` | Create banner | Admin |
| GET | `/cms/pages/:slug` | Get page by slug | No |
| POST | `/cms/pages` | Create page | Admin |

### Discount Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/discounts` | Get all coupons | Admin |
| POST | `/discounts` | Create coupon | Admin |
| POST | `/discounts/validate` | Validate coupon code | Yes |

---

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Create a new web service on your platform
2. Connect your GitHub repository
3. Set environment variables from `.env`
4. Deploy the `backend` directory
5. Update `BACKEND_BASE_URL` to your deployed URL

### Frontend Deployment (Vercel/Netlify)

1. Create a new project
2. Connect your GitHub repository
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `frontend`
4. Add environment variable `VITE_API_URL` with your backend URL
5. Deploy

### Admin Deployment (Vercel/Netlify)

1. Create a new project
2. Connect your GitHub repository
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `admin`
4. Add environment variable `VITE_BACKEND_URL` with your backend URL
5. Deploy

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Whitelist your deployment server IPs
3. Create a database user
4. Get connection string and update `MONGODB_URI`

---

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **JWT Secret**: Use a strong, random secret key
- **Password Hashing**: Passwords are hashed using bcrypt with configurable salt rounds
- **Input Validation**: All user inputs are validated and sanitized
- **CORS**: Configure CORS to allow only trusted domains in production
- **Rate Limiting**: Consider implementing rate limiting for API endpoints
- **HTTPS**: Always use HTTPS in production

---

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Run backend tests
cd backend
npm run test

# Run linting
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Use meaningful variable and function names
- Write comments for complex logic
- Keep components small and focused
- Follow React best practices

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**MD Salman Farse**

---

## 🙏 Acknowledgments

- React and Vite teams for excellent development tools
- MongoDB for the robust database solution
- Cloudinary for image management
- Google Gemini and HuggingFace for AI capabilities
- All open-source contributors

---

## 📞 Support

For support, email support@hksignature.com or open an issue in the GitHub repository.

---

## 🗺️ Roadmap

- [ ] Add product reviews and ratings
- [ ] Implement wishlist functionality
- [ ] Add multi-language support
- [ ] Integrate live chat support
- [ ] Add advanced analytics dashboard
- [ ] Implement inventory management
- [ ] Add bulk product import/export
- [ ] Mobile app development (React Native)

---

**Made with ❤️ by MD Salman Farse**
