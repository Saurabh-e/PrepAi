import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth(data.firstName, data.lastName, data.email, data.password);
      showToast('Registration successful! Welcome.', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || 'Registration failed. Email may already be in use.',
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
        className="w-full max-w-md bg-bg-card border border-border-base p-8 rounded-2xl shadow-xl z-10 my-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-xl p-3 bg-primary/15 text-primary mb-4">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-text-main">
            Create an Account
          </h2>
          <p className="text-xs text-text-muted mt-1.5 text-center">
            Sign up to get personalized AI feedback and tracking reports.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted block">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="John"
                  {...register('firstName', { required: 'Required' })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
                />
              </div>
              {errors.firstName && (
                <span className="text-[10px] font-medium text-rose-500">{errors.firstName.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted block">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Doe"
                  {...register('lastName', { required: 'Required' })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
                />
              </div>
              {errors.lastName && (
                <span className="text-[10px] font-medium text-rose-500">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
              />
            </div>
            {errors.password && (
              <span className="text-[11px] font-medium text-rose-500">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                placeholder="Confirm password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === passwordValue || 'Passwords do not match',
                })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/60"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-[11px] font-medium text-rose-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            loading={loading}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-base text-center">
          <p className="text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
