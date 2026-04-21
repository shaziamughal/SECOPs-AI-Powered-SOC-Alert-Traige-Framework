
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import Button from '../components/common/Button';

interface SignInProps {
  onLogin: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber-Grid Effect */}
      <div className="absolute inset-0 z-0" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', 
             backgroundSize: '40px 40px',
             opacity: 0.3
           }}>
      </div>
      
      {/* Animated Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl shadow-black/15">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-cyan-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SOC Admin Portal</h1>
            <p className="text-slate-500 text-sm mt-2">Authorized Personnel Only • Secure Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Operator ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input 
                  type="text" 
                  required
                  defaultValue="admin@secops.ai"
                  placeholder="admin.identifier"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Key</label>
                <button type="button" className="text-[10px] text-cyan-500 hover:underline">Forgot Key?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  defaultValue="password123"
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-cyan-900/15 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Establish Session</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* MFA Hint */}
          <div className="mt-8 pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                   <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="text-violet-400 font-bold block mb-0.5">MFA COMPLIANCE</span>
                  A validation prompt will be sent to your registered device upon clicking 'Establish Session'.
                </div>
             </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-slate-600 text-xs">
          SECOPS AI DASHBOARD v2.4.1 Build 9982 <br/>
          &copy; 2024 Global Cyber Defense Agency
        </p>
      </div>
    </div>
  );
};

export default SignIn;
