'use client';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Star, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inr } from '@/lib/store';

export default function CompareView({ compare, setView, cart }) {
  if (compare.items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Compare Products</h1>
        <p className="text-white/60 mb-4">Add products to compare from any product listing (up to 4)</p>
        <Button onClick={() => setView({ name: 'products' })} className="bg-primary hover:bg-primary/90">Browse Products</Button>
      </div>
    );
  }

  // Collect all spec keys across items
  const specKeys = Array.from(new Set(compare.items.flatMap(p => Object.keys(p.specs || {}))));

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Compare Products</h1>
          <p className="text-white/50 text-sm mt-1">Side-by-side comparison of {compare.items.length} product{compare.items.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" onClick={compare.clear} className="border-white/10">Clear all</Button>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <tbody>
            <tr>
              <td className="p-4 w-32 border-b border-white/5 font-medium text-white/60">Product</td>
              {compare.items.map(p => (
                <td key={p.slug} className="p-4 border-b border-white/5 min-w-[220px] align-top">
                  <div className="relative">
                    <button onClick={() => compare.toggle(p)} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center"><X className="w-3 h-3" /></button>
                    <img src={p.image} alt={p.name} className="w-full aspect-square rounded-xl object-cover mb-2" />
                    <div className="font-medium leading-tight">{p.name}</div>
                    <div className="text-xs text-white/50 mt-1">{p.brand}</div>
                    <div className="mt-2 font-bold text-primary">{inr(p.price)}</div>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/5 font-medium text-white/60">Rating</td>
              {compare.items.map(p => <td key={p.slug} className="p-4 border-b border-white/5"><div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{p.rating} ({p.reviews})</div></td>)}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/5 font-medium text-white/60">Stock</td>
              {compare.items.map(p => <td key={p.slug} className="p-4 border-b border-white/5"><span className={p.stock > 20 ? 'text-secondary' : 'text-orange-400'}>{p.stock > 20 ? 'In Stock' : `${p.stock} left`}</span></td>)}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/5 font-medium text-white/60">Description</td>
              {compare.items.map(p => <td key={p.slug} className="p-4 border-b border-white/5 text-xs text-white/70">{p.short}</td>)}
            </tr>
            {specKeys.map(k => (
              <tr key={k}>
                <td className="p-4 border-b border-white/5 font-medium text-white/60">{k}</td>
                {compare.items.map(p => <td key={p.slug} className="p-4 border-b border-white/5 text-xs">{p.specs?.[k] ? <span className="text-white/90">{p.specs[k]}</span> : <Minus className="w-3.5 h-3.5 text-white/20" />}</td>)}
              </tr>
            ))}
            <tr>
              <td className="p-4 font-medium text-white/60">Action</td>
              {compare.items.map(p => (
                <td key={p.slug} className="p-4">
                  <Button size="sm" onClick={() => cart.add(p)} className="w-full bg-primary hover:bg-primary/90"><ShoppingCart className="w-3.5 h-3.5 mr-1.5" />Add to Cart</Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
