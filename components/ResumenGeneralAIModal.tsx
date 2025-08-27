import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../types';
import { generateContent } from '../lib/gemini-client';

interface ResumenGeneralAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Estudiante;
  results: any; // The calculated results object
  periodo: string;
}

const ResumenGeneralAIModal: React.FC<ResumenGeneralAIModalProps> = ({ isOpen, onClose, student, results, periodo }) => {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateComment();
    } else {
      setComment('');
      setIsLoading(false);
      setError('');
    }
  }, [isOpen]);

  const generateComment = async () => {
    if (!student || !results) return;

    setIsLoading(true);
    setError('');
    setComment('');

    try {
      const prompt = `Como asistente de un docente, redacta un comentario general para el informe de calificaciones de un estudiante. El comentario debe ser profesional, constructivo y basado en los siguientes datos de rendimiento.

      Datos del Informe:
      - Nombre del Estudiante: ${student.nombre} ${student.primerApellido}
      - Periodo Evaluado: ${periodo}
      - Rendimiento en Tareas: ${results.tareas.porcentaje.toFixed(2)}% (Nota: ${results.tareas.nota.toFixed(2)})
      - Rendimiento en Trabajo Cotidiano: ${results.cotidiano.porcentaje.toFixed(2)}% (Nota: ${results.cotidiano.nota.toFixed(2)})
      - Resumen de Asistencia: ${results.asistencia.injustificadas} ausencias injustificadas, ${results.asistencia.justificadas} justificadas, y ${results.asistencia.tardias} tardías.
      - Rendimiento en Pruebas: ${results.pruebas.porcentaje.toFixed(2)}% (Nota: ${results.pruebas.nota.toFixed(2)})
      - Rendimiento en Proyectos: ${results.proyectos.configurado ? `${results.proyectos.porcentaje.toFixed(2)}% (Nota: ${results.proyectos.nota.toFixed(2)})` : 'No evaluado'}
      - **Promedio Final: ${results.totalPorcentaje.toFixed(2)}%**

      Instrucciones para la redacción:
      1.  **Idioma:** El comentario debe ser en español.
      2.  **Tono:** Mantén un tono positivo y alentador, incluso si el rendimiento es bajo.
      3.  **Estructura:**
          -   Comienza con una observación general sobre el rendimiento del estudiante en el periodo.
          -   Identifica y menciona específicamente las áreas de mayor fortaleza (donde obtuvo mejores notas).
          -   Si hay ausencias injustificadas, menciónalas de forma neutral como un factor que puede impactar el aprendizaje.
          -   Identifica y menciona de manera constructiva las áreas que requieren más atención o mejora.
          -   Concluye con una nota de ánimo, sugiriendo los próximos pasos o felicitando por el esfuerzo.
      4.  **Personalización:** Usa el nombre del estudiante para hacer el comentario más personal.
      5.  **Claridad:** El texto debe ser claro y fácil de entender para los padres o encargados.
      6.  **Formato:** Redacta un único párrafo coherente.`;

      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setComment(response.text);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el comentario. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(comment);
    alert('Comentario copiado al portapapeles.');
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-5 flex items-start justify-between border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comentario General con IA</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Para: {`${student.nombre} ${student.primerApellido}`} ({periodo})
              </p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="min-h-[200px] p-4 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-300">
                <svg className="animate-spin h-6 w-6 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analizando rendimiento y generando comentario...</span>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <textarea 
                readOnly 
                value={comment} 
                className="w-full h-full bg-transparent border-0 resize-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200 text-base leading-relaxed" 
                rows={8}
              />
            )}
          </div>
        </div>
          
        <div className="flex-shrink-0 flex justify-end items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={copyToClipboard} 
            disabled={isLoading || !!error || !comment}
            className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar
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

export default ResumenGeneralAIModal;