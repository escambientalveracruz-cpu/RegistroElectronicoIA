import React, { useState, useEffect } from 'react';
import type { Estudiante, Prueba, CalificacionPrueba } from '../types';
import { generateContent } from '../lib/gemini-client';

interface ComentarioAIPruebaModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Estudiante;
  prueba: Prueba;
  calificacion: CalificacionPrueba;
}

const ComentarioAIPruebaModal: React.FC<ComentarioAIPruebaModalProps> = ({ isOpen, onClose, estudiante, prueba, calificacion }) => {
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
    if (!estudiante || !prueba || !calificacion) return;

    setIsLoading(true);
    setError('');
    setComment('');

    try {
      const prompt = `Como asistente de un docente, redacta un borrador de comentario constructivo y personalizado para un estudiante basado en su calificación en una prueba.

      Datos:
      - Nombre del Estudiante: ${estudiante.nombre}
      - Nombre de la Prueba: ${prueba.nombre}
      - Calificación Obtenida: ${calificacion.puntosObtenidos} de ${prueba.puntosTotales} puntos.
      - Porcentaje de la Prueba: ${prueba.porcentaje}%

      Instrucciones:
      - El comentario debe ser en español.
      - Si la nota es alta (más del 80% de los puntos), felicita al estudiante y resalta su buen desempeño.
      - Si la nota es media (entre 60% y 80% de los puntos), reconoce el esfuerzo y sugiere áreas de mejora o anima a revisar los puntos más difíciles.
      - Si la nota es baja (menos del 60% de los puntos), ofrece apoyo, sugiere una reunión para repasar y anima al estudiante a no desanimarse.
      - Sé positivo y enfócate en el aprendizaje.
      - Mantén el comentario conciso, claro y adecuado para compartir con el estudiante o su encargado.`;

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
        {/* Header */}
        <div className="flex-shrink-0 p-5 flex items-start justify-between border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comentario con IA</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Para: {`${estudiante.nombre} ${estudiante.primerApellido}`} en "{prueba.nombre}"
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
        
        {/* Scrollable Body */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="min-h-[150px] p-4 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-300">
                <svg className="animate-spin h-6 w-6 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generando retroalimentación...</span>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <textarea 
                readOnly 
                value={comment} 
                className="w-full h-full bg-transparent border-0 resize-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200 text-base leading-relaxed" 
                rows={5}
              />
            )}
          </div>
        </div>
          
        {/* Footer */}
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

export default ComentarioAIPruebaModal;