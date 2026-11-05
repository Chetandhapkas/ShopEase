import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, Product, Coupon, OrderItem } from './server/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ADMIN_INIT_SECRET = process.env.ADMIN_INIT_SECRET || 'SHOPEASE_SUPER_ADMIN_2026';

app.use(express.json());

// Simple JWT / Token handler
function generateToken(userId: string, role: string) {
  const payload = { userId, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.exp && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    active: boolean;
  };
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = decodeToken(token);
  if (!decoded) {
    res.status(401).json({ message: 'Invalid or expired authentication token' });
    return;
  }

  const user = db.findUserById(decoded.userId);
  if (!user || !user.active) {
    res.status(401).json({ message: 'User account not found or suspended' });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    active: user.active
  };

  next();
};

const adminOnlyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied: Admin role required' });
      return;
    }
    next();
  });
};

// ==========================================
// 1. AUTHENTICATION APIS
// ==========================================
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, confirmPassword, adminSecretKey } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Full name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email address already exists' });
      return;
    }

    // Role check: Only assign ADMIN if secure setup secret key matches
    let role: 'USER' | 'ADMIN' = 'USER';
    if (adminSecretKey) {
      if (adminSecretKey === ADMIN_INIT_SECRET) {
        role = 'ADMIN';
      } else {
        res.status(403).json({ message: 'Invalid admin initialization secret key' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role,
      active: true
    });

    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal registration error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.active) {
      res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login error' });
  }
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

// ==========================================
// 2. PRODUCTS APIS
// ==========================================
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      size,
      brand,
      inStock,
      sort,
      trending,
      newArrivals,
      page = '1',
      limit = '20'
    } = req.query;

    let products = db.getAllProducts();

    // Only active products for general storefront unless specified
    products = products.filter(p => p.active !== false);

    // Filter by search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // Filter by gender
    if (gender && typeof gender === 'string' && gender !== 'all') {
      products = products.filter(p => p.gender === gender || p.gender === 'Unisex');
    }

    // Filter by brand
    if (brand && typeof brand === 'string' && brand !== 'all') {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    // Filter by size
    if (size && typeof size === 'string') {
      products = products.filter(p => p.sizes.includes(size));
    }

    // Filter by price range
    if (minPrice && !isNaN(Number(minPrice))) {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // Filter by in-stock
    if (inStock === 'true') {
      products = products.filter(p => p.stockQuantity > 0);
    }

    // Trending flag
    if (trending === 'true') {
      products = products.filter(p => p.isTrending);
    }

    // New arrivals flag
    if (newArrivals === 'true') {
      products = products.filter(p => p.isNewArrival);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        products.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.max(1, parseInt(limit as string));
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.status(200).json(product);
});

app.post('/api/products', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      gender,
      price,
      originalPrice,
      discount,
      sizes,
      colors,
      stockQuantity,
      images,
      rating = 4.8,
      active = true,
      isTrending = false,
      isNewArrival = true
    } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ message: 'Name, price, and category are required' });
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : parsedPrice;
    const calculatedDiscount = discount
      ? parseInt(discount)
      : parsedOriginalPrice > parsedPrice
      ? Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100)
      : 0;

    const newProduct = db.createProduct({
      name: name.trim(),
      description: description || '',
      brand: brand ? brand.trim() : 'ShopEase Collection',
      category,
      gender: gender || 'Unisex',
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      discount: calculatedDiscount,
      sizes: Array.isArray(sizes) ? sizes : sizes ? [sizes] : ['Standard'],
      colors: Array.isArray(colors) ? colors : colors ? [colors] : ['Default'],
      stockQuantity: stockQuantity ? parseInt(stockQuantity) : 10,
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/category_men_collection_1793874441796.jpg'],
      rating: typeof rating === 'number' ? rating : 4.8,
      reviewsCount: 1,
      active: active !== false,
      isTrending: !!isTrending,
      isNewArrival: !!isNewArrival
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
});

app.put('/api/products/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
});

app.delete('/api/products/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.status(200).json({ message: 'Product deleted successfully' });
});

// ==========================================
// 3. CATEGORIES APIS
// ==========================================
app.get('/api/categories', (_req: Request, res: Response) => {
  res.status(200).json(db.getCategories());
});

app.post('/api/categories', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, description, image } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: 'Name and slug are required' });
    return;
  }
  const created = db.createCategory({ name, slug, description: description || '', image: image || '' });
  res.status(201).json(created);
});

app.put('/api/categories/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.status(200).json(updated);
});

app.delete('/api/categories/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteCategory(req.params.id);
  if (!ok) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.status(200).json({ message: 'Category deleted successfully' });
});

// ==========================================
// 4. CART APIS
// ==========================================
app.get('/api/cart', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const cart = db.getCart(req.user!.id);
  // Populate items with latest product prices and stock availability
  const populatedItems = cart.items.map(item => {
    const product = db.getProductById(item.productId);
    return {
      ...item,
      product: product || null,
      subtotal: product ? product.price * item.quantity : 0,
      inStock: product ? product.stockQuantity >= item.quantity : false
    };
  }).filter(item => item.product !== null);

  const subtotal = populatedItems.reduce((acc, i) => acc + i.subtotal, 0);

  res.status(200).json({
    userId: cart.userId,
    items: populatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    totalItems: populatedItems.reduce((acc, i) => acc + i.quantity, 0)
  });
});

