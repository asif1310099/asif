'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials.');
      router.push(data.redirectTo || '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B19] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-[#0B1224] p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <Logo />
          <h1 className="text-2xl font-bold text-white">Customer Sign In</h1>
        </div>
        {error && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2.5 bg-[#060B19] border border-slate-800 rounded text-white text-sm" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2.5 bg-[#060B19] border border-slate-800 rounded text-white text-sm" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded">Sign In</button>
        </form>
        <div className="text-center text-xs text-slate-400">
          <Link href="/register" className="text-emerald-400">Create Account</Link>
        </div>
      </div>
    </div>
  );
}