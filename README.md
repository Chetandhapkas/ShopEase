# ShopEase – Full-Stack E-Commerce Platform

A production-grade, college-level full-stack fashion and lifestyle e-commerce web platform engineered with modern full-stack architecture, role-based authorization, atomic inventory decrementing, and real-time coupon validation.

---

## 1. Project Overview & Architecture

### System Architecture
```
                  ┌────────────────────────────────────────┐
                  │          React 19 SPA (Vite)           │
                  │  (Tailwind CSS v4, Lucide, Axios)       │
                  └──────────────────┬─────────────────────┘
                                     │
                        REST APIs (/api/*) + JWT
                                     │
        ┌────────────────────────────┴───────────────────────────┐
        │                                                        │
┌───────▼──────────────────────┐             ┌───────────────────▼─────────────────────┐
│  Live Dev Environment        │             │  Production Java Spring Boot 3 Engine   │
│  Full-Stack Node/Express API │             │  (Spring Web, Spring Data, Security)    │
│  BCrypt Hashing & DB Engine  │             │  MongoDB Atlas Driver & BCrypt Encoder  │
└──────────────┬───────────────┘             └───────────────────┬─────────────────────┘
               │                                                 │
               ▼                                                 ▼
     ┌──────────────────┐                              ┌───────────────────┐
     │  data/db.json    │                              │   MongoDB Atlas   │
     │  Local Document  │                              │   Cloud Database  │
     │  Store & Seed    │                              │   (shopeasedb)    │
     └──────────────────┘                              └───────────────────┘
```

---

## 2. Evaluation Demonstration Credentials

