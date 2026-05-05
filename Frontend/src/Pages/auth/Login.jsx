import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight, Users } from 'lucide-react';
import apiClient from '../../api/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // /api/Auth/login → proxied to https://localhost:7111/api/Auth/login
      const { data } = await apiClient.post('/Auth/login', { email, password });
      localStorage.setItem('token', data.Token || data.token);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" style={{ animation: 'pulse 6s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" style={{ animation: 'pulse 8s ease-in-out infinite 2s' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" style={{ animation: 'pulse 7s ease-in-out infinite 1s' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 m-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl" style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}>
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}>
              <Car className="h-8 w-8 text-white" />
            </div>
            <div className="text-center" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.2s both' }}>
              <h1 className="text-2xl font-bold tracking-tight text-white">Vehicle Inventory</h1>
              <p className="mt-1 text-sm text-blue-200/70">Sign in to access the management system</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.3s both' }}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-blue-200/80">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/50" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-blue-400/60 focus:bg-white/15 focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-blue-200/80">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/50" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-blue-400/60 focus:bg-white/15 focus:ring-2 focus:ring-blue-500/30" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <><svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Authenticating…</>
                ) : (
                  <>Sign In<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></>
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/25" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.4s both' }}>Vehicle Inventory Management System</p>

          <div className="mt-4" style={{ animation: 'fadeSlideUp 0.6s ease-out 0.5s both' }}>
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" /><span className="text-xs text-white/25">or</span><div className="flex-1 h-px bg-white/10" />
            </div>
            <Link to="/customer" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-blue-200/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
              <Users className="h-4 w-4" />Customer Self Service Portal<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Login;
