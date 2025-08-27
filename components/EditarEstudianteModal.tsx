import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../types';
import { EstadoEstudiante } from '../types';

interface EditarEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estudiante: Estudiante) => void;
  estudiante: Estudiante;
}

const EditarEstudianteModal: React.FC<EditarEstudianteModalProps> = ({ isOpen, onClose, onSave, estudiante }) => {
  const [formData, setFormData] = useState<Estudiante>(estudiante);

  useEffect(() => {
    // Reset form data when the modal is opened with a new student
    if (isOpen) {
        setFormData(estudiante);
    }
  }, [estudiante, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.primerApellido.trim() || !formData.cedula.trim()) {
      alert('Nombre, primer apellido y cédula son campos requeridos.');
      return;
    }
    onSave(formData);
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Información del Estudiante</h2>
            
            {/* Datos del Estudiante */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4">
                <legend className="px-2 font-semibold text-slate-800 dark:text-slate-100">Datos del Estudiante</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
                    <div>
                        <label htmlFor="edit_nombre" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nombre</label>
                        <input type="text" name="nombre" id="edit_nombre" value={formData.nombre} onChange={handleChange} className="w-full form-input" required/>
                    </div>
                    <div>
                        <label htmlFor="edit_cedula" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Cédula</label>
                        <input type="text" name="cedula" id="edit_cedula" value={formData.cedula} onChange={handleChange} className="w-full form-input" required/>
                    </div>
                    <div>
                        <label htmlFor="edit_primerApellido" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Primer Apellido</label>
                        <input type="text" name="primerApellido" id="edit_primerApellido" value={formData.primerApellido} onChange={handleChange} className="w-full form-input" required/>
                    </div>
                    <div>
                        <label htmlFor="edit_segundoApellido" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Segundo Apellido</label>
                        <input type="text" name="segundoApellido" id="edit_segundoApellido" value={formData.segundoApellido} onChange={handleChange} className="w-full form-input"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="edit_fechaIngreso" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fecha de Ingreso</label>
                        <input type="date" name="fechaIngreso" id="edit_fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className="w-full form-input" required />
                    </div>
                </div>
            </fieldset>

            {/* Datos del Encargado */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4">
                <legend className="px-2 font-semibold text-slate-800 dark:text-slate-100">Datos del Encargado</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
                    <div>
                        <label htmlFor="edit_nombreEncargado" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nombre del Encargado</label>
                        <input type="text" name="nombreEncargado" id="edit_nombreEncargado" value={formData.nombreEncargado} onChange={handleChange} className="w-full form-input"/>
                    </div>
                    <div>
                        <label htmlFor="edit_telefono" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Teléfono del Encargado</label>
                        <input type="tel" name="telefono" id="edit_telefono" value={formData.telefono} onChange={handleChange} className="w-full form-input"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="edit_direccion" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Dirección</label>
                        <textarea name="direccion" id="edit_direccion" value={formData.direccion} onChange={handleChange} rows={3} className="w-full form-input"></textarea>
                    </div>
                </div>
            </fieldset>

          </div>
          
          <div className="flex justify-end gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg mt-6">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors">Guardar Cambios</button>
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
      `}</style>
    </div>
  );
};

export default EditarEstudianteModal;