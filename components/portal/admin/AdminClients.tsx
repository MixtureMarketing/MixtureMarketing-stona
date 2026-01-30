import React, { useState, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import Button from '../../common/Button';
import { Client } from '../types';

interface AdminClientsProps {
  clients: Client[];
  onEdit: (client?: Partial<Client>) => void;
}

const AdminClients: React.FC<AdminClientsProps> = ({ clients, onEdit }) => {
  const [clientSearch, setClientSearch] = useState('');

  const filteredClients = useMemo(
    () =>
      (clients || []).filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.company_name?.toLowerCase().includes(clientSearch.toLowerCase()),
      ),
    [clients, clientSearch],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Szukaj klienta (imię, email, firma)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
          <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <Button onClick={() => onEdit({})} icon={<Plus size={18} />}>
          Dodaj Klienta
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Nazwa</th>
              <th className="px-6 py-4">Firma</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-dark">{client.name}</td>
                <td className="px-6 py-4">{client.company_name}</td>
                <td className="px-6 py-4 text-gray-500">{client.email}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEdit(client)} className="text-blue-600 hover:underline">
                    Edytuj
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nie znaleziono klientów spełniających kryteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClients;
