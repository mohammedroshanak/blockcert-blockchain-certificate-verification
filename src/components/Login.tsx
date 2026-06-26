import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { useCertificates } from '../context/CertificateContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login, addLog } = useCertificates();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
      addLog('Login Attempt Failed', `Failed login attempt with email: ${email}`, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/10 mb-4 ring-1 ring-sky-300/20">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2 font-sans">
            BLOCKCERT
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Blockchain-Based Academic Certificate Verification System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
          
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-left">
            Admin Portal Access
          </h2>

          {error && (
            <div className="mb-5 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-200 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Institutional Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@blockcert.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-200 placeholder-slate-600 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-200 placeholder-slate-600 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credentials helper card */}
          <div className="mt-6 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-left">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-2.5">
              Role-Based Demo Accounts
            </span>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                <div>
                  <p className="font-bold text-slate-300">Super Admin <span className="text-[9px] text-indigo-400 font-normal">(System Master)</span></p>
                  <p className="text-[10px] font-mono text-slate-500">superadmin@blockcert.edu</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('superadmin@blockcert.edu');
                    setPassword('superadmin123');
                    setError('');
                  }}
                  className="text-[10px] bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-850 px-2 py-1 rounded transition cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                <div>
                  <p className="font-bold text-slate-300">Registrar <span className="text-[9px] text-emerald-400 font-normal">(Issuer & Revoker)</span></p>
                  <p className="text-[10px] font-mono text-slate-500">registrar@blockcert.edu</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('registrar@blockcert.edu');
                    setPassword('registrar123');
                    setError('');
                  }}
                  className="text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-850 px-2 py-1 rounded transition cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                <div>
                  <p className="font-bold text-slate-300">HOD <span className="text-[9px] text-amber-400 font-normal">(Dept. Validator)</span></p>
                  <p className="text-[10px] font-mono text-slate-500">hodcs@blockcert.edu</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('hodcs@blockcert.edu');
                    setPassword('hodcs123');
                    setError('');
                  }}
                  className="text-[10px] bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 border border-amber-850 px-2 py-1 rounded transition cursor-pointer"
                >
                  Autofill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Footer */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Final Year CSE Academic Project © 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
};
