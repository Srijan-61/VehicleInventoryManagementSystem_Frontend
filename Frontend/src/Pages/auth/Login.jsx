import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7111/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.Token || data.token;
        localStorage.setItem('token', token);
        
        try {
          // Decode the JWT payload to get the user's role
          const payload = JSON.parse(atob(token.split('.')[1]));
          // ASP.NET Core often stores the role in this schema URI or just 'role'
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
          
          toast.success('Login successful!');
          
          // Navigate based on role
          if (role === 'Staff') {
            navigate('/staff');
          } else if (role === 'Customer') {
            navigate('/customer');
          } else {
            navigate('/admin'); // Default or Admin
          }
        } catch (e) {
          toast.success('Login successful!');
          navigate('/admin');
        }
      } else {
        toast.error(data.Message || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.error('An error occurred while connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 xl:p-32 relative z-10">
        
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-3 text-sm lg:text-base">Please enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>



            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading ? 'Authenticating...' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center sm:text-left">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Sign-up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Illustration / Design */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50 items-center justify-center overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 w-full h-full bg-grid-slate-200/[0.04] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-indigo-50/50 mix-blend-multiply"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-400/20 blur-[120px]"></div>
        
        {/* Abstract illustration representation */}
        <div className="relative z-10 w-full max-w-lg p-12">
          <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl p-8 relative">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl rotate-12 opacity-80 blur-[2px]"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-full opacity-80 blur-[2px]"></div>
            
            <div className="relative z-10">

              <h3 className="text-2xl font-bold text-slate-800 mb-4">Streamline Your Vehicle Inventory</h3>
              <p className="text-slate-600 leading-relaxed">
                Experience a seamless management system for your vehicle inventory, parts, and customer relationships all in one powerful platform.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-1/2 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-5/6 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

