import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../types';
import { generateContent } from '../lib/gemini-client';

interface ComunicacionAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
}

const communicationTopics = [
  'Convocar a reunión',
  'Notificar ausencia injustificada',
  'Felicitar por buen rendimiento',
  'Informar sobre tarea pendiente',
  'Solicitar actualización de datos',
];

const ComunicacionAIModal: React.FC<ComunicacionAIModalProps> = ({ isOpen, onClose, estudiante }) => {
  const [topic, setTopic] = useState(communicationTopics[0]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!isOpen) {
        setMessage('');
        setIsLoading(false);
        setError('');
        setTopic(communicationTopics[0]);
    }
  }, [isOpen]);

  const generateMessage = async () => {
    if (!estudiante || !topic) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const prompt = `Como asistente de un docente, redacta un borrador de mensaje de texto (SMS) profesional, breve y cortés para el encargado de un estudiante.
      
      Datos:
      - Nombre del Estudiante: ${estudiante.nombre} ${estudiante.primerApellido}
      - Nombre del Encargado: ${estudiante.nombreEncargado || 'Estimado(a) encargado(a)'}
      - Motivo de la comunicación: ${topic}
      
      Instrucciones:
      - El mensaje debe ser en español.
      - Sé respetuoso y claro.
      - No incluyas el nombre del docente, deja un espacio para que lo añada (ej: "Atte. [Nombre del Docente]").
      - El mensaje debe ser adecuado para ser enviado por SMS, por lo tanto, debe ser conciso.`;
      
      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setMessage(response.text);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el mensaje. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    alert('Mensaje copiado al portapapeles.');
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Asistente de Comunicación</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Para encargado de: {`${estudiante.nombre} ${estudiante.primerApellido}`}
              </p>
            </div>
             <div className="text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
                <label htmlFor="topic-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Motivo del mensaje</label>
                <select id="topic-select" value={topic} onChange={e => setTopic(e.target.value)} className="w-full form-input">
                    {communicationTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
             <button onClick={generateMessage} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-wait">
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                )}
                Generar Borrador
             </button>
          </div>
          
           <div className="mt-4 min-h-[150px] p-4 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-200 text-base leading-relaxed">
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && !message && <p className="text-slate-400">El borrador del mensaje aparecerá aquí...</p>}
            {!isLoading && !error && message && <p>{message}</p>}
          </div>
        </div>
          
        <div className="flex justify-between items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg">
           <button 
            type="button" 
            onClick={copyToClipboard} 
            disabled={isLoading || !!error || !message}
            className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
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
        <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border-radius:0.375rem;background-color:rgb(241 245 249/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(71 85 105/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}`}</style>
      </div>
    </div>
  );
};

export default ComunicacionAIModal;