import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../types';
import { generateContent } from '../lib/gemini-client';

interface ResumenEstudianteAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
}

const ResumenEstudianteAIModal: React.FC<ResumenEstudianteAIModalProps> = ({ isOpen, onClose, estudiante }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && estudiante) {
      generateSummary();
    } else {
      setSummary('');
      setIsLoading(false);
      setError('');
    }
  }, [isOpen, estudiante]);

  const generateSummary = async () => {
    if (!estudiante) return;

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const prompt = `Como asistente de un docente, resume la siguiente información del estudiante en un párrafo profesional y coherente. Sé conciso y enfócate en los datos más relevantes para un reporte rápido.
      
      Datos del Estudiante:
      - Nombre Completo: ${estudiante.nombre} ${estudiante.primerApellido} ${estudiante.segundoApellido}
      - Cédula: ${estudiante.cedula}
      - Fecha de Ingreso: ${estudiante.fechaIngreso}
      - Estado Actual: ${estudiante.estado}
      ${estudiante.estado === 'Trasladado' ? `- Fecha de Traslado: ${estudiante.fechaTraslado || 'No especificada'}\n- Escuela de Destino: ${estudiante.escuelaTraslado || 'No especificada'}\n- Observaciones del Traslado: ${estudiante.observacionesTraslado || 'Ninguna'}` : ''}
      ${estudiante.estado === 'Desertor' ? `- Fecha de Deserción: ${estudiante.fechaDesercion || 'No especificada'}\n- Observaciones de la Deserción: ${estudiante.observacionesDesercion || 'Ninguna'}` : ''}
      - Nombre del Encargado: ${estudiante.nombreEncargado || 'No especificado'}
      - Teléfono del Encargado: ${estudiante.telefono || 'No especificado'}
      - Dirección: ${estudiante.direccion || 'No especificada'}
      
      Genera el resumen en español.`;

      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setSummary(response.text);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el resumen. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert('Resumen copiado al portapapeles.');
  };

  if (!isOpen || !estudiante) return null;

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
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resumen Generado por IA</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Estudiante: {`${estudiante.nombre} ${estudiante.primerApellido}`}
              </p>
            </div>
            <div className="text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <div className="mt-6 min-h-[150px] p-4 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-200 text-base leading-relaxed">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3">Generando resumen...</span>
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && <p>{summary}</p>}
          </div>
        </div>
          
        <div className="flex justify-between items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg">
          <button 
            type="button" 
            onClick={copyToClipboard} 
            disabled={isLoading || !!error || !summary}
            className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar Texto
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumenEstudianteAIModal;