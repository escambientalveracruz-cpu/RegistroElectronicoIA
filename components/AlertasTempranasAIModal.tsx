import React, { useState, useEffect, useRef } from 'react';
import type { Estudiante, CursoLectivo, AlertaTempranaRecord, AtencionAction, ContactLog } from '../types';
import { generateContent } from '../lib/gemini-client';
import { Type } from "@google/genai";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AlertasTempranasAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Estudiante;
  cursoActivo: CursoLectivo;
  onSave: (alerta: AlertaTempranaRecord) => void;
  existingAlerta: AlertaTempranaRecord | null;
  fullData: any; 
}

const alertaItemsConfig = {
    "AUSENTISMO": [
        { id: "ausentismo_1", text: "Ausentismo por día en preescolar y primaria (las lecciones por más de tres (3) días sin la debida justificación)." }
    ],
    "DIMENSIÓN DESEMPEÑO EDUCATIVO": [
        { id: "1", text: "Reincorporación." },
        { id: "2", text: "Repitencia / estudiante rezagado en alguna asignatura." },
        { id: "3", text: "Sobre edad según nivel educativo." },
        { id: "4", text: "Traslados repetitivos anualmente de la persona estudiante." },
        { id: "5", text: "Bajo rendimiento académico." },
        { id: "6", text: "Calificación de conducta reprobada." },
        { id: "7", text: "Rezago en el proceso de la lectoescritura." },
        { id: "8", text: "Suspensión de la persona estudiante al centro educativo." },
    ],
    "DIMENSIÓN CONVIVENCIA EDUCATIVA": [
        { id: "9", text: "Desmotivación educativa." },
        { id: "10", text: "Cambios repentinos de ánimo o conducta." },
        { id: "11", text: "Aislamiento." },
        { id: "12", text: "Percepción del estudiante de no aceptación por parte de los docentes." },
        { id: "13", text: "Bullying o ciberbullyng." },
        { id: "14", text: "Bullying por condición LGTB." },
        { id: "15", text: "Violencia física hacia el estudiante." },
        { id: "16", text: "Violencia psicológica hacia el estudiante." },
        { id: "17", text: "Delito penados por ley de la persona estudiante." },
        { id: "18", text: "Consumo de drogas de la persona estudiante en el CE." },
        { id: "19", text: "Tráfico de drogas/ delito de la persona estudiante en el CE." },
        { id: "20", text: "Tenencia de drogas de la persona estudiante en el CE." },
        { id: "21", text: "Tenencia de armas de la persona estudiante en el CE." },
        { id: "22", text: "Uso de armas en la persona estudiante." },
        { id: "23", text: "Xenofobia." },
        { id: "24", text: "Discriminación racial." },
        { id: "25", text: "Víctima de tiroteo o sicariato." },
    ],
    "DIMENSIÓN CONDICIÓN ECONÓMICA": [
        { id: "26", text: "Desempleo." },
        { id: "27", text: "Trabajo informal o temporal." },
        { id: "28", text: "Pobreza o pobreza extrema." },
        { id: "29", text: "No cuenta con transferencia monetaria condicionada." },
    ],
    "DIMENSIÓN CONDICIÓN FAMILIAR": [
        { id: "30", text: "Adicciones a drogas lícitas e ilícitas de las personas." },
        { id: "31", text: "Baja escolarización de los encargados." },
        { id: "32", text: "Fallecimiento de la persona encargada." },
        { id: "33", text: "Negligencia en el apoyo educativo de los encargados al estudiante." },
        { id: "34", text: "Negligencia en la atención integral de los encargados a la persona estudiante." },
        { id: "35", text: "Violencia intrafamiliar." },
    ],
    "DIMENSIÓN RIESGO SOCIAL": [
        { id: "36", text: "Relaciones impropias en la persona estudiante." },
        { id: "37", text: "Estudiante embarazada menor de edad." },
        { id: "38", text: "Persona estudiante madre/padre menor de edad." },
        { id: "39", text: "Trabajadora infantil o adolescente (se refiere a MTSS)." },
        { id: "40", text: "Trata de personas estudiantes." },
        { id: "41", text: "Explotación Sexual Comercial de la persona estudiante." },
    ],
    "DIMENSIÓN CONDICIÓN CULTURAL": [
        { id: "42", text: "Indígena." },
        { id: "43", text: "Idioma." },
        { id: "44", text: "Idioma/Lengua Territorio Indígena." },
        { id: "45", text: "Condición del extranjero: migrante regular." },
        { id: "46", text: "Condición del extranjero: migrante irregular." },
        { id: "47", text: "Apátrida." },
        { id: "48", text: "Riesgo de apatridia." },
        { id: "49", text: "Riesgo a la deportación durante el ciclo lectivo del estudiante mayor de edad o encargado del estudiante en condición migratoria irregular." },
        { id: "50", text: "Incompatibilidad de la cultura del estudiante con las normativas del sistema educativo (horarios, costumbres, idioma y alimentación)." },
    ],
    "DIMENSIÓN CONDICIÓN DE ACCESO": [
        { id: "51", text: "Falta de apoyos educativos curriculares (problemas de aprendizaje y lenguaje, adecuaciones significativas, no significativas y de acceso)." },
        { id: "52", text: "Falta de apoyos personales, organizativos, materiales y tecnológicos para estudiantes con discapacidad." },
        { id: "53", text: "Falta de apoyos educativos integrales dirigidos al estudiante con alta dotación, talento y creatividad." },
        { id: "54", text: "Falta del subsidio para la persona estudiante con alta dotación, talento y creatividad." },
        { id: "55", text: "Ausencia del servicio de alimentación." },
        { id: "56", text: "Ausencia del beneficio de transporte." },
        { id: "57", text: "Ausencia de ayudas técnicas para estudiantes en condición de discapacidad." },
        { id: "58", text: "Dificultad de acceso físico al centro educativo." },
        { id: "59", text: "Dificultad de acceso tecnológico." },
    ],
    "DIMENSIÓN CONDICIÓN DE SALUD": [
        { id: "60", text: "Persona estudiante con alteraciones del desarrollo relacionada con la nutrición (Tamizaje)." },
        { id: "61", text: "Persona estudiante con alteraciones del desarrollo relacionada agudeza visual (Tamizaje)." },
        { id: "62", text: "Persona estudiante con alteraciones del desarrollo-agudeza auditiva (Tamizaje)." },
        { id: "63", text: "Persona estudiante con alteraciones del desarrollo- ausencia de vacunas (Tamizaje)." },
        { id: "64", text: "Persona Estudiante con Alteraciones Bucodentales (Tamizaje)." },
        { id: "65", text: "Ideación y tentativa de suicidio de la persona estudiante." },
        { id: "66", text: "Lesiones autoinfligidas de la persona estudiante." },
        { id: "67", text: "Trastornos alimenticios de la persona estudiante." },
        { id: "68", text: "Condiciones de salud recurrentes a tratamiento." },
        { id: "69", text: "Hospitalización o convalecencia." },
        { id: "70", text: "Persona estudiante que presentan alergias medicamentosas, vectores y alimentarias." },
        { id: "71", text: "Afectación por situación de desastre de origen natural y/o antrópico o causado por el ser humano." },
    ],
    "CONFIDENCIAL (CONVIVENCIA ESTUDIANTIL)": [
        { id: "72", text: "Acoso y hostigamiento sexual hacia la persona estudiante." },
        { id: "73", text: "Violación sexual hacia la persona estudiante." },
        { id: "74", text: "Otras violencias sexuales hacia la persona estudiante." },
        { id: "75", text: "Estudiante pertenece a banda delictiva." },
        { id: "76", text: "Condición del extranjero: refugiado." },
        { id: "77", text: "Condición del extranjero: solicitante de refugio." },
    ],
};

