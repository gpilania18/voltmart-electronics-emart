'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, ShoppingCart, Heart, User, ChevronRight,
  Zap, Shield, Truck, Headphones, Star, Plus, Minus, Trash2, Check, ArrowRight,
  Cpu, Wifi, Radar, Package, Cog, Bot, Cloud, CircuitBoard, Battery, Monitor,
  Wrench, Box, Plane, Workflow, BrainCircuit, MemoryStick, GraduationCap, Layers,
  Sparkles, TrendingUp, Award, SlidersHorizontal,
  Download, FileText, MessageSquare, ShoppingBag, Flame, Gift, Clock, MapPin,
  LogOut, LayoutDashboard, GitCompare, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

import { useAuth, useCart, useCompare, useWish, inr } from '@/lib/store';
import AuthModal from '@/components/store/AuthModal';
import CheckoutView from '@/components/store/CheckoutView';
import DashboardView from '@/components/store/DashboardView';
import AdminView from '@/components/store/AdminView';
import CompareView from '@/components/store/CompareView';

const iconMap = { Cpu, Wifi, Radar, Package, Cog, Bot, Cloud, CircuitBoard, Battery, Monitor, Wrench, Box, Plane, Workflow, BrainCircuit, MemoryStick, GraduationCap, Zap, Microchip: Cpu };

