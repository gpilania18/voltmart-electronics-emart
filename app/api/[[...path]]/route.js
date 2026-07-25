import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PRODUCTS, CATEGORIES, BRANDS } from '@/lib/data/catalog';
import { signJWT, verifyJWT, hashPassword, verifyPassword, requireAuth, otp6 } from '@/lib/auth';
import { parseQuery } from '@/lib/aiSearch';
import { v4 as uuid } from 'uuid';

const json = (data, init) => NextResponse.json(data, init);
const err = (msg, code = 400) => NextResponse.json({ error: msg }, { status: code });

const clone = (arr) => arr.map(o => JSON.parse(JSON.stringify(o)));

async function ensureSeed() {
  const db = await getDb();
  if (await db.collection('products').countDocuments() === 0) {
    await db.collection('products').insertMany(clone(PRODUCTS));
    try { await db.collection('products').createIndex({ name: 'text', short: 'text', description: 'text' }); } catch {}
  }
  if (await db.collection('categories').countDocuments() === 0) await db.collection('categories').insertMany(clone(CATEGORIES));
  if (await db.collection('brands').countDocuments() === 0) await db.collection('brands').insertMany(clone(BRANDS));
  if (await db.collection('coupons').countDocuments() === 0) {
    await db.collection('coupons').insertMany([
      { code: 'WELCOME10', type: 'percent', value: 10, minAmount: 0, maxDiscount: 500, active: true, description: '10% off for new customers' },
      { code: 'FLAT100', type: 'flat', value: 100, minAmount: 999, maxDiscount: 100, active: true, description: '₹100 off on orders above ₹999' },
      { code: 'MEGA20', type: 'percent', value: 20, minAmount: 5000, maxDiscount: 2000, active: true, description: '20% off on orders above ₹5000' },
    ]);
  }
  if (!(await db.collection('users').findOne({ email: 'admin@voltmart.com' }))) {
    await db.collection('users').insertOne({ id: 'admin-1', email: 'admin@voltmart.com', name: 'VoltMart Admin', password: hashPassword('admin123'), role: 'admin', verified: true, createdAt: new Date() });
  }
  return db;
}

const getUser = async (db, request) => {
  const p = requireAuth(request);
  if (!p) return null;
  return db.collection('users').findOne({ id: p.sub }, { projection: { password: 0 } });
};

