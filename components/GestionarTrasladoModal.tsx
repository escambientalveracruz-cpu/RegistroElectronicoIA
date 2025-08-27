import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../types';
import { EstadoEstudiante } from '../types';

interface GestionarEstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estudiante: Estudiante) => void;
  estudiante: Estudiante;
}

const GestionarEstadoModal: React.FC<GestionarEstadoModalProps> = ({ isOpen, onClose, onSave, estudiante }) => {
  const [estado, setEstado] = useState<EstadoEstudiante>(estudiante.estado);
  const [formData, setFormData] = useState({
      fechaTraslado: estudiante.fechaTraslado || '',
      escuelaTraslado: estudiante.escuelaTraslado || '',
      observacionesTraslado: estudiante.observacionesTraslado || '',
      fechaDesercion: estudiante.fechaDesercion || '',
      observacionesDesercion: estudiante.observacionesDesercion || '',
  });

  useEffect(() => {
    if (isOpen) {
      setEstado(estudiante.estado);
      setFormData({
        fechaTraslado: estudiante.fechaTraslado || '',
        escuelaTraslado: estudiante.escuelaTraslado || '',
        observacionesTraslado: estudiante.observacionesTraslado || '',
        fechaDesercion: estudiante.fechaDesercion || '',
        observacionesDesercion: estudiante.observacionesDesercion || '',
      });
    }
  }, [estudiante, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'estado') {
        setEstado(value as EstadoEstudiante);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ingresoDate = estudiante.fechaIngreso;

    // Create a mutable copy from the original prop
    const finalEstudianteData = { ...estudiante };

    // Set the new estado from the component's state
    finalEstudianteData.estado = estado;

    // Based on the new estado, update fields and clear others
    if (estado === EstadoEstudiante.Trasladado) {
        if (formData.fechaTraslado && formData.fechaTraslado < ingresoDate) {
            alert('La fecha de traslado no puede ser anterior a la fecha de ingreso.');
            return;
        }
        finalEstudianteData.fechaTraslado = formData.fechaTraslado;
        finalEstudianteData.escuelaTraslado = formData.escuelaTraslado;
        finalEstudianteData.observacionesTraslado = formData.observacionesTraslado;
        // Clear conflicting data
        finalEstudianteData.fechaDesercion = '';
        finalEstudianteData.observacionesDesercion = '';
    } else if (estado === EstadoEstudiante.Desertor) {
        if (formData.fechaDesercion && formData.fechaDesercion < ingresoDate) {
            alert('La fecha de deserción no puede ser anterior a la fecha de ingreso.');
            return;
        }
        finalEstudianteData.fechaDesercion = formData.fechaDesercion;
        finalEstudianteData.observacionesDesercion = formData.observacionesDesercion;
        // Clear conflicting data
        finalEstudianteData.fechaTraslado = '';
        finalEstudianteData.escuelaTraslado = '';
        finalEstudianteData.observacionesTraslado = '';
    } else { // Activo
        // Clear all related data
        finalEstudianteData.fechaTraslado = '';
        finalEstudianteData.escuelaTraslado = '';
        finalEstudianteData.observacionesTraslado = '';
        finalEstudianteData.fechaDesercion = '';
        finalEstudianteData.observacionesDesercion = '';
    }
    
    onSave(finalEstudianteData);
    onClose();
  };

  const fullName = `${estudiante.nombre} ${estudiante.primerApellido}`;

  return (
    <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestionar Estado</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Estudiante: {fullName}</p>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Estado del Estudiante</label>
                    <select name="estado" id="estado" value={estado} onChange={handleChange} className="w-full form-input">
                        <option value={EstadoEstudiante.Activo}>Activo</option>
                        <option value={EstadoEstudiante.Trasladado}>Trasladado</option>
                        <option value={EstadoEstudiante.Desertor}>Desertor</option>
                    </select>
                </div>

                {estado === EstadoEstudiante.Trasladado && (
                    <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-md space-y-4 animate-fade-in">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Información del Traslado</h3>
                        <div>
                            <label htmlFor="fechaTraslado" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Traslado (Opcional)</label>
                            <input type="date" name="fechaTraslado" id="fechaTraslado" value={formData.fechaTraslado} onChange={handleChange} className="w-full form-input"/>
                        </div>
                        <div>
                            <label htmlFor="escuelaTraslado" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Escuela de Traslado (Opcional)</label>
                            <input type="text" name="escuelaTraslado" id="escuelaTraslado" value={formData.escuelaTraslado} onChange={handleChange} className="w-full form-input" placeholder="Ej: Escuela Central"/>
                        </div>
                        <div>
                            <label htmlFor="observacionesTraslado" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Observaciones (Opcional)</label>
                            <textarea name="observacionesTraslado" id="observacionesTraslado" value={formData.observacionesTraslado} onChange={handleChange} rows={3} className="w-full form-input"></textarea>
                        </div>
                    </div>
                )}

                {estado === EstadoEstudiante.Desertor && (
                    <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-md space-y-4 animate-fade-in">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Información de la Deserción</h3>
                        <div>
                            <label htmlFor="fechaDesercion" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Deserción (Opcional)</label>
                            <input type="date" name="fechaDesercion" id="fechaDesercion" value={formData.fechaDesercion} onChange={handleChange} className="w-full form-input"/>
                        </div>
                        <div>
                            <label htmlFor="observacionesDesercion" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Observaciones (Opcional)</label>
                            <textarea name="observacionesDesercion" id="observacionesDesercion" value={formData.observacionesDesercion} onChange={handleChange} rows={3} className="w-full form-input"></textarea>
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors">
                Guardar Cambios
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .form-input {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          border-radius: 0.375rem;
          background-color: transparent;
          border: 1px solid;
        }
        .form-input {
          background-color: rgb(241 245 249 / 1); /* slate-100 */
          border-color: rgb(203 213 225 / 1); /* slate-300 */
        }
        .dark .form-input {
          background-color: rgb(71 85 105 / 1); /* slate-600 */
          border-color: rgb(100 116 139 / 1); /* slate-500 */
        }
        .form-input:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: rgb(99 102 241 / 1); /* indigo-500 */
          box-shadow: 0 0 0 1px rgb(99 102 241 / 1);
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default GestionarEstadoModal;
