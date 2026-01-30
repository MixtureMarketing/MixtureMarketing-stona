import React, { useState, useMemo } from 'react';
import { Briefcase, Plus, Edit, ExternalLink, FilePlus, Trash2, X } from 'lucide-react';
import Button from '../../common/Button';
import { Project } from '../types';

interface AdminProjectsProps {
  projects: Project[];
  onEdit: (project?: Partial<Project>) => void;
  onDownload: (docId: string, fileName: string) => void;
  onDeleteDoc: (id: string) => void;
  onUploadDoc: (e: React.FormEvent) => void;
  uploadDocData: {
    project_id: string;
    name: string;
    type: 'invoice' | 'document';
    subtype: string;
    file: File | null;
  };
  setUploadDocData: (data: {
    project_id: string;
    name: string;
    type: 'invoice' | 'document';
    subtype: string;
    file: File | null;
  }) => void;
  isUploadingDoc: boolean;
  onAddMilestone: (projectId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
}

const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  onEdit,
  onDownload,
  onDeleteDoc,
  onUploadDoc,
  uploadDocData,
  setUploadDocData,
  isUploadingDoc,
  onAddMilestone,
  onEditMilestone,
}) => {
  const [projectSearch, setProjectSearch] = useState('');

  const filteredProjects = useMemo(
    () =>
      (projects || []).filter(
        (p) =>
          p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
          p.client_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
          p.company_name?.toLowerCase().includes(projectSearch.toLowerCase()),
      ),
    [projects, projectSearch],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Szukaj projektu lub klienta..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
          />
          <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <Button
          onClick={() => onEdit({ progress: 0, status: 'pending' })}
          icon={<Plus size={18} />}
        >
          Dodaj Projekt
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group hover:border-primary transition-colors"
          >
            <button
              onClick={() => onEdit(project)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-dark hover:text-white transition-colors"
            >
              <Edit size={16} />
            </button>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {project.client_name}
            </div>
            <h3 className="text-lg font-bold text-dark mb-4">{project.name}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold">{project.status}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${project.progress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Postęp:</span>
                <span>{project.progress}%</span>
              </div>
            </div>

            {project.drive_link && (
              <a
                href={project.drive_link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline mb-4"
              >
                <ExternalLink size={12} /> Google Drive
              </a>
            )}

            {/* Documents Management Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Dokumenty i Faktury
                </h4>
                <button
                  onClick={() => setUploadDocData({ ...uploadDocData, project_id: project.id })}
                  className="p-1.5 text-secondary hover:bg-indigo-50 rounded-lg transition-all"
                  title="Dodaj dokument"
                >
                  <FilePlus size={16} />
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {project.documents?.length === 0 ? (
                  <p className="text-xxs text-gray-400 italic">Brak dokumentów</p>
                ) : (
                  project.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group/doc"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-dark truncate">{doc.name}</span>
                        <span className="text-xxs uppercase font-medium text-gray-400">
                          {doc.type === 'invoice' ? 'Faktura' : doc.subtype}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDownload(doc.id, doc.name)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Pobierz"
                        >
                          <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Upload Form (visible when project_id matches) */}
              {uploadDocData.project_id === project.id && (
                <form
                  onSubmit={onUploadDoc}
                  className="mt-4 p-3 bg-indigo-50 rounded-xl space-y-3 animate-fade-in"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xxs font-black uppercase text-secondary">Nowy plik</span>
                    <button
                      type="button"
                      onClick={() => setUploadDocData({ ...uploadDocData, project_id: '' })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    className="w-full text-[11px] p-2 border-0 rounded-lg shadow-sm"
                    placeholder="Nazwa (np. Faktura FV/1/2026)"
                    value={uploadDocData.name}
                    onChange={(e) => setUploadDocData({ ...uploadDocData, name: e.target.value })}
                    required
                  />
                  <div className="flex gap-2">
                    <select
                      className="flex-1 text-xxs p-2 border-0 rounded-lg shadow-sm bg-white"
                      value={uploadDocData.type}
                      onChange={(e) =>
                        setUploadDocData({
                          ...uploadDocData,
                          type: e.target.value as 'invoice' | 'document',
                        })
                      }
                    >
                      <option value="document">Dokument</option>
                      <option value="invoice">Faktura</option>
                    </select>
                    {uploadDocData.type === 'document' && (
                      <select
                        className="flex-1 text-xxs p-2 border-0 rounded-lg shadow-sm bg-white"
                        value={uploadDocData.subtype}
                        onChange={(e) =>
                          setUploadDocData({ ...uploadDocData, subtype: e.target.value })
                        }
                      >
                        <option value="contract">Umowa</option>
                        <option value="nda">NDA</option>
                        <option value="other">Inny</option>
                      </select>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      setUploadDocData({
                        ...uploadDocData,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="text-xxs w-full"
                    required
                  />
                  <Button className="w-full py-2 text-xxs" disabled={isUploadingDoc}>
                    {isUploadingDoc ? 'Wgrywanie...' : 'Wgraj PDF'}
                  </Button>
                </form>
              )}
            </div>

            {/* Milestones Management Section */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Harmonogram / Kamienie
                </h4>
                <button
                  onClick={() => onAddMilestone(project.id)}
                  className="p-1.5 text-instagram hover:bg-red-50 rounded-lg transition-all"
                  title="Dodaj kamień milowy"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {project.milestones?.length === 0 ? (
                  <p className="text-xxs text-gray-400 italic">Brak kamieni milowych</p>
                ) : (
                  project.milestones?.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group/mile"
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              m.status === 'accepted'
                                ? 'bg-green-500'
                                : m.status === 'corrections'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                            }`}
                          ></span>
                          <span className="text-[11px] font-bold text-dark truncate">
                            {m.title}
                          </span>
                        </div>
                        {m.feedback && (
                          <span className="text-xxs text-red-500 font-bold truncate max-w-[150px]">
                            Uwaga: {m.feedback}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onEditMilestone(m)}
                        className="p-1 text-gray-400 hover:text-dark opacity-0 group-hover/mile:opacity-100"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
            Nie znaleziono projektów spełniających kryteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
