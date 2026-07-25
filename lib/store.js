'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

// ---------- Auth store ----------
export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('vm_token');
    if (!t) { setLoading(false); return; }
    setToken(t);
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setUser(d.user); else { localStorage.removeItem('vm_token'); setToken(null); } })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, user) => {
    localStorage.setItem('vm_token', token);
    setToken(token); setUser(user);
    toast.success(`Welcome back, ${user.name}!`);
  };
  const logout = () => { localStorage.removeItem('vm_token'); setToken(null); setUser(null); toast.success('Logged out'); };
  const authFetch = useCallback((url, opts = {}) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } }), [token]);

  return { user, token, loading, login, logout, authFetch };
};

// ---------- Cart store ----------
export const useCart = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('voltmart_cart') || '[]')); } catch {} }, []);
  const save = (next) => { setItems(next); localStorage.setItem('voltmart_cart', JSON.stringify(next)); };
  const add = (p, qty = 1) => {
    const ex = items.find(i => i.slug === p.slug);
    const next = ex ? items.map(i => i.slug === p.slug ? { ...i, qty: i.qty + qty } : i) : [...items, { slug: p.slug, name: p.name, price: p.price, image: p.image, qty }];
    save(next); toast.success(`Added ${p.name} to cart`);
  };
  const remove = (slug) => save(items.filter(i => i.slug !== slug));
  const update = (slug, qty) => save(items.map(i => i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i));
  const clear = () => save([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return { items, add, remove, update, clear, count, total };
};

// ---------- Compare store ----------
export const useCompare = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('voltmart_compare') || '[]')); } catch {} }, []);
  const save = (next) => { setItems(next); localStorage.setItem('voltmart_compare', JSON.stringify(next)); };
  const toggle = (p) => {
    if (items.find(i => i.slug === p.slug)) save(items.filter(i => i.slug !== p.slug));
    else if (items.length >= 4) toast.error('Max 4 products to compare');
    else save([...items, p]);
  };
  const has = (slug) => !!items.find(i => i.slug === slug);
  const clear = () => save([]);
  return { items, toggle, has, clear };
};

// ---------- Wishlist store (server + local hybrid) ----------
export const useWish = (authFetch, user) => {
  const [slugs, setSlugs] = useState([]);
  const localKey = 'voltmart_wish';
  useEffect(() => {
    if (user) {
      authFetch('/api/wishlist').then(r => r.json()).then(d => setSlugs((d.products || []).map(p => p.slug)));
    } else {
      try { setSlugs(JSON.parse(localStorage.getItem(localKey) || '[]')); } catch {}
    }
  }, [user, authFetch]);
  const toggle = async (slug) => {
    const has = slugs.includes(slug);
    const next = has ? slugs.filter(s => s !== slug) : [...slugs, slug];
    setSlugs(next);
    if (user) {
      if (has) await authFetch(`/api/wishlist/${slug}`, { method: 'DELETE' });
      else await authFetch('/api/wishlist', { method: 'POST', body: JSON.stringify({ slug }) });
    } else {
      localStorage.setItem(localKey, JSON.stringify(next));
    }
  };
  const has = (s) => slugs.includes(s);
  return { slugs, toggle, has };
};

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
