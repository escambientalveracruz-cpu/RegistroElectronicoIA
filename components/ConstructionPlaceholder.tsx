

import React from 'react';
import type { ReactElement } from 'react';

interface ConstructionPlaceholderProps {
  title: string;
  icon: ReactElement<{ className?: string }>;
}

const ConstructionPlaceholder: React.FC<ConstructionPlaceholderProps> = ({ title, icon }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <div className="text-indigo-500 dark:text-indigo-400 mb-6">
        <div className="w-20 h-20 mx-auto flex items-center justify-center">
          {React.cloneElement(icon, { className: "h-16 w-16" })}
        </div>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-lg text-slate-500 dark:text-slate-300 mb-8 max-w-md">
        Esta sección está actualmente en construcción.
      </p>

      <div className="bg-slate-200 dark:bg-slate-700/50 rounded-lg p-4 flex items-center justify-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <p className="text-sm font-medium text-indigo-700 dark:text-slate-200">
          Próximamente: ¡Funciones potenciadas por IA!
        </p>
      </div>
    </div>
  );
};

export default ConstructionPlaceholder;