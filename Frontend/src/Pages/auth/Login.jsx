import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LogIn, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://localhost:7111/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.Token || data.token;
        localStorage.setItem("token", token);

        try {
          // Decode the JWT payload to get the user's role
          const payload = JSON.parse(atob(token.split(".")[1]));
          // ASP.NET Core often stores the role in this schema URI or just 'role'
          const role =
            payload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] || payload.role;

          toast.success("Login successful!");

          // Navigate based on role
          if (role === "Staff") {
            navigate("/staff");
          } else if (role === "Customer") {
            navigate("/customer");
          } else {
            navigate("/admin"); // Default or Admin
          }
        } catch (e) {
          toast.success("Login successful!");
          navigate("/admin");
        }
      } else {
        toast.error(
          data.Message ||
            data.message ||
            "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      toast.error("An error occurred while connecting to the server.");
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
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 mt-3 text-sm lg:text-base">
              Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>
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
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
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
                className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg "
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading ? "Authenticating..." : "Log In"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center sm:text-left">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign-up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Illustration / Design */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center overflow-hidden">
        {/* Vector Art Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <img
            src="/src/assets/login vector art.svg"
            alt="Login Illustration"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
