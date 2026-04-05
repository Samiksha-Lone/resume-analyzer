import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Zap,
  BrainCircuit,
  Activity,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    // --- Client-side Validation ---
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (name.trim().length < 2) {
        setError('Name must be at least 2 characters long.');
        return;
      }

    if (/\d/.test(name)) {
      setError('Names should not contain numeric digits.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long for security.');
      return;
    }
    // ------------------------------

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/analyze');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
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
          className="flex flex-col items-center text-center mb-6"
        >
          <Link to="/" className="flex items-center gap-3 mb-4 group">
             <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6 text-white" />
             </div>
             <span className="text-xl font-black tracking-tighter dark:text-white">HIRE<span className="text-accent">METRIC</span></span>
          </Link>
          
          <h1 className="text-4xl font-black tracking-tighter dark:text-white leading-none">
            Member <span className="text-accent underline decoration-stone-800/30">Signup.</span>
          </h1>
        </motion.div>

        <Card className="bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl rounded-[32px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/10">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleRegister} className="space-y-4">
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

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Full Identity</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Display Name"
                      className="w-full bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 rounded-2xl py-3 pl-14 pr-8 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Credential Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 rounded-2xl py-3 pl-14 pr-8 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Access Secret</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Secure Password"
                      className="w-full bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 rounded-2xl py-3 pl-14 pr-12 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
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
                       Deploying Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       Create Membership <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-white/5 flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-stone-500">Already a member?</p>
              <Link to="/login">
                <Button variant="ghost" className="text-accent font-black text-[10px] uppercase tracking-widest hover:bg-accent/10 px-8 py-3 rounded-xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
