import React, { useState, useEffect } from 'react';
import type { Tarea } from '../types';

interface TareaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tarea: Omit<Tarea, 'id' | 'cursoLectivoId' | 'periodoNombre' | 'subject'>) => void;
    tareaExistente: Tarea | null;
    porcentajeTotal: number;
    porcentajeYaAsignado: number;
}

const TareaModal: React.FC<TareaModalProps> = ({ isOpen, onClose, onSave, tareaExistente, porcentajeTotal, porcentajeYaAsignado }) => {
    const [nombre, setNombre] = useState('');
    const [porcentaje, setPorcentaje] = useState(0);
    const [puntosTotales, setPuntosTotales] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setNombre(tareaExistente?.nombre || '');
            setPorcentaje(tareaExistente?.porcentaje || 0);
            setPuntosTotales(tareaExistente?.puntosTotales || 0);
        }
    }, [isOpen, tareaExistente]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const porcentajeAjustado = tareaExistente ? porcentajeYaAsignado - tareaExistente.porcentaje : porcentajeYaAsignado;
        const disponible = porcentajeTotal - porcentajeAjustado;

        if (!nombre.trim() || porcentaje <= 0 || puntosTotales <= 0) {
            alert('Todos los campos son requeridos y los valores deben ser mayores a cero.');
            return;
        }
        if (porcentaje > disponible) {
            alert(`El porcentaje (${porcentaje}%) excede el disponible (${disponible.toFixed(2)}%).`);
            return;
        }

        onSave({ nombre, porcentaje, puntosTotales });
    };

    const porcentajeAjustadoParaValidacion = tareaExistente ? porcentajeYaAsignado - tareaExistente.porcentaje : porcentajeYaAsignado;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {tareaExistente ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Porcentaje disponible: <span className="font-bold">{(porcentajeTotal - porcentajeAjustadoParaValidacion).toFixed(2)}%</span>
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nombreTarea" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nombre de la Tarea</label>
                                <input id="nombreTarea" type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full form-input" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="porcentaje" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Porcentaje (%)</label>
                                    <input id="porcentaje" type="number" step="0.01" value={porcentaje} onChange={e => setPorcentaje(parseFloat(e.target.value))} className="w-full form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="puntosTotales" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Puntos Totales</label>
                                    <input id="puntosTotales" type="number" value={puntosTotales} onChange={e => setPuntosTotales(parseFloat(e.target.value))} className="w-full form-input" required />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600">Guardar Tarea</button>
                    </div>
                </form>
                 <style>{`
                    .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background-color: rgb(241 245 249 / 1); border: 1px solid rgb(203 213 225 / 1); }
                    .dark .form-input { background-color: rgb(71 85 105 / 1); border-color: rgb(100 116 139 / 1); }
                    .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: rgb(99 102 241 / 1); box-shadow: 0 0 0 1px rgb(99 102 241 / 1); }
                 `}</style>
            </div>
        </div>
    );
};

export default TareaModal;