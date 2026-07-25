'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle2, MapPin, CreditCard, Truck, Shield, Sparkles, Package, ChevronRight, Trash2, Plus, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { inr } from '@/lib/store';

export default function CheckoutView({ cart, user, authFetch, setView, onLoginRequired }) {
  const [step, setStep] = useState(1); // 1: address, 2: review, 3: payment, 4: success
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', type: 'Home' });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) { onLoginRequired(); return; }
    authFetch('/api/addresses').then(r => r.json()).then(d => {
      setAddresses(d.addresses || []);
      if (d.addresses?.length) setSelectedAddr(d.addresses[0].id);
      else setShowNewAddr(true);
    });
  }, [user]);

  if (!user) return <div className="container py-20 text-center text-white/60">Please log in to checkout.</div>;
  if (cart.items.length === 0 && step !== 4) return <div className="container py-20 text-center text-white/60">Your cart is empty. <button onClick={() => setView({ name: 'home' })} className="text-primary underline">Continue shopping</button></div>;

  const subtotal = cart.total;
  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const gst = Math.round(afterDiscount * 0.18);
  const shipping = afterDiscount > 999 ? 0 : 79;
  const total = afterDiscount + gst + shipping;

  const addAddress = async (e) => {
    e.preventDefault();
    const r = await authFetch('/api/addresses', { method: 'POST', body: JSON.stringify(newAddr) });
    const d = await r.json();
    if (r.ok) { setAddresses([...addresses, d.address]); setSelectedAddr(d.address.id); setShowNewAddr(false); setNewAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', type: 'Home' }); toast.success('Address saved'); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const r = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, subtotal }) });
    const d = await r.json();
    if (r.ok) { setCouponDiscount(d.discount); setCouponApplied(d.coupon); toast.success(`Applied ${d.coupon.code} — saved ${inr(d.discount)}`); }
    else { toast.error(d.error); setCouponDiscount(0); setCouponApplied(null); }
  };

  const placeOrder = async () => {
    setPlacing(true);
    // Simulate Razorpay flow with a short delay for UX
    if (paymentMethod === 'razorpay') {
      toast.info('Opening Razorpay…');
      await new Promise(r => setTimeout(r, 1200));
    }
    const r = await authFetch('/api/orders', { method: 'POST', body: JSON.stringify({ items: cart.items.map(i => ({ slug: i.slug, qty: i.qty })), addressId: selectedAddr, couponCode: couponApplied?.code, paymentMethod }) });
    const d = await r.json();
    if (r.ok) { setOrder(d.order); cart.clear(); setStep(4); }
    else { toast.error(d.error || 'Order failed'); }
    setPlacing(false);
  };

  return (
    <div className="container py-8 max-w-6xl">
      {step < 4 && (
        <>
          <button onClick={() => setView({ name: 'home' })} className="flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Back to shopping</button>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Checkout</h1>
          <div className="flex items-center gap-2 mb-8 text-sm">
            {['Address', 'Review', 'Payment'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step > i ? 'bg-secondary text-white' : step === i + 1 ? 'bg-primary text-white glow-blue' : 'bg-white/10 text-white/50'}`}>{step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}</div>
                <span className={step >= i + 1 ? 'text-white' : 'text-white/50'}>{s}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-white/30 mx-2" />}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div>
          {step === 1 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Delivery Address</h2>
              <div className="space-y-3">
                {addresses.map(a => (
                  <label key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${selectedAddr === a.id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" name="addr" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mt-1 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="font-medium">{a.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{a.type}</span></div>
                      <div className="text-sm text-white/70 mt-1">{a.line1}, {a.line2 && a.line2 + ', '}{a.city}, {a.state} - {a.pincode}</div>
                      <div className="text-sm text-white/50 mt-1">📞 {a.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
              {showNewAddr ? (
                <form onSubmit={addAddress} className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input required placeholder="Full name" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} className="bg-white/5 border-white/10" />
                    <Input required placeholder="Phone" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} className="bg-white/5 border-white/10" />
                  </div>
                  <Input required placeholder="Address line 1" value={newAddr.line1} onChange={e => setNewAddr({...newAddr, line1: e.target.value})} className="bg-white/5 border-white/10" />
                  <Input placeholder="Address line 2 (optional)" value={newAddr.line2} onChange={e => setNewAddr({...newAddr, line2: e.target.value})} className="bg-white/5 border-white/10" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input required placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="bg-white/5 border-white/10" />
                    <Input required placeholder="State" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} className="bg-white/5 border-white/10" />
                    <Input required placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">Save address</Button>
                    {addresses.length > 0 && <Button type="button" variant="outline" onClick={() => setShowNewAddr(false)} className="border-white/10">Cancel</Button>}
                  </div>
                </form>
              ) : (
                <Button variant="outline" onClick={() => setShowNewAddr(true)} className="mt-3 border-dashed border-white/20 hover:bg-white/5"><Plus className="w-4 h-4 mr-2" />Add new address</Button>
              )}
              <Button onClick={() => setStep(2)} disabled={!selectedAddr} className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 glow-blue">Continue to Review</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Order Items ({cart.items.length})</h2>
                <div className="space-y-3">
                  {cart.items.map(i => (
                    <div key={i.slug} className="flex gap-3 p-3 rounded-xl bg-white/5">
                      <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1"><div className="font-medium text-sm">{i.name}</div><div className="text-xs text-white/50">Qty: {i.qty}</div></div>
                      <div className="text-right"><div className="font-semibold">{inr(i.price * i.qty)}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-medium mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-secondary" />Apply Coupon</h3>
                <div className="flex gap-2">
                  <Input placeholder="Try WELCOME10, FLAT100, MEGA20" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="bg-white/5 border-white/10" />
                  <Button onClick={applyCoupon} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Apply</Button>
                </div>
                {couponApplied && <div className="mt-2 text-sm text-secondary">✓ {couponApplied.description} — saved {inr(couponDiscount)}</div>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="border-white/10">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 glow-blue">Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'razorpay', name: 'Razorpay', desc: 'Credit/Debit Card · UPI · Net Banking · Wallets', badge: 'Recommended' },
                  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive · ₹50 handling fee waived', badge: null },
                ].map(m => (
                  <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" name="pm" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="mt-1 accent-primary" />
                    <div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium">{m.name}</span>{m.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">{m.badge}</span>}</div><div className="text-sm text-white/60 mt-1">{m.desc}</div></div>
                  </label>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 text-sm">
                <Shield className="w-5 h-5 text-secondary shrink-0" />
                <div>Secure checkout — 256-bit SSL encryption. Your payment details are never stored on our servers.</div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="border-white/10">Back</Button>
                <Button onClick={placeOrder} disabled={placing} className="flex-1 h-12 bg-primary hover:bg-primary/90 glow-blue">{placing ? 'Processing…' : `Place Order · ${inr(total)}`}</Button>
              </div>
              <p className="text-[11px] text-white/40 text-center mt-3">By placing order, you agree to VoltMart's Terms of Service and Privacy Policy</p>
            </div>
          )}

          {step === 4 && order && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
              <div className="relative">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 glow-mint">
                  <CheckCircle2 className="w-12 h-12 text-secondary" />
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-white/60 mb-6">Order <span className="text-white font-mono">#{order.orderNo}</span> placed successfully</p>
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/60">Items:</span><span>{order.items.length}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Total paid:</span><span className="font-semibold text-primary">{inr(order.total)}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Delivering to:</span><span className="text-right">{order.address.city}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Est. delivery:</span><span className="text-secondary">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
                </div>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setView({ name: 'dashboard' })} className="border-white/10">View Orders</Button>
                  <Button onClick={() => setView({ name: 'home' })} className="bg-primary hover:bg-primary/90 glow-blue">Continue Shopping</Button>
                </div>
                <div className="mt-4 text-xs text-white/40 flex items-center justify-center gap-1"><FileText className="w-3 h-3" />GST invoice sent to your email</div>
              </div>
            </motion.div>
          )}
        </div>

        {step < 4 && (
          <aside>
            <div className="glass rounded-2xl p-6 sticky top-20">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70"><span>Subtotal ({cart.count} items)</span><span>{inr(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-secondary"><span>Discount ({couponApplied?.code})</span><span>-{inr(couponDiscount)}</span></div>}
                <div className="flex justify-between text-white/70"><span>GST (18%)</span><span>{inr(gst)}</span></div>
                <div className="flex justify-between text-white/70"><span>Shipping</span><span className={shipping === 0 ? 'text-secondary' : ''}>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
                <Separator className="bg-white/10 my-2" />
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-primary">{inr(total)}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/50 space-y-2">
                <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-primary" />Delivery in 1-3 days</div>
                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-primary" />GST invoice included</div>
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-primary" />100% authentic guarantee</div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
