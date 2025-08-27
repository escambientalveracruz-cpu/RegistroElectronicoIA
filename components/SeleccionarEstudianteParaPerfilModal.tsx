import React, { useState } from 'react';
import type { Estudiante } from '../types';

interface SeleccionarEstudianteParaPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Estudiante[];
  onSelect: (student: Estudiante) => void;
}

const SeleccionarEstudianteParaPerfilModal: React.FC<SeleccionarEstudianteParaPerfilModalProps> = ({ isOpen, onClose, students, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter(student =>
    `${student.nombre} ${student.primerApellido} ${student.segundoApellido}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelect = (student: Estudiante) => {
    onSelect(student);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seleccionar Estudiante</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Haga clic en un estudiante para generar su perfil de salida.</p>
        </div>
        
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full form-input"
            aria-label="Buscar estudiante"
          />
        </div>

        <div className="flex-grow p-4 pt-0 overflow-y-auto space-y-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => handleSelect(student)}
                className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(student); }}
              >
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {`${student.nombre} ${student.primerApellido} ${student.segundoApellido}`}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">No se encontraron estudiantes.</p>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
        <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;border-radius:0.375rem;background-color:rgb(241 245 249/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(71 85 105/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}.btn-secondary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(226 232 240);color:rgb(51 65 85);transition:background-color 0.2s}.dark .btn-secondary{background-color:rgb(71 85 105);color:rgb(226 232 240)}.btn-secondary:hover{background-color:rgb(203 213 225)}.dark .btn-secondary:hover{background-color:rgb(100 116 139)}`}</style>
      </div>
    </div>
  );
};

export default SeleccionarEstudianteParaPerfilModal;
