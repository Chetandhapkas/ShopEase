import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string; // bcrypt hashed
  role: 'USER' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string; // category id or slug
  gender: 'Men' | 'Women' | 'Unisex';
  price: number;
  originalPrice: number;
  discount: number; // percentage
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  active: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: string;
  active: boolean;
  description: string;
  usageCount: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  houseStreet: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  deliveryCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  carts: Record<string, Cart>; // keyed by userId
  wishlists: Record<string, Wishlist>; // keyed by userId
  coupons: Coupon[];
  orders: Order[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    products: [],
    categories: [],
    carts: {},
    wishlists: {},
    coupons: [],
    orders: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Loaded existing database with ${this.data.products.length} products, ${this.data.users.length} users, ${this.data.orders.length} orders.`);
        return;
      } catch (err) {
        console.error('[Database] Failed to parse db.json, re-seeding default data', err);
      }
    }

    this.seedDefaultData();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Error persisting database to disk:', err);
    }
  }

  private seedDefaultData() {
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const userPasswordHash = bcrypt.hashSync('User@123', 10);

    const initialUsers: User[] = [
      {
        id: 'usr_admin_1',
        fullName: 'ShopEase Admin',
        email: 'admin@shopease.com',
        phone: '+1 (555) 019-2834',
        password: adminPasswordHash,
        role: 'ADMIN',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_demo_1',
        fullName: 'Sarah Jenkins',
        email: 'user@shopease.com',
        phone: '+1 (555) 482-9102',
        password: userPasswordHash,
        role: 'USER',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];

    const initialCategories: Category[] = [
      {
        id: 'cat_men',
        name: "Men's Fashion",
        slug: 'mens-fashion',
        description: 'Tailored suits, urban jackets, premium knitwear and elevated casuals.',
        image: '/src/assets/images/category_men_collection_1793874441796.jpg'
      },
      {
        id: 'cat_women',
        name: "Women's Fashion",
        slug: 'womens-fashion',
        description: 'Contemporary dresses, tailored trench coats, silk separates, and silhouettes.',
        image: '/src/assets/images/category_women_collection_1793874442289.jpg'
      },
      {
        id: 'cat_footwear',
        name: 'Footwear & Shoes',
        slug: 'footwear',
        description: 'Handcrafted leather sneakers, Chelsea boots, and minimalist loafers.',
        image: '/src/assets/images/category_footwear_accessories_1793874442728.jpg'
      },
      {
        id: 'cat_accessories',
        name: 'Accessories & Bags',
        slug: 'accessories',
        description: 'Italian leather totes, chronographs, minimal eyewear, and brass accents.',
        image: '/src/assets/images/special_offer_banner_1793874442423.jpg'
      },
      {
        id: 'cat_electronics',
        name: 'Electronics & Audio',
        slug: 'electronics',
        description: 'Studio-grade noise-cancelling headphones, wireless speakers, and smart chronos.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'cat_lifestyle',
        name: 'Lifestyle & Fragrance',
        slug: 'lifestyle',
        description: 'Bespoke eau de parfum, organic skincare, and curated home fragrances.',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
      }
    ];

    const initialProducts: Product[] = [
      {
        id: 'prod_1',
        name: 'Architectural Trench Coat in Sandstone',
        description: 'Crafted from water-resistant double-woven organic cotton twill. Features raglan sleeves, storm flap, horn buttons, and removable waist belt. Cut in a modern relaxed drape.',
        brand: 'ShopEase Atelier',
        category: 'cat_women',
        gender: 'Women',
        price: 245,
        originalPrice: 350,
        discount: 30,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Sandstone', 'Midnight Navy', 'Charcoal'],
        stockQuantity: 24,
        images: [
          '/src/assets/images/category_women_collection_1793874442289.jpg',
          '/src/assets/images/hero_fashion_banner_1793874440664.jpg'
        ],
        rating: 4.9,
        reviewsCount: 42,
        active: true,
        isTrending: true,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_2',
        name: 'Merino Cable Knit Crewneck',
        description: 'Spun from 100% extra-fine Australian Merino wool with honeycomb cable detailing. Provides exceptional natural thermal regulation and ultra-soft handfeel without bulk.',
        brand: 'Nordic Weave',
        category: 'cat_men',
        gender: 'Men',
        price: 135,
        originalPrice: 180,
        discount: 25,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Oatmeal', 'Navy Heather', 'Olive Green'],
        stockQuantity: 38,
        images: [
          '/src/assets/images/category_men_collection_1793874441796.jpg',
          '/src/assets/images/special_offer_banner_1793874442423.jpg'
        ],
        rating: 4.8,
        reviewsCount: 68,
        active: true,
        isTrending: true,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_3',
        name: 'Handcrafted Heritage Sneaker in Cognac Leather',
        description: 'Full-grain Tuscan calfskin leather upper paired with durable Margom rubber cupsole. Reinforced heel counter, waxed cotton laces, and padded calfskin lining for all-day comfort.',
        brand: 'Lusso Veloce',
        category: 'cat_footwear',
        gender: 'Unisex',
        price: 195,
        originalPrice: 260,
        discount: 25,
        sizes: ['7 US', '8 US', '9 US', '10 US', '11 US', '12 US'],
        colors: ['Cognac Tan', 'Chalk White', 'Obsidian Black'],
        stockQuantity: 18,
        images: [
          '/src/assets/images/category_footwear_accessories_1793874442728.jpg'
        ],
        rating: 4.9,
        reviewsCount: 89,
        active: true,
        isTrending: true,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_4',
        name: 'Full-Grain Structured Leather Shopper Tote',
        description: 'Vegetable-tanned saddle leather tote with gold-finish brass hardware and magnetic snap closure. Includes internal zippered organizer pocket and detachable key lanyard.',
        brand: 'Lusso Veloce',
        category: 'cat_accessories',
        gender: 'Women',
        price: 220,
        originalPrice: 295,
        discount: 25,
        sizes: ['One Size'],
        colors: ['Cognac Brown', 'Noir', 'Burgundy'],
        stockQuantity: 12,
        images: [
          '/src/assets/images/category_footwear_accessories_1793874442728.jpg',
          '/src/assets/images/special_offer_banner_1793874442423.jpg'
        ],
        rating: 4.9,
        reviewsCount: 31,
        active: true,
        isTrending: false,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_5',
        name: 'Bespoke Silk Slip Dress & Overlay',
        description: 'Pure Mulberry silk charmeuse with bias cut construction that gracefully hugs the body. Features delicate adjustable spaghetti straps and French seam finishing throughout.',
        brand: 'ShopEase Atelier',
        category: 'cat_women',
        gender: 'Women',
        price: 185,
        originalPrice: 230,
        discount: 20,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Champagne Pearl', 'Violet Slate', 'Emerald'],
        stockQuantity: 15,
        images: [
          '/src/assets/images/category_women_collection_1793874442289.jpg',
          '/src/assets/images/hero_fashion_banner_1793874440664.jpg'
        ],
        rating: 4.7,
        reviewsCount: 29,
        active: true,
        isTrending: true,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_6',
        name: 'Italian Wool Structured Blazer',
        description: 'Tailored single-breasted blazer woven in Biella, Italy. Half-canvas interior structure with unpadded shoulders for an effortlessly refined drape. Mother-of-pearl buttons.',
        brand: 'Nordic Weave',
        category: 'cat_men',
        gender: 'Men',
        price: 280,
        originalPrice: 380,
        discount: 26,
        sizes: ['38R', '40R', '42R', '44R'],
        colors: ['Navy Blue', 'Forest Green', 'Slate Grey'],
        stockQuantity: 9,
        images: [
          '/src/assets/images/category_men_collection_1793874441796.jpg',
          '/src/assets/images/hero_fashion_banner_1793874440664.jpg'
        ],
        rating: 4.9,
        reviewsCount: 54,
        active: true,
        isTrending: false,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_7',
        name: 'Studio Master Wireless Noise-Cancelling Headphones',
        description: 'Engineered with custom 40mm bio-cellulose drivers, active hybrid noise cancellation with transparency mode, 40-hour battery life, and plush memory foam protein leather earcups.',
        brand: 'Acoustic Labs',
        category: 'cat_electronics',
        gender: 'Unisex',
        price: 299,
        originalPrice: 399,
        discount: 25,
        sizes: ['Standard'],
        colors: ['Matte Black', 'Silver Frost', 'Midnight Navy'],
        stockQuantity: 32,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
        ],
        rating: 4.8,
        reviewsCount: 112,
        active: true,
        isTrending: true,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_8',
        name: 'Velvet Flora Artisan Eau De Parfum',
        description: 'Hand-blended botanical fragrance with opening notes of wild bergamot and pink pepper, blooming into lavender absolute and Bulgarian rose, settling on smoky vetiver and amber.',
        brand: 'Aunora Botanicals',
        category: 'cat_lifestyle',
        gender: 'Unisex',
        price: 110,
        originalPrice: 145,
        discount: 24,
        sizes: ['50ml', '100ml'],
        colors: ['Amber Glass'],
        stockQuantity: 40,
        images: [
          '/src/assets/images/special_offer_banner_1793874442423.jpg'
        ],
        rating: 4.9,
        reviewsCount: 76,
        active: true,
        isTrending: true,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_9',
        name: 'Japanese Selvedge Denim Relaxed Trouser',
        description: '13.5oz Kuroki Mills rope-dyed indigo selvedge denim. Classic five-pocket styling with copper rivets, chainstitched hems, and a comfortable mid-rise straight leg silhouette.',
        brand: 'Nordic Weave',
        category: 'cat_men',
        gender: 'Men',
        price: 165,
        originalPrice: 210,
        discount: 21,
        sizes: ['30', '32', '34', '36'],
        colors: ['Raw Indigo', 'Washed Stone'],
        stockQuantity: 22,
        images: [
          '/src/assets/images/category_men_collection_1793874441796.jpg'
        ],
        rating: 4.6,
        reviewsCount: 38,
        active: true,
        isTrending: false,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_10',
        name: 'Minimalist Titanium Chronometer Watch',
        description: 'Grade 5 aerospace titanium case housing an automatic mechanical movement with 42-hour power reserve. Domed anti-reflective sapphire crystal and quick-release Milanese mesh strap.',
        brand: 'Chronos Precision',
        category: 'cat_accessories',
        gender: 'Unisex',
        price: 360,
        originalPrice: 480,
        discount: 25,
        sizes: ['40mm'],
        colors: ['Titanium Grey', 'Brushed Gold'],
        stockQuantity: 8,
        images: [
          '/src/assets/images/special_offer_banner_1793874442423.jpg'
        ],
        rating: 4.9,
        reviewsCount: 47,
        active: true,
        isTrending: true,
        isNewArrival: false,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_11',
        name: 'Pure Cashmere Relaxed Cardigan in Lilac Dust',
        description: 'Two-ply Mongolian grade-A cashmere knit with gentle ribbed trims and natural horn buttons. Lightweight warmth designed to layer effortlessly in all seasons.',
        brand: 'ShopEase Atelier',
        category: 'cat_women',
        gender: 'Women',
        price: 210,
        originalPrice: 280,
        discount: 25,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Lilac Dust', 'Ivory Cream', 'Heather Charcoal'],
        stockQuantity: 14,
        images: [
          '/src/assets/images/special_offer_banner_1793874442423.jpg',
          '/src/assets/images/hero_fashion_banner_1793874440664.jpg'
        ],
        rating: 4.8,
        reviewsCount: 52,
        active: true,
        isTrending: true,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_12',
        name: 'Minimalist Chelsea Boot in Suede',
        description: 'Water-repellent European calf suede with Goodyear welt construction, elasticated side gussets, woven pull tabs, and crepe rubber outsole for durable cushioned traction.',
        brand: 'Lusso Veloce',
        category: 'cat_footwear',
        gender: 'Men',
        price: 235,
        originalPrice: 310,
        discount: 24,
        sizes: ['8 US', '9 US', '10 US', '11 US', '12 US'],
        colors: ['Sand Suede', 'Dark Chocolate Suede', 'Jet Black'],
        stockQuantity: 16,
        images: [
          '/src/assets/images/category_footwear_accessories_1793874442728.jpg',
          '/src/assets/images/hero_fashion_banner_1793874440664.jpg'
        ],
        rating: 4.7,
        reviewsCount: 39,
        active: true,
        isTrending: false,
        isNewArrival: true,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const initialCoupons: Coupon[] = [
      {
        id: 'coup_1',
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minPurchase: 50,
        maxDiscount: 25,
        expiryDate: '2027-12-31',
        active: true,
        description: '10% OFF on orders above $50 (Max discount $25)',
        usageCount: 14
      },
      {
        id: 'coup_2',
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minPurchase: 120,
        maxDiscount: 60,
        expiryDate: '2027-12-31',
        active: true,
        description: '20% OFF on luxury orders above $120 (Max discount $60)',
        usageCount: 38
      },
      {
        id: 'coup_3',
        code: 'FLAT100',
        discountType: 'FIXED',
        discountValue: 100,
        minPurchase: 300,
        maxDiscount: 100,
        expiryDate: '2027-12-31',
        active: true,
        description: 'Flat $100 OFF on premium cart values above $300',
        usageCount: 9
      },
      {
        id: 'coup_4',
        code: 'SHOP50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minPurchase: 180,
        maxDiscount: 75,
        expiryDate: '2027-12-31',
        active: true,
        description: '50% OFF up to $75 on qualifying orders over $180',
        usageCount: 22
      }
    ];

    const initialOrders: Order[] = [
      {
        id: 'ord_sample_101',
        orderNumber: 'ORD-2026-A948',
        userId: 'usr_demo_1',
        userEmail: 'user@shopease.com',
        userName: 'Sarah Jenkins',
        items: [
          {
            productId: 'prod_1',
            productName: 'Architectural Trench Coat in Sandstone',
            productImage: '/src/assets/images/category_women_collection_1793874442289.jpg',
            price: 245,
            size: 'S',
            color: 'Sandstone',
            quantity: 1,
            subtotal: 245
          },
          {
            productId: 'prod_8',
            productName: 'Velvet Flora Artisan Eau De Parfum',
            productImage: '/src/assets/images/special_offer_banner_1793874442423.jpg',
            price: 110,
            size: '50ml',
            color: 'Amber Glass',
            quantity: 1,
            subtotal: 110
          }
        ],
        shippingAddress: {
          fullName: 'Sarah Jenkins',
          phone: '+1 (555) 482-9102',
          houseStreet: '742 Evergreen Terrace, Apt 4B',
          city: 'Portland',
          state: 'OR',
          pinCode: '97201'
        },
        subtotal: 355,
        couponCode: 'SAVE20',
        couponDiscount: 60,
        deliveryCharge: 0,
        tax: 14.75,
        totalAmount: 309.75,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'ord_sample_102',
        orderNumber: 'ORD-2026-B812',
        userId: 'usr_demo_1',
        userEmail: 'user@shopease.com',
        userName: 'Sarah Jenkins',
        items: [
          {
            productId: 'prod_3',
            productName: 'Handcrafted Heritage Sneaker in Cognac Leather',
            productImage: '/src/assets/images/category_footwear_accessories_1793874442728.jpg',
            price: 195,
            size: '8 US',
            color: 'Cognac Tan',
            quantity: 1,
            subtotal: 195
          }
        ],
        shippingAddress: {
          fullName: 'Sarah Jenkins',
          phone: '+1 (555) 482-9102',
          houseStreet: '742 Evergreen Terrace, Apt 4B',
          city: 'Portland',
          state: 'OR',
          pinCode: '97201'
        },
        subtotal: 195,
        couponCode: 'WELCOME10',
        couponDiscount: 19.5,
        deliveryCharge: 0,
        tax: 8.78,
        totalAmount: 184.28,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'SHIPPED',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];

    this.data = {
      users: initialUsers,
      products: initialProducts,
      categories: initialCategories,
      carts: {
        usr_demo_1: {
          userId: 'usr_demo_1',
          items: [
            {
              productId: 'prod_2',
              size: 'M',
              color: 'Oatmeal',
              quantity: 1,
              addedAt: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        }
      },
      wishlists: {
        usr_demo_1: {
          userId: 'usr_demo_1',
          productIds: ['prod_1', 'prod_4'],
          updatedAt: new Date().toISOString()
        }
      },
      coupons: initialCoupons,
      orders: initialOrders
    };
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public toggleUserStatus(id: string): User | null {
    const user = this.findUserById(id);
    if (!user) return null;
    user.active = !user.active;
    this.save();
    return user;
  }

  // --- Products ---
  public getAllProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...data,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public reduceStock(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (!product || product.stockQuantity < quantity) return false;
    product.stockQuantity -= quantity;
    product.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public restoreStock(productId: string, quantity: number): void {
    const product = this.getProductById(productId);
    if (product) {
      product.stockQuantity += quantity;
      product.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.map(c => ({
      ...c,
      productCount: this.data.products.filter(p => p.category === c.id).length
    }));
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}`
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prevLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Cart ---
  public getCart(userId: string): Cart {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = {
        userId,
        items: [],
        updatedAt: new Date().toISOString()
      };
      this.save();
    }
    return this.data.carts[userId];
  }

  public addToCart(userId: string, item: { productId: string; size?: string; color?: string; quantity: number }): Cart {
    const cart = this.getCart(userId);
    const existingIndex = cart.items.findIndex(
      i => i.productId === item.productId && i.size === item.size && i.color === item.color
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      cart.items.push({
        ...item,
        addedAt: new Date().toISOString()
      });
    }

    cart.updatedAt = new Date().toISOString();
    this.save();
    return cart;
  }

  public updateCartItem(userId: string, productId: string, quantity: number, size?: string, color?: string): Cart {
    const cart = this.getCart(userId);
    if (quantity <= 0) {
      cart.items = cart.items.filter(
        i => !(i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true))
      );
    } else {
      const item = cart.items.find(
        i => i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true)
      );
      if (item) {
        item.quantity = quantity;
      }
    }
    cart.updatedAt = new Date().toISOString();
    this.save();
    return cart;
  }

  public removeCartItem(userId: string, productId: string, size?: string, color?: string): Cart {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(
      i => !(i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true))
    );
    cart.updatedAt = new Date().toISOString();
    this.save();
    return cart;
  }

  public clearCart(userId: string): void {
    if (this.data.carts[userId]) {
      this.data.carts[userId].items = [];
      this.data.carts[userId].updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Wishlist ---
  public getWishlist(userId: string): Wishlist {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = {
        userId,
        productIds: [],
        updatedAt: new Date().toISOString()
      };
      this.save();
    }
    return this.data.wishlists[userId];
  }

  public toggleWishlist(userId: string, productId: string): { wishlist: Wishlist; added: boolean } {
    const wishlist = this.getWishlist(userId);
    const index = wishlist.productIds.indexOf(productId);
    let added = false;

    if (index > -1) {
      wishlist.productIds.splice(index, 1);
      added = false;
    } else {
      wishlist.productIds.push(productId);
      added = true;
    }

    wishlist.updatedAt = new Date().toISOString();
    this.save();
    return { wishlist, added };
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup_${Date.now()}`,
      usageCount: 0
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  public deleteCoupon(id: string): boolean {
    const prev = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    if (this.data.coupons.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  public incrementCouponUsage(code: string): void {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.usageCount += 1;
      this.save();
    }
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['orderStatus']): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;

    // If cancelling, restore stock
    if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        this.restoreStock(item.productId, item.quantity);
      }
    }

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }
}

export const db = new Database();
