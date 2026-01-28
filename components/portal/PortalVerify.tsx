/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

// Global variable to prevent double-firing in Strict Mode
let verificationInProgress: string | null = null;

const PortalVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyToken, user } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTimeout(() => setError(true), 0);
      return;
    }

    // Prevent double verification for the same token
    if (verificationInProgress === token) return;
    verificationInProgress = token;

    const verify = async () => {
      // Force verify (overwrites existing session)
      const success = await verifyToken(token);
      verificationInProgress = null;
      if (success) {
        navigate('/portal/dashboard');
      } else {
        setError(true);
      }
    };
    verify();
  }, [searchParams, verifyToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Błąd weryfikacji</h2>
        <p className="text-gray-600 mb-8 max-w-sm">
          Link wygasł lub jest nieprawidłowy. Spróbuj zalogować się ponownie.
        </p>
        <Button onClick={() => navigate('/portal')}>Wróć do logowania</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 size={48} className="text-secondary animate-spin mb-4" />
      <p className="text-gray-500 font-medium animate-pulse">Weryfikacja dostępu...</p>
    </div>
  );
};

export default PortalVerify;