### Pre-configured Accounts (Ready to Test)
| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@shopease.com` | `Admin@123` | Full Admin Console, CRUD Products, Order Status, Inventory Monitor, User Controls |
| **USER** | `user@shopease.com` | `User@123` | Browsing, Cart, Wishlist, Multi-Payment Checkout, Order Tracking & Cancellation |

> **Secure Admin Registration Key**: To create a brand new administrator from the registration screen, expand *"Create with Admin Privileges"* and enter secret key: `SHOPEASE_SUPER_ADMIN_2026`.

### Active Promotional Coupons
- `WELCOME10`: 10% OFF on orders over $50 (Max discount $25)
- `SAVE20`: 20% OFF on luxury orders over $120 (Max discount $60)
- `FLAT100`: Flat $100 OFF on cart totals over $300
- `SHOP50`: 50% OFF up to $75 on qualifying orders over $180

---

## 3. Key Implemented Features

1. **Top Bar Contract & Navigation**:
   - Clean 3-zone header: Wordmark brand, single-line navigation links, search, wishlist & cart counter badges, user profile dropdown.
2. **Catalog Search & Multi-Faceted Filters**:
   - Search across title, brand, description, and keywords.
   - Combined filters: Department/Category, Gender, Price Range ($), Size, Brand, In-Stock Only.
   - Dynamic sorting: Price Low to High, High to Low, Rating, Popularity, Newest First.
   - Real-time result counter and zero-result empty state.
3. **Cart & Dynamic Pricing Engine**:
   - Stock limit checks (cannot add more than available inventory).
   - Quantity stepper and variant preservation.
   - Server-validated coupons: Disallows expired coupons or subtotal under minimum threshold; clamps to maximum discount.
   - Automatic calculations: Subtotal, coupon discount, free delivery over $150 (otherwise $15), 5% tax, final payable amount.
4. **Checkout & Order Management**:
   - Step 1: Delivery Address (with demo autofill helper).
   - Step 2: Payment Simulation: Cash on Delivery (COD), UPI Instant Simulation, Credit/Debit Card, Net Banking.
   - Step 3: Atomic stock reduction in database upon order placement.
   - Order receipt generation with milestone progress tracking: `PLACED` $\to$ `CONFIRMED` $\to$ `SHIPPED` $\to$ `DELIVERED` $\to$ `CANCELLED`.
   - Customer Order Cancellation: Immediately restores reserved inventory in the database.
5. **Role-Based Admin Console (`/admin`)**:
   - Restricted route: non-admin accounts receive HTTP 403 Forbidden.
   - Overview KPI cards: Total Revenue, Total Orders, Pending Orders, Catalog Count, Low Stock Alerts, Total Users.
   - Manage Products: Full CRUD modal, price, discount, sizes, colors, images, and stock editing.
   - Manage Categories: Add/Delete department categories.
   - Manage Coupons: Add custom discount rules, expiration date, min purchase.
   - Manage Orders: Real-time status update dropdown (updates customer storefront immediately).
   - Inventory Management: Filter low stock items (< 10 units) with "+25 Units Quick Restock".
   - User Management: View registered accounts and suspend/activate toggles.

---

## 4. Running the Application

### A. Live Sandbox Environment (Already Running)
The current workspace runs the full-stack server on port 3000 (`server.ts` mounting REST API routes + Vite dev middleware).
```bash
npm run dev
```

### B. Java Spring Boot & MongoDB Atlas Backend
To run the enterprise Java backend in any standard Java 17+ environment:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your MongoDB Atlas connection URI in `src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopeasedb?retryWrites=true&w=majority
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   mvn clean spring-boot:run
   ```
4. Or build an executable JAR:
   ```bash
   mvn clean package
   java -jar target/shopease-backend-1.0.0.jar
   ```

### C. Seed Data Import
Sample documents for MongoDB Atlas are available in `backend/src/main/resources/mongodb-seed.json`.

---

## 5. REST API Specification

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register with BCrypt password hashing & optional admin secret |
| `/api/auth/login` | `POST` | Public | Authenticate user & return signed JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile and role |
| `/api/products` | `GET` | Public | Query products with multi-filter, search, and pagination |
| `/api/products/:id` | `GET` | Public | Fetch product details by ID |
| `/api/products` | `POST` | Admin | Create product in database |
| `/api/products/:id` | `PUT` | Admin | Update product details or stock |
| `/api/products/:id` | `DELETE` | Admin | Delete product from database |
| `/api/cart` | `GET` | User | Get current user's cart populated with live prices & stock |
| `/api/cart/add` | `POST` | User | Add variant to cart with stock validation |
| `/api/cart/update` | `PUT` | User | Update item quantity |
| `/api/cart/remove/:productId` | `DELETE` | User | Remove item from cart |
| `/api/coupons` | `GET` | Public | List active coupons |
| `/api/coupons/validate` | `POST` | Public | Server-side validation of coupon eligibility & discount calculation |
| `/api/orders/checkout` | `POST` | User | Atomic checkout, inventory deduction, order receipt creation |
| `/api/orders/my-orders` | `GET` | User | Retrieve current user's past orders |
| `/api/orders/:id/cancel` | `PUT` | User/Admin | Cancel order and restore stock in database |
| `/api/admin/dashboard` | `GET` | Admin | Aggregate dashboard KPIs and revenue statistics |
| `/api/admin/users` | `GET` | Admin | Manage users and view order counts |
| `/api/admin/users/:id/toggle-status` | `PUT` | Admin | Toggle account suspension |
| `/api/admin/orders/:id/status` | `PUT` | Admin | Update order milestone status (`CONFIRMED`, `SHIPPED`, etc.) |

---

## 6. Evaluation Verification Checklist
- [x] User registration & login with BCrypt password hashing
- [x] Admin vs User role-based authorization
- [x] Protected `/admin` route blocking unauthorized URLs
- [x] Product listing with real-time multi-filter and keyword search
- [x] Shopping cart with stock limits and duplicate prevention
- [x] Server-validated coupon discount engine
- [x] Complete checkout with delivery address and payment simulation (COD, UPI, Card)
- [x] Atomic inventory reduction upon purchase and restoration upon cancellation
- [x] Order history with status tracking milestones
- [x] Full Admin CRUD operations immediately reflected on customer catalog
- [x] Complete Java Spring Boot 3 + Spring Data MongoDB Atlas project repository in `/backend`
- [x] Responsive layout across desktop, tablet, and mobile devices
