
import React, { useState, useEffect } from 'react';
import { SectionId } from '../types';
import type { CursoLectivo, Periodo } from '../types';
import PeriodosModal from './PeriodosModal';
import TagInput from './TagInput';

interface ConfiguracionProps {
  onSave: (curso: Omit<CursoLectivo, 'id'>) => void;
  onUpdate: (curso: CursoLectivo) => void;
  cursoActivo: CursoLectivo | null;
  setActiveSection: (section: SectionId) => void;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ onSave, onUpdate, cursoActivo, setActiveSection }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [year, setYear] = useState(new Date().getFullYear());
  const [teacherName, setTeacherName] = useState('');
  const [periods, setPeriods] = useState<Periodo[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetForm = () => {
    setYear(new Date().getFullYear());
    setTeacherName('');
    setPeriods([]);
    setSubjects([]);
    setGroups([]);
  };

  useEffect(() => {
    if (cursoActivo) {
      setIsEditMode(true);
      setYear(cursoActivo.year);
      setTeacherName(cursoActivo.teacherName);
      setPeriods(cursoActivo.periods);
      setSubjects(cursoActivo.subjects);
      setGroups(cursoActivo.groups);
    } else {
      setIsEditMode(false);
      resetForm();
    }
  }, [cursoActivo]);

  const handleSwitchToCreate = () => {
    setIsEditMode(false);
    resetForm();
  };

  const handleSavePeriods = (nuevosPeriodos: Periodo[]) => {
    setPeriods(nuevosPeriodos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || subjects.length === 0 || groups.length === 0 || periods.length !== 2) {
        alert("Por favor, complete todos los campos requeridos: nombre, al menos una materia, un grupo y la configuración de los dos periodos.");
        return;
    }
    
    if (isEditMode && cursoActivo) {
      const updatedCurso: CursoLectivo = {
        ...cursoActivo,
        year,
        teacherName,
        periods,
        subjects,
        groups,
      };
      onUpdate(updatedCurso);
      alert("Curso lectivo actualizado con éxito.");
      setActiveSection(SectionId.ListaEstudiantes);
    } else {
      const configuration = {
        year,
        teacherName,
        periods,
        subjects,
        groups,
      };
      onSave(configuration);
      alert("Configuración de curso lectivo guardada con éxito.");
      setActiveSection(SectionId.ListaEstudiantes);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {isEditMode && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleSwitchToCreate}
              className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear Nuevo Curso
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-slate-700 rounded-xl shadow-2xl space-y-8">
            <div className="text-center border-b border-slate-200 dark:border-slate-600 pb-6">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'Editar Curso Lectivo' : 'Configuración del Curso Lectivo'}
                </h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                {isEditMode ? 'Actualice los detalles de su año académico.' : 'Defina los detalles de su nuevo año académico.'}
                </p>
            </div>
            
            {/* --- Información General --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Año Lectivo</label>
                <input
                  type="number"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="teacherName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nombre del Docente</label>
                <input
                  type="text"
                  id="teacherName"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Ej: Ana Rodríguez"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* --- Periodos Lectivos --- */}
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-600/50 rounded-lg">
                {periods.length === 2 ? (
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Periodos Lectivos Configurados</h3>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                                <p><span className="font-medium">1er Periodo:</span> {periods[0].fechaInicio} &mdash; {periods[0].fechaFin}</p>
                                <p><span className="font-medium">2do Periodo:</span> {periods[1].fechaInicio} &mdash; {periods[1].fechaFin}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Periodos Lectivos</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Es necesario configurar las fechas.</p>
                    </div>
                )}
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(true)} 
                    className="px-5 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700 transition-transform hover:scale-105 flex-shrink-0"
                >
                    {periods.length === 2 ? 'Editar' : 'Configurar'}
                </button>
            </div>
            
            {/* --- Materias y Grupos --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <TagInput
                  title="Materias"
                  placeholder="Ej: Matemáticas"
                  items={subjects}
                  onAddItem={(subject) => setSubjects(prev => [...prev, subject])}
                  onRemoveItem={(subject) => setSubjects(prev => prev.filter(s => s !== subject))}
                />
                <TagInput
                  title="Grupos"
                  placeholder="Ej: 7-A"
                  items={groups}
                  onAddItem={(group) => setGroups(prev => [...prev, group])}
                  onRemoveItem={(group) => setGroups(prev => prev.filter(g => g !== group))}
                />
            </div>

            {/* --- Botón de Guardar --- */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-600">
                <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700 transition-all duration-300 transform hover:scale-105"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {isEditMode ? 'Actualizar Cambios' : 'Guardar Configuración del Curso'}
                </button>
            </div>
        </form>
      </div>

      <PeriodosModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePeriods}
        initialPeriods={periods}
      />
    </>
  );
};

export default Configuracion;
