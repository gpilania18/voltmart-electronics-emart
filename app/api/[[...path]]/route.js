import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PRODUCTS, CATEGORIES, BRANDS } from '@/lib/data/catalog';

const json = (data, init) => NextResponse.json(data, init);
const err = (msg, code = 400) => NextResponse.json({ error: msg }, { status: code });

async function ensureSeed() {
  const db = await getDb();
  const cnt = await db.collection('products').countDocuments();
  if (cnt === 0) {
    await db.collection('products').insertMany(PRODUCTS);
    await db.collection('categories').insertMany(CATEGORIES);
    await db.collection('brands').insertMany(BRANDS);
    await db.collection('products').createIndex({ name: 'text', short: 'text', description: 'text' });
  }
  return db;
}

export async function GET(request, { params }) {
  const parts = (await params).path || [];
  const url = new URL(request.url);
  const q = url.searchParams;
  try {
    const db = await ensureSeed();

    if (parts.length === 0 || parts[0] === 'health') {
      return json({ ok: true, service: 'voltmart-api', time: new Date().toISOString() });
    }

    if (parts[0] === 'seed') {
      await db.collection('products').deleteMany({});
      await db.collection('categories').deleteMany({});
      await db.collection('brands').deleteMany({});
      await db.collection('products').insertMany(PRODUCTS);
      await db.collection('categories').insertMany(CATEGORIES);
      await db.collection('brands').insertMany(BRANDS);
      return json({ seeded: true, products: PRODUCTS.length, categories: CATEGORIES.length, brands: BRANDS.length });
    }

    if (parts[0] === 'categories') {
      const cats = await db.collection('categories').find({}, { projection: { _id: 0 } }).toArray();
      return json({ categories: cats });
    }

    if (parts[0] === 'brands') {
      const brands = await db.collection('brands').find({}, { projection: { _id: 0 } }).toArray();
      return json({ brands });
    }

    if (parts[0] === 'products') {
      if (parts[1]) {
        const product = await db.collection('products').findOne({ slug: parts[1] }, { projection: { _id: 0 } });
        if (!product) return err('Product not found', 404);
        const related = await db.collection('products').find({ category: product.category, slug: { $ne: product.slug } }, { projection: { _id: 0 } }).limit(8).toArray();
        return json({ product, related });
      }
      // list with filters
      const filter = {};
      const category = q.get('category');
      const brand = q.get('brand');
      const search = q.get('q');
      const minPrice = parseFloat(q.get('minPrice') || '0');
      const maxPrice = parseFloat(q.get('maxPrice') || '999999');
      const minRating = parseFloat(q.get('minRating') || '0');
      const inStock = q.get('inStock');
      const deal = q.get('deal');
      const featured = q.get('featured');
      const trending = q.get('trending');
      const bestSeller = q.get('bestSeller');
      const sort = q.get('sort') || 'popular';
      const page = parseInt(q.get('page') || '1');
      const limit = Math.min(parseInt(q.get('limit') || '24'), 60);

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

      const sortMap = {
        popular: { sold: -1 },
        newest: { createdAt: -1 },
        'price-low': { price: 1 },
        'price-high': { price: -1 },
        rating: { rating: -1 },
      };

      const total = await db.collection('products').countDocuments(filter);
      const products = await db.collection('products')
        .find(filter, { projection: { _id: 0 } })
        .sort(sortMap[sort] || sortMap.popular)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      return json({ products, total, page, limit, pages: Math.ceil(total / limit) });
    }

    if (parts[0] === 'search' && parts[1] === 'suggest') {
      const term = (q.get('q') || '').trim();
      if (!term) return json({ suggestions: [] });
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const items = await db.collection('products')
        .find({ $or: [{ name: rx }, { short: rx }, { sku: rx }] }, { projection: { _id: 0, name: 1, slug: 1, image: 1, price: 1, category: 1 } })
        .limit(8).toArray();
      const cats = await db.collection('categories')
        .find({ name: rx }, { projection: { _id: 0, name: 1, slug: 1 } }).limit(4).toArray();
      return json({ suggestions: items, categories: cats });
    }

    return err('Not found', 404);
  } catch (e) {
    console.error(e);
    return err(e.message || 'Server error', 500);
  }
}

export async function POST(request, { params }) {
  const parts = (await params).path || [];
  try {
    const db = await ensureSeed();
    const body = await request.json().catch(() => ({}));

    if (parts[0] === 'newsletter') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email');
      await db.collection('newsletter').updateOne({ email }, { $set: { email, at: new Date() } }, { upsert: true });
      return json({ ok: true });
    }

    if (parts[0] === 'contact') {
      await db.collection('contacts').insertOne({ ...body, at: new Date() });
      return json({ ok: true });
    }

    return err('Not found', 404);
  } catch (e) {
    return err(e.message || 'Server error', 500);
  }
}
