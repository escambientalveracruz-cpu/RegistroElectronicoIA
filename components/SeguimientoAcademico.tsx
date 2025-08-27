import React, { useState, useMemo } from 'react';
import {
    CursoLectivo, Estudiante, EstadoEstudiante,
    ConfiguracionPorcentaje, Tarea, CalificacionTarea,
    ConfiguracionCotidiano, Indicador, EvaluacionCotidiano, CalificacionIndicador, NivelRubrica,
    ConfiguracionProyecto, Proyecto, CalificacionProyecto,
    ConfiguracionPrueba, Prueba, CalificacionPrueba,
    AsistenciaRecord, AsistenciaStatus, AlertaTempranaRecord
} from '../types';
import PerfilSalidaAIModal from './PerfilSalidaAIModal';
import PerfilEntradaAIModal from './PerfilEntradaAIModal';
import AlertasTempranasAIModal from './AlertasTempranasAIModal';
import SeleccionarEstudianteParaPerfilModal from './SeleccionarEstudianteParaPerfilModal';

interface SeguimientoAcademicoProps {
    cursoActivo: CursoLectivo | null;
    estudiantes: Estudiante[];
    alertasTempranas: AlertaTempranaRecord[];
    onSaveAlertaTemprana: (alerta: AlertaTempranaRecord) => void;
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

// Re-using the calculation logic from Resumen.tsx to ensure consistency.
const useCalculations = (props: SeguimientoAcademicoProps) => {
    const { cursoActivo } = props;
    return useMemo(() => {
        if (!cursoActivo) return () => ({ totalPorcentaje: 0 });
        
        const calculateTareas = (studentId: string, periodo: string, subject: string) => {
            const config = props.configuracionesTareas.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config) return { porcentaje: 0 };
            const relevantTareas = props.tareas.filter(t => t.periodoNombre === periodo && t.subject === subject);
            if (relevantTareas.length === 0) return { porcentaje: 0 };
            let porcentajeAcumulado = 0;
            relevantTareas.forEach(tarea => {
                const cal = props.calificacionesTareas.find(c => c.tareaId === tarea.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && tarea.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / tarea.puntosTotales) * tarea.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado };
        };

        const calculateCotidiano = (studentId: string, periodo: string, subject: string) => {
            const config = props.configuracionesCotidiano.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config) return { porcentaje: 0 };
            const evaluacion = props.evaluacionesCotidiano.find(e => e.periodoNombre === periodo && e.subject === subject);
            const ids = evaluacion?.indicadorIds || [];
            if (ids.length === 0) return { porcentaje: 0 };
            const nivelValues = { [NivelRubrica.Avanzado]: 1.0, [NivelRubrica.Logrado]: 0.85, [NivelRubrica.EnProceso]: 0.70, [NivelRubrica.Iniciado]: 0.50 };
            let totalValor = 0, indicadoresEvaluados = 0;
            ids.forEach(id => {
                const cal = props.calificacionesIndicadores.find(c => c.estudianteId === studentId && c.indicadorId === id && c.periodoNombre === periodo && c.subject === subject);
                if (cal?.nivel) {
                    totalValor += nivelValues[cal.nivel];
                    indicadoresEvaluados++;
                }
            });
            const nota = indicadoresEvaluados > 0 ? (totalValor / indicadoresEvaluados) * 100 : 0;
            return { porcentaje: (nota / 100) * config.porcentajeGeneral };
        };

        const calculateProyectos = (studentId: string, periodo: string, subject: string) => {
            const config = props.configuracionesProyectos.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config || !config.isEnabled) return { porcentaje: 0 };
            const relevant = props.proyectos.filter(p => p.periodoNombre === periodo && p.subject === subject);
            if (relevant.length === 0) return { porcentaje: 0 };
            let porcentajeAcumulado = 0;
            relevant.forEach(p => {
                const cal = props.calificacionesProyectos.find(c => c.proyectoId === p.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && p.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / p.puntosTotales) * p.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado };
        };

        const calculatePruebas = (studentId: string, periodo: string, subject: string) => {
            const config = props.configuracionesPruebas.find(c => c.periodoNombre === periodo && c.subject === subject);
            if (!config || !config.isEnabled) return { porcentaje: 0 };
            const relevant = props.pruebas.filter(p => p.periodoNombre === periodo && p.subject === subject);
            if (relevant.length === 0) return { porcentaje: 0 };
            let porcentajeAcumulado = 0;
            relevant.forEach(p => {
                const cal = props.calificacionesPruebas.find(c => c.pruebaId === p.id && c.estudianteId === studentId);
                const puntos = cal?.puntosObtenidos;
                if (puntos !== null && puntos !== undefined && p.puntosTotales > 0) {
                    porcentajeAcumulado += (puntos / p.puntosTotales) * p.porcentaje;
                }
            });
            return { porcentaje: porcentajeAcumulado };
        };

        const getPeriodoResults = (studentId: string, periodo: string, subject: string) => {
            const tareas = calculateTareas(studentId, periodo, subject);
            const cotidiano = calculateCotidiano(studentId, periodo, subject);
            const proyectos = calculateProyectos(studentId, periodo, subject);
            const pruebas = calculatePruebas(studentId, periodo, subject);
            const totalPorcentaje = tareas.porcentaje + cotidiano.porcentaje + proyectos.porcentaje + pruebas.porcentaje;
            return { totalPorcentaje };
        };

        return (studentId: string, subject: string) => {
            const p1Results = cursoActivo.periods[0] ? getPeriodoResults(studentId, cursoActivo.periods[0].nombre, subject) : { totalPorcentaje: 0 };
            const p2Results = cursoActivo.periods[1] ? getPeriodoResults(studentId, cursoActivo.periods[1].nombre, subject) : { totalPorcentaje: 0 };
            return {
                totalPorcentaje: (p1Results.totalPorcentaje + p2Results.totalPorcentaje) / 2
            };
        };
    }, [props]);
};


