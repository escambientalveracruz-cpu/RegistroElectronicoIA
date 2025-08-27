import React, { useState, useEffect } from 'react';
import type { Indicador, CursoLectivo } from '../types';
import { Type } from "@google/genai";
import { generateContent } from '../lib/gemini-client';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Set the workerSrc to load the PDF worker script
// This is required for pdf.js to work in a web environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

interface GestionarIndicadoresModalProps {
    isOpen: boolean;
    onClose: () => void;
    cursoActivo: CursoLectivo;
    subject: string;
    indicadoresExistentes: Indicador[];
    onSave: (indicador: Indicador) => void;
    onDelete: (indicadorId: string) => void;
    onSaveBatch: (indicadores: Omit<Indicador, 'id'>[]) => void;
}

const GestionarIndicadoresModal: React.FC<GestionarIndicadoresModalProps> = ({ isOpen, onClose, cursoActivo, subject, indicadoresExistentes, onSave, onDelete, onSaveBatch }) => {
    const [descripcion, setDescripcion] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'manual' | 'paste' | 'upload'>('manual');
    
    // AI related state
    const [pastedText, setPastedText] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiError, setAiError] = useState('');
    const [reviewList, setReviewList] = useState<string[]>([]);
    const [checkedForSave, setCheckedForSave] = useState<Set<string>>(new Set());

    const resetAIState = () => {
        setPastedText('');
        setIsLoadingAI(false);
        setAiError('');
        setReviewList([]);
        setCheckedForSave(new Set());
    };

    useEffect(() => {
        if (!isOpen) {
            setDescripcion('');
            setEditingId(null);
            resetAIState();
            setActiveTab('manual');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSaveManual = () => {
        if (!descripcion.trim()) return;
        const newIndicador: Indicador = {
            id: editingId || `indicador_${Date.now()}`,
            cursoLectivoId: cursoActivo.id,
            subject,
            descripcion: descripcion.trim(),
        };
        onSave(newIndicador);
        setDescripcion('');
        setEditingId(null);
    };

    const handleEdit = (indicador: Indicador) => {
        setActiveTab('manual');
        setEditingId(indicador.id);
        setDescripcion(indicador.descripcion);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este indicador? Esta acción no se puede deshacer.')) {
            onDelete(id);
        }
    };
    
     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoadingAI(true);
        setAiError('');
        setReviewList([]);

        try {
            let text = '';
            if (file.type === 'application/pdf') {
                const reader = new FileReader();
                const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
                    reader.onerror = e => reject(reader.error);
                    reader.readAsArrayBuffer(file);
                });

                const data = new Uint8Array(arrayBuffer);
                const pdf = await pdfjsLib.getDocument({ data }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    // Using `any` for item because pdf.js types are not easily available in this setup
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
                text = fullText;
            } else { // Assume .txt or other text-based file
                text = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.onerror = e => reject(reader.error);
                    reader.readAsText(file);
                });
            }
            
            if (text.trim()) {
                await handleProcessAI(text);
            } else {
                setAiError("No se pudo extraer texto del archivo.");
                setIsLoadingAI(false);
            }
        } catch (error) {
            console.error("Error reading file:", error);
            setAiError("Error al leer o procesar el archivo. Asegúrese de que no esté dañado.");
            setIsLoadingAI(false);
        } finally {
            event.target.value = ''; // Reset file input
        }
    };

    const handleProcessAI = async (text: string) => {
        if (!text.trim()) return;
        setIsLoadingAI(true);
        setAiError('');
        setReviewList([]);

        try {
            const prompt = `Como asistente de un docente, tu tarea es extraer indicadores de evaluación educativa del siguiente texto. El texto puede estar desordenado o tener varios formatos. Identifica cada indicador de forma clara y completa.
    
Devuelve el resultado como un objeto JSON con una sola clave "indicadores", que contenga un array de strings. Cada string en el array debe ser un indicador único y completo. No incluyas números, viñetas, guiones ni ningún otro formato de lista en los strings finales.

Ejemplo de Entrada:
'1. Muestra respeto por sus compañeros. 2.- Sigue las instrucciones dadas por el docente. - Participa activamente en clase.'

Salida JSON Esperada:
{
  "indicadores": [
    "Muestra respeto por sus compañeros",
    "Sigue las instrucciones dadas por el docente",
    "Participa activamente en clase"
  ]
}

Ahora, procesa el siguiente texto:
${text}`;

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            indicadores: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING, description: 'Un indicador de evaluación educativa.' }
                            }
                        }
                    }
                }
            });
            
            const jsonString = response.text;
            const result = JSON.parse(jsonString);
            const indicators: string[] = result.indicadores || [];

            if (indicators.length === 0) {
                setAiError('La IA no pudo extraer indicadores del texto proporcionado. Intente con otro texto.');
            } else {
                setReviewList(indicators);
                setCheckedForSave(new Set(indicators));
            }
        } catch (err) {
            console.error(err);
            setAiError('Ocurrió un error al procesar con la IA. Verifique el texto o la configuración.');
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleToggleChecked = (indicator: string) => {
        setCheckedForSave(prev => {
            const newSet = new Set(prev);
            if (newSet.has(indicator)) newSet.delete(indicator);
            else newSet.add(indicator);
            return newSet;
        });
    };

    const handleConfirmSaveBatch = () => {
        if (checkedForSave.size === 0) return;
        const indicadoresAAgregar: Omit<Indicador, 'id'>[] = Array.from(checkedForSave).map(desc => ({
            descripcion: desc,
            cursoLectivoId: cursoActivo.id,
            subject: subject,
        }));
        onSaveBatch(indicadoresAAgregar);
        resetAIState();
    };

    const TabButton: React.FC<{ tabId: typeof activeTab; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 border-t border-x' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Banco de Indicadores ({subject})</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Añada, edite o importe indicadores para evaluar esta materia.</p>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-2">
                    {indicadoresExistentes.map(ind => (
                        <div key={ind.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                            <p className="text-sm text-slate-800 dark:text-slate-200 flex-1 mr-4">{ind.descripcion}</p>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => handleEdit(ind)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                <button onClick={() => handleDelete(ind.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-800/50" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    ))}
                </div>

                {reviewList.length > 0 ? (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <h3 className="font-bold text-lg mb-2">Revisar Indicadores Extraídos</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Seleccione los indicadores que desea añadir al banco.</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {reviewList.map((item, index) => (
                                <label key={index} className="flex items-start p-2 bg-white dark:bg-slate-600 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                    <input type="checkbox" checked={checkedForSave.has(item)} onChange={() => handleToggleChecked(item)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5" />
                                    <span className="ml-3 text-sm">{item}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={resetAIState} className="btn-secondary">Cancelar</button>
                            <button onClick={handleConfirmSaveBatch} className="btn-primary" disabled={checkedForSave.size === 0}>Añadir {checkedForSave.size} Indicadores</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex -mb-px"><TabButton tabId="manual">Manual</TabButton><TabButton tabId="paste">IA: Pegar Texto</TabButton><TabButton tabId="upload">IA: Subir Archivo</TabButton></div>
                        <div className="bg-white dark:bg-slate-700 p-4 rounded-b-md rounded-tr-md relative min-h-[160px]">
                            {isLoadingAI && <div className="absolute inset-0 bg-white/70 dark:bg-slate-700/70 flex items-center justify-center z-10"><svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="ml-3">Procesando...</span></div>}
                            {activeTab === 'manual' && <div className="space-y-2"><label className="text-sm font-semibold">{editingId ? 'Editando Indicador' : 'Nuevo Indicador'}</label><div className="flex gap-2"><textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full form-input" placeholder="Escriba la descripción del indicador..."></textarea><button onClick={handleSaveManual} className="btn-primary flex-shrink-0">{editingId ? 'Actualizar' : 'Añadir'}</button></div>{editingId && <button onClick={() => { setEditingId(null); setDescripcion(''); }} className="text-xs text-indigo-500 hover:underline">Cancelar edición</button>}</div>}
                            {activeTab === 'paste' && <div className="space-y-2"><p className="text-sm text-slate-500 dark:text-slate-400">Pegue una lista de indicadores y la IA los separará por usted.</p><textarea value={pastedText} onChange={e => setPastedText(e.target.value)} rows={4} className="w-full form-input" placeholder="1. Indicador uno... - Indicador dos..."></textarea><button onClick={() => handleProcessAI(pastedText)} className="btn-primary w-full">Procesar con IA</button></div>}
                            {activeTab === 'upload' && <div className="text-center p-4"><p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Suba un archivo (.txt, .pdf) con sus indicadores.</p><input type="file" id="file-upload" className="hidden" accept=".txt,.pdf" onChange={handleFileChange} /><label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">Seleccionar Archivo</label></div>}
                            {aiError && <p className="text-sm text-red-500 mt-2">{aiError}</p>}
                        </div>
                    </div>
                )}
                
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="btn-secondary">Cerrar</button>
                </div>
                 <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;border-radius:0.375rem;background-color:rgb(248 250 252/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(51 65 85/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}.btn-primary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(99 102 241);color:white;transition:background-color 0.2s}.btn-primary:hover{background-color:rgb(79 70 229)}.btn-primary:disabled{opacity:0.6;cursor:not-allowed}.btn-secondary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(226 232 240);color:rgb(51 65 85);transition:background-color 0.2s}.dark .btn-secondary{background-color:rgb(71 85 105);color:rgb(226 232 240)}.btn-secondary:hover{background-color:rgb(203 213 225)}.dark .btn-secondary:hover{background-color:rgb(100 116 139)}`}</style>
            </div>
        </div>
    );
};

export default GestionarIndicadoresModal;