const seguimientoItems = [
    { key: 'Activada', text: 'Se registró la alerta temprana asociada al riesgo de exclusión, para iniciar su atención.' },
    { key: 'En proceso', text: 'Se están implementando acciones de atención y seguimiento con el estudiante y su familia.' },
    { key: 'Referida', text: 'El caso se ha referido a una instancia externa (ej. PANI, IAFA, ESE) para atención especializada.' },
    { key: 'Cerrada', text: 'Se cierra el proceso de alerta temprana tras la superación de los factores de riesgo o por traslado/deserción del estudiante.' }
];

const AlertasTempranasAIModal: React.FC<AlertasTempranasAIModalProps> = ({ isOpen, onClose, student, cursoActivo, onSave, existingAlerta, fullData }) => {
    const [activeTab, setActiveTab] = useState('riesgos');
    // Form state
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [observaciones, setObservaciones] = useState('');
    const [estadoAlerta, setEstadoAlerta] = useState<string | null>(null);
    const [justificacionEliminada, setJustificacionEliminada] = useState('');
    const [atencionActions, setAtencionActions] = useState<AtencionAction[]>([]);
    const [institucionReferida, setInstitucionReferida] = useState('');
    const [contactLogs, setContactLogs] = useState<ContactLog[]>([]);

    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiError, setAiError] = useState('');
    
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (existingAlerta) {
                setCheckedItems(existingAlerta.checkedItems || {});
                setObservaciones(existingAlerta.observaciones || '');
                setEstadoAlerta(existingAlerta.estadoAlerta || null);
                setJustificacionEliminada(existingAlerta.justificacionEliminada || '');
                setAtencionActions(existingAlerta.atencionActions || []);
                setInstitucionReferida(existingAlerta.institucionReferida || '');
                setContactLogs(existingAlerta.contactLogs || []);
            } else {
                // Reset form for new alerta
                setCheckedItems({});
                setObservaciones('');
                setEstadoAlerta('Activada');
                setJustificacionEliminada('');
                setAtencionActions([]);
                setInstitucionReferida('');
                setContactLogs([]);
            }
        }
    }, [isOpen, existingAlerta]);


    if (!isOpen) return null;

    const handleCheckboxChange = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSaveAlerta = () => {
        const newAlerta: AlertaTempranaRecord = {
            id: existingAlerta?.id || `alerta_${Date.now()}`,
            estudianteId: student.id,
            cursoLectivoId: cursoActivo.id,
            fechaCreacion: existingAlerta?.fechaCreacion || new Date().toISOString().split('T')[0],
            checkedItems,
            observaciones,
            estadoAlerta,
            justificacionEliminada,
            atencionActions,
            institucionReferida,
            contactLogs,
        };
        onSave(newAlerta);
        onClose();
    };

    const generatePlanDeAtencion = async () => {
        setIsLoadingAI(true);
        setAiError('');

        const selectedItemsText = Object.entries(checkedItems)
            .filter(([, isChecked]) => isChecked)
            .map(([id]) => {
                for (const category in alertaItemsConfig) {
                    const item = (alertaItemsConfig as any)[category].find((i: any) => i.id === id);
                    if (item) return `- ${item.text}`;
                }
                return null;
            }).filter(Boolean).join('\n');
        
        try {
            const prompt = `
            ROL Y OBJETIVO:
            Actúa como un orientador educativo experto en protocolos de alerta temprana. Tu tarea es generar un "Plan de Atención" estructurado y profesional basado en los factores de riesgo identificados y el estado actual del proceso para un estudiante.

            DATOS DEL CONTEXTO:
            - Estudiante: ${student.nombre} ${student.primerApellido}
            - Estado Actual del Proceso: ${estadoAlerta || 'No especificado'}
            - Factores de Riesgo Identificados:
            ${selectedItemsText}
            - Observaciones Adicionales del Docente: ${observaciones}

            INSTRUCCIONES:
            Genera una respuesta JSON que contenga un plan de acción sugerido. El plan debe ser coherente con el estado actual del proceso. Por ejemplo, si el estado es 'Referida', las acciones deben enfocarse en el seguimiento de esa referencia. Si el estado es 'Activada', las acciones deben ser de contacto inicial y diagnóstico.
            El JSON debe tener una clave principal "planDeAtencion" que sea un array de objetos. Cada objeto en el array representa una acción y debe tener las siguientes claves:
            - "action": Una descripción clara y concisa de la acción a realizar.
            - "responsible": El responsable sugerido (ej. "Docente", "Orientación", "Comité de Convivencia", "Administración").
            - "observations": Sugerencias o detalles importantes para llevar a cabo la acción.

            Ejemplo de estructura JSON de salida:
            {
              "planDeAtencion": [
                {
                  "action": "Convocar a una reunión con el encargado legal.",
                  "responsible": "Docente",
                  "observations": "Presentar las observaciones de forma objetiva y constructiva. Elaborar una minuta de la reunión."
                },
                {
                  "action": "Referir el caso al departamento de Orientación.",
                  "responsible": "Docente",
                  "observations": "Aportar toda la documentación relevante, incluyendo el formulario de alerta temprana."
                }
              ]
            }

            Asegúrate de que las acciones sean coherentes con los factores de riesgo y las observaciones. El plan debe ser realista y aplicable en un contexto escolar. Responde únicamente con el objeto JSON.
            `;

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            planDeAtencion: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        action: { type: Type.STRING },
                                        responsible: { type: Type.STRING },
                                        observations: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text);
            const generatedActions = result.planDeAtencion.map((item: any, index: number) => ({
                id: Date.now() + index,
                startDate: '',
                endDate: '',
                ...item,
            }));
            
            setAtencionActions(prev => [...prev, ...generatedActions]);

        } catch (error) {
            console.error("Error generating attention plan:", error);
            setAiError("No se pudo generar el plan de atención. Por favor, inténtelo de nuevo.");
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handleActionChange = (index: number, field: keyof AtencionAction, value: string) => {
        const updated = [...atencionActions];
        (updated[index] as any)[field] = value;
        setAtencionActions(updated);
    };

    const addAction = () => {
        setAtencionActions([...atencionActions, { id: Date.now(), action: '', startDate: '', endDate: '', responsible: '', observations: '' }]);
    };
    
    const removeAction = (id: number) => {
        setAtencionActions(atencionActions.filter(a => a.id !== id));
    };

     const handleContactLogChange = (index: number, field: keyof ContactLog, value: string) => {
        const updated = [...contactLogs];
        (updated[index] as any)[field] = value;
        setContactLogs(updated);
    };

    const addContactLog = () => {
        setContactLogs([...contactLogs, { id: Date.now(), date: '', contactMethod: '', personContacted: '', comments: '' }]);
    };
    
    const removeContactLog = (id: number) => {
        setContactLogs(contactLogs.filter(log => log.id !== id));
    };

    const handleDownloadPDF = () => {
        const input = reportRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Alerta_Temprana_${student.nombre.replace(' ', '_')}.pdf`);
        });
    };

    const TabButton: React.FC<{ tabId: string, children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex-shrink-0 p-5 flex items-start justify-between border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Formulario de Alerta Temprana</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Estudiante: {`${student.nombre} ${student.primerApellido}`}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="flex justify-center gap-4 mb-6">
                        <TabButton tabId="riesgos">Paso 1. Factores de Riesgo</TabButton>
                        <TabButton tabId="seguimiento">Paso 2. Seguimiento</TabButton>
                        <TabButton tabId="atencion">Paso 3. Plan de Atención (IA)</TabButton>
                        <TabButton tabId="reporte">Paso 4. Reporte Final</TabButton>
                    </div>

                    <div className="space-y-6">
                        {/* Tab 1: Factores de Riesgo */}
                        {activeTab === 'riesgos' && (
                            <div className="space-y-6">
                                {Object.entries(alertaItemsConfig).map(([category, items]) => (
                                    <fieldset key={category} className="border border-slate-300 dark:border-slate-600 rounded-md p-4">
                                        <legend className="px-2 font-semibold text-indigo-600 dark:text-indigo-400">{category}</legend>
                                        <div className="space-y-3 mt-2">
                                            {items.map(item => (
                                                <label key={item.id} className="flex items-start cursor-pointer">
                                                    <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => handleCheckboxChange(item.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1" />
                                                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                                <div>
                                    <label htmlFor="observaciones" className="block text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Observaciones Generales</label>
                                    <textarea id="observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={4} className="w-full form-input" placeholder="Describa aquí otras situaciones observadas..."></textarea>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Seguimiento */}
                        {activeTab === 'seguimiento' && (
                            <div className="space-y-6">
                                 <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Estado del Proceso</h3>
                                    <div className="space-y-3">
                                        {seguimientoItems.map(item => (
                                            <div key={item.key}>
                                                <label className="flex items-start p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50">
                                                    <input
                                                        type="radio"
                                                        name="estadoAlerta"
                                                        value={item.key}
                                                        checked={estadoAlerta === item.key}
                                                        onChange={(e) => setEstadoAlerta(e.target.value)}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                                                    />
                                                    <span className="ml-3 text-sm">
                                                        <strong className="font-semibold text-slate-800 dark:text-slate-100">{item.key}:</strong>
                                                        <span className="text-slate-600 dark:text-slate-300"> {item.text}</span>
                                                    </span>
                                                </label>
                                                {item.key === 'En proceso' && estadoAlerta === 'En proceso' && (
                                                    <div className="mt-2 p-3 text-sm text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/40 rounded-lg w-full flex items-start gap-3 animate-fade-in">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p>Para documentar el progreso, utilice la <strong>Bitácora de Contacto</strong> (más abajo) y elabore un <strong>Plan de Atención</strong> en el Paso 3.</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {estadoAlerta === 'Referida' && (
                                        <div className="mt-4 animate-fade-in"><label className="form-label">Institución Referida</label><input type="text" value={institucionReferida} onChange={e => setInstitucionReferida(e.target.value)} className="w-full form-input" placeholder="Ej: PANI, IAFA, Equipo Interdisciplinario..." /></div>
                                    )}
                                     {estadoAlerta === 'Cerrada' && (
                                        <div className="mt-4 animate-fade-in"><label className="form-label">Justificación de Cierre</label><textarea value={justificacionEliminada} onChange={e => setJustificacionEliminada(e.target.value)} rows={3} className="w-full form-input" placeholder="Describa el motivo del cierre del caso..."></textarea></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Bitácora de Contacto</h3>
                                    <div className="space-y-4">
                                        {contactLogs.map((log, index) => (
                                            <div key={log.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 dark:border-slate-600 p-4 rounded-md relative">
                                                <button onClick={() => removeContactLog(log.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                <div><label className="form-label">Fecha</label><input type="date" value={log.date} onChange={e => handleContactLogChange(index, 'date', e.target.value)} className="w-full form-input" /></div>
                                                <div><label className="form-label">Medio de Contacto</label><input type="text" value={log.contactMethod} onChange={e => handleContactLogChange(index, 'contactMethod', e.target.value)} className="w-full form-input" placeholder="Llamada, reunión, mensaje..." /></div>
                                                <div><label className="form-label">Persona Contactada</label><input type="text" value={log.personContacted} onChange={e => handleContactLogChange(index, 'personContacted', e.target.value)} className="w-full form-input" placeholder="Nombre y parentesco" /></div>
                                                <div className="md:col-span-2"><label className="form-label">Comentarios</label><textarea value={log.comments} onChange={e => handleContactLogChange(index, 'comments', e.target.value)} className="w-full form-input" rows={2}></textarea></div>
                                            </div>
                                        ))}
                                        <button onClick={addContactLog} className="btn-secondary w-full">Añadir Registro a Bitácora</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                         {/* Tab 3: Plan de Atención (IA) */}
                        {activeTab === 'atencion' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                                    <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">Asistente de IA para Plan de Atención</h3>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1 mb-3">Genere un plan de acción sugerido basado en los factores de riesgo y el estado del seguimiento.</p>
                                    <button onClick={generatePlanDeAtencion} disabled={isLoadingAI} className="btn-primary">
                                        {isLoadingAI ? 'Generando...' : 'Generar Plan Sugerido'}
                                    </button>
                                    {aiError && <p className="text-xs text-red-500 mt-2">{aiError}</p>}
                                </div>
                                <div className="space-y-4">
                                    {atencionActions.map((action, index) => (
                                        <div key={action.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 dark:border-slate-600 p-4 rounded-md relative">
                                            <button onClick={() => removeAction(action.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            <div className="md:col-span-2"><label className="form-label">Acción</label><textarea value={action.action} onChange={e => handleActionChange(index, 'action', e.target.value)} className="w-full form-input" rows={2}></textarea></div>
                                            <div><label className="form-label">Fecha Inicio</label><input type="date" value={action.startDate} onChange={e => handleActionChange(index, 'startDate', e.target.value)} className="w-full form-input" /></div>
                                            <div><label className="form-label">Fecha Fin</label><input type="date" value={action.endDate} onChange={e => handleActionChange(index, 'endDate', e.target.value)} className="w-full form-input" /></div>
                                            <div><label className="form-label">Responsable</label><input type="text" value={action.responsible} onChange={e => handleActionChange(index, 'responsible', e.target.value)} className="w-full form-input" /></div>
                                            <div className="md:col-span-2"><label className="form-label">Observaciones</label><textarea value={action.observations} onChange={e => handleActionChange(index, 'observations', e.target.value)} className="w-full form-input" rows={2}></textarea></div>
                                        </div>
                                    ))}
                                    <button onClick={addAction} className="btn-secondary w-full">Añadir Acción Manualmente</button>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Reporte */}
                        {activeTab === 'reporte' && (
                            <div ref={reportRef} className="p-8 bg-white text-black font-serif">
                                <h1 className="text-2xl font-bold text-center mb-6">FORMULARIO DE ALERTA TEMPRANA</h1>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 border-b pb-4">
                                    <p><strong>Estudiante:</strong> {student.nombre} {student.primerApellido} {student.segundoApellido}</p>
                                    <p><strong>Cédula:</strong> {student.cedula}</p>
                                    <p><strong>Docente:</strong> {cursoActivo.teacherName}</p>
                                    <p><strong>Fecha de Apertura:</strong> {existingAlerta?.fechaCreacion ? new Date(existingAlerta.fechaCreacion).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                    <p><strong>Curso Lectivo:</strong> {cursoActivo.year}</p>
                                    <p><strong>Estado Actual:</strong> <span className="font-bold">{estadoAlerta || 'N/A'}</span></p>
                                </div>
                                <h2 className="text-xl font-bold mb-4">1. Factores de Riesgo Identificados</h2>
                                <ul className="list-disc list-inside space-y-1 mb-6 text-sm">
                                    {Object.entries(checkedItems).filter(([, isChecked]) => isChecked).map(([id]) => {
                                        for (const category in alertaItemsConfig) {
                                            const item = (alertaItemsConfig as any)[category].find((i: any) => i.id === id);
                                            if (item) return <li key={id}>{item.text}</li>;
                                        }
                                        return null;
                                    })}
                                </ul>
                                <h3 className="text-lg font-bold mb-2">Observaciones Generales</h3>
                                <p className="text-sm border p-2 mb-6 bg-slate-50 min-h-[50px]">{observaciones || 'Sin observaciones.'}</p>
                                <h2 className="text-xl font-bold mb-4">2. Plan de Atención</h2>
                                {atencionActions.map((action, index) => (
                                    <div key={index} className="mb-4 border-b pb-2 text-sm">
                                        <p><strong>Acción {index+1}:</strong> {action.action}</p>
                                        <p><strong>Responsable:</strong> {action.responsible}</p>
                                        <p><strong>Fechas:</strong> {action.startDate} al {action.endDate}</p>
                                        <p><strong>Observaciones:</strong> {action.observations}</p>
                                    </div>
                                ))}
                                 <h2 className="text-xl font-bold mb-4">3. Seguimiento</h2>
                                 <h3 className="text-lg font-bold mb-2">Bitácora de Contacto</h3>
                                 {contactLogs.map((log, index) => (
                                     <div key={index} className="mb-4 border-b pb-2 text-sm">
                                         <p><strong>Fecha:</strong> {log.date}</p>
                                         <p><strong>Medio/Persona:</strong> {log.contactMethod} / {log.personContacted}</p>
                                         <p><strong>Comentarios:</strong> {log.comments}</p>
                                     </div>
                                 ))}
                                 {estadoAlerta === 'Referida' && <p className="text-sm"><strong>Institución Referida:</strong> {institucionReferida}</p>}
                                 {estadoAlerta === 'Cerrada' && <p className="text-sm"><strong>Justificación de Cierre:</strong> {justificacionEliminada}</p>}

                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex justify-between items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
                    <button onClick={handleDownloadPDF} disabled={activeTab !== 'reporte'} className="btn-secondary disabled:opacity-50">Descargar PDF</button>
                    <button onClick={handleSaveAlerta} className="btn-primary">Guardar Cambios y Cerrar</button>
                </div>

                <style>{`
                    .form-input{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;border-radius:0.375rem;background-color:rgb(241 245 249/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(71 85 105/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}
                    .form-label{display:block;font-size:0.875rem;font-weight:500;color:rgb(71 85 105);margin-bottom:0.25rem}.dark .form-label{color:rgb(203 213 225)}
                    .btn-primary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(99 102 241);color:white;transition:background-color 0.2s}.btn-primary:hover{background-color:rgb(79 70 229)}.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
                    .btn-secondary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(226 232 240);color:rgb(51 65 85);transition:background-color 0.2s}.dark .btn-secondary{background-color:rgb(71 85 105);color:rgb(226 232 240)}.btn-secondary:hover{background-color:rgb(203 213 225)}.dark .btn-secondary:hover{background-color:rgb(100 116 139)}.btn-secondary:disabled{opacity:0.6;cursor:not-allowed}
                    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        </div>
    );
};

export default AlertasTempranasAIModal;