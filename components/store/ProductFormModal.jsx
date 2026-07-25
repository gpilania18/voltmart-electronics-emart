'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const empty = { name: '', brand: 'arduino', category: 'arduino', price: 999, mrp: 1299, stock: 100, image: '', short: '', description: '', sku: '', specs: [{ k: '', v: '' }], bestSeller: false, deal: false, trending: false, featured: false, new: true };

export default function ProductFormModal({ open, onClose, product, onSaved, authFetch, categories, brands }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const editing = !!product;

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        ...product,
        specs: product.specs ? Object.entries(product.specs).map(([k, v]) => ({ k, v })) : [{ k: '', v: '' }],
      });
    } else {
      setForm(empty);
    }
  }, [open, product]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSpec = (i, key, val) => setForm(f => ({ ...f, specs: f.specs.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));
  const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { k: '', v: '' }] }));
  const removeSpec = (i) => setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const specs = {};
    form.specs.forEach(s => { if (s.k && s.v) specs[s.k] = s.v; });
    const payload = {
      ...form,
      specs,
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock),
      images: form.image ? [form.image, ...(product?.images?.slice(1) || [])] : (product?.images || []),
    };
    delete payload.specs; payload.specs = specs;
    let r;
    if (editing) r = await authFetch(`/api/admin/products/${product.slug}`, { method: 'PATCH', body: JSON.stringify(payload) });
    else r = await authFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { toast.success(editing ? 'Product updated' : 'Product created'); onSaved(d.product); onClose(); }
    else toast.error(d.error || 'Failed');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-10 p-4 overflow-y-auto" onClick={onClose}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="w-full max-w-3xl glass-strong rounded-3xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl font-bold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-sm text-white/50">{editing ? `Editing ${product.name}` : 'Create a new product in your catalog'}</p>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {form.image && (
                <div className="flex justify-center"><img src={form.image} alt="preview" className="w-40 h-40 rounded-2xl object-cover border border-white/10" /></div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Product Name *</label>
                  <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arduino Uno R4 WiFi" className="bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">SKU</label>
                  <Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="ARD-UNO-R4" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Short Description *</label>
                <Input required value={form.short} onChange={e => set('short', e.target.value)} placeholder="Latest Arduino Uno with built-in WiFi" className="bg-white/5 border-white/10" />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Full Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description..." className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Product Image URL *</label>
                <Input required value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" className="bg-white/5 border-white/10" />
                <p className="text-[10px] text-white/40 mt-1">Tip: paste any Unsplash / Pexels URL</p>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Price (₹) *</label>
                  <Input required type="number" value={form.price} onChange={e => set('price', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">MRP (₹)</label>
                  <Input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Stock</label>
                  <Input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Discount</label>
                  <div className="h-10 flex items-center text-secondary font-semibold text-sm">
                    {form.mrp > form.price ? `${Math.round(((form.mrp - form.price) / form.mrp) * 100)}% off` : '—'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Category *</label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0c14] border-white/10 text-white max-h-64">
                      {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Brand *</label>
                  <Select value={form.brand} onValueChange={v => set('brand', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0c14] border-white/10 text-white max-h-64">
                      {brands.map(b => <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/60">Specifications</label>
                  <Button type="button" size="sm" variant="outline" onClick={addSpec} className="border-white/10 h-7 text-xs"><Plus className="w-3 h-3 mr-1" />Add row</Button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={s.k} onChange={e => setSpec(i, 'k', e.target.value)} placeholder="Key (e.g. MCU)" className="bg-white/5 border-white/10 flex-1" />
                      <Input value={s.v} onChange={e => setSpec(i, 'v', e.target.value)} placeholder="Value (e.g. ATmega328)" className="bg-white/5 border-white/10 flex-1" />
                      {form.specs.length > 1 && <button type="button" onClick={() => removeSpec(i)} className="w-9 h-9 rounded-md bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-2 block">Labels & Flags</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[['bestSeller', 'Best Seller'], ['deal', 'On Deal'], ['trending', 'Trending'], ['featured', 'Featured'], ['new', 'New arrival']].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
                      <Checkbox checked={!!form[k]} onCheckedChange={v => set(k, !!v)} />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/10">Cancel</Button>
              <Button onClick={submit} disabled={saving || !form.name || !form.image} className="bg-primary hover:bg-primary/90 glow-blue"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
