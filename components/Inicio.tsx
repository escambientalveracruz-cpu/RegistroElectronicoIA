
import React from 'react';
import { SectionId } from '../types';

interface InicioProps {
  setActiveSection: (section: SectionId) => void;
}


const Inicio: React.FC<InicioProps> = ({ setActiveSection }) => {
  const handleConfigClick = () => {
    setActiveSection(SectionId.Configuracion);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
        Bienvenido a su Registro Electrónico <span className="text-indigo-500">Potenciado por IA</span>
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
        Tu asistente inteligente para la gestión académica. Organiza listas de estudiantes, controla la asistencia, califica tareas, pruebas y proyectos de forma sencilla y eficiente. Todo guardado y organizado por año lectivo.
      </p>
      <button
        onClick={handleConfigClick}
        className="inline-flex items-center justify-center px-8 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Configurar Curso Lectivo
      </button>
    </div>
  );
};

export default Inicio;
