import React, { useState, useMemo } from 'react';
import {
    CursoLectivo, Estudiante, EstadoEstudiante,
    ConfiguracionPorcentaje, Tarea, CalificacionTarea,
    ConfiguracionCotidiano, Indicador, EvaluacionCotidiano, CalificacionIndicador, NivelRubrica,
    ConfiguracionProyecto, Proyecto, CalificacionProyecto,
    ConfiguracionPrueba, Prueba, CalificacionPrueba,
    AsistenciaRecord, AsistenciaStatus
} from '../types';
import ResumenGeneralAIModal from './ResumenGeneralAIModal';
import PerfilSalidaAIModal from './PerfilSalidaAIModal';
import SeleccionarEstudianteParaPerfilModal from './SeleccionarEstudianteParaPerfilModal';


interface ResumenProps {
    cursoActivo: CursoLectivo | null;
    estudiantes: Estudiante[];
    // Data for all evaluation components
    configuracionesTareas: ConfiguracionPorcentaje[];
    tareas: Tarea[];
    calificacionesTareas: CalificacionTarea[];
    configuracionesCotidiano: ConfiguracionCotidiano[];
    evaluacionesCotidiano: EvaluacionCotidiano[];
    indicadores: Indicador[];
    calificacionesIndicadores: CalificacionIndicador[];
    configuracionesProyectos: ConfiguracionProyecto[];
    proyectos: Proyecto[];
    calificacionesProyectos: CalificacionProyecto[];
    configuracionesPruebas: ConfiguracionPrueba[];
    pruebas: Prueba[];
    calificacionesPruebas: CalificacionPrueba[];
    asistenciaRecords: AsistenciaRecord[];
}

// Define calculation results structure
interface CalculationResult {
    porcentaje: number;
    nota: number;
    configurado: boolean;
    evaluado: boolean;
}
interface AsistenciaSummary {
    justificadas: number;
    injustificadas: number;
    tardias: number;
}

const defaultCalculationResult: CalculationResult = { porcentaje: 0, nota: 0, configurado: false, evaluado: false };
const defaultAsistenciaSummary: AsistenciaSummary = { justificadas: 0, injustificadas: 0, tardias: 0 };
const defaultResultsSet = {
    tareas: defaultCalculationResult,
    cotidiano: defaultCalculationResult,
    proyectos: defaultCalculationResult,
    pruebas: defaultCalculationResult,
    asistencia: defaultAsistenciaSummary,
    totalPorcentaje: 0,
};

