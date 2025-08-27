import React, { useState, useMemo } from 'react';
import type { CursoLectivo, Estudiante, ConfiguracionPorcentaje, Tarea, CalificacionTarea } from '../types';
import { EstadoEstudiante } from '../types';
import TareaModal from './TareaModal';
import ComentarioAIModal from './ComentarioAIModal';

interface TareasProps {
    cursoActivo: CursoLectivo | null;
    estudiantes: Estudiante[];
    configuraciones: ConfiguracionPorcentaje[];
    onSaveConfiguracion: (config: ConfiguracionPorcentaje) => void;
    tareas: Tarea[];
    calificaciones: CalificacionTarea[];
    onSaveTarea: (tarea: Tarea) => void;
    onDeleteTarea: (tareaId: string) => void;
    onSaveCalificacion: (calificacion: CalificacionTarea) => void;
}

const Tareas: React.FC<TareasProps> = ({ cursoActivo, estudiantes, configuraciones, onSaveConfiguracion, tareas, calificaciones, onSaveTarea, onDeleteTarea, onSaveCalificacion }) => {
    const [selectedPeriodoName, setSelectedPeriodoName] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [isTareaModalOpen, setIsTareaModalOpen] = useState(false);
    const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
    
    // State for AI Comment Modal
    const [isComentarioAIModalOpen, setIsComentarioAIModalOpen] = useState(false);
    const [selectedCalificacionData, setSelectedCalificacionData] = useState<{ estudiante: Estudiante; tarea: Tarea; calificacion: CalificacionTarea } | null>(null);


    const activeStudents = useMemo(() => estudiantes.filter(e => e.estado === EstadoEstudiante.Activo), [estudiantes]);

    const activeConfig = useMemo(() => {
        if (!cursoActivo || !selectedPeriodoName || !selectedSubject) return null;
        return configuraciones.find(c => c.cursoLectivoId === cursoActivo.id && c.periodoNombre === selectedPeriodoName && c.subject === selectedSubject);
    }, [configuraciones, cursoActivo, selectedPeriodoName, selectedSubject]);

    const activeTareas = useMemo(() => {
        if (!cursoActivo || !selectedPeriodoName || !selectedSubject) return [];
        return tareas.filter(t => t.cursoLectivoId === cursoActivo.id && t.periodoNombre === selectedPeriodoName && t.subject === selectedSubject);
    }, [tareas, cursoActivo, selectedPeriodoName, selectedSubject]);
    
    const porcentajeAsignado = useMemo(() => activeTareas.reduce((sum, t) => sum + t.porcentaje, 0), [activeTareas]);
    
    const calificacionesMap = useMemo(() => {
        const map = new Map<string, CalificacionTarea>();
        calificaciones.forEach(c => map.set(c.id, c));
        return map;
    }, [calificaciones]);

    const handlePorcentajeGeneralChange = (value: number) => {
        if (!cursoActivo || !selectedPeriodoName || !selectedSubject || isNaN(value)) return;
        const newConfig: ConfiguracionPorcentaje = {
            id: `${cursoActivo.id}-${selectedPeriodoName}-${selectedSubject}`,
            cursoLectivoId: cursoActivo.id,
            periodoNombre: selectedPeriodoName,
            subject: selectedSubject,
            porcentajeGeneral: Math.max(0, Math.min(100, value)),
        };
        onSaveConfiguracion(newConfig);
    };

    const handleOpenTareaModal = (tarea: Tarea | null) => {
        setEditingTarea(tarea);
        setIsTareaModalOpen(true);
    };
    
    const handleOpenComentarioAIModal = (estudiante: Estudiante, tarea: Tarea, calificacion: CalificacionTarea) => {
        setSelectedCalificacionData({ estudiante, tarea, calificacion });
        setIsComentarioAIModalOpen(true);
    };

    const handleSaveTarea = (tareaData: Omit<Tarea, 'id' | 'cursoLectivoId' | 'periodoNombre' | 'subject'>) => {
        if (!cursoActivo || !selectedPeriodoName || !selectedSubject) return;
        const newTarea: Tarea = {
            id: editingTarea?.id || `tarea_${Date.now()}`,
            cursoLectivoId: cursoActivo.id,
            periodoNombre: selectedPeriodoName,
            subject: selectedSubject,
            ...tareaData
        };
        onSaveTarea(newTarea);
        setIsTareaModalOpen(false);
        setEditingTarea(null);
    };

    const handleCalificacionChange = (estudianteId: string, tarea: Tarea, puntos: string) => {
        const puntosNum = puntos === '' ? null : parseFloat(puntos);
        if (puntosNum !== null && (isNaN(puntosNum) || puntosNum < 0 || puntosNum > tarea.puntosTotales)) {
            return;
        }

        const newCalificacion: CalificacionTarea = {
            id: `${tarea.id}-${estudianteId}`,
            tareaId: tarea.id,
            estudianteId,
            puntosObtenidos: puntosNum,
            noEntregado: false,
        };
        onSaveCalificacion(newCalificacion);
    };

    const handleSetNoEntregado = (estudianteId: string, tarea: Tarea) => {
        const calificacionId = `${tarea.id}-${estudianteId}`;
        const currentCalificacion = calificacionesMap.get(calificacionId);
        const isCurrentlyNoEntregado = currentCalificacion?.noEntregado ?? false;

        const newCalificacion: CalificacionTarea = {
            id: calificacionId,
            tareaId: tarea.id,
            estudianteId,
            puntosObtenidos: !isCurrentlyNoEntregado ? 0 : null,
            noEntregado: !isCurrentlyNoEntregado,
        };
        onSaveCalificacion(newCalificacion);
    };
    
    if (!cursoActivo) {
        return <div className="text-center p-8">Por favor, cree o seleccione un curso lectivo.</div>;
    }

    return (
        <div className="max-w-full mx-auto space-y-6">
            {/* --- Selectors --- */}
            <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-4 mb-4">Calificación de Tareas</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select onChange={e => setSelectedPeriodoName(e.target.value)} className="w-full form-input" value={selectedPeriodoName}>
                        <option value="">-- Seleccione Periodo --</option>
                        {cursoActivo.periods.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
                    </select>
                    <select onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedPeriodoName} className="w-full form-input" value={selectedSubject}>
                        <option value="">-- Seleccione Materia --</option>
                        {cursoActivo.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {selectedPeriodoName && selectedSubject && (
            <>
                {/* --- Configuration Panel --- */}
                <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <label htmlFor="porcentajeGeneral" className="text-lg font-bold text-slate-900 dark:text-white">Porcentaje General de Tareas</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Valor total de todas las tareas para esta materia y periodo.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <input
                                id="porcentajeGeneral"
                                type="number"
                                value={activeConfig?.porcentajeGeneral || 0}
                                onChange={e => handlePorcentajeGeneralChange(parseFloat(e.target.value))}
                                className="w-24 text-center text-2xl font-bold form-input"
                            />
                            <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">%</span>
                        </div>
                    </div>
                    <div className="text-sm text-right">
                        <span className="font-semibold">{porcentajeAsignado.toFixed(2)}%</span> de <span className="font-semibold">{activeConfig?.porcentajeGeneral || 0}%</span> asignado.
                    </div>
                </div>

                {/* --- Grading Table --- */}
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center border-collapse">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-600 dark:text-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left min-w-[200px] sticky left-0 z-10 bg-slate-100 dark:bg-slate-600">Estudiante</th>
                                    {activeTareas.map(tarea => (
                                        <React.Fragment key={tarea.id}>
                                            <th className="px-2 py-3 border-l dark:border-slate-500 min-w-[170px]">
                                                <div className="flex flex-col items-center">
                                                    <span>{tarea.nombre}</span>
                                                    <span className="font-normal text-slate-500 dark:text-slate-400">({tarea.puntosTotales} pts)</span>
                                                </div>
                                            </th>
                                            <th className="px-2 py-3 border-r dark:border-slate-500 w-24">% Obtenido</th>
                                        </React.Fragment>
                                    ))}
                                    <th className="px-4 py-3 border-l dark:border-slate-500 font-bold text-base w-28">% Final</th>
                                    <th className="px-4 py-3 border-l dark:border-slate-500 min-w-[150px]">
                                        <button onClick={() => handleOpenTareaModal(null)} className="px-3 py-1 text-xs bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Añadir Tarea</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeStudents.map(student => {
                                    let porcentajeTotalAcumulado = 0;
                                    return (
                                        <tr key={student.id} className="border-b dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white text-left sticky left-0 z-0 bg-white dark:bg-slate-700">{`${student.nombre} ${student.primerApellido}`}</td>
                                            {activeTareas.map(tarea => {
                                                const calificacion = calificacionesMap.get(`${tarea.id}-${student.id}`);
                                                const puntosObtenidos = calificacion?.puntosObtenidos;
                                                const noEntregado = calificacion?.noEntregado;
                                                const porcentajeObtenido = (puntosObtenidos !== null && puntosObtenidos !== undefined && tarea.puntosTotales > 0)
                                                    ? (puntosObtenidos / tarea.puntosTotales) * tarea.porcentaje
                                                    : 0;
                                                porcentajeTotalAcumulado += porcentajeObtenido;

                                                return (
                                                    <React.Fragment key={tarea.id}>
                                                        <td className="px-2 py-2 border-l dark:border-slate-500">
                                                             <div className="flex items-center justify-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={noEntregado ? '' : (puntosObtenidos ?? '')}
                                                                    onChange={(e) => handleCalificacionChange(student.id, tarea, e.target.value)}
                                                                    placeholder={noEntregado ? "N/E" : "-"}
                                                                    className={`w-16 text-center form-input-table ${noEntregado ? 'bg-slate-200 dark:bg-slate-600 cursor-not-allowed text-slate-500' : ''}`}
                                                                    max={tarea.puntosTotales}
                                                                    min={0}
                                                                    disabled={noEntregado}
                                                                />
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <button
                                                                        onClick={() => handleSetNoEntregado(student.id, tarea)}
                                                                        title={noEntregado ? "Quitar marca 'No Entregado'" : "Marcar como No Entregado"}
                                                                        className={`w-full px-1.5 py-0.5 text-xs font-semibold rounded ${noEntregado ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-500 hover:bg-slate-300'}`}
                                                                    >
                                                                        N/E
                                                                    </button>
                                                                    {calificacion && puntosObtenidos !== null && puntosObtenidos !== undefined && !noEntregado && (
                                                                        <button
                                                                            onClick={() => handleOpenComentarioAIModal(student, tarea, calificacion)}
                                                                            title="Generar comentario con IA"
                                                                            className="w-full p-0.5 rounded text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-2 border-r dark:border-slate-500 font-bold text-lg text-indigo-500 dark:text-indigo-400">
                                                            {noEntregado ? '0.00' : (puntosObtenidos !== null && puntosObtenidos !== undefined ? porcentajeObtenido.toFixed(2) : '-')}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <td className="px-4 py-2 border-l dark:border-slate-500 font-bold text-xl text-green-600 dark:text-green-400">
                                                {porcentajeTotalAcumulado.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 border-l dark:border-slate-500">&nbsp;</td>
                                        </tr>
                                    );
                                })}
                                {/* Row for managing tasks */}
                                 <tr className="bg-slate-50 dark:bg-slate-600/50">
                                    <td className="px-4 py-2 font-semibold text-left sticky left-0 z-0 bg-slate-50 dark:bg-slate-600/50">Acciones</td>
                                    {activeTareas.map(tarea => (
                                        <td key={tarea.id} colSpan={2} className="px-2 py-2 border-x dark:border-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleOpenTareaModal(tarea)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500" title="Editar Tarea"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                <button onClick={() => onDeleteTarea(tarea.id)} className="p-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-800 text-red-500" title="Eliminar Tarea"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                            </div>
                                        </td>
                                    ))}
                                    <td colSpan={2}></td>
                                 </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            )}

             {isTareaModalOpen && (
                <TareaModal
                    isOpen={isTareaModalOpen}
                    onClose={() => setIsTareaModalOpen(false)}
                    onSave={handleSaveTarea}
                    tareaExistente={editingTarea}
                    porcentajeTotal={activeConfig?.porcentajeGeneral || 0}
                    porcentajeYaAsignado={porcentajeAsignado}
                />
             )}
             
             {isComentarioAIModalOpen && selectedCalificacionData && (
                <ComentarioAIModal
                    isOpen={isComentarioAIModalOpen}
                    onClose={() => setIsComentarioAIModalOpen(false)}
                    estudiante={selectedCalificacionData.estudiante}
                    tarea={selectedCalificacionData.tarea}
                    calificacion={selectedCalificacionData.calificacion}
                />
             )}

             <style>{`
                .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background-color: rgb(241 245 249 / 1); border: 1px solid rgb(203 213 225 / 1); }
                .dark .form-input { background-color: rgb(71 85 105 / 1); border-color: rgb(100 116 139 / 1); }
                .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: rgb(99 102 241 / 1); box-shadow: 0 0 0 1px rgb(99 102 241 / 1); }
                .form-input-table { padding: 0.25rem; font-size: 0.875rem; border-radius: 0.25rem; background-color: rgb(241 245 249 / 0.5); border: 1px solid rgb(203 213 225 / 0.7); }
                .dark .form-input-table { background-color: rgb(71 85 105 / 0.5); border-color: rgb(100 116 139 / 0.7); }
                .form-input-table:focus { border-color: rgb(99 102 241 / 1); box-shadow: 0 0 0 1px rgb(99 102 241 / 1); }
             `}</style>
        </div>
    );
};

export default Tareas;