app.post('/api/cart/add', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const product = db.getProductById(productId);
    if (!product || !product.active) {
      res.status(404).json({ message: 'Product is unavailable' });
      return;
    }

    if (product.stockQuantity < 1) {
      res.status(400).json({ message: 'Product is currently out of stock' });
      return;
    }

    const cart = db.getCart(req.user!.id);
    const existing = cart.items.find(
      i => i.productId === productId && i.size === size && i.color === color
    );

    const totalRequested = (existing ? existing.quantity : 0) + quantity;
    if (totalRequested > product.stockQuantity) {
      res.status(400).json({
        message: `Only ${product.stockQuantity} items in stock. You cannot add more.`
      });
      return;
    }

    const updatedCart = db.addToCart(req.user!.id, {
      productId,
      size,
      color,
      quantity
    });

    res.status(200).json({ message: 'Item added to cart', cart: updatedCart });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error adding to cart' });
  }
});

app.put('/api/cart/update', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity, size, color } = req.body;
  if (!productId || typeof quantity !== 'number') {
    res.status(400).json({ message: 'Product ID and quantity are required' });
    return;
  }

  const product = db.getProductById(productId);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  if (quantity > product.stockQuantity) {
    res.status(400).json({
      message: `Cannot update quantity to ${quantity}. Only ${product.stockQuantity} available.`
    });
    return;
  }

  const updatedCart = db.updateCartItem(req.user!.id, productId, quantity, size, color);
  res.status(200).json({ message: 'Cart updated', cart: updatedCart });
});

app.delete('/api/cart/remove/:productId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { size, color } = req.query;
  const updatedCart = db.removeCartItem(
    req.user!.id,
    req.params.productId,
    typeof size === 'string' ? size : undefined,
    typeof color === 'string' ? color : undefined
  );
  res.status(200).json({ message: 'Item removed from cart', cart: updatedCart });
});

app.delete('/api/cart/clear', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.clearCart(req.user!.id);
  res.status(200).json({ message: 'Cart cleared' });
});

// ==========================================
// 5. WISHLIST APIS
// ==========================================
app.get('/api/wishlist', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const wishlist = db.getWishlist(req.user!.id);
  const products = wishlist.productIds
    .map(id => db.getProductById(id))
    .filter((p): p is Product => p !== undefined && p.active !== false);

  res.status(200).json({
    userId: wishlist.userId,
    products,
    totalCount: products.length
  });
});

app.post('/api/wishlist/toggle', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ message: 'Product ID is required' });
    return;
  }

  const result = db.toggleWishlist(req.user!.id, productId);
  res.status(200).json({
    message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
    added: result.added,
    wishlist: result.wishlist
  });
});

app.post('/api/wishlist/add', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  const wishlist = db.getWishlist(req.user!.id);
  if (!wishlist.productIds.includes(productId)) {
    wishlist.productIds.push(productId);
    db.save();
  }
  res.status(200).json({ message: 'Added to wishlist', wishlist });
});

app.delete('/api/wishlist/remove/:productId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const wishlist = db.getWishlist(req.user!.id);
  wishlist.productIds = wishlist.productIds.filter(id => id !== req.params.productId);
  db.save();
  res.status(200).json({ message: 'Removed from wishlist', wishlist });
});

// ==========================================
// 6. COUPON APIS
// ==========================================
app.get('/api/coupons', (_req: Request, res: Response) => {
  const coupons = db.getCoupons().filter(c => c.active);
  res.status(200).json(coupons);
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    res.status(400).json({ message: 'Coupon code is required' });
    return;
  }

  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    res.status(404).json({ message: 'Invalid or inactive coupon code' });
    return;
  }

  if (new Date(coupon.expiryDate).getTime() < Date.now()) {
    res.status(400).json({ message: 'This coupon has expired' });
    return;
  }

  const subtotal = typeof cartSubtotal === 'number' ? cartSubtotal : 0;
  if (subtotal < coupon.minPurchase) {
    res.status(400).json({
      message: `Minimum order value of $${coupon.minPurchase} required to use coupon "${coupon.code}". (Current cart: $${subtotal})`
    });
    return;
  }

  let calculatedDiscount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    calculatedDiscount = (subtotal * coupon.discountValue) / 100;
  } else {
    calculatedDiscount = coupon.discountValue;
  }

  // Enforce server-side maximum discount clamp
  if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
    calculatedDiscount = coupon.maxDiscount;
  }

  calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

  res.status(200).json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discountAmount: calculatedDiscount,
    coupon
  });
});

app.post('/api/coupons', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, discountValue, minPurchase, maxDiscount, expiryDate, description, active } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    res.status(400).json({ message: 'Code, discount type, and discount value are required' });
    return;
  }
  const created = db.createCoupon({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue: parseFloat(discountValue),
    minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : 100,
    expiryDate: expiryDate || '2027-12-31',
    active: active !== false,
    description: description || ''
  });
  res.status(201).json(created);
});

app.put('/api/coupons/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Coupon not found' });
    return;
  }
  res.status(200).json(updated);
});

app.delete('/api/coupons/:id', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteCoupon(req.params.id);
  if (!ok) {
    res.status(404).json({ message: 'Coupon not found' });
    return;
  }
  res.status(200).json({ message: 'Coupon deleted' });
});

// ==========================================
// 7. ORDER APIS
// ==========================================
app.post('/api/orders/checkout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shippingAddress, paymentMethod = 'COD', couponCode } = req.body;
    const user = req.user!;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.houseStreet || !shippingAddress.city || !shippingAddress.pinCode) {
      res.status(400).json({ message: 'Complete delivery address is required' });
      return;
    }

    const cart = db.getCart(user.id);
    if (!cart.items || cart.items.length === 0) {
      res.status(400).json({ message: 'Your shopping cart is empty' });
      return;
    }

    // Server-side inventory & price verification
    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of cart.items) {
      const product = db.getProductById(item.productId);
      if (!product || !product.active) {
        res.status(400).json({ message: `Product ${item.productId} is no longer available` });
        return;
      }

      if (product.stockQuantity < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.`
        });
        return;
      }

      const itemSubtotal = product.price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '',
        price: product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Coupon calculation on server
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && coupon.active && new Date(coupon.expiryDate).getTime() >= Date.now() && calculatedSubtotal >= coupon.minPurchase) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
        } else {
          couponDiscount = coupon.discountValue;
        }
        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
          couponDiscount = coupon.maxDiscount;
        }
        db.incrementCouponUsage(coupon.code);
      }
    }

    couponDiscount = Math.round(couponDiscount * 100) / 100;

    // Free delivery above $150, else $15
    const deliveryCharge = calculatedSubtotal > 150 ? 0 : 15;
    const taxableAmount = Math.max(0, calculatedSubtotal - couponDiscount);
    const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% tax
    const totalAmount = Math.round((taxableAmount + deliveryCharge + tax) * 100) / 100;

    // Atomically reduce stock in DB
    for (const item of orderItems) {
      db.reduceStock(item.productId, item.quantity);
    }

    // Payment simulation status
    let paymentStatus: 'PENDING' | 'PAID' = 'PENDING';
    if (paymentMethod === 'UPI' || paymentMethod === 'CARD' || paymentMethod === 'NET_BANKING') {
      paymentStatus = 'PAID';
    }

    // Create Order
    const order = db.createOrder({
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      items: orderItems,
      shippingAddress,
      subtotal: calculatedSubtotal,
      couponCode: couponCode || undefined,
      couponDiscount,
      deliveryCharge,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: 'PLACED'
    });

    // Clear user cart
    db.clearCart(user.id);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing checkout' });
  }
});

app.get('/api/orders/my-orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrdersByUserId(req.user!.id);
  res.status(200).json(orders);
});

app.get('/api/orders/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  // Non-admins can only view their own orders
  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden: You cannot access this order' });
    return;
  }

  res.status(200).json(order);
});

app.put('/api/orders/:id/cancel', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  if (order.orderStatus === 'DELIVERED') {
    res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
    return;
  }

  if (order.orderStatus === 'CANCELLED') {
    res.status(400).json({ message: 'Order is already cancelled' });
    return;
  }

  const updated = db.updateOrderStatus(order.id, 'CANCELLED');
  res.status(200).json({ message: 'Order cancelled successfully', order: updated });
});

// ==========================================
// 8. ADMIN APIS
// ==========================================
app.get('/api/admin/dashboard', adminOnlyMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.getAllProducts();
    const users = db.getAllUsers();
    const orders = db.getOrders();

    const totalProducts = products.length;
    const totalUsers = users.length;
    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const lowStockProducts = products.filter(p => p.stockQuantity < 10);
    const pendingOrders = orders.filter(o => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED');

    const recentOrders = orders.slice(0, 6);

    res.status(200).json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      lowStockProductsCount: lowStockProducts.length,
      pendingOrdersCount: pendingOrders.length,
      lowStockProducts,
      recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error compiling admin stats' });
  }
});

app.get('/api/admin/users', adminOnlyMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers().map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    ordersCount: db.getOrdersByUserId(u.id).length
  }));
  res.status(200).json(users);
});

app.put('/api/admin/users/:id/toggle-status', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.toggleUserStatus(req.params.id);
  if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.status(200).json({
    message: `User is now ${updated.active ? 'active' : 'suspended'}`,
    user: updated
  });
});

app.get('/api/admin/orders', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;
  let orders = db.getOrders();
  if (status && typeof status === 'string' && status !== 'ALL') {
    orders = orders.filter(o => o.orderStatus === status);
  }
  res.status(200).json(orders);
});

app.put('/api/admin/orders/:id/status', adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const allowed = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    return;
  }

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  res.status(200).json({ message: 'Order status updated', order: updated });
});

// ==========================================
// VITE & FRONTEND MOUNTING
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopEase Server] Running full-stack on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[ShopEase Server] Fatal initialization error:', err);
});
