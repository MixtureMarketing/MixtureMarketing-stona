/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const PortalLogin: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const success = await login(email);
    setStatus(success ? 'success' : 'error');
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <GlassCard className="max-w-md w-full p-8 text-center bg-white border-green-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Sprawdź skrzynkę!</h2>
          <p className="text-gray-600 mb-6">
            Wysłaliśmy link logowania na adres <strong>{email}</strong>. Kliknij go, aby uzyskać
            dostęp do panelu.
          </p>
          <Button variant="outline" onClick={() => setStatus('idle')}>
            Wróć
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <GlassCard className="max-w-md w-full p-8 bg-white border-gray-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-indigo-50 text-secondary mb-4">
            <Mail size={24} />
          </div>
          <h1 className="text-3xl font-bold text-dark">Strefa Klienta</h1>
          <p className="text-gray-500 mt-2">Zaloguj się bez hasła (Magic Link)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
              Email służbowy
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. jan@twoja-firma.pl"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} /> Nie znaleziono konta lub wystąpił błąd.
            </div>
          )}

          <Button
            className="w-full justify-center py-3"
            disabled={status === 'loading'}
            icon={status === 'loading' ? undefined : <ArrowRight size={18} />}
          >
            {status === 'loading' ? 'Wysyłanie...' : 'Wyślij Link Logowania'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default PortalLogin;
