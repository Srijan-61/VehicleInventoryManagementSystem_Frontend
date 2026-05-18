import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { forgotPassword } from "../../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.info("Reset link sent if account exists.");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
              {!isLoading && <Send size={18} />}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-emerald-800 text-sm">
            <p>If an account exists for <strong>{email}</strong>, a reset link has been sent to your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
