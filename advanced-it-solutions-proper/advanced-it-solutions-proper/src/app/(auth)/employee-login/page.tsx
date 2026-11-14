'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials.');
      router.push(data.redirectTo || '/portal/employee/dashboard');
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
          <h1 className="text-2xl font-bold text-white">Employee ID Portal</h1>
        </div>
        {error && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded">{error}</div>}
        <form onSubmit= {handleLogin} className="space-y-4">
          <input type="text" placeholder="AIS-EMP-1001" value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} required className="w-full p-2.5 bg-[#060B19] border border-slate-800 rounded text-white text-sm uppercase" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2.5 bg-[#060B19] border border-slate-800 rounded text-white text-sm" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded">Sign In</button>
        </form>
      </div>
    </div>
  );
}