// -------- Product Card --------
const ProductCard = ({ p, onOpen, onAdd, wishHas, onWish, compareHas, onCompare }) => {
  const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition cursor-pointer">
      <div onClick={onOpen} className="relative aspect-square overflow-hidden bg-black/40">
        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {p.bestSeller && <Badge className="bg-secondary/90 hover:bg-secondary text-white text-[10px] border-0"><Award className="w-2.5 h-2.5 mr-1" />Best Seller</Badge>}
          {p.new && <Badge className="bg-primary/90 hover:bg-primary text-white text-[10px] border-0">NEW</Badge>}
          {discount > 0 && <Badge className="bg-red-500/90 hover:bg-red-500 text-white text-[10px] border-0">-{discount}%</Badge>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onWish(p.slug); }} className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition">
            <Heart className={`w-4 h-4 ${wishHas ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onCompare(p); }} className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition" title="Compare">
            <GitCompare className={`w-4 h-4 ${compareHas ? 'text-primary' : 'text-white'}`} />
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <div className="text-[11px] uppercase tracking-wide text-white/40 mb-1">{p.brand}</div>
        <h3 onClick={onOpen} className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem] hover:text-primary transition">{p.name}</h3>
        <div className="flex items-center gap-1 mt-2 text-xs">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-white/80">{p.rating}</span>
          <span className="text-white/40">({p.reviews})</span>
          <span className="ml-auto text-white/40">{p.sold}+ sold</span>
        </div>
        <div className="mt-2.5 flex items-end justify-between">
          <div>
            <div className="text-lg font-semibold text-white">{inr(p.price)}</div>
            {p.mrp > p.price && <div className="text-xs text-white/40 line-through">{inr(p.mrp)}</div>}
          </div>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onAdd(p); }} className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 h-8 px-3 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// -------- Header --------
const Header = ({ setView, cart, wish, compare, user, onSearchOpen, onLogin, onLogout }) => (
  <header className="sticky top-0 z-40 border-b border-white/5 glass-strong">
    <div className="container flex items-center gap-4 h-16">
      <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-2 font-display text-xl font-bold shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-blue">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="hidden sm:inline">Volt<span className="text-accent-gradient">Mart</span></span>
      </button>
      <nav className="hidden lg:flex items-center gap-1 text-sm">
        <button onClick={() => setView({ name: 'products' })} className="px-3 py-2 text-white/80 hover:text-white transition">Shop All</button>
        <button onClick={() => setView({ name: 'products', filters: { deal: true } })} className="px-3 py-2 text-white/80 hover:text-white transition">Deals</button>
        <button onClick={() => setView({ name: 'products', filters: { bestSeller: true } })} className="px-3 py-2 text-white/80 hover:text-white transition">Best Sellers</button>
        <button onClick={() => setView({ name: 'products', filters: { trending: true } })} className="px-3 py-2 text-white/80 hover:text-white transition">Trending</button>
      </nav>
      <button onClick={onSearchOpen} className="flex-1 max-w-2xl flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white/50 text-sm transition">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="flex-1 text-left">Ask VoltAI or search products…</span>
        <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">⌘K</kbd>
      </button>
      <div className="flex items-center gap-1">
        {compare.items.length > 0 && (
          <Button variant="ghost" size="icon" onClick={() => setView({ name: 'compare' })} className="relative hidden sm:inline-flex" title="Compare">
            <GitCompare className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] rounded-full bg-primary flex items-center justify-center">{compare.items.length}</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => user ? setView({ name: 'dashboard' }) : null} className="relative">
          <Heart className="w-5 h-5" />
          {wish.slugs.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] rounded-full bg-secondary flex items-center justify-center">{wish.slugs.length}</span>}
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.count > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] rounded-full bg-primary flex items-center justify-center glow-blue">{cart.count}</span>}
            </Button>
          </SheetTrigger>
          <CartSheet cart={cart} onCheckout={() => setView({ name: 'checkout' })} />
        </Sheet>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-sm">{user.name[0].toUpperCase()}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0c14] border-white/10 text-white w-56">
              <DropdownMenuLabel className="text-white/60"><div className="text-white font-medium">{user.name}</div><div className="text-xs">{user.email}</div></DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => setView({ name: 'dashboard' })} className="focus:bg-white/5"><User className="w-4 h-4 mr-2" />My Account</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView({ name: 'dashboard' })} className="focus:bg-white/5"><Package className="w-4 h-4 mr-2" />My Orders</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView({ name: 'dashboard' })} className="focus:bg-white/5"><Heart className="w-4 h-4 mr-2" />Wishlist</DropdownMenuItem>
              {user.role === 'admin' && <>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => setView({ name: 'admin' })} className="focus:bg-primary/10 text-primary"><LayoutDashboard className="w-4 h-4 mr-2" />Admin Dashboard</DropdownMenuItem>
              </>}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={onLogout} className="focus:bg-red-500/10 text-red-400"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" onClick={onLogin} className="hidden sm:inline-flex"><User className="w-4 h-4 mr-1.5" />Sign in</Button>
        )}
      </div>
    </div>
  </header>
);

// -------- AI Search Dialog --------
const SearchDialog = ({ open, onClose, setView }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState({ suggestions: [], categories: [] });
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mode, setMode] = useState('quick'); // 'quick' | 'ai'

  useEffect(() => {
    if (!q.trim() || mode !== 'quick') { setResults({ suggestions: [], categories: [] }); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`).then(r => r.json());
      setResults(r);
    }, 150);
    return () => clearTimeout(t);
  }, [q, mode]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => { if (!open) { setQ(''); setAiResults(null); setMode('quick'); } }, [open]);

  const askAI = async (query) => {
    setMode('ai'); setAiLoading(true); setAiResults(null);
    const r = await fetch('/api/ai-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
    const d = await r.json();
    setAiResults(d); setAiLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (q.trim()) askAI(q);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4" onClick={onClose}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="w-full max-w-2xl glass-strong rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-blue"><Sparkles className="w-4 h-4 text-white" /></div>
              <input autoFocus value={q} onChange={e => { setQ(e.target.value); setMode('quick'); }} placeholder='Try: "ESP32 with camera under ₹1000"' className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40" />
              {q && <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 h-8">Ask AI →</Button>}
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">ESC</kbd>
            </form>
            <div className="max-h-[65vh] overflow-y-auto">
              {mode === 'ai' && (
                <div className="p-4">
                  {aiLoading && <div className="flex items-center justify-center gap-2 py-8 text-white/60"><Loader2 className="w-4 h-4 animate-spin" />VoltAI is thinking…</div>}
                  {aiResults && (
                    <>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/10 mb-3">
                        <div className="text-xs text-primary uppercase tracking-wider mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" />VoltAI</div>
                        <div className="text-sm text-white/90">{aiResults.summary}</div>
                        <div className="text-xs text-white/50 mt-1">{aiResults.products?.length || 0} products found</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {aiResults.products?.slice(0, 8).map(p => (
                          <button key={p.slug} onClick={() => { setView({ name: 'product', slug: p.slug }); onClose(); }} className="text-left p-2 rounded-lg hover:bg-white/5 flex gap-2">
                            <img src={p.image} alt={p.name} className="w-14 h-14 rounded-md object-cover" />
                            <div className="flex-1 min-w-0"><div className="text-xs truncate">{p.name}</div><div className="text-sm font-semibold text-primary mt-1">{inr(p.price)}</div></div>
                          </button>
                        ))}
                      </div>
                      {aiResults.products?.length > 8 && <Button variant="outline" className="w-full mt-3 border-white/10" onClick={() => { setView({ name: 'products', filters: aiResults.parsed?.filter }); onClose(); }}>View all {aiResults.products.length} results →</Button>}
                    </>
                  )}
                </div>
              )}
              {mode === 'quick' && !q && (
                <div className="p-4 text-sm text-white/60">
                  <div className="mb-3 font-medium text-white/80">Try VoltAI</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['ESP32 with camera under 1000', 'cheap arduino boards', 'best drone', 'raspberry pi 5 8gb', 'servo motor for robotics'].map(s => (
                      <button key={s} onClick={() => { setQ(s); askAI(s); }} className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-white/80 text-xs">{s}</button>
                    ))}
                  </div>
                  <div className="text-xs text-white/40">Or search directly by product name / SKU</div>
                </div>
              )}
              {mode === 'quick' && results.categories?.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] uppercase tracking-wider text-white/40 px-2 mb-1">Categories</div>
                  {results.categories.map(c => (
                    <button key={c.slug} onClick={() => { setView({ name: 'products', filters: { category: c.slug } }); onClose(); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"><Layers className="w-4 h-4 text-primary" /></div>
                      <span className="text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {mode === 'quick' && results.suggestions?.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] uppercase tracking-wider text-white/40 px-2 mb-1">Products</div>
                  {results.suggestions.map(p => (
                    <button key={p.slug} onClick={() => { setView({ name: 'product', slug: p.slug }); onClose(); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                      <div className="flex-1 min-w-0"><div className="text-sm truncate">{p.name}</div><div className="text-xs text-white/50">{p.category}</div></div>
                      <div className="text-sm font-semibold text-primary">{inr(p.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// -------- Cart Sheet --------
const CartSheet = ({ cart, onCheckout }) => {
  const { items, remove, update, total } = cart;
  const gst = Math.round(total * 0.18);
  const shipping = total > 999 ? 0 : 79;
  const grand = total + gst + shipping;
  return (
    <SheetContent className="bg-[#0a0c14] border-white/10 text-white flex flex-col p-0 w-full sm:max-w-md">
      <SheetHeader className="p-6 border-b border-white/10"><SheetTitle className="text-white font-display">Your Cart · {items.length} item{items.length !== 1 ? 's' : ''}</SheetTitle></SheetHeader>
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6"><ShoppingBag className="w-12 h-12 text-white/20" /><p className="text-white/60 text-sm">Your cart is empty</p></div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map(i => (
              <div key={i.slug} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.name}</div>
                  <div className="text-primary font-semibold text-sm mt-1">{inr(i.price)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => update(i.slug, i.qty - 1)} className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm min-w-6 text-center">{i.qty}</span>
                    <button onClick={() => update(i.slug, i.qty + 1)} className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => remove(i.slug)} className="ml-auto text-white/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-white/10 space-y-2 text-sm">
            <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{inr(total)}</span></div>
            <div className="flex justify-between text-white/70"><span>GST (18%)</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between text-white/70"><span>Shipping</span><span className={shipping === 0 ? 'text-secondary' : ''}>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
            <Separator className="bg-white/10 my-2" />
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-primary">{inr(grand)}</span></div>
            <Button onClick={onCheckout} className="w-full mt-3 bg-primary hover:bg-primary/90 glow-blue h-11">Checkout · {inr(grand)}</Button>
            <p className="text-[11px] text-white/40 text-center">Secure checkout · GST invoice included</p>
          </div>
        </>
      )}
    </SheetContent>
  );
};

// -------- Section header --------
const SectionHeader = ({ title, subtitle, icon: Ic, action }) => (
  <div className="flex items-end justify-between mb-6 gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        {Ic && <Ic className="w-5 h-5 text-primary" />}
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
    </div>
    {action && <Button variant="ghost" onClick={action} className="text-white/70 hover:text-white hidden md:inline-flex">View all <ChevronRight className="w-4 h-4 ml-1" /></Button>}
  </div>
);

// -------- Newsletter --------
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (r.ok) { toast.success('Subscribed! Check your inbox 🎉'); setEmail(''); } else { toast.error('Please enter a valid email'); }
  };
  return (
    <section className="container py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs mb-4"><Gift className="w-3 h-3 text-secondary" /> First order ₹100 off</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Get the maker newsletter</h2>
            <p className="text-white/60 mt-2">New arrivals, deep-dive tutorials, and exclusive early-bird deals.</p>
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40" />
            <Button type="submit" className="h-12 px-6 bg-primary hover:bg-primary/90 glow-blue">Subscribe</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ setView }) => (
  <footer className="border-t border-white/5 bg-black/40 mt-8">
    <div className="container py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
      <div className="col-span-2">
        <div className="flex items-center gap-2 font-display text-xl font-bold mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Zap className="w-5 h-5 text-white" fill="white" /></div>
          Volt<span className="text-accent-gradient">Mart</span>
        </div>
        <p className="text-white/50 text-sm max-w-sm leading-relaxed">India's premium electronics marketplace for engineers, makers, and industry.</p>
        <div className="mt-6 text-sm text-white/60 space-y-1">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Bangalore · Delhi · Mumbai</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Mon-Sat, 9 AM – 8 PM IST</div>
        </div>
      </div>
      {[
        { t: 'Shop', l: ['Arduino', 'Raspberry Pi', 'ESP32', 'Sensors', 'Robotics', 'Drones'] },
        { t: 'Company', l: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
        { t: 'Support', l: ['Help Center', 'Returns', 'Track Order', 'GST Invoice', 'Bulk Enquiry'] },
      ].map((c, i) => (
        <div key={i}>
          <div className="text-white font-medium mb-3">{c.t}</div>
          <ul className="space-y-2 text-sm text-white/50">{c.l.map(l => <li key={l}><a className="hover:text-white cursor-pointer">{l}</a></li>)}</ul>
        </div>
      ))}
    </div>
    <div className="border-t border-white/5 py-5">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/40">
        <div>© 2025 VoltMart Electronics Pvt. Ltd. · GST: 29AABCV1234F1Z5</div>
        <div className="flex gap-4"><a>Privacy</a><a>Terms</a><a>Refund Policy</a><a>Shipping</a></div>
      </div>
    </div>
  </footer>
);

// -------- Home View --------
const HomeView = ({ setView, cart, wish, compare }) => {
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deals, setDeals] = useState([]);
  const [best, setBest] = useState([]);
  const [trending, setTrending] = useState([]);
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || []));
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(d.brands || []));
    fetch('/api/products?deal=true&limit=8').then(r => r.json()).then(d => setDeals(d.products || []));
    fetch('/api/products?bestSeller=true&limit=10').then(r => r.json()).then(d => setBest(d.products || []));
    fetch('/api/products?trending=true&limit=8').then(r => r.json()).then(d => setTrending(d.products || []));
  }, []);

  const cardProps = (p) => ({ p, onOpen: () => setView({ name: 'product', slug: p.slug }), onAdd: cart.add, wishHas: wish.has(p.slug), onWish: wish.toggle, compareHas: compare.has(p.slug), onCompare: compare.toggle });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container relative pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-white/80">Free shipping on orders above ₹999</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                <span className="text-gradient">Powering</span><br />
                the next generation<br />
                of <span className="text-accent-gradient">builders</span>.
              </h1>
              <p className="mt-6 text-white/60 text-lg max-w-lg leading-relaxed">
                India's premium marketplace for Arduino, Raspberry Pi, sensors, robotics, drones, and 5,000+ electronics components.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setView({ name: 'products' })} className="bg-primary hover:bg-primary/90 glow-blue h-12 px-6 text-base">Shop All Products<ArrowRight className="w-4 h-4 ml-2" /></Button>
                <Button size="lg" variant="outline" onClick={() => setView({ name: 'products', filters: { deal: true } })} className="border-white/20 hover:bg-white/5 h-12 px-6 text-base">View Deals</Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                {[{ n: '5K+', l: 'Products' }, { n: '50K+', l: 'Makers served' }, { n: '4.8★', l: 'Rated' }].map((s, i) => (
                  <div key={i}><div className="font-display text-3xl font-bold text-accent-gradient">{s.n}</div><div className="text-xs text-white/50 mt-1">{s.l}</div></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 glow-blue">
                  <img src="https://images.unsplash.com/photo-1517055729445-fa7d27394b48?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxjaXJjdWl0JTIwYm9hcmR8ZW58MHx8fGJsYWNrfDE3ODUwMDMxNTl8MA&ixlib=rb-4.1.0&q=85" alt="Electronics" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-4 -left-4 glass-strong rounded-2xl p-4 w-48">
                  <div className="flex items-center gap-2 text-xs text-secondary mb-1"><Flame className="w-3.5 h-3.5" /> Flash Sale</div>
                  <div className="font-semibold text-sm">Arduino Uno R4</div>
                  <div className="text-primary font-bold text-lg">₹2,499</div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -bottom-4 -right-4 glass-strong rounded-2xl p-4 w-52">
                  <div className="flex items-center gap-2 text-xs text-primary mb-1"><Sparkles className="w-3.5 h-3.5" /> VoltAI Search</div>
                  <div className="font-semibold text-sm">Ask in plain English</div>
                  <div className="text-white/60 text-xs">"ESP32 with camera under ₹1000"</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { i: Truck, t: 'Same-Day Dispatch', s: 'Orders before 3 PM' },
            { i: Shield, t: 'Genuine Products', s: '100% original parts' },
            { i: FileText, t: 'GST Invoice', s: 'Available on all orders' },
            { i: Headphones, t: 'Expert Support', s: 'Engineers on call' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><f.i className="w-5 h-5 text-primary" /></div>
              <div><div className="text-sm font-medium">{f.t}</div><div className="text-xs text-white/50">{f.s}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeader title="Shop by Category" subtitle="Everything a maker needs, organized" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cats.slice(0, 12).map((c, i) => {
            const Ic = iconMap[c.icon] || Layers;
            return (
              <motion.button key={c.slug} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} onClick={() => setView({ name: 'products', filters: { category: c.slug } })} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition">
                <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center"><Ic className="w-5 h-5 text-white" /></div>
                  <div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-white/50">{c.count} products</div></div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="container py-8">
        <SectionHeader title="Today's Deals" subtitle="Limited-time offers, ends soon" icon={Flame} action={() => setView({ name: 'products', filters: { deal: true } })} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map(p => <ProductCard key={p.slug} {...cardProps(p)} />)}
        </div>
      </section>

      <section className="container py-8">
        <SectionHeader title="Best Sellers" subtitle="Loved by 50,000+ engineers & makers" icon={Award} action={() => setView({ name: 'products', filters: { bestSeller: true } })} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {best.slice(0, 10).map(p => <ProductCard key={p.slug} {...cardProps(p)} />)}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeader title="Popular Brands" subtitle="Authorized distributors of world-class manufacturers" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {brands.map(b => (
            <div key={b.slug} className="glass rounded-2xl p-5 hover:border-primary/30 transition group cursor-pointer">
              <div className="font-display font-bold text-lg group-hover:text-primary transition">{b.name}</div>
              <div className="text-xs text-white/50 mt-1">{b.tagline}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <SectionHeader title="Trending Components" subtitle="What everyone is building right now" icon={TrendingUp} action={() => setView({ name: 'products', filters: { trending: true } })} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trending.map(p => <ProductCard key={p.slug} {...cardProps(p)} />)}
        </div>
      </section>

      <section className="container py-20">
        <SectionHeader title="Why VoltMart" subtitle="Built for engineers, by engineers" />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { i: Shield, t: 'Genuine & Warrantied', d: 'Direct from manufacturers with warranty. Zero counterfeits — guaranteed authentic components.', c: 'from-primary/20 to-transparent' },
            { i: Zap, t: 'Blazing Fast Fulfillment', d: 'Same-day dispatch on 5000+ SKUs. Delivered to 25,000+ pincodes across India in 1-3 days.', c: 'from-secondary/20 to-transparent' },
            { i: BrainCircuit, t: 'Expert Technical Support', d: 'Chat with our in-house engineers for schematic reviews, part selection & datasheet queries.', c: 'from-purple-500/20 to-transparent' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative rounded-2xl p-8 bg-gradient-to-br ${f.c} border border-white/10 overflow-hidden`}>
              <f.i className="w-10 h-10 text-white mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">{f.t}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeader title="Loved by the maker community" subtitle="4.8/5 from 12,000+ verified reviews" />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: 'Rohan Verma', r: 'Robotics Engineer, IIT Delhi', t: 'Ordered 40+ ESP32 boards for our lab — every single one worked out of the box. Best pricing I have found in India.' },
            { n: 'Priya Sharma', r: 'Founder, RoboKids Academy', t: 'The STEM kits are premium quality and the packaging is beautiful. My students absolutely love unboxing them.' },
            { n: 'Arjun Patel', r: 'Hardware Startup CTO', t: 'We source all our prototyping components from VoltMart. Fast delivery, genuine parts, unbeatable bulk pricing.' },
          ].map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">&ldquo;{t.t}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-semibold">{t.n[0]}</div>
                <div><div className="text-sm font-medium">{t.n}</div><div className="text-xs text-white/50">{t.r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
      <Footer setView={setView} />
    </div>
  );
};

// -------- Products view --------
const ProductsView = ({ initialFilters, setView, cart, wish, compare }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({ category: '', brand: '', minPrice: 0, maxPrice: 100000, inStock: false, deal: false, bestSeller: false, trending: false, ...initialFilters });
  const [sort, setSort] = useState('popular');

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || [])); fetch('/api/brands').then(r => r.json()).then(d => setBrands(d.brands || [])); }, []);
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 0 && v !== false) p.set(k, v); });
    p.set('sort', sort); p.set('limit', 24);
    fetch(`/api/products?${p.toString()}`).then(r => r.json()).then(d => { setProducts(d.products || []); setTotal(d.total || 0); setLoading(false); });
  }, [filters, sort]);

  const activeCat = cats.find(c => c.slug === filters.category);
  const title = activeCat ? activeCat.name : filters.deal ? "Today's Deals" : filters.bestSeller ? 'Best Sellers' : filters.trending ? 'Trending Now' : 'All Products';
  const cardProps = (p) => ({ p, onOpen: () => setView({ name: 'product', slug: p.slug }), onAdd: cart.add, wishHas: wish.has(p.slug), onWish: wish.toggle, compareHas: compare.has(p.slug), onCompare: compare.toggle });

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
        <button onClick={() => setView({ name: 'home' })} className="hover:text-white">Home</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/80">{title}</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">{title}</h1>
      <p className="text-white/50 text-sm mb-6">{total} products found</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="glass rounded-2xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4"><SlidersHorizontal className="w-4 h-4 text-primary" /><span className="font-medium">Filters</span></div>
            <Accordion type="multiple" defaultValue={['cat', 'brand', 'price', 'other']} className="space-y-1">
              <AccordionItem value="cat" className="border-white/5">
                <AccordionTrigger className="hover:no-underline text-sm">Category</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                  {cats.map(c => (
                    <label key={c.slug} className="flex items-center gap-2 text-sm text-white/70 hover:text-white cursor-pointer">
                      <Checkbox checked={filters.category === c.slug} onCheckedChange={(v) => setFilters(f => ({ ...f, category: v ? c.slug : '' }))} />
                      <span>{c.name}</span><span className="ml-auto text-xs text-white/40">{c.count}</span>
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="brand" className="border-white/5">
                <AccordionTrigger className="hover:no-underline text-sm">Brand</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                  {brands.map(b => (
                    <label key={b.slug} className="flex items-center gap-2 text-sm text-white/70 hover:text-white cursor-pointer">
                      <Checkbox checked={filters.brand === b.slug} onCheckedChange={(v) => setFilters(f => ({ ...f, brand: v ? b.slug : '' }))} />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price" className="border-white/5">
                <AccordionTrigger className="hover:no-underline text-sm">Price</AccordionTrigger>
                <AccordionContent className="pt-3">
                  <Slider min={0} max={100000} step={500} value={[filters.minPrice, filters.maxPrice]} onValueChange={(v) => setFilters(f => ({ ...f, minPrice: v[0], maxPrice: v[1] }))} />
                  <div className="flex justify-between text-xs text-white/60 mt-2"><span>{inr(filters.minPrice)}</span><span>{inr(filters.maxPrice)}</span></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="other" className="border-white/5">
                <AccordionTrigger className="hover:no-underline text-sm">Availability & Deals</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={filters.inStock} onCheckedChange={(v) => setFilters(f => ({ ...f, inStock: !!v }))} />In Stock</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={filters.deal} onCheckedChange={(v) => setFilters(f => ({ ...f, deal: !!v }))} />On Deal</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={filters.bestSeller} onCheckedChange={(v) => setFilters(f => ({ ...f, bestSeller: !!v }))} />Best Sellers</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={filters.trending} onCheckedChange={(v) => setFilters(f => ({ ...f, trending: !!v }))} />Trending</label>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button variant="outline" className="w-full mt-4 border-white/10 hover:bg-white/5" onClick={() => setFilters({ category: '', brand: '', minPrice: 0, maxPrice: 100000, inStock: false, deal: false, bestSeller: false, trending: false })}>Clear Filters</Button>
          </div>
        </aside>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0a0c14] border-white/10 text-white">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-sm text-white/60">Showing {products.length} of {total}</div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl shimmer bg-white/5" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-white/50">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.slug} {...cardProps(p)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// -------- Product Detail --------
const ProductView = ({ slug, setView, cart, wish, compare }) => {
  const [data, setData] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  useEffect(() => { setData(null); setImgIdx(0); fetch(`/api/products/${slug}`).then(r => r.json()).then(setData); }, [slug]);
  if (!data?.product) return <div className="container py-20 text-center text-white/50">Loading…</div>;
  const p = data.product;
  const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const cardProps = (rp) => ({ p: rp, onOpen: () => setView({ name: 'product', slug: rp.slug }), onAdd: cart.add, wishHas: wish.has(rp.slug), onWish: wish.toggle, compareHas: compare.has(rp.slug), onCompare: compare.toggle });

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
        <button onClick={() => setView({ name: 'home' })} className="hover:text-white">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => setView({ name: 'products', filters: { category: p.category } })} className="hover:text-white capitalize">{p.category.replace('-', ' ')}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/80 truncate max-w-xs">{p.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 cursor-zoom-in" onClick={() => setZoom(true)}>
            <img src={p.images[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
            {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0">-{discount}% OFF</Badge>}
          </div>
          <div className="flex gap-2 mt-3">
            {p.images.map((im, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${imgIdx === i ? 'border-primary glow-blue' : 'border-white/10'}`}>
                <img src={im} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider mb-2">
            <span className="text-primary">{p.brand}</span><span>·</span><span>SKU: {p.sku}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{p.name}</h1>
          <p className="text-white/60 mt-2">{p.short}</p>
          <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{p.rating}</span><span className="text-white/50">({p.reviews} reviews)</span></div>
            <span className="text-white/30">·</span>
            <span className="text-white/60">{p.sold}+ sold</span>
            <span className="text-white/30">·</span>
            <span className={p.stock > 20 ? 'text-secondary' : 'text-orange-400'}><Check className="w-3.5 h-3.5 inline mr-1" />{p.stock > 20 ? 'In Stock' : `Only ${p.stock} left`}</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3 flex-wrap">
            <div className="font-display text-4xl font-bold text-white">{inr(p.price)}</div>
            {p.mrp > p.price && <div className="text-lg text-white/40 line-through">{inr(p.mrp)}</div>}
            {discount > 0 && <Badge className="bg-secondary/20 text-secondary border-secondary/30">Save {inr(p.mrp - p.price)}</Badge>}
          </div>
          <div className="text-xs text-white/50 mt-1">Inclusive of GST · Free shipping above ₹999</div>
          <div className="mt-6 p-4 rounded-xl glass flex items-center gap-4 text-sm">
            <Truck className="w-5 h-5 text-primary" />
            <div><div className="font-medium">Free delivery by <span className="text-secondary">Tomorrow</span></div><div className="text-white/50 text-xs">Order in 3h 24m for same-day dispatch</div></div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-white/10 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-white/5"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-11 flex items-center justify-center hover:bg-white/5"><Plus className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => cart.add(p, qty)} className="flex-1 h-11 bg-primary hover:bg-primary/90 glow-blue"><ShoppingCart className="w-4 h-4 mr-2" />Add to Cart</Button>
            <Button onClick={() => wish.toggle(p.slug)} variant="outline" size="icon" className="h-11 w-11 border-white/10 hover:bg-white/5"><Heart className={`w-4 h-4 ${wish.has(p.slug) ? 'fill-red-500 text-red-500' : ''}`} /></Button>
            <Button onClick={() => compare.toggle(p)} variant="outline" size="icon" className="h-11 w-11 border-white/10 hover:bg-white/5" title="Compare"><GitCompare className={`w-4 h-4 ${compare.has(p.slug) ? 'text-primary' : ''}`} /></Button>
          </div>
          <Button onClick={() => { cart.add(p, qty); setView({ name: 'checkout' }); }} variant="outline" className="w-full mt-2 h-11 border-secondary/40 text-secondary hover:bg-secondary/10">Buy Now with Razorpay</Button>
          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            {[{ i: Shield, t: 'Authentic' }, { i: FileText, t: 'GST Invoice' }, { i: Headphones, t: 'Tech Support' }].map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <f.i className="w-4 h-4 text-primary mx-auto mb-1" /><div className="text-white/70">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="specs">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="desc">Description</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({p.reviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-6">
            <div className="glass rounded-2xl overflow-hidden">
              {Object.entries(p.specs).map(([k, v], i) => (
                <div key={k} className={`flex ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <div className="w-1/3 p-4 text-white/60 text-sm">{k}</div>
                  <div className="flex-1 p-4 text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="desc" className="mt-6"><div className="glass rounded-2xl p-6 text-white/80 leading-relaxed">{p.description}</div></TabsContent>
          <TabsContent value="downloads" className="mt-6">
            <div className="grid md:grid-cols-2 gap-3">
              {['Datasheet.pdf', 'Schematic.pdf', 'Pinout Diagram.pdf', 'Example Code.zip'].map(f => (
                <a key={f} className="flex items-center gap-3 p-4 rounded-xl glass hover:border-primary/30 border border-transparent transition cursor-pointer">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1"><div className="text-sm font-medium">{f}</div><div className="text-xs text-white/50">Click to download</div></div>
                  <Download className="w-4 h-4 text-white/50" />
                </a>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                <div className="text-center">
                  <div className="font-display text-5xl font-bold">{p.rating}</div>
                  <div className="flex gap-0.5 justify-center mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />)}</div>
                  <div className="text-xs text-white/50 mt-1">{p.reviews} reviews</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(s => (<div key={s} className="flex items-center gap-2 text-xs"><span className="w-4">{s}★</span><div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-yellow-400" style={{ width: `${s === 5 ? 68 : s === 4 ? 22 : s === 3 ? 6 : 2}%` }} /></div></div>))}
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {[{ n: 'Vikram S.', d: '2 days ago', s: 5, t: 'Genuine product, arrived in perfect condition.' }, { n: 'Anita R.', d: '1 week ago', s: 5, t: 'Amazing quality. Fast delivery to Chennai.' }, { n: 'Kartik M.', d: '2 weeks ago', s: 4, t: 'Solid product for the price.' }].map((r, i) => (
                  <div key={i} className="pb-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{r.n}</span><Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary">Verified</Badge><span className="text-xs text-white/40">· {r.d}</span></div>
                    <div className="flex gap-0.5 mb-2">{Array.from({ length: r.s }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                    <p className="text-sm text-white/70">{r.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {data.related?.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.related.slice(0, 4).map(rp => <ProductCard key={rp.slug} {...cardProps(rp)} />)}
          </div>
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-zoom-out">
            <img src={p.images[imgIdx]} alt={p.name} className="max-w-full max-h-full rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -------- App --------
const App = () => {
  const [view, setView] = useState({ name: 'home' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, token, loading: authLoading, login, logout, authFetch } = useAuth();
  const cart = useCart();
  const compare = useCompare();
  const wish = useWish(authFetch, user);

  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view.name, view.slug]);

  const requireLogin = () => { setAuthOpen(true); };

  return (
    <div className="min-h-screen bg-[#05060A]">
      <Header setView={setView} cart={cart} wish={wish} compare={compare} user={user} onSearchOpen={() => setSearchOpen(true)} onLogin={() => setAuthOpen(true)} onLogout={() => { logout(); setView({ name: 'home' }); }} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} setView={setView} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={login} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={view.name + (view.slug || '') + JSON.stringify(view.filters || {})} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {view.name === 'home' && <HomeView setView={setView} cart={cart} wish={wish} compare={compare} />}
            {view.name === 'products' && <ProductsView initialFilters={view.filters || {}} setView={setView} cart={cart} wish={wish} compare={compare} />}
            {view.name === 'product' && <ProductView slug={view.slug} setView={setView} cart={cart} wish={wish} compare={compare} />}
            {view.name === 'checkout' && <CheckoutView cart={cart} user={user} authFetch={authFetch} setView={setView} onLoginRequired={requireLogin} />}
            {view.name === 'dashboard' && (user ? <DashboardView user={user} authFetch={authFetch} logout={() => { logout(); setView({ name: 'home' }); }} setView={setView} wish={wish} /> : <div className="container py-20 text-center"><Button onClick={() => setAuthOpen(true)} className="bg-primary hover:bg-primary/90">Sign in to view</Button></div>)}
            {view.name === 'admin' && (user ? <AdminView user={user} authFetch={authFetch} setView={setView} logout={() => { logout(); setView({ name: 'home' }); }} /> : <div className="container py-20 text-center"><Button onClick={() => setAuthOpen(true)} className="bg-primary hover:bg-primary/90">Sign in as admin</Button></div>)}
            {view.name === 'compare' && <CompareView compare={compare} setView={setView} cart={cart} />}
          </motion.div>
        </AnimatePresence>
      </main>
      {['home', 'products', 'product'].includes(view.name) && view.name !== 'home' && <Footer setView={setView} />}
    </div>
  );
};

export default App;
