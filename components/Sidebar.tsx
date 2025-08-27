import React from 'react';
import { NAV_ITEMS } from '../constants';
import { SectionId } from '../types';
import type { User, CursoLectivo } from '../types';

interface SidebarProps {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  cursos: CursoLectivo[];
  activeCursoId: string | null;
  setActiveCursoId: (id: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, cursos, activeCursoId, setActiveCursoId, user, onLogout }) => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-700 flex-shrink-0 border-r border-slate-200 dark:border-slate-600 flex flex-col print:hidden">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <h1 className="text-xl font-bold ml-3 text-slate-900 dark:text-white">Estudiante AI</h1>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-600">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Sesión iniciada como:</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={user.email}>{user.email}</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(item.id);
            }}
            className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
              activeSection === item.id
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            {item.icon}
            <span className="ml-4 font-medium">{item.name}</span>
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-600">
        <label htmlFor="curso-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            Curso Lectivo Activo
        </label>
        {cursos.length > 0 ? (
            <select
                id="curso-select"
                value={activeCursoId || ''}
                onChange={(e) => setActiveCursoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                aria-label="Seleccionar curso lectivo"
            >
                {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                        {curso.year} - {curso.teacherName.split(' ')[0]}
                    </option>
                ))}
            </select>
        ) : (
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600/50 rounded-md py-2 px-1">No hay cursos.</p>
        )}
        <button
            onClick={() => setActiveSection(SectionId.Configuracion)}
            className="w-full mt-3 inline-flex items-center justify-center px-4 py-2 bg-indigo-500 text-white font-semibold rounded-md text-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {cursos.length > 0 ? 'Gestionar Cursos' : 'Crear Curso'}
        </button>
      </div>
      <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-600">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600/50 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
