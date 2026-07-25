'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Zap, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login'); // login | register | otp | forgot | reset
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const call = async (path, body) => {
    setLoading(true);
    const r = await fetch(`/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { toast.error(d.error || 'Failed'); return null; }
    return d;
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    const d = await call('login', { email, password });
    if (d) { onSuccess(d.token, d.user); onClose(); }
  };
  const submitRegister = async (e) => {
    e.preventDefault();
    const d = await call('register', { name, email, password });
    if (d) { setDevOtp(d.devOtp); setMode('otp'); toast.info(`Dev OTP: ${d.devOtp}`); }
  };
  const submitOtp = async (e) => {
    e.preventDefault();
    const d = await call('verify-otp', { email, otp });
    if (d) { onSuccess(d.token, d.user); onClose(); }
  };
  const submitForgot = async (e) => {
    e.preventDefault();
    const d = await call('forgot', { email });
    if (d) { setDevOtp(d.devOtp || ''); if (d.devOtp) toast.info(`Dev OTP: ${d.devOtp}`); setMode('reset'); }
  };
  const submitReset = async (e) => {
    e.preventDefault();
    const d = await call('reset', { email, otp, password });
    if (d) { toast.success('Password reset. Please log in.'); setMode('login'); setPassword(''); setOtp(''); }
  };

  const quickAdmin = () => { setMode('login'); setEmail('admin@voltmart.com'); setPassword('admin123'); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md glass-strong rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative p-8">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-blue"><Zap className="w-5 h-5" fill="white" /></div>
                <div>
                  <div className="font-display text-xl font-bold">Volt<span className="text-accent-gradient">Mart</span></div>
                  <div className="text-xs text-white/50">Premium electronics marketplace</div>
                </div>
              </div>

              {mode === 'login' && (
                <>
                  <h2 className="font-display text-2xl font-bold mb-1">Welcome back</h2>
                  <p className="text-sm text-white/50 mb-6">Log in to your VoltMart account</p>
                  <form onSubmit={submitLogin} className="space-y-3">
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-11 bg-white/5 border-white/10" />
                    <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="h-11 bg-white/5 border-white/10" />
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">Forgot password?</button>
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 glow-blue">{loading ? 'Logging in…' : 'Log in'}</Button>
                    <Button type="button" variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5">Continue with Google</Button>
                  </form>
                  <div className="mt-4 p-3 rounded-xl bg-secondary/5 border border-secondary/20 text-xs text-white/70">
                    <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-3.5 h-3.5 text-secondary" /><span className="font-medium text-secondary">Demo admin access</span></div>
                    <div>Email: <code className="text-white">admin@voltmart.com</code> · Password: <code className="text-white">admin123</code></div>
                    <button type="button" onClick={quickAdmin} className="mt-1 text-secondary hover:underline">Fill credentials →</button>
                  </div>
                  <p className="text-sm text-center mt-4 text-white/60">New to VoltMart? <button onClick={() => setMode('register')} className="text-primary hover:underline">Create account</button></p>
                </>
              )}

              {mode === 'register' && (
                <>
                  <h2 className="font-display text-2xl font-bold mb-1">Create account</h2>
                  <p className="text-sm text-white/50 mb-6">Get ₹100 off your first order</p>
                  <form onSubmit={submitRegister} className="space-y-3">
                    <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="h-11 bg-white/5 border-white/10" />
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-11 bg-white/5 border-white/10" />
                    <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="h-11 bg-white/5 border-white/10" />
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 glow-blue">{loading ? 'Creating…' : 'Create account'}</Button>
                  </form>
                  <p className="text-sm text-center mt-4 text-white/60">Already have an account? <button onClick={() => setMode('login')} className="text-primary hover:underline">Log in</button></p>
                </>
              )}

              {mode === 'otp' && (
                <>
                  <h2 className="font-display text-2xl font-bold mb-1">Verify your email</h2>
                  <p className="text-sm text-white/50 mb-6">Enter the 6-digit code sent to <span className="text-white">{email}</span></p>
                  {devOtp && <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">Dev mode — your OTP is <code className="text-white font-bold text-base">{devOtp}</code></div>}
                  <form onSubmit={submitOtp} className="space-y-3">
                    <Input required maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" className="h-11 bg-white/5 border-white/10 text-center tracking-[0.5em] text-lg font-mono" />
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 glow-blue">Verify & continue</Button>
                  </form>
                </>
              )}

              {mode === 'forgot' && (
                <>
                  <h2 className="font-display text-2xl font-bold mb-1">Reset password</h2>
                  <p className="text-sm text-white/50 mb-6">We'll send an OTP to your email</p>
                  <form onSubmit={submitForgot} className="space-y-3">
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-11 bg-white/5 border-white/10" />
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">Send OTP</Button>
                  </form>
                  <p className="text-sm text-center mt-4 text-white/60"><button onClick={() => setMode('login')} className="text-primary hover:underline">Back to login</button></p>
                </>
              )}

              {mode === 'reset' && (
                <>
                  <h2 className="font-display text-2xl font-bold mb-1">Set new password</h2>
                  <p className="text-sm text-white/50 mb-6">Enter the OTP and your new password</p>
                  {devOtp && <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">Dev OTP: <code className="text-white font-bold">{devOtp}</code></div>}
                  <form onSubmit={submitReset} className="space-y-3">
                    <Input required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="OTP" className="h-11 bg-white/5 border-white/10" />
                    <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="h-11 bg-white/5 border-white/10" />
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">Reset password</Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
