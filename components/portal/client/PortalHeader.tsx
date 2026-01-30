import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Home, User as UserIcon, LogOut } from 'lucide-react';

interface PortalHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    company_name?: string;
  };
  onEditProfile: () => void;
  onLogout: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ user, onEditProfile, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="hidden md:block">
              <span className="block font-bold text-dark leading-none">Mixture</span>
              <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest">
                Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {user.role === 'admin' && (
            <Link
              to="/portal/admin"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-instagram hover:text-[#C2185B] transition-colors bg-red-50 px-3 py-1 rounded-lg border border-red-100"
            >
              <ShieldCheck size={16} /> Panel Admina
            </Link>
          )}
          <Link
            to="/"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-secondary transition-colors"
          >
            <Home size={18} /> Strona główna
          </Link>
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-dark">{user.name}</div>
              <div className="text-xxs text-gray-500">{user.email}</div>
            </div>
            <button
              onClick={onEditProfile}
              className="p-2 text-gray-400 hover:text-secondary hover:bg-indigo-50 rounded-lg transition-all"
              title="Edytuj profil"
            >
              <UserIcon size={20} />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Wyloguj się"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
