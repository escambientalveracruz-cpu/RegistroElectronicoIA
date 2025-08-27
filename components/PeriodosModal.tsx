import React, { useState, useEffect } from 'react';
import type { Periodo } from '../types';

interface PeriodosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (periodos: Periodo[]) => void;
  initialPeriods: Periodo[];
}

const PeriodosModal: React.FC<PeriodosModalProps> = ({ isOpen, onClose, onSave, initialPeriods }) => {
  const [periodo1, setPeriodo1] = useState({ inicio: '', fin: '' });
  const [periodo2, setPeriodo2] = useState({ inicio: '', fin: '' });

  useEffect(() => {
    if (initialPeriods.length === 2) {
      setPeriodo1({ inicio: initialPeriods[0].fechaInicio, fin: initialPeriods[0].fechaFin });
      setPeriodo2({ inicio: initialPeriods[1].fechaInicio, fin: initialPeriods[1].fechaFin });
    } else {
      setPeriodo1({ inicio: '', fin: '' });
      setPeriodo2({ inicio: '', fin: '' });
    }
  }, [initialPeriods, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic validation
    if (!periodo1.inicio || !periodo1.fin || !periodo2.inicio || !periodo2.fin) {
      alert('Por favor, complete todas las fechas.');
      return;
    }
    if (new Date(periodo1.fin) < new Date(periodo1.inicio)) {
      alert('La fecha de fin del primer periodo no puede ser anterior a la de inicio.');
      return;
    }
    if (new Date(periodo2.fin) < new Date(periodo2.inicio)) {
        alert('La fecha de fin del segundo periodo no puede ser anterior a la de inicio.');
        return;
    }
    if (new Date(periodo2.inicio) <= new Date(periodo1.fin)) {
        alert('La fecha de inicio del segundo periodo debe ser posterior a la fecha de fin del primero.');
        return;
    }
    
    const nuevosPeriodos: Periodo[] = [
      { nombre: 'Primer Periodo', fechaInicio: periodo1.inicio, fechaFin: periodo1.fin },
      { nombre: 'Segundo Periodo', fechaInicio: periodo2.inicio, fechaFin: periodo2.fin },
    ];
    onSave(nuevosPeriodos);
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Configurar Periodos Lectivos</h2>
        
        {/* Periodo 1 */}
        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4 mb-6">
            <legend className="px-2 font-semibold text-slate-800 dark:text-slate-100">Primer Periodo</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="p1-inicio" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Inicio</label>
                    <input type="date" id="p1-inicio" value={periodo1.inicio} onChange={e => setPeriodo1({...periodo1, inicio: e.target.value})} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="p1-fin" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Fin</label>
                    <input type="date" id="p1-fin" value={periodo1.fin} onChange={e => setPeriodo1({...periodo1, fin: e.target.value})} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                </div>
            </div>
        </fieldset>

        {/* Periodo 2 */}
        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4 mb-8">
            <legend className="px-2 font-semibold text-slate-800 dark:text-slate-100">Segundo Periodo</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="p2-inicio" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Inicio</label>
                    <input type="date" id="p2-inicio" value={periodo2.inicio} onChange={e => setPeriodo2({...periodo2, inicio: e.target.value})} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="p2-fin" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Fin</label>
                    <input type="date" id="p2-fin" value={periodo2.fin} onChange={e => setPeriodo2({...periodo2, fin: e.target.value})} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                </div>
            </div>
        </fieldset>
        
        <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors">Guardar Periodos</button>
        </div>
      </div>
    </div>
  );
};

export default PeriodosModal;