const useCalculations = (props: ResumenProps) => {
    const { cursoActivo } = props;

    return useMemo(() => {
        if (!cursoActivo) return () => defaultResultsSet;

        const calculateAsistencia = (studentId: string, periodo: string, subject: string): AsistenciaSummary => {
            const records = props.asistenciaRecords.filter(r => r.estudianteId === studentId && r.periodoNombre === periodo && r.subject === subject);
            return records.reduce((acc, record) => {
                if (record.status === AsistenciaStatus.Justificada) acc.justificadas++;
                if (record.status === AsistenciaStatus.Injustificada) acc.injustificadas++;
                if (record.status === AsistenciaStatus.TardiaJustificada || record.status === AsistenciaStatus.TardiaInjustificada) acc.tardias++;
                return acc;
            }, { justificadas: 0, injustificadas: 0, tardias: 0 });
        };
        
        const calculateTareas = (studentId: string, periodo: string, subject: string): CalculationResult => {
            const config = props.configuracionesTareas.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config) return { ...defaultCalculationResult, configurado: false };
            const relevantTareas = props.tareas.filter(t => t.periodoNombre === periodo && t.subject === subject);
            if (relevantTareas.length === 0) return { porcentaje: 0, nota: 0, configurado: true, evaluado: false };
            let porcentajeAcumulado = 0;
            relevantTareas.forEach(tarea => {
                const cal = props.calificacionesTareas.find(c => c.tareaId === tarea.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && tarea.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / tarea.puntosTotales) * tarea.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado, nota: (porcentajeAcumulado / (relevantTareas.reduce((sum, t) => sum + t.porcentaje, 0) || 1)) * 100, configurado: true, evaluado: true };
        };

        const calculateCotidiano = (studentId: string, periodo: string, subject: string): CalculationResult => {
            const config = props.configuracionesCotidiano.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config) return { ...defaultCalculationResult, configurado: false };
            const evaluacion = props.evaluacionesCotidiano.find(e => e.periodoNombre === periodo && e.subject === subject);
            const ids = evaluacion?.indicadorIds || [];
            if (ids.length === 0) return { porcentaje: 0, nota: 0, configurado: true, evaluado: false };
            
            const nivelValues: { [key in NivelRubrica]: number } = {
                [NivelRubrica.Avanzado]: 1.0,
                [NivelRubrica.Logrado]: 0.85,
                [NivelRubrica.EnProceso]: 0.70,
                [NivelRubrica.Iniciado]: 0.50,
            };
            let totalValor = 0;
            let indicadoresEvaluados = 0;

            ids.forEach(id => {
                const cal = props.calificacionesIndicadores.find(c => c.estudianteId === studentId && c.indicadorId === id && c.periodoNombre === periodo && c.subject === subject);
                if (cal?.nivel) {
                    totalValor += nivelValues[cal.nivel];
                    indicadoresEvaluados++;
                }
            });
            
            const nota = indicadoresEvaluados > 0 ? (totalValor / indicadoresEvaluados) * 100 : 0;
            return { porcentaje: (nota / 100) * config.porcentajeGeneral, nota, configurado: true, evaluado: true };
        };

        const calculateProyectos = (studentId: string, periodo: string, subject: string): CalculationResult => {
            const config = props.configuracionesProyectos.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config || !config.isEnabled) return { ...defaultCalculationResult, configurado: config?.isEnabled || false };
            const relevant = props.proyectos.filter(p => p.periodoNombre === periodo && p.subject === subject);
            if (relevant.length === 0) return { porcentaje: 0, nota: 0, configurado: true, evaluado: false };
            let porcentajeAcumulado = 0;
            relevant.forEach(p => {
                const cal = props.calificacionesProyectos.find(c => c.proyectoId === p.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && p.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / p.puntosTotales) * p.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado, nota: (porcentajeAcumulado / (relevant.reduce((sum, p) => sum + p.porcentaje, 0) || 1)) * 100, configurado: true, evaluado: true };
        };

        const calculatePruebas = (studentId: string, periodo: string, subject: string): CalculationResult => {
            const config = props.configuracionesPruebas.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config || !config.isEnabled) return { ...defaultCalculationResult, configurado: config?.isEnabled || false };
            const relevant = props.pruebas.filter(p => p.periodoNombre === periodo && p.subject === subject);
            if (relevant.length === 0) return { porcentaje: 0, nota: 0, configurado: true, evaluado: false };
            let porcentajeAcumulado = 0;
            relevant.forEach(p => {
                const cal = props.calificacionesPruebas.find(c => c.pruebaId === p.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && p.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / p.puntosTotales) * p.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado, nota: (porcentajeAcumulado / (relevant.reduce((sum, p) => sum + p.porcentaje, 0) || 1)) * 100, configurado: true, evaluado: true };
        };

        const getPeriodoResults = (studentId: string, periodo: string, subject: string) => {
            const tareas = calculateTareas(studentId, periodo, subject);
            const cotidiano = calculateCotidiano(studentId, periodo, subject);
            const proyectos = calculateProyectos(studentId, periodo, subject);
            const pruebas = calculatePruebas(studentId, periodo, subject);
            const asistencia = calculateAsistencia(studentId, periodo, subject);
            const totalPorcentaje = tareas.porcentaje + cotidiano.porcentaje + proyectos.porcentaje + pruebas.porcentaje;
            return { tareas, cotidiano, proyectos, pruebas, asistencia, totalPorcentaje };
        };

        return (studentId: string, periodo: string, subject: string) => {
            if (periodo === 'Anual' && cursoActivo.periods.length > 0) {
                const hasP1 = props.configuracionesTareas.some(c => c.periodoNombre === cursoActivo.periods[0].nombre && c.subject === subject) ||
                              props.configuracionesCotidiano.some(c => c.periodoNombre === cursoActivo.periods[0].nombre && c.subject === subject);
                const hasP2 = cursoActivo.periods.length > 1 ? (props.configuracionesTareas.some(c => c.periodoNombre === cursoActivo.periods[1].nombre && c.subject === subject) ||
                             props.configuracionesCotidiano.some(c => c.periodoNombre === cursoActivo.periods[1].nombre && c.subject === subject)) : false;

                const p1 = hasP1 ? getPeriodoResults(studentId, cursoActivo.periods[0].nombre, subject) : null;
                const p2 = hasP2 ? getPeriodoResults(studentId, cursoActivo.periods[1].nombre, subject) : null;
                
                if (!p1 && !p2) return defaultResultsSet;
                if (!p2) return p1!;
                if (!p1) return p2;

                const avgResult = (r1: CalculationResult, r2: CalculationResult) => ({
                    porcentaje: (r1.porcentaje + r2.porcentaje) / 2,
                    nota: (r1.nota + r2.nota) / 2,
                    configurado: r1.configurado || r2.configurado,
                    evaluado: r1.evaluado || r2.evaluado
                });
                
                return {
                    tareas: avgResult(p1.tareas, p2.tareas),
                    cotidiano: avgResult(p1.cotidiano, p2.cotidiano),
                    proyectos: avgResult(p1.proyectos, p2.proyectos),
                    pruebas: avgResult(p1.pruebas, p2.pruebas),
                    asistencia: {
                        justificadas: p1.asistencia.justificadas + p2.asistencia.justificadas,
                        injustificadas: p1.asistencia.injustificadas + p2.asistencia.injustificadas,
                        tardias: p1.asistencia.tardias + p2.asistencia.tardias,
                    },
                    totalPorcentaje: (p1.totalPorcentaje + p2.totalPorcentaje) / 2
                };
            }
            // Fallback for non-annual or single-period courses
            const singlePeriod = periodo === 'Anual' ? cursoActivo.periods[0].nombre : periodo;
            return getPeriodoResults(studentId, singlePeriod, subject);
        };
    }, [props]);
};


