'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Package, Heart, MapPin, User as UserIcon, LogOut, Settings, Bell, HelpCircle, FileText, Truck, CheckCircle2, Clock, ChevronRight, Trash2, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { inr } from '@/lib/store';

const statusColors = { confirmed: 'text-primary bg-primary/10', shipped: 'text-secondary bg-secondary/10', delivered: 'text-secondary bg-secondary/10', cancelled: 'text-red-400 bg-red-500/10', pending: 'text-orange-400 bg-orange-500/10' };
const statusIcons = { confirmed: CheckCircle2, shipped: Truck, delivered: CheckCircle2, cancelled: Trash2, pending: Clock };

export default function DashboardView({ user, authFetch, logout, setView, wish }) {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishProducts, setWishProducts] = useState([]);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    authFetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
    authFetch('/api/addresses').then(r => r.json()).then(d => setAddresses(d.addresses || []));
    authFetch('/api/wishlist').then(r => r.json()).then(d => setWishProducts(d.products || []));
  }, []);

  const removeAddress = async (id) => {
    await authFetch(`/api/addresses/${id}`, { method: 'DELETE' });
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold glow-blue">{user.name[0].toUpperCase()}</div>
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider">My Account</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Hello, {user.name}</h1>
            <div className="text-sm text-white/60">{user.email} · <span className="text-secondary">{user.verified ? 'Verified' : 'Unverified'}</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === 'admin' && <Button onClick={() => setView({ name: 'admin' })} className="bg-secondary hover:bg-secondary/90 hidden sm:inline-flex">Admin Dashboard</Button>}
          <Button variant="outline" onClick={logout} className="border-white/10"><LogOut className="w-4 h-4 mr-2" />Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { i: Package, l: 'Total Orders', v: orders.length, c: 'primary' },
          { i: Heart, l: 'Wishlist', v: wishProducts.length, c: 'secondary' },
          { i: MapPin, l: 'Addresses', v: addresses.length, c: 'primary' },
          { i: Bell, l: 'Notifications', v: 3, c: 'secondary' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-${s.c}/10 flex items-center justify-center`}><s.i className={`w-5 h-5 text-${s.c}`} /></div>
            <div><div className="text-2xl font-bold">{s.v}</div><div className="text-xs text-white/50">{s.l}</div></div>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
          <TabsTrigger value="orders"><Package className="w-3.5 h-3.5 mr-1.5" />Orders</TabsTrigger>
          <TabsTrigger value="wishlist"><Heart className="w-3.5 h-3.5 mr-1.5" />Wishlist</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="w-3.5 h-3.5 mr-1.5" />Addresses</TabsTrigger>
          <TabsTrigger value="profile"><UserIcon className="w-3.5 h-3.5 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="support"><HelpCircle className="w-3.5 h-3.5 mr-1.5" />Support</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1.5" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No orders yet</p>
              <Button onClick={() => setView({ name: 'home' })} className="mt-4 bg-primary hover:bg-primary/90">Start shopping</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => {
                const StatusIcon = statusIcons[o.status] || Package;
                return (
                  <div key={o.id} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <div className="text-xs text-white/50">Order #{o.orderNo}</div>
                        <div className="text-sm text-white/70 mt-1">Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <Badge className={`${statusColors[o.status] || ''} border-0 capitalize`}><StatusIcon className="w-3 h-3 mr-1" />{o.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {o.items.slice(0, 4).map((i, idx) => <img key={idx} src={i.image} alt={i.name} className="w-14 h-14 rounded-lg object-cover" />)}
                      {o.items.length > 4 && <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/60">+{o.items.length - 4}</div>}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/5">
                      <div><div className="text-xs text-white/50">{o.items.length} items · Delivered by</div><div className="text-sm text-secondary">{new Date(o.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div></div>
                      <div className="flex items-center gap-3">
                        <div className="text-right"><div className="text-xs text-white/50">Total</div><div className="font-semibold text-primary">{inr(o.total)}</div></div>
                        <Button size="sm" variant="outline" className="border-white/10"><Download className="w-3.5 h-3.5 mr-1" />Invoice</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {wishProducts.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center"><Heart className="w-12 h-12 text-white/20 mx-auto mb-3" /><p className="text-white/60">Your wishlist is empty</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishProducts.map(p => (
                <div key={p.slug} onClick={() => setView({ name: 'product', slug: p.slug })} className="glass rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 border border-transparent transition">
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                    <div className="mt-2 font-semibold text-primary">{inr(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <div className="grid md:grid-cols-2 gap-3">
            {addresses.map(a => (
              <div key={a.id} className="glass rounded-2xl p-5">
                <div className="flex justify-between mb-2"><span className="font-medium">{a.name}</span><Badge className="bg-white/10 text-white border-0">{a.type}</Badge></div>
                <div className="text-sm text-white/70">{a.line1}, {a.line2 && a.line2 + ', '}{a.city}, {a.state} - {a.pincode}</div>
                <div className="text-sm text-white/50 mt-1">📞 {a.phone}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => removeAddress(a.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"><Trash2 className="w-3.5 h-3.5 mr-1" />Remove</Button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && <div className="col-span-full glass rounded-2xl p-8 text-center text-white/60">No saved addresses. Add one during checkout.</div>}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="glass rounded-2xl p-6 max-w-xl">
            <h3 className="font-medium mb-4">Profile Information</h3>
            <div className="space-y-3">
              {[['Name', user.name], ['Email', user.email], ['Role', user.role], ['Email verified', user.verified ? 'Yes' : 'No']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5"><span className="text-white/60">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <div className="glass rounded-2xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold">Need help?</h3>
            <p className="text-white/60 mt-1">Our engineers respond within 4 hours</p>
            <Button className="mt-4 bg-primary hover:bg-primary/90">Contact Support</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="glass rounded-2xl p-6 max-w-xl space-y-3">
            <h3 className="font-medium">Notification preferences</h3>
            {['Order updates', 'Deals & offers', 'New products', 'Newsletter'].map(k => (
              <label key={k} className="flex items-center justify-between py-2"><span className="text-sm text-white/80">{k}</span><input type="checkbox" defaultChecked className="accent-primary w-4 h-4" /></label>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
