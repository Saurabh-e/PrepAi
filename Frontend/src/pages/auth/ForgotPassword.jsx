import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Sparkles, Mail, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export const ForgotPassword = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    // Simulate sending email request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      showToast('Password reset link sent to your email!', 'success');
    }, 1500);
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
        {!success ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="rounded-xl p-3 bg-primary/15 text-primary mb-4">
                <KeyRound className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-text-main">
                Reset Password
              </h2>
              <p className="text-xs text-text-muted mt-1.5 text-center">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={loading}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-500 mb-4">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-black text-text-main">Link Sent Successfully</h2>
            <p className="text-xs text-text-muted mt-3 max-w-xs">
              Check your inbox. We have sent password recovery instructions to the specified email address.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              variant="secondary"
              className="mt-6 w-full"
            >
              Change email address
            </Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border-base text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
