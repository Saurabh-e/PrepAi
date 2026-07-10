import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      showToast('Welcome back to PrepAI!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || 'Login failed. Please verify credentials.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-bg-card border border-border-base p-8 rounded-2xl shadow-xl z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-xl p-3 bg-primary/15 text-primary mb-4">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-text-main">
            Welcome back to PrepAI
          </h2>
          <p className="text-xs text-text-muted mt-1.5 text-center">
            Sign in to start practicing mock interviews with AI.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
              />
            </div>
            {errors.email && (
              <span className="text-[11px] font-medium text-rose-500">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text-muted">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-primary hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
              />
            </div>
            {errors.password && (
              <span className="text-[11px] font-medium text-rose-500">{errors.password.message}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-base text-center">
          <p className="text-xs text-text-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
