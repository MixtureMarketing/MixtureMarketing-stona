import React from 'react';
import { X, RefreshCw, Save } from 'lucide-react';
import Button from '../../common/Button';
import AnimateOnScroll from '../../common/AnimateOnScroll';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: { name: string; company_name: string };
  setProfileData: React.Dispatch<React.SetStateAction<{ name: string; company_name: string }>>;
  onUpdate: (e: React.FormEvent) => void;
  loading: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  onUpdate,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <AnimateOnScroll className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold text-dark">Edytuj swój profil</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onUpdate} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Imię i Nazwisko
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Nazwa Firmy
              </label>
              <input
                type="text"
                value={profileData.company_name}
                onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                placeholder="Opcjonalnie"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                variant="outline"
                type="button"
                className="flex-1 justify-center"
                onClick={onClose}
              >
                Anuluj
              </Button>
              <Button
                icon={
                  loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />
                }
                className="flex-1 justify-center"
                disabled={loading}
              >
                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </div>
          </form>
        </div>
      </AnimateOnScroll>
    </div>
  );
};
