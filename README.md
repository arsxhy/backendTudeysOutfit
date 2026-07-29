# Tudey's Outfit - Backend API

This is the backend repository for **Tudey's Outfit**, a robust REST API providing data, authentication, and payment processing services for the frontend.

## 🚀 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database:** MariaDB / MySQL
- **ORM:** TypeORM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Gateway:** [Xendit](https://www.xendit.co/) (Node SDK v7)

## ✨ Core Features

- 👤 **User Management:** Registration, login, profile management, and JWT validation (Auth Guards).
- 📦 **Products & Catalog:** Full CRUD capabilities for products, categories, and inventory variants.
- 🛒 **Orders & Checkout:** Order creation with price-locking mechanisms and stock deduction constraints.
- 💳 **Payment Integration:** Automated Xendit Invoice generation and webhook handling for asynchronous payment status updates.
- 💖 **Wishlist & Addresses:** API endpoints for managing user shipping addresses and saved items.

## ⚙️ Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_DATABASE=tudeys_outfit
   JWT_SECRET=rahasia_tudeys_outfit
   XENDIT_SECRET_KEY=your_xendit_secret_key
   FRONTEND_URL=http://localhost:3000
   PORT=3001
   ```

3. **Run the application:**
   ```bash
   # development
   npm run start

   # watch mode
   npm run start:dev
   ```

## 🌐 Deployment (Railway / Render)

This backend is designed to be easily hosted on platforms like [Railway](https://railway.app/) or Render.
1. Connect this repository to your Railway account.
2. Provision a MySQL/MariaDB database within Railway.
3. Add the database credentials and all other environment variables into the Railway project settings.
4. Set `FRONTEND_URL` to your Vercel frontend URL to allow CORS.
5. Deploy! Railway will automatically detect NestJS, build, and run the server.