const SeguimientoAcademico: React.FC<SeguimientoAcademicoProps> = (props) => {
    const { cursoActivo, estudiantes, alertasTempranas, onSaveAlertaTemprana } = props;
    const [editingAlerta, setEditingAlerta] = useState<AlertaTempranaRecord | null>(null);

    const [isPerfilSalidaModalOpen, setIsPerfilSalidaModalOpen] = useState(false);
    const [isPerfilEntradaModalOpen, setIsPerfilEntradaModalOpen] = useState(false);
    const [isAlertaTempranaModalOpen, setIsAlertaTempranaModalOpen] = useState(false);

    const [isSelectStudentForSalidaModalOpen, setIsSelectStudentForSalidaModalOpen] = useState(false);
    const [isSelectStudentForEntradaModalOpen, setIsSelectStudentForEntradaModalOpen] = useState(false);
    const [isSelectStudentForAlertaModalOpen, setIsSelectStudentForAlertaModalOpen] = useState(false);

    const [selectedStudentForAI, setSelectedStudentForAI] = useState<{ student: Estudiante, results: any } | null>(null);

    const getStudentAnnualResults = useCalculations(props);
    const activeStudents = useMemo(() => estudiantes.filter(e => e.cursoLectivoId === cursoActivo?.id && e.estado === EstadoEstudiante.Activo), [estudiantes, cursoActivo]);

    const estudiantesMap = useMemo(() => {
        const map = new Map<string, Estudiante>();
        estudiantes.forEach(s => map.set(s.id, s));
        return map;
    }, [estudiantes]);


    if (!cursoActivo) {
        return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Por favor, cree o seleccione un curso lectivo para acceder a las herramientas de seguimiento.</div>;
    }

    const handleOpenPerfilSalidaModal = (student: Estudiante) => {
        const allSubjects = cursoActivo.subjects;
        const annualResultsBySubject = allSubjects.reduce((acc, subject) => {
            acc[subject] = getStudentAnnualResults(student.id, subject);
            return acc;
        }, {} as Record<string, any>);
        
        setSelectedStudentForAI({ student, results: annualResultsBySubject });
        setIsPerfilSalidaModalOpen(true);
    };
    
    const handleOpenPerfilEntradaModal = (student: Estudiante) => {
        setSelectedStudentForAI({ student, results: {} }); // No results needed for entry profile
        setIsPerfilEntradaModalOpen(true);
    };

    const handleOpenAlertaTempranaModal = (student: Estudiante) => {
        setEditingAlerta(null); // This is for a new alert
        setSelectedStudentForAI({ student, results: {} }); 
        setIsAlertaTempranaModalOpen(true);
    };

    const handleEditAlerta = (alerta: AlertaTempranaRecord) => {
        const student = estudiantes.find(s => s.id === alerta.estudianteId);
        if (student) {
            setEditingAlerta(alerta);
            setSelectedStudentForAI({ student, results: {} });
            setIsAlertaTempranaModalOpen(true);
        } else {
            alert("No se pudo encontrar al estudiante asociado a esta alerta.");
        }
    };


    const handleStudentSelectedForSalida = (student: Estudiante) => {
        setIsSelectStudentForSalidaModalOpen(false);
        handleOpenPerfilSalidaModal(student);
    };

    const handleStudentSelectedForEntrada = (student: Estudiante) => {
        setIsSelectStudentForEntradaModalOpen(false);
        handleOpenPerfilEntradaModal(student);
    };

    const handleStudentSelectedForAlerta = (student: Estudiante) => {
        setIsSelectStudentForAlertaModalOpen(false);
        handleOpenAlertaTempranaModal(student);
    };
    
    const ComingSoonBadge = () => (
      <span className="absolute top-2 right-2 text-xs font-bold text-amber-800 bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 rounded-full">Próximamente</span>
    );
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Seguimiento Académico</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Herramientas para el análisis y la elaboración de informes estudiantiles.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Perfil de Entrada */}
                <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg flex flex-col items-start hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20 transition-shadow">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Perfil de Entrada</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">Registre las habilidades y conocimientos iniciales de cada estudiante al comenzar el curso.</p>
                    <button onClick={() => setIsSelectStudentForEntradaModalOpen(true)} className="mt-auto font-semibold text-sm text-white bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700">Generar Perfil</button>
                </div>

                {/* Perfil de Salida */}
                <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg flex flex-col items-start hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-shadow">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Perfil de Salida Anual</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">Genere un informe descriptivo completo del rendimiento y desarrollo del estudiante al finalizar el año lectivo.</p>
                    <button onClick={() => setIsSelectStudentForSalidaModalOpen(true)} className="mt-auto font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700">Generar Perfil</button>
                </div>
                
                {/* Alertas Tempranas */}
                <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg flex flex-col items-start hover:shadow-amber-100 dark:hover:shadow-amber-900/20 transition-shadow md:col-span-2">
                    <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-300 mb-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sistema Integrado de Alerta Temprana</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">Identifique estudiantes en riesgo, active protocolos y genere planes de atención con apoyo de IA para un seguimiento efectivo.</p>
                     <button onClick={() => setIsSelectStudentForAlertaModalOpen(true)} className="mt-auto font-semibold text-sm text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700">Iniciar Nuevo Proceso de Alerta</button>
                </div>
            </div>

            {/* Registro de Alertas Aplicadas */}
             <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Registro de Alertas Aplicadas</h3>
                {alertasTempranas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-600 dark:text-slate-200">
                                <tr>
                                    <th className="px-4 py-2">Estudiante</th>
                                    <th className="px-4 py-2">Fecha</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                {alertasTempranas.map(alerta => {
                                    const student = estudiantesMap.get(alerta.estudianteId);
                                    return (
                                        <tr key={alerta.id}>
                                            <td className="px-4 py-2 font-medium">{student ? `${student.nombre} ${student.primerApellido}` : 'Estudiante no encontrado'}</td>
                                            <td className="px-4 py-2">{new Date(alerta.fechaCreacion).toLocaleDateString()}</td>
                                            <td className="px-4 py-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${alerta.estadoAlerta === 'Cerrada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{alerta.estadoAlerta || 'N/A'}</span></td>
                                            <td className="px-4 py-2">
                                                <button onClick={() => handleEditAlerta(alerta)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Ver/Editar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">No hay alertas registradas para este curso lectivo.</p>
                )}
            </div>

            {isSelectStudentForSalidaModalOpen && ( <SeleccionarEstudianteParaPerfilModal isOpen={isSelectStudentForSalidaModalOpen} onClose={() => setIsSelectStudentForSalidaModalOpen(false)} students={activeStudents} onSelect={handleStudentSelectedForSalida} /> )}
            {isSelectStudentForEntradaModalOpen && ( <SeleccionarEstudianteParaPerfilModal isOpen={isSelectStudentForEntradaModalOpen} onClose={() => setIsSelectStudentForEntradaModalOpen(false)} students={activeStudents} onSelect={handleStudentSelectedForEntrada} /> )}
            {isSelectStudentForAlertaModalOpen && ( <SeleccionarEstudianteParaPerfilModal isOpen={isSelectStudentForAlertaModalOpen} onClose={() => setIsSelectStudentForAlertaModalOpen(false)} students={activeStudents} onSelect={handleStudentSelectedForAlerta} /> )}

            {isPerfilSalidaModalOpen && selectedStudentForAI && cursoActivo && ( <PerfilSalidaAIModal isOpen={isPerfilSalidaModalOpen} onClose={() => setIsPerfilSalidaModalOpen(false)} student={selectedStudentForAI.student} results={selectedStudentForAI.results} periodo="Anual" cursoActivo={cursoActivo} subjects={cursoActivo.subjects} /> )}
            {isPerfilEntradaModalOpen && selectedStudentForAI && cursoActivo && ( <PerfilEntradaAIModal isOpen={isPerfilEntradaModalOpen} onClose={() => setIsPerfilEntradaModalOpen(false)} student={selectedStudentForAI.student} cursoActivo={cursoActivo} /> )}
            
            {isAlertaTempranaModalOpen && selectedStudentForAI && cursoActivo && (
                 <AlertasTempranasAIModal
                    isOpen={isAlertaTempranaModalOpen}
                    onClose={() => setIsAlertaTempranaModalOpen(false)}
                    student={selectedStudentForAI.student}
                    cursoActivo={cursoActivo}
                    onSave={onSaveAlertaTemprana}
                    existingAlerta={editingAlerta}
                    fullData={{
                        estudiantes,
                        configuracionesTareas: props.configuracionesTareas,
                        tareas: props.tareas,
                        calificacionesTareas: props.calificacionesTareas,
                        configuracionesCotidiano: props.configuracionesCotidiano,
                        evaluacionesCotidiano: props.evaluacionesCotidiano,
                        indicadores: props.indicadores,
                        calificacionesIndicadores: props.calificacionesIndicadores,
                        configuracionesProyectos: props.configuracionesProyectos,
                        proyectos: props.proyectos,
                        calificacionesProyectos: props.calificacionesProyectos,
                        configuracionesPruebas: props.configuracionesPruebas,
                        pruebas: props.pruebas,
                        calificacionesPruebas: props.calificacionesPruebas,
                        asistenciaRecords: props.asistenciaRecords,
                    }}
                 />
            )}
        </div>
    );
};

export default SeguimientoAcademico;
