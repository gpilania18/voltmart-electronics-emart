'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Save, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Package, TrendingUp, AlertTriangle, XCircle, DollarSign, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { inr } from '@/lib/store';

// ============ COUPON FORM MODAL ============
const couponEmpty = { code: '', description: '', type: 'percent', value: 10, minAmount: 0, maxDiscount: 500, active: true };

export function CouponFormModal({ open, onClose, coupon, onSaved, authFetch }) {
  const [form, setForm] = useState(couponEmpty);
  const [saving, setSaving] = useState(false);
  const editing = !!coupon;

  useEffect(() => {
    if (!open) return;
    setForm(coupon ? { ...coupon } : couponEmpty);
  }, [open, coupon]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, value: Number(form.value), minAmount: Number(form.minAmount), maxDiscount: Number(form.maxDiscount), code: form.code.toUpperCase() };
    let r;
    if (editing) r = await authFetch(`/api/admin/coupons/${coupon.code}`, { method: 'PATCH', body: JSON.stringify(payload) });
    else r = await authFetch('/api/admin/coupons', { method: 'POST', body: JSON.stringify(payload) });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { toast.success(editing ? 'Coupon updated' : 'Coupon created'); onSaved(); onClose(); }
    else toast.error(d.error || 'Failed');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass-strong rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div><h2 className="font-display text-2xl font-bold">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2><p className="text-sm text-white/50">{editing ? `Editing ${coupon.code}` : 'Add a new discount coupon'}</p></div>
              <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Coupon Code *</label>
                <Input required disabled={editing} value={form.code} onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g. SUMMER25" className="bg-white/5 border-white/10 font-mono uppercase" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Description *</label>
                <Input required value={form.description} onChange={e => set('description', e.target.value)} placeholder="25% off on summer sale items" className="bg-white/5 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Type *</label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0c14] border-white/10 text-white"><SelectItem value="percent">Percent (%)</SelectItem><SelectItem value="flat">Flat (₹)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Value * {form.type === 'percent' ? '(%)' : '(₹)'}</label>
                  <Input required type="number" value={form.value} onChange={e => set('value', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Min Order Amount (₹)</label>
                  <Input type="number" value={form.minAmount} onChange={e => set('minAmount', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Max Discount (₹)</label>
                  <Input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer">
                <Checkbox checked={form.active} onCheckedChange={v => set('active', !!v)} />
                <span className="text-sm">Active (customers can use this coupon)</span>
              </label>
            </form>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/10">Cancel</Button>
              <Button onClick={submit} disabled={saving || !form.code || !form.description} className="bg-primary hover:bg-primary/90 glow-blue"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ BULK IMPORT MODAL ============
const CSV_TEMPLATE = `name,brand,category,price,mrp,stock,sku,image,short,description
"Sample Product A",arduino,arduino,1999,2499,50,SAMPLE-A,https://images.unsplash.com/photo-1517055729445-fa7d27394b48,"Short description here","Full description here"
"Sample Product B",espressif,esp32,899,1199,120,SAMPLE-B,https://images.unsplash.com/photo-1581092921461-eab62e97a780,"Another short desc","Another full desc"`;

function parseCSV(text) {
  const rows = [];
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  // Simple CSV parser handling quoted values
  const parseLine = (line) => {
    const out = []; let cur = ''; let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQuote && line[i + 1] === '"') { cur += '"'; i++; } else inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(v => v.trim());
  };
  const headers = parseLine(lines[0]).map(h => h.toLowerCase());
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

export function BulkImportModal({ open, onClose, onDone, authFetch }) {
  const [rows, setRows] = useState([]);
  const [step, setStep] = useState('upload'); // upload | preview | importing | done
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { if (!open) { setRows([]); setStep('upload'); setResult(null); } }, [open]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      if (!parsed.length) { toast.error('CSV appears empty or malformed'); return; }
      setRows(parsed); setStep('preview');
    };
    reader.readAsText(file);
  };

  const doImport = async () => {
    setStep('importing');
    const r = await authFetch('/api/admin/bulk-import', { method: 'POST', body: JSON.stringify({ products: rows }) });
    const d = await r.json();
    setResult(d); setStep('done');
    if (d.created > 0) onDone();
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'voltmart-products-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-10 p-4 overflow-y-auto" onClick={onClose}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-3xl glass-strong rounded-3xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div><h2 className="font-display text-2xl font-bold">Bulk Import Products</h2><p className="text-sm text-white/50">Upload a CSV to add many products at once</p></div>
              <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {step === 'upload' && (
              <div className="p-6 space-y-4">
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${dragOver ? 'border-primary bg-primary/5' : 'border-white/10'}`}>
                  <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                  <div className="font-medium mb-1">Drop your CSV here</div>
                  <p className="text-sm text-white/50 mb-4">or click to browse</p>
                  <label className="inline-block">
                    <input type="file" accept=".csv,text/csv" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                    <span className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm">Choose file</span>
                  </label>
                </div>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-secondary shrink-0" />
                  <div className="flex-1"><div className="text-sm font-medium">Need a template?</div><div className="text-xs text-white/50">Columns: name, brand, category, price, mrp, stock, sku, image, short, description</div></div>
                  <Button size="sm" variant="outline" onClick={downloadTemplate} className="border-white/10">Download CSV</Button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Found <span className="font-semibold text-primary">{rows.length}</span> product{rows.length !== 1 ? 's' : ''} to import</div>
                  <Button size="sm" variant="outline" onClick={() => setStep('upload')} className="border-white/10">Choose different file</Button>
                </div>
                <div className="glass rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5 sticky top-0"><tr>{['Name', 'Brand', 'Category', 'Price', 'Stock'].map(h => <th key={h} className="text-left p-2 text-white/60 uppercase">{h}</th>)}</tr></thead>
                    <tbody>
                      {rows.slice(0, 100).map((r, i) => (
                        <tr key={i} className="border-t border-white/5"><td className="p-2">{r.name || <span className="text-red-400">missing</span>}</td><td className="p-2 text-white/70">{r.brand}</td><td className="p-2 text-white/70">{r.category}</td><td className="p-2 text-primary">₹{r.price}</td><td className="p-2 text-white/70">{r.stock}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 100 && <p className="text-xs text-white/40 text-center">Showing first 100 of {rows.length} rows</p>}
              </div>
            )}

            {step === 'importing' && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <div className="font-medium">Importing {rows.length} products…</div>
                <p className="text-sm text-white/50 mt-1">This may take a few seconds</p>
              </div>
            )}

            {step === 'done' && result && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-3" />
                  <h3 className="font-display text-2xl font-bold">Import complete</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-display font-bold text-secondary">{result.created}</div><div className="text-xs text-white/60 mt-1">Created</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-display font-bold text-orange-400">{result.skipped}</div><div className="text-xs text-white/60 mt-1">Skipped</div></div>
                </div>
                {result.errors?.length > 0 && (
                  <div className="glass rounded-xl p-4 max-h-40 overflow-y-auto">
                    <div className="text-xs font-medium text-orange-400 mb-2">Errors:</div>
                    {result.errors.slice(0, 10).map((e, i) => <div key={i} className="text-xs text-white/60">• {e.name}: {e.reason}</div>)}
                  </div>
                )}
              </div>
            )}

            <div className="p-6 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <Button variant="outline" onClick={onClose} className="border-white/10">{step === 'done' ? 'Close' : 'Cancel'}</Button>
              {step === 'preview' && <Button onClick={doImport} className="bg-primary hover:bg-primary/90 glow-blue"><Upload className="w-4 h-4 mr-2" />Import {rows.length} products</Button>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ INSIGHTS TAB ============
export function InsightsTab({ authFetch, setView }) {
  const [data, setData] = useState(null);
  useEffect(() => { authFetch('/api/admin/insights').then(r => r.json()).then(setData); }, []);
  if (!data) return <div className="text-center py-20 text-white/50">Loading insights…</div>;

  return (
    <div className="space-y-6 mt-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'Total Products', v: data.totalProductCount, i: Package, c: '#0F62FE' },
          { l: 'Inventory Value', v: inr(data.totalInventoryValue), i: DollarSign, c: '#00C896' },
          { l: 'Total Stock Units', v: data.totalStock.toLocaleString('en-IN'), i: Boxes, c: '#a855f7' },
          { l: 'Avg. Price', v: inr(data.avgPrice), i: TrendingUp, c: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ background: s.c }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.c}20` }}><s.i className="w-5 h-5" style={{ color: s.c }} /></div>
              <div className="text-xl md:text-2xl font-display font-bold">{s.v}</div>
              <div className="text-xs text-white/50 mt-1">{s.l}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Selling & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary" />Top Selling Products (by revenue)</h3>
          {data.topSelling.length === 0 ? <p className="text-sm text-white/40 text-center py-8">No sales yet</p> : (
            <div className="space-y-2">
              {data.topSelling.map((p, i) => (
                <button key={p.slug} onClick={() => setView({ name: 'product', slug: p.slug })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left">
                  <span className="w-6 text-center text-xs font-mono text-white/40">#{i + 1}</span>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0"><div className="text-sm truncate">{p.name}</div><div className="text-xs text-white/50">{p.sold} sold · {inr(p.price)}</div></div>
                  <div className="text-sm font-semibold text-secondary">{inr(p.revenue)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Low Stock Alerts (&lt; 20 units)</h3>
          {data.lowStock.length === 0 ? <p className="text-sm text-secondary text-center py-8">All products well stocked ✓</p> : (
            <div className="space-y-2">
              {data.lowStock.map(p => (
                <button key={p.slug} onClick={() => setView({ name: 'product', slug: p.slug })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0"><div className="text-sm truncate">{p.name}</div><div className="text-xs text-white/50">SKU: {p.sku}</div></div>
                  <Badge className={`border-0 ${p.stock < 5 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{p.stock} left</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Out of Stock & Category Breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" />Out of Stock ({data.outOfStock.length})</h3>
          {data.outOfStock.length === 0 ? <p className="text-sm text-secondary text-center py-8">Nothing out of stock ✓</p> : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {data.outOfStock.slice(0, 30).map(p => (
                <button key={p.slug} onClick={() => setView({ name: 'product', slug: p.slug })} className="glass rounded-lg p-2 text-left hover:border-primary/30 border border-transparent">
                  <img src={p.image} alt={p.name} className="w-full aspect-square rounded object-cover mb-1" />
                  <div className="text-xs font-medium line-clamp-2">{p.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-medium mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.categoryBreakdown.slice(0, 8)} layout="vertical" margin={{ left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={(v, k) => k === 'value' ? [inr(v), 'Inventory value'] : [v, k]} />
              <Bar dataKey="count" fill="#0F62FE" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category detailed table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5"><h3 className="font-medium">Category Insights</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-white/50">
            <tr>{['Category', 'Products', 'Total Stock', 'Inventory Value', 'Avg Rating'].map(h => <th key={h} className="text-left p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.categoryBreakdown.map(c => (
              <tr key={c.name} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-3 capitalize font-medium">{c.name.replace('-', ' ')}</td>
                <td className="p-3 text-white/70">{c.count}</td>
                <td className="p-3 text-white/70">{c.stock.toLocaleString('en-IN')}</td>
                <td className="p-3 text-primary font-semibold">{inr(c.value)}</td>
                <td className="p-3">⭐ {c.avgRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