const ResultBlock: React.FC<{ title: string; result: CalculationResult, isFinal?: boolean }> = ({ title, result, isFinal = false }) => {
    return (
        <div className={`text-center flex-shrink-0 ${isFinal ? 'min-w-[90px]' : 'w-20'}`}>
            <p className={`font-bold truncate ${isFinal ? 'text-xl text-green-600 dark:text-green-400' : 'text-lg text-indigo-500 dark:text-indigo-400'}`}>
                {result.configurado && result.evaluado ? `${result.porcentaje.toFixed(2)}%` : '-'}
            </p>
            {result.configurado && result.evaluado && (
                 <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                    Nota: {result.nota.toFixed(0)}
                 </p>
            )}
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate mt-1" title={title}>
                {title}
            </h4>
        </div>
    );
};

const AsistenciaBlock: React.FC<{ summary: AsistenciaSummary }> = ({ summary }) => (
    <div className="text-center flex-shrink-0 w-24">
        <div className="flex justify-center items-baseline space-x-2">
            <div title="Injustificadas">
                <span className="font-bold text-lg text-red-500">{summary.injustificadas}</span>
                <span className="text-xs font-semibold text-red-500 ml-0.5">I</span>
            </div>
            <div title="Justificadas">
                <span className="font-bold text-lg text-green-500">{summary.justificadas}</span>
                <span className="text-xs font-semibold text-green-500 ml-0.5">J</span>
            </div>
            <div title="Tardías">
                <span className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{summary.tardias}</span>
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 ml-0.5">T</span>
            </div>
        </div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate mt-1">
            Asistencia
        </h4>
    </div>
);


