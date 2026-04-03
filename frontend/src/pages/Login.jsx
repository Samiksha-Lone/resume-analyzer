import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const origin = location.state?.from?.pathname || '/analyze';
      navigate(origin);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1C1C1C] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-1"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[140px] rounded-full -z-1"></div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-tighter mb-4">
            <Sparkles className="w-3 h-3" />
            <span>Welcome Back to HireMetric</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white leading-none">
            Member <span className="text-accent underline decoration-stone-800/30">Login.</span>
          </h1>
        </motion.div>

        <Card className="bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl rounded-[32px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/10">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Credential Identity</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 rounded-2xl py-3.5 pl-14 pr-8 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Access Secret</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Password"
                      className="w-full bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 rounded-2xl py-3.5 pl-14 pr-12 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-stone-400 hover:text-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-6 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] h-14 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                       <Activity className="pulse-slow w-4 h-4" /> 
                       Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       Secure Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-4 border-t border-stone-100 dark:border-white/5 flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-stone-500">Don't have an account yet?</p>
              <Link to="/signup">
                <Button variant="ghost" className="text-accent font-black text-[10px] uppercase tracking-widest hover:bg-accent/10 px-8 py-3 rounded-xl">
                  Initialize Membership
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-stone-500">Encrypted</span>
           </div>
           <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-stone-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-stone-500">Swift Audit</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
