'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LayoutDashboard, Package, Users, ShoppingBag, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Tag, MessageSquare, FileText, Settings, LogOut, ChevronRight, Search, Plus, Trash2, Edit, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { inr } from '@/lib/store';
import ProductFormModal from './ProductFormModal';
import { CouponFormModal, BulkImportModal, InsightsTab } from './AdminExtras';

const COLORS = ['#0F62FE', '#00C896', '#a855f7', '#f59e0b', '#ec4899'];

export default function AdminView({ user, authFetch, setView, logout }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tab, setTab] = useState('overview');
  const [productSearch, setProductSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    authFetch('/api/admin/stats').then(r => r.json()).then(setStats);
    authFetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
    authFetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []));
    loadProducts();
    authFetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || []));
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(d.brands || []));
  }, [user]);

  const loadProducts = () => fetch('/api/products?limit=60').then(r => r.json()).then(d => setProducts(d.products || []));

  const deleteProduct = async (slug, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const r = await authFetch(`/api/admin/products/${slug}`, { method: 'DELETE' });
    if (r.ok) { setProducts(products.filter(p => p.slug !== slug)); toast.success(`Deleted ${name}`); }
    else toast.error('Delete failed');
  };

  const onSaved = (product) => {
    if (editing) setProducts(products.map(p => p.slug === editing.slug ? product : p));
    else setProducts([product, ...products]);
    setEditing(null);
  };

  const filteredProducts = productSearch.trim() ? products.filter(p => (p.name + ' ' + p.sku + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(productSearch.toLowerCase())) : products;

  if (user?.role !== 'admin') {
    return (
      <div className="container py-20 text-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <div className="text-lg font-medium mb-2">Admin access required</div>
          <p className="text-white/60 text-sm">Log in with admin credentials to view this page.</p>
          <p className="text-xs text-white/40 mt-4">Demo: admin@voltmart.com / admin123</p>
        </div>
      </div>
    );
  }

  const updateOrderStatus = async (id, status) => {
    await authFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Order marked ${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05060A] via-[#0a0c14] to-[#05060A]">
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-16 z-30">
        <div className="container flex items-center gap-4 py-3">
          <div className="flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-primary" /><span className="font-display font-bold">Admin Console</span></div>
          <button onClick={() => setView({ name: 'home' })} className="ml-auto text-sm text-white/60 hover:text-white flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back to store</button>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="customers">Customers ({users.length})</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="insights"><InsightsTab authFetch={authFetch} setView={setView} /></TabsContent>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'Total Revenue', v: inr(stats?.revenue || 0), delta: '+12.4%', up: true, i: DollarSign, c: '#0F62FE' },
                { l: 'Orders', v: stats?.orders || 0, delta: '+8.2%', up: true, i: ShoppingBag, c: '#00C896' },
                { l: 'Customers', v: stats?.users || 0, delta: '+18%', up: true, i: Users, c: '#a855f7' },
                { l: 'Products', v: stats?.products || 0, delta: '+4', up: true, i: Package, c: '#f59e0b' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="relative glass rounded-2xl p-5 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: s.c }} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.c}20` }}><s.i className="w-5 h-5" style={{ color: s.c }} /></div>
                      <Badge className={`${s.up ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-400'} border-0 text-[10px]`}>{s.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}{s.delta}</Badge>
                    </div>
                    <div className="text-2xl md:text-3xl font-display font-bold">{s.v}</div>
                    <div className="text-xs text-white/50 mt-1">{s.l}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-medium">Revenue — Last 7 days</h3><TrendingUp className="w-4 h-4 text-secondary" /></div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats?.last7 || []}>
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0F62FE" stopOpacity={0.4}/><stop offset="100%" stopColor="#0F62FE" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#0F62FE" strokeWidth={2.5} dot={{ fill: '#0F62FE', r: 4 }} activeDot={{ r: 6, fill: '#00C896' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-medium mb-4">Top Categories</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats?.topCats || []} innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                      {(stats?.topCats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {(stats?.topCats || []).map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="capitalize text-white/70">{c.name.replace('-', ' ')}</span></div>
                      <span className="text-white/50">{inr(c.value)}</span>
                    </div>
                  ))}
                  {(stats?.topCats || []).length === 0 && <p className="text-xs text-white/40 text-center py-4">No sales yet</p>}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-medium">Orders — Last 7 days</h3><ShoppingBag className="w-4 h-4 text-secondary" /></div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.last7 || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="orders" fill="#00C896" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-medium mb-4">Recent Orders</h3>
                <div className="space-y-2">
                  {(stats?.recentOrders || []).slice(0, 6).map(o => (
                    <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-mono">#{o.orderNo?.slice(-3)}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm truncate">{o.address?.name || 'Customer'}</div><div className="text-xs text-white/40">{o.items.length} items</div></div>
                      <div className="text-sm font-semibold text-primary">{inr(o.total)}</div>
                    </div>
                  ))}
                  {(stats?.recentOrders || []).length === 0 && <p className="text-xs text-white/40 text-center py-6">No orders yet — try placing one!</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase text-white/50">
                  <tr>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left p-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-white/50">No orders yet</td></tr>}
                  {orders.map(o => (
                    <tr key={o.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-3 font-mono text-xs">{o.orderNo}</td>
                      <td className="p-3">{o.address?.name}</td>
                      <td className="p-3">{o.items.length}</td>
                      <td className="p-3 font-semibold text-primary">{inr(o.total)}</td>
                      <td className="p-3"><Badge className="capitalize bg-white/5 border border-white/10">{o.status}</Badge></td>
                      <td className="p-3 text-white/60 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs">
                          {['confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products, SKU, brand…" className="pl-9 bg-white/5 border-white/10" />
              </div>
              <div className="text-sm text-white/60">{filteredProducts.length} of {products.length} products</div>
              <Button onClick={() => setBulkOpen(true)} variant="outline" className="border-white/10 ml-auto"><Upload className="w-4 h-4 mr-1.5" />Bulk Import</Button>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary hover:bg-primary/90 glow-blue"><Plus className="w-4 h-4 mr-1.5" />Add Product</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map(p => (
                <div key={p.slug} className="group glass rounded-xl overflow-hidden relative">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <Button size="icon" onClick={() => { setEditing(p); setFormOpen(true); }} className="w-9 h-9 bg-primary hover:bg-primary/90"><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" onClick={() => deleteProduct(p.slug, p.name)} className="w-9 h-9 bg-red-500/90 hover:bg-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                      {p.bestSeller && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-white">BEST</span>}
                      {p.new && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-white">NEW</span>}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-[10px] uppercase text-white/40">{p.brand}</div>
                    <div className="text-xs font-medium line-clamp-2 mb-1">{p.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold text-sm">{inr(p.price)}</span>
                      <span className={`text-[10px] ${p.stock > 20 ? 'text-secondary' : p.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full glass rounded-2xl p-12 text-center text-white/50">
                  {productSearch ? 'No products match your search' : 'No products yet — click "Add Product"'}
                </div>
              )}
            </div>
            <ProductFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} product={editing} onSaved={onSaved} authFetch={authFetch} categories={categories} brands={brands} />
            <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} onDone={loadProducts} authFetch={authFetch} />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase text-white/50"><tr>{['Name', 'Email', 'Role', 'Verified', 'Joined'].map(h => <th key={h} className="text-left p-3">{h}</th>)}</tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="p-3 flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">{u.name[0]}</div>{u.name}</td>
                      <td className="p-3 text-white/70">{u.email}</td>
                      <td className="p-3"><Badge className={u.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 border-white/10'}>{u.role}</Badge></td>
                      <td className="p-3">{u.verified ? <span className="text-secondary text-xs">✓ Verified</span> : <span className="text-white/40 text-xs">Pending</span>}</td>
                      <td className="p-3 text-white/60 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-white/60">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</div>
              <Button onClick={() => { setEditingCoupon(null); setCouponFormOpen(true); }} className="bg-primary hover:bg-primary/90 glow-blue"><Plus className="w-4 h-4 mr-1.5" />Create Coupon</Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {coupons.map(c => (
                <div key={c.code} className="glass rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <Badge className={c.active ? 'bg-secondary/10 text-secondary border-0' : 'bg-white/5 border-white/10'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="font-mono text-lg font-bold">{c.code}</div>
                    <div className="text-sm text-white/60 mt-1">{c.description}</div>
                    <div className="text-xs text-white/40 mt-2">{c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`} · Min ₹{c.minAmount} · Max ₹{c.maxDiscount}</div>
                    <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Button size="sm" variant="outline" onClick={() => { setEditingCoupon(c); setCouponFormOpen(true); }} className="border-white/10 h-8 flex-1"><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" onClick={async () => { if (confirm(`Delete coupon ${c.code}?`)) { await authFetch(`/api/admin/coupons/${c.code}`, { method: 'DELETE' }); setCoupons(coupons.filter(x => x.code !== c.code)); toast.success(`Deleted ${c.code}`); } }} className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && <div className="col-span-full glass rounded-2xl p-12 text-center text-white/50">No coupons yet — click "Create Coupon"</div>}
            </div>
            <CouponFormModal open={couponFormOpen} onClose={() => { setCouponFormOpen(false); setEditingCoupon(null); }} coupon={editingCoupon} onSaved={() => authFetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || []))} authFetch={authFetch} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="glass rounded-2xl p-6 max-w-xl">
              <h3 className="font-medium mb-4">Store Settings</h3>
              <div className="space-y-3">
                {[['Store name', 'VoltMart'], ['GST rate', '18%'], ['Free shipping above', '₹999'], ['Support email', 'support@voltmart.com']].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-white/5"><span className="text-white/60">{k}</span><span className="font-medium">{v}</span></div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
