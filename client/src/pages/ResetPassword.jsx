import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Home as HomeIcon,
  Loader2,
  Lock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import { toast } from "../utils/toast";

const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password must include one uppercase letter.";
  if (!/[0-9]/.test(value)) return "Password must include one number.";
  return "";
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const normalizedToken = useMemo(
    () => String(token || "").trim().replace(/[^a-f0-9]/gi, ""),
    [token]
  );

  const passwordError = useMemo(() => validatePassword(password), [password]);
  const confirmError = useMemo(() => {
    if (!confirmPassword) return "Please confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  }, [confirmPassword, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!normalizedToken) {
      const message = "Reset link is invalid or incomplete.";
      setError(message);
      toast.error(message);
      return;
    }

    const message = passwordError || confirmError;
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await api.post(`/auth/reset-password/${normalizedToken}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data?.message || "Password reset successfully.");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Reset Password</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Secure Access
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Set a New <span className="italic text-amber-400">Password</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-sm mx-auto mt-4 leading-relaxed">
            Choose a strong password for your account.
          </p>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-[450px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <>
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                  Reset Your Password
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Enter your new password below. It will update your account immediately.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-12 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-12 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-amber-700 transition-colors"
                >
                  Need a new reset link?
                </Link>
              </div>
            </>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