async function handle(request, params) {
  const parts = (await params).path || [];
  const url = new URL(request.url);
  const q = url.searchParams;
  const method = request.method;
  const db = await ensureSeed();

  // -------- PUBLIC --------
  if (parts.length === 0 || parts[0] === 'health') return json({ ok: true, service: 'voltmart-api', time: new Date().toISOString() });

  if (parts[0] === 'seed' && method === 'GET') {
    await Promise.all(['products', 'categories', 'brands', 'coupons'].map(c => db.collection(c).deleteMany({})));
    await db.collection('products').insertMany(PRODUCTS);
    await db.collection('categories').insertMany(CATEGORIES);
    await db.collection('brands').insertMany(BRANDS);
    return json({ seeded: true, products: PRODUCTS.length });
  }

  if (parts[0] === 'categories') return json({ categories: await db.collection('categories').find({}, { projection: { _id: 0 } }).toArray() });
  if (parts[0] === 'brands') return json({ brands: await db.collection('brands').find({}, { projection: { _id: 0 } }).toArray() });

  if (parts[0] === 'products') {
    if (parts[1] && method === 'GET') {
      const product = await db.collection('products').findOne({ slug: parts[1] }, { projection: { _id: 0 } });
      if (!product) return err('Product not found', 404);
      const related = await db.collection('products').find({ category: product.category, slug: { $ne: product.slug } }, { projection: { _id: 0 } }).limit(8).toArray();
      return json({ product, related });
    }
    if (method === 'GET') return listProducts(db, q);
  }

  if (parts[0] === 'ai-search' && method === 'POST') {
    const { query = '' } = await request.json().catch(() => ({}));
    const parsed = parseQuery(query);
    const filter = {};
    if (parsed.filter.category) filter.category = parsed.filter.category;
    if (parsed.filter.brand) filter.brand = parsed.filter.brand;
    if (parsed.filter.deal) filter.deal = true;
    if (parsed.filter.minPrice || parsed.filter.maxPrice) filter.price = { $gte: parsed.filter.minPrice || 0, $lte: parsed.filter.maxPrice || 9999999 };
    if (parsed.keywords.length && !filter.category && !filter.brand) {
      filter.$or = parsed.keywords.map(k => ({ $or: [{ name: new RegExp(k, 'i') }, { short: new RegExp(k, 'i') }] }));
    }
    const sortMap = { 'price-low': { price: 1 }, 'price-high': { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
    const sort = sortMap[parsed.filter._sort] || { sold: -1 };
    const products = await db.collection('products').find(filter, { projection: { _id: 0 } }).sort(sort).limit(24).toArray();
    return json({ products, parsed, summary: parsed.summary });
  }

  if (parts[0] === 'search' && parts[1] === 'suggest' && method === 'GET') {
    const term = (q.get('q') || '').trim();
    if (!term) return json({ suggestions: [], categories: [] });
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const items = await db.collection('products').find({ $or: [{ name: rx }, { short: rx }, { sku: rx }] }, { projection: { _id: 0, name: 1, slug: 1, image: 1, price: 1, category: 1 } }).limit(8).toArray();
    const cats = await db.collection('categories').find({ name: rx }, { projection: { _id: 0, name: 1, slug: 1 } }).limit(4).toArray();
    return json({ suggestions: items, categories: cats });
  }

  if (parts[0] === 'newsletter' && method === 'POST') {
    const { email } = await request.json().catch(() => ({}));
    const em = (email || '').trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return err('Invalid email');
    await db.collection('newsletter').updateOne({ email: em }, { $set: { email: em, at: new Date() } }, { upsert: true });
    return json({ ok: true });
  }

  if (parts[0] === 'coupons' && parts[1] === 'validate' && method === 'POST') {
    const { code, subtotal = 0 } = await request.json().catch(() => ({}));
    const c = await db.collection('coupons').findOne({ code: (code || '').toUpperCase(), active: true }, { projection: { _id: 0 } });
    if (!c) return err('Invalid coupon');
    if (subtotal < c.minAmount) return err(`Minimum order ₹${c.minAmount} required`);
    const discount = c.type === 'percent' ? Math.min(Math.round(subtotal * c.value / 100), c.maxDiscount) : c.value;
    return json({ coupon: c, discount });
  }

  // -------- AUTH --------
  if (parts[0] === 'auth') {
    if (parts[1] === 'register' && method === 'POST') {
      const { name, email, password } = await request.json().catch(() => ({}));
      if (!email || !password || !name) return err('All fields required');
      const em = email.trim().toLowerCase();
      if (await db.collection('users').findOne({ email: em })) return err('Email already registered');
      const otp = otp6();
      const user = { id: uuid(), name, email: em, password: hashPassword(password), role: 'user', verified: false, otp, otpExpires: Date.now() + 10 * 60 * 1000, createdAt: new Date() };
      await db.collection('users').insertOne(user);
      // MOCKED: In production send OTP via nodemailer. Returning in dev for demo.
      return json({ ok: true, message: 'OTP sent to email', devOtp: otp, email: em });
    }
    if (parts[1] === 'verify-otp' && method === 'POST') {
      const { email, otp } = await request.json().catch(() => ({}));
      const u = await db.collection('users').findOne({ email: (email || '').toLowerCase() });
      if (!u) return err('User not found');
      if (u.otp !== otp || u.otpExpires < Date.now()) return err('Invalid or expired OTP');
      await db.collection('users').updateOne({ id: u.id }, { $set: { verified: true }, $unset: { otp: '', otpExpires: '' } });
      const token = signJWT({ sub: u.id, email: u.email, role: u.role });
      return json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role, verified: true } });
    }
    if (parts[1] === 'login' && method === 'POST') {
      const { email, password } = await request.json().catch(() => ({}));
      const u = await db.collection('users').findOne({ email: (email || '').toLowerCase() });
      if (!u || !verifyPassword(password, u.password)) return err('Invalid credentials', 401);
      const token = signJWT({ sub: u.id, email: u.email, role: u.role });
      return json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role, verified: u.verified } });
    }
    if (parts[1] === 'me' && method === 'GET') {
      const u = await getUser(db, request);
      if (!u) return err('Unauthorized', 401);
      return json({ user: { id: u.id, name: u.name, email: u.email, role: u.role, verified: u.verified, phone: u.phone } });
    }
    if (parts[1] === 'forgot' && method === 'POST') {
      const { email } = await request.json().catch(() => ({}));
      const u = await db.collection('users').findOne({ email: (email || '').toLowerCase() });
      if (!u) return json({ ok: true }); // don't reveal
      const otp = otp6();
      await db.collection('users').updateOne({ id: u.id }, { $set: { resetOtp: otp, resetExpires: Date.now() + 10 * 60 * 1000 } });
      return json({ ok: true, devOtp: otp });
    }
    if (parts[1] === 'reset' && method === 'POST') {
      const { email, otp, password } = await request.json().catch(() => ({}));
      const u = await db.collection('users').findOne({ email: (email || '').toLowerCase() });
      if (!u || u.resetOtp !== otp || u.resetExpires < Date.now()) return err('Invalid or expired OTP');
      await db.collection('users').updateOne({ id: u.id }, { $set: { password: hashPassword(password) }, $unset: { resetOtp: '', resetExpires: '' } });
      return json({ ok: true });
    }
  }

  // -------- USER PROTECTED --------
  if (parts[0] === 'me' || parts[0] === 'orders' || parts[0] === 'addresses' || parts[0] === 'wishlist' || parts[0] === 'reviews' || parts[0] === 'admin') {
    const user = await getUser(db, request);
    if (!user) return err('Unauthorized', 401);

    // --- Addresses ---
    if (parts[0] === 'addresses') {
      if (method === 'GET') return json({ addresses: await db.collection('addresses').find({ userId: user.id }, { projection: { _id: 0 } }).toArray() });
      if (method === 'POST') {
        const body = await request.json();
        const a = { id: uuid(), userId: user.id, ...body, createdAt: new Date() };
        await db.collection('addresses').insertOne(a);
        return json({ address: { ...a, _id: undefined } });
      }
      if (parts[1] && method === 'DELETE') { await db.collection('addresses').deleteOne({ id: parts[1], userId: user.id }); return json({ ok: true }); }
    }

    // --- Wishlist ---
    if (parts[0] === 'wishlist') {
      if (method === 'GET') {
        const items = await db.collection('wishlist').find({ userId: user.id }).toArray();
        const slugs = items.map(i => i.slug);
        const products = await db.collection('products').find({ slug: { $in: slugs } }, { projection: { _id: 0 } }).toArray();
        return json({ products });
      }
      if (method === 'POST') { const { slug } = await request.json(); await db.collection('wishlist').updateOne({ userId: user.id, slug }, { $set: { userId: user.id, slug, at: new Date() } }, { upsert: true }); return json({ ok: true }); }
      if (parts[1] && method === 'DELETE') { await db.collection('wishlist').deleteOne({ userId: user.id, slug: parts[1] }); return json({ ok: true }); }
    }

    // --- Reviews ---
    if (parts[0] === 'reviews' && method === 'POST') {
      const { slug, rating, comment } = await request.json();
      await db.collection('reviews').insertOne({ id: uuid(), userId: user.id, userName: user.name, slug, rating, comment, at: new Date() });
      return json({ ok: true });
    }

    // --- Orders ---
    if (parts[0] === 'orders') {
      if (method === 'GET' && !parts[1]) {
        const orders = await db.collection('orders').find({ userId: user.id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
        return json({ orders });
      }
      if (method === 'GET' && parts[1]) {
        const order = await db.collection('orders').findOne({ id: parts[1], userId: user.id }, { projection: { _id: 0 } });
        if (!order) return err('Not found', 404);
        return json({ order });
      }
      if (method === 'POST' && !parts[1]) {
        const { items, addressId, couponCode, paymentMethod = 'razorpay' } = await request.json();
        if (!items?.length) return err('No items');
        const address = await db.collection('addresses').findOne({ id: addressId, userId: user.id });
        if (!address) return err('Invalid address');
        // recompute prices from DB (server-authoritative)
        const dbProducts = await db.collection('products').find({ slug: { $in: items.map(i => i.slug) } }).toArray();
        const orderItems = items.map(i => { const p = dbProducts.find(x => x.slug === i.slug); return { slug: i.slug, name: p.name, image: p.image, price: p.price, qty: i.qty }; });
        const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
        let discount = 0;
        if (couponCode) {
          const c = await db.collection('coupons').findOne({ code: couponCode.toUpperCase(), active: true });
          if (c && subtotal >= c.minAmount) discount = c.type === 'percent' ? Math.min(Math.round(subtotal * c.value / 100), c.maxDiscount) : c.value;
        }
        const afterDiscount = subtotal - discount;
        const gst = Math.round(afterDiscount * 0.18);
        const shipping = afterDiscount > 999 ? 0 : 79;
        const total = afterDiscount + gst + shipping;
        const orderNo = 'VM' + Date.now().toString().slice(-8);
        const order = { id: uuid(), orderNo, userId: user.id, items: orderItems, address, subtotal, discount, gst, shipping, total, couponCode, paymentMethod, paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', status: 'confirmed', createdAt: new Date(), estimatedDelivery: new Date(Date.now() + 3 * 86400000) };
        await db.collection('orders').insertOne(order);
        return json({ order: { ...order, _id: undefined } });
      }
    }

    // --- Admin ---
    if (parts[0] === 'admin') {
      if (user.role !== 'admin') return err('Admin only', 403);
      if (parts[1] === 'stats' && method === 'GET') {
        const [orders, users, productsCount, revenueAgg] = await Promise.all([
          db.collection('orders').find({}).toArray(),
          db.collection('users').countDocuments(),
          db.collection('products').countDocuments(),
          db.collection('orders').aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).toArray(),
        ]);
        const revenue = revenueAgg[0]?.total || 0;
        const last7 = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
          const next = new Date(d); next.setDate(next.getDate() + 1);
          const dayOrders = orders.filter(o => new Date(o.createdAt) >= d && new Date(o.createdAt) < next);
          return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
        });
        const catSales = {};
        orders.forEach(o => o.items.forEach(i => { const p = PRODUCTS.find(x => x.slug === i.slug); if (p) catSales[p.category] = (catSales[p.category] || 0) + i.price * i.qty; }));
        const topCats = Object.entries(catSales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
        return json({ revenue, orders: orders.length, users, products: productsCount, last7, topCats, recentOrders: orders.slice(-8).reverse() });
      }
      if (parts[1] === 'orders' && method === 'GET') {
        return json({ orders: await db.collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray() });
      }
      if (parts[1] === 'orders' && parts[2] && method === 'PATCH') {
        const { status } = await request.json();
        await db.collection('orders').updateOne({ id: parts[2] }, { $set: { status } });
        return json({ ok: true });
      }
      if (parts[1] === 'users' && method === 'GET') {
        const users = await db.collection('users').find({}, { projection: { _id: 0, password: 0, otp: 0, resetOtp: 0 } }).sort({ createdAt: -1 }).limit(100).toArray();
        return json({ users });
      }
      if (parts[1] === 'products' && method === 'POST') {
        const p = await request.json();
        p.id = 'p_' + uuid().slice(0, 8);
        p.slug = (p.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + p.id.slice(-4);
        p.rating = 4.5; p.reviews = 0; p.sold = 0; p.stock = p.stock || 100; p.createdAt = Date.now();
        p.images = p.images || [p.image];
        p.specs = p.specs || {};
        await db.collection('products').insertOne(p);
        return json({ product: { ...p, _id: undefined } });
      }
      if (parts[1] === 'products' && parts[2] && method === 'PATCH') {
        const updates = await request.json();
        delete updates._id; delete updates.slug; delete updates.id;
        if (updates.image && (!updates.images || !updates.images.length)) updates.images = [updates.image];
        await db.collection('products').updateOne({ slug: parts[2] }, { $set: updates });
        const updated = await db.collection('products').findOne({ slug: parts[2] }, { projection: { _id: 0 } });
        return json({ product: updated });
      }
      if (parts[1] === 'products' && parts[2] && method === 'DELETE') {
        await db.collection('products').deleteOne({ slug: parts[2] });
        return json({ ok: true });
      }
      if (parts[1] === 'coupons' && method === 'GET') return json({ coupons: await db.collection('coupons').find({}, { projection: { _id: 0 } }).toArray() });
      if (parts[1] === 'coupons' && method === 'POST') { const c = await request.json(); c.code = c.code.toUpperCase(); c.active = c.active !== false; await db.collection('coupons').updateOne({ code: c.code }, { $set: c }, { upsert: true }); return json({ ok: true, coupon: c }); }
      if (parts[1] === 'coupons' && parts[2] && method === 'PATCH') { const updates = await request.json(); delete updates._id; delete updates.code; await db.collection('coupons').updateOne({ code: parts[2].toUpperCase() }, { $set: updates }); return json({ ok: true }); }
      if (parts[1] === 'coupons' && parts[2] && method === 'DELETE') { await db.collection('coupons').deleteOne({ code: parts[2].toUpperCase() }); return json({ ok: true }); }

      // BULK IMPORT
      if (parts[1] === 'bulk-import' && method === 'POST') {
        const { products: incoming = [] } = await request.json();
        if (!Array.isArray(incoming) || !incoming.length) return err('No products to import');
        const results = { created: 0, skipped: 0, errors: [] };
        for (const p of incoming) {
          try {
            if (!p.name || !p.price || !p.image) { results.skipped++; results.errors.push({ name: p.name || 'unnamed', reason: 'Missing name/price/image' }); continue; }
            const doc = { ...p };
            doc.id = 'p_' + uuid().slice(0, 8);
            doc.slug = (p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + doc.id.slice(-4);
            doc.price = Number(p.price); doc.mrp = Number(p.mrp || p.price); doc.stock = Number(p.stock || 100);
            doc.brand = p.brand || 'arduino'; doc.category = p.category || 'modules';
            doc.rating = Number(p.rating || 4.5); doc.reviews = 0; doc.sold = 0;
            doc.images = p.images || [p.image];
            doc.specs = p.specs || {};
            doc.createdAt = Date.now();
            await db.collection('products').insertOne(doc);
            results.created++;
          } catch (e) { results.skipped++; results.errors.push({ name: p.name, reason: e.message }); }
        }
        return json(results);
      }

      // INSIGHTS
      if (parts[1] === 'insights' && method === 'GET') {
        const [allProducts, allOrders] = await Promise.all([
          db.collection('products').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('orders').find({}).toArray(),
        ]);
        // Sold count per slug from orders
        const soldMap = {};
        allOrders.forEach(o => o.items.forEach(i => { soldMap[i.slug] = (soldMap[i.slug] || 0) + i.qty; }));
        const withSold = allProducts.map(p => ({ ...p, actualSold: soldMap[p.slug] || 0 }));

        const topSelling = [...withSold].sort((a, b) => (b.actualSold * b.price) - (a.actualSold * a.price)).slice(0, 8).map(p => ({ slug: p.slug, name: p.name, image: p.image, price: p.price, sold: p.actualSold, revenue: p.actualSold * p.price }));
        const lowStock = allProducts.filter(p => p.stock > 0 && p.stock < 20).sort((a, b) => a.stock - b.stock).slice(0, 10);
        const outOfStock = allProducts.filter(p => !p.stock || p.stock === 0);
        const totalInventoryValue = allProducts.reduce((s, p) => s + p.price * (p.stock || 0), 0);
        const totalProductCount = allProducts.length;
        const totalStock = allProducts.reduce((s, p) => s + (p.stock || 0), 0);
        const avgPrice = totalProductCount ? Math.round(allProducts.reduce((s, p) => s + p.price, 0) / totalProductCount) : 0;
        // Category breakdown
        const catStats = {};
        allProducts.forEach(p => {
          if (!catStats[p.category]) catStats[p.category] = { count: 0, stock: 0, value: 0, avgRating: 0, ratings: 0 };
          catStats[p.category].count++;
          catStats[p.category].stock += (p.stock || 0);
          catStats[p.category].value += p.price * (p.stock || 0);
          catStats[p.category].avgRating += (p.rating || 0);
          catStats[p.category].ratings++;
        });
        const categoryBreakdown = Object.entries(catStats).map(([name, s]) => ({ name, count: s.count, stock: s.stock, value: s.value, avgRating: (s.avgRating / s.ratings).toFixed(2) })).sort((a, b) => b.value - a.value);
        // Brand breakdown
        const brandStats = {};
        allProducts.forEach(p => { if (!brandStats[p.brand]) brandStats[p.brand] = 0; brandStats[p.brand]++; });
        const brandBreakdown = Object.entries(brandStats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

        return json({ topSelling, lowStock, outOfStock, totalInventoryValue, totalProductCount, totalStock, avgPrice, categoryBreakdown, brandBreakdown });
      }
    }
  }

  return err('Not found', 404);
}

async function listProducts(db, q) {
  const filter = {};
  const category = q.get('category'); const brand = q.get('brand'); const search = q.get('q');
  const minPrice = parseFloat(q.get('minPrice') || '0'); const maxPrice = parseFloat(q.get('maxPrice') || '999999');
  const minRating = parseFloat(q.get('minRating') || '0'); const inStock = q.get('inStock');
  const deal = q.get('deal'); const featured = q.get('featured'); const trending = q.get('trending'); const bestSeller = q.get('bestSeller');
  const sort = q.get('sort') || 'popular'; const page = parseInt(q.get('page') || '1'); const limit = Math.min(parseInt(q.get('limit') || '24'), 60);
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice < 999999) filter.price = { $gte: minPrice, $lte: maxPrice };
  if (minRating) filter.rating = { $gte: minRating };
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (deal === 'true') filter.deal = true;
  if (featured === 'true') filter.featured = true;
  if (trending === 'true') filter.trending = true;
  if (bestSeller === 'true') filter.bestSeller = true;
  const sortMap = { popular: { sold: -1 }, newest: { createdAt: -1 }, 'price-low': { price: 1 }, 'price-high': { price: -1 }, rating: { rating: -1 } };
  const total = await db.collection('products').countDocuments(filter);
  const products = await db.collection('products').find(filter, { projection: { _id: 0 } }).sort(sortMap[sort] || sortMap.popular).skip((page - 1) * limit).limit(limit).toArray();
  return json({ products, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function GET(request, { params }) { try { return await handle(request, params); } catch (e) { console.error(e); return err(e.message || 'Server error', 500); } }
export async function POST(request, { params }) { try { return await handle(request, params); } catch (e) { console.error(e); return err(e.message || 'Server error', 500); } }
export async function PATCH(request, { params }) { try { return await handle(request, params); } catch (e) { console.error(e); return err(e.message || 'Server error', 500); } }
export async function DELETE(request, { params }) { try { return await handle(request, params); } catch (e) { console.error(e); return err(e.message || 'Server error', 500); } }
