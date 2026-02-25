
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { authService } from "../../services/auth.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await authService.login(email, password);
      if (success) {
        navigate("/home");
      } else {
        alert("Error signing in");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error signing in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 text-white transform -rotate-6">
          <span className="text-3xl font-bold">N</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-10 text-sm">Please sign in to continue your studies</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm transition-all"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm transition-all"
              required
            />
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot Password?</a>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-xs text-gray-400">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
