import React, { useState, useEffect } from 'react';
import type { Indicador, EvaluacionCotidiano, CursoLectivo } from '../types';

interface SeleccionarIndicadoresModalProps {
    isOpen: boolean;
    onClose: () => void;
    cursoActivo: CursoLectivo;
    subject: string;
    periodo: string;
    todosIndicadores: Indicador[];
    evaluacionActiva: EvaluacionCotidiano | undefined;
    onSave: (evaluacion: EvaluacionCotidiano) => void;
}

const SeleccionarIndicadoresModal: React.FC<SeleccionarIndicadoresModalProps> = ({ isOpen, onClose, cursoActivo, subject, periodo, todosIndicadores, evaluacionActiva, onSave }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set(evaluacionActiva?.indicadorIds || []));
        }
    }, [isOpen, evaluacionActiva]);

    if (!isOpen) return null;

    const handleToggle = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        const newEvaluacion: EvaluacionCotidiano = {
            id: `${cursoActivo.id}-${periodo}-${subject}`,
            cursoLectivoId: cursoActivo.id,
            periodoNombre: periodo,
            subject,
            indicadorIds: Array.from(selectedIds),
        };
        onSave(newEvaluacion);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Seleccionar Indicadores a Evaluar</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Marque los indicadores que evaluará en este periodo.</p>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-3">
                    {todosIndicadores.length > 0 ? todosIndicadores.map(ind => (
                        <label key={ind.id} htmlFor={`ind-${ind.id}`} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
                            <input
                                id={`ind-${ind.id}`}
                                type="checkbox"
                                checked={selectedIds.has(ind.id)}
                                onChange={() => handleToggle(ind.id)}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                            />
                            <span className="ml-3 text-sm text-slate-800 dark:text-slate-200">{ind.descripcion}</span>
                        </label>
                    )) : <p className="text-center text-slate-500 dark:text-slate-400">No hay indicadores en el banco para esta materia. Por favor, añádalos en "Gestionar Banco de Indicadores".</p>}
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSave} className="btn-primary">Guardar Selección</button>
                </div>
                <style>{`.btn-primary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(99 102 241);color:white;transition:background-color 0.2s}.btn-primary:hover{background-color:rgb(79 70 229)}.btn-secondary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(226 232 240);color:rgb(51 65 85);transition:background-color 0.2s}.dark .btn-secondary{background-color:rgb(71 85 105);color:rgb(226 232 240)}.btn-secondary:hover{background-color:rgb(203 213 225)}.dark .btn-secondary:hover{background-color:rgb(100 116 139)}`}</style>
            </div>
        </div>
    );
};

export default SeleccionarIndicadoresModal;
