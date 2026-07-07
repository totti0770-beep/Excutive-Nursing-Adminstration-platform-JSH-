import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { Heart, Lock, Mail, ShieldAlert } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      showToast('تم تسجيل الدخول بنجاح');
    } catch (err: any) {
      console.error(err);
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      showToast('خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4" dir="rtl">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gold/10 bg-bg-card shadow-2xl">
        <div className="bg-accent-gradient p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold">بوابة التمريض</h1>
          <p className="mt-2 text-sm text-white/80">مستشفى جازان التخصصي</p>
        </div>
        
        <div className="p-8">
          <h2 className="mb-6 text-xl font-bold text-text-primary text-center">تسجيل الدخول</h2>
          
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-secondary">البريد الإلكتروني</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gold/20 bg-bg-primary py-3 pl-4 pr-10 text-text-primary outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="admin@jazanhospital.com"
                />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-secondary">كلمة المرور</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gold/20 bg-bg-primary py-3 pl-4 pr-10 text-text-primary outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-accent-gradient py-3.5 text-[15px] font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-text-muted">
            <p>للمساعدة التقنية، يرجى التواصل مع قسم تقنية المعلومات</p>
          </div>
        </div>
      </div>
    </div>
  );
}