const Resumen: React.FC<ResumenProps> = (props) => {
    const { cursoActivo, estudiantes } = props;
    const [selectedPeriodoName, setSelectedPeriodoName] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
    const [isSelectStudentModalOpen, setIsSelectStudentModalOpen] = useState(false);
    const [selectedStudentForAI, setSelectedStudentForAI] = useState<{ student: Estudiante, results: any } | null>(null);

    const getStudentResults = useCalculations(props);
    
    const activeStudents = useMemo(() => estudiantes.filter(e => e.estado === EstadoEstudiante.Activo), [estudiantes]);
    
    if (!cursoActivo) {
        return <div className="text-center p-8">Por favor, cree o seleccione un curso lectivo.</div>;
    }

    const periodosDisponibles = [...cursoActivo.periods.map(p => p.nombre), 'Anual'];

    const handleOpenAIModal = (student: Estudiante) => {
        const results = getStudentResults(student.id, selectedPeriodoName, selectedSubject);
        setSelectedStudentForAI({ student, results });
        setIsAIModalOpen(true);
    };

    const handleOpenPerfilModal = (student: Estudiante) => {
        if (!cursoActivo) return;

        const allSubjects = cursoActivo.subjects;
        const annualResultsBySubject = allSubjects.reduce((acc, subject) => {
            // Get 'Anual' results for each subject
            acc[subject] = getStudentResults(student.id, 'Anual', subject);
            return acc;
        }, {} as Record<string, any>);
        
        // The aggregated results are passed here
        setSelectedStudentForAI({ student, results: annualResultsBySubject });
        setIsPerfilModalOpen(true);
    };

    const handleStudentSelectedForProfile = (student: Estudiante) => {
        setIsSelectStudentModalOpen(false);
        handleOpenPerfilModal(student);
    };
    
    return (
        <div className="max-w-full mx-auto space-y-6">
             <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg print:hidden">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-4 mb-4">Resumen de Calificaciones</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select onChange={e => setSelectedPeriodoName(e.target.value)} className="w-full form-input md:col-span-1" value={selectedPeriodoName}>
                        <option value="">-- Seleccione Periodo --</option>
                        {periodosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedPeriodoName} className="w-full form-input md:col-span-1" value={selectedSubject}>
                        <option value="">-- Seleccione Materia --</option>
                        {cursoActivo.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <div className="md:col-span-1 flex items-center justify-end gap-2">
                        {selectedPeriodoName === 'Anual' && (
                            <button
                                onClick={() => setIsSelectStudentModalOpen(true)}
                                disabled={activeStudents.length === 0}
                                className="inline-flex items-center justify-center px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                title={activeStudents.length === 0 ? "No hay estudiantes activos para generar un perfil" : "Generar perfil de salida anual para un estudiante"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Generar Perfil
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            disabled={!selectedPeriodoName || !selectedSubject}
                            className="inline-flex items-center justify-center px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>

            {selectedPeriodoName && selectedSubject ? (
                 <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="hidden print:block mb-6 p-6 border-b">
                        <h1 className="text-3xl font-bold text-black">Resumen de Calificaciones</h1>
                        <div className="text-lg">
                            <p><span className="font-semibold">Curso Lectivo:</span> {cursoActivo.year}</p>
                            <p><span className="font-semibold">Docente:</span> {cursoActivo.teacherName}</p>
                            <p><span className="font-semibold">Materia:</span> {selectedSubject}</p>
                            <p><span className="font-semibold">Periodo:</span> {selectedPeriodoName}</p>
                            <p><span className="font-semibold">Fecha de Impresión:</span> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <ul className="divide-y divide-slate-200 dark:divide-slate-600">
                             {activeStudents.map(student => {
                                const results = getStudentResults(student.id, selectedPeriodoName, selectedSubject);
                                 return (
                                     <li key={student.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                         <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                                    {`${student.nombre} ${student.primerApellido} ${student.segundoApellido}`}
                                                </p>
                                                <button onClick={() => handleOpenAIModal(student)} className="print:hidden text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors" title="Generar comentario general con IA">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                                </button>
                                            </div>
                                         </div>
                                         <div className="flex-shrink-0 flex items-center justify-end gap-x-4 gap-y-2 flex-wrap">
                                             <ResultBlock title="Tareas" result={results.tareas} />
                                             <ResultBlock title="Cotidiano" result={results.cotidiano} />
                                             {results.pruebas.configurado && <ResultBlock title="Pruebas" result={results.pruebas} />}
                                             {results.proyectos.configurado && <ResultBlock title="Proyectos" result={results.proyectos} />}
                                             <AsistenciaBlock summary={results.asistencia} />
                                             <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-600 mt-2 md:mt-0 pt-2 md:pt-0 md:pl-4">
                                                <ResultBlock title="Final" result={{ ...defaultCalculationResult, porcentaje: results.totalPorcentaje, configurado: true, evaluado: true, nota: results.totalPorcentaje }} isFinal />
                                             </div>
                                         </div>
                                     </li>
                                 );
                             })}
                         </ul>
                     </div>
                 </div>
            ) : (
                <div className="text-center p-8 bg-white dark:bg-slate-700 rounded-xl shadow-lg print:hidden">
                    <p className="text-slate-500 dark:text-slate-400">Seleccione un periodo y una materia para ver el resumen de calificaciones.</p>
                </div>
            )}

            {isAIModalOpen && selectedStudentForAI && (
                <ResumenGeneralAIModal 
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    student={selectedStudentForAI.student}
                    results={selectedStudentForAI.results}
                    periodo={selectedPeriodoName}
                />
            )}
            
            {isSelectStudentModalOpen && (
                <SeleccionarEstudianteParaPerfilModal
                    isOpen={isSelectStudentModalOpen}
                    onClose={() => setIsSelectStudentModalOpen(false)}
                    students={activeStudents}
                    onSelect={handleStudentSelectedForProfile}
                />
            )}

            {isPerfilModalOpen && selectedStudentForAI && cursoActivo && (
                <PerfilSalidaAIModal
                    isOpen={isPerfilModalOpen}
                    onClose={() => setIsPerfilModalOpen(false)}
                    student={selectedStudentForAI.student}
                    results={selectedStudentForAI.results}
                    periodo="Anual"
                    cursoActivo={cursoActivo}
                    subjects={cursoActivo.subjects}
                />
            )}

             <style>{`
                .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background-color: rgb(241 245 249 / 1); border: 1px solid rgb(203 213 225 / 1); }
                .dark .form-input { background-color: rgb(71 85 105 / 1); border-color: rgb(100 116 139 / 1); }
                .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: rgb(99 102 241 / 1); box-shadow: 0 0 0 1px rgb(99 102 241 / 1); }
                 @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default Resumen;