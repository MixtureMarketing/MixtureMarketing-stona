import React from 'react';
import { RefreshCw, FolderOpen, ExternalLink, Clock, Calendar } from 'lucide-react';
import Button from '../../common/Button';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import { Project } from '../types';

interface PortalProjectListProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

const PortalProjectList: React.FC<PortalProjectListProps> = ({
  projects,
  loading,
  onSelectProject,
  getStatusColor,
  getStatusLabel,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-secondary mb-4" size={32} />
        <p className="text-gray-400 font-medium">Ładowanie projektów...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <AnimateOnScroll>
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <FolderOpen size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Brak aktywnych projektów</h3>
          <p className="text-500 max-w-md mx-auto mb-8">
            Wygląda na to, że nie masz jeszcze przypisanych żadnych projektów. Jeśli uważasz, że to
            błąd, skontaktuj się z nami.
          </p>
          <Button onClick={() => (window.location.href = 'mailto:kontakt@mixturemarketing.pl')}>
            Skontaktuj się z opiekunem
          </Button>
        </div>
      </AnimateOnScroll>
    );
  }

  return (
    <LazyHydrate minHeight="400px">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <AnimateOnScroll key={project.id} delay={index * 100} className="h-full">
            <GlassCard
              onClick={() => onSelectProject(project.id)}
              className="p-0 bg-white border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="p-6 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xxs font-bold uppercase border tracking-wide ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase">
                    {project.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-dark group-hover:text-secondary transition-colors line-clamp-2">
                  {project.name}
                </h3>
              </div>

              <div className="p-6 flex-grow">
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>Postęp realizacji</span>
                    <span className="text-secondary font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {project.next_milestone && (
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 group-hover:border-[#E0EFFF] transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-secondary mb-2 uppercase tracking-wide">
                      <Clock size={12} /> Następny krok
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {project.next_milestone}
                    </div>
                    {project.next_milestone_date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>
                          Termin:{' '}
                          {new Date(project.next_milestone_date).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 text-secondary rounded-xl font-bold text-sm hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm">
                  Zobacz szczegóły <ExternalLink size={12} />
                </div>
              </div>
            </GlassCard>
          </AnimateOnScroll>
        ))}
      </div>
    </LazyHydrate>
  );
};

export default PortalProjectList;
