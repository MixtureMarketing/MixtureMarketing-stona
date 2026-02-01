import React from 'react';
import { X, FileDown } from 'lucide-react';
import Button from '../../common/Button';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { Project } from '../types';
import { getStatusColor, getStatusLabel } from '../../../utils/portalHelpers';
import ProjectTimeline from './ProjectTimeline';
import { useProjectActions } from './useProjectActions';

interface PortalProjectDetailsProps {
  project: Project;
  onClose: () => void;
  refreshProjects: () => void;
}

const PortalProjectDetails: React.FC<PortalProjectDetailsProps> = ({
  project,
  onClose,
  refreshProjects,
}) => {
  const { updateMilestone, downloadFile, isUpdating } = useProjectActions(refreshProjects);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4 overflow-y-auto">
      <AnimateOnScroll className="w-full max-w-4xl my-auto">
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xxs font-bold uppercase border tracking-wide ${getStatusColor(project.status)}`}
                >
                  {getStatusLabel(project.status)}
                </span>
                <span className="text-xs font-mono text-gray-400 uppercase">{project.type}</span>
              </div>
              <h2 className="text-3xl font-black text-dark">{project.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Progress & Timeline */}
              <div className="lg:col-span-2 space-y-10">
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">
                    Harmonogram Projektu
                  </h3>
                  <ProjectTimeline
                    milestones={project.milestones}
                    onUpdateMilestone={updateMilestone}
                    isUpdating={isUpdating}
                  />
                </div>
              </div>

              {/* Right Column: Info & Resources */}
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">
                    Podsumowanie
                  </h3>
                  <div className="bg-[#F8FAFC] rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Postęp</span>
                      <span className="text-sm font-bold text-secondary">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xxs uppercase font-bold text-gray-400 block mb-1">
                          Typ projektu
                        </span>
                        <span className="text-sm font-bold text-dark uppercase">
                          {project.type}
                        </span>
                      </div>
                      {project.budget && (
                        <div>
                          <span className="text-xxs uppercase font-bold text-gray-400 block mb-1">
                            Wartość
                          </span>
                          <span className="text-sm font-black text-green-600">
                            {project.budget}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">
                    Pliki Projektowe
                  </h3>
                  <div className="space-y-2">
                    {project.documents && project.documents.length > 0 ? (
                      project.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => downloadFile(doc.id, doc.name)}
                          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group w-full text-left"
                        >
                          <div className="flex items-center gap-3">
                            <FileDown
                              size={16}
                              className="text-gray-400 group-hover:text-blue-500"
                            />
                            <span className="text-xs font-bold text-dark truncate max-w-[120px]">
                              {doc.name}
                            </span>
                          </div>
                          <span className="text-xxs font-bold text-gray-300 uppercase">
                            {doc.type}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Brak wgranych plików.</p>
                    )}
                  </div>
                </div>

                <div className="bg-dark rounded-2xl p-6 text-white">
                  <h4 className="text-sm font-bold mb-2 text-primary">Pomoc techniczna</h4>
                  <p className="text-[11px] text-gray-300 mb-4 leading-relaxed">
                    Masz pytania do harmonogramu? Napisz do nas na czacie lub zadzwoń bezpośrednio.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-white border-white/20 hover:bg-white/10 py-2 text-xs"
                    onClick={onClose}
                  >
                    Wróć do czatu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
};

export default PortalProjectDetails;
