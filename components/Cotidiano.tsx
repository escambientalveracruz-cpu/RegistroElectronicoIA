import React, { useState, useMemo } from 'react';
import type { CursoLectivo, Estudiante, ConfiguracionCotidiano, Indicador, EvaluacionCotidiano, CalificacionIndicador } from '../types';
import { EstadoEstudiante, NivelRubrica } from '../types';
import GestionarIndicadoresModal from './GestionarIndicadoresModal';
import SeleccionarIndicadoresModal from './SeleccionarIndicadoresModal';

interface CotidianoProps {
    cursoActivo: CursoLectivo | null;
    estudiantes: Estudiante[];
    configuraciones: ConfiguracionCotidiano[];
    onSaveConfiguracion: (config: ConfiguracionCotidiano) => void;
    indicadores: Indicador[];
    onSaveIndicador: (indicador: Indicador) => void;
    onDeleteIndicador: (indicadorId: string) => void;
    onSaveIndicadoresBatch: (indicadores: Omit<Indicador, 'id'>[]) => void;
    evaluaciones: EvaluacionCotidiano[];
    onSaveEvaluacion: (evaluacion: EvaluacionCotidiano) => void;
    calificaciones: CalificacionIndicador[];
    onSaveCalificacion: (calificacion: CalificacionIndicador) => void;
}

const NIVEL_CYCLE = [null, NivelRubrica.Avanzado, NivelRubrica.Logrado, NivelRubrica.EnProceso, NivelRubrica.Iniciado];
const NIVEL_VALUES: { [key in NivelRubrica]: number } = {
    [NivelRubrica.Avanzado]: 1.0,
    [NivelRubrica.Logrado]: 0.85,
    [NivelRubrica.EnProceso]: 0.70,
    [NivelRubrica.Iniciado]: 0.50,
};
const NIVEL_VISUALS: { [key in NivelRubrica | 'null']: { label: string; color: string; tooltip: string } } = {
    'null': { label: 'N/O', color: 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200', tooltip: 'No Observado' },
    [NivelRubrica.Avanzado]: { label: '4', color: 'bg-blue-500 text-white', tooltip: 'Nivel 4: Avanzado (100%)' },
    [NivelRubrica.Logrado]: { label: '3', color: 'bg-green-500 text-white', tooltip: 'Nivel 3: Logrado (85%)' },
    [NivelRubrica.EnProceso]: { label: '2', color: 'bg-yellow-500 text-black', tooltip: 'Nivel 2: En Proceso (70%)' },
    [NivelRubrica.Iniciado]: { label: '1', color: 'bg-orange-500 text-white', tooltip: 'Nivel 1: Iniciado (50%)' },
};

const Cotidiano: React.FC<CotidianoProps> = (props) => {
    const { cursoActivo, estudiantes, configuraciones, onSaveConfiguracion, indicadores, onSaveIndicador, onDeleteIndicador, onSaveIndicadoresBatch, evaluaciones, onSaveEvaluacion, calificaciones, onSaveCalificacion } = props;

    const [selectedPeriodoName, setSelectedPeriodoName] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [isGestionarModalOpen, setIsGestionarModalOpen] = useState(false);
    const [isSeleccionarModalOpen, setIsSeleccionarModalOpen] = useState(false);

    const activeStudents = useMemo(() => estudiantes.filter(e => e.estado === EstadoEstudiante.Activo), [estudiantes]);
    const idContexto = cursoActivo ? `${cursoActivo.id}-${selectedPeriodoName}-${selectedSubject}` : '';

    const activeConfig = useMemo(() => configuraciones.find(c => c.id === idContexto), [configuraciones, idContexto]);
    const activeEvaluacion = useMemo(() => evaluaciones.find(e => e.id === idContexto), [evaluaciones, idContexto]);
    const indicadoresDelCurso = useMemo(() => indicadores.filter(i => i.cursoLectivoId === cursoActivo?.id && i.subject === selectedSubject), [indicadores, cursoActivo, selectedSubject]);
    
    const indicadoresSeleccionados = useMemo(() => {
        const selectedIds = new Set(activeEvaluacion?.indicadorIds || []);
        return indicadoresDelCurso.filter(i => selectedIds.has(i.id));
    }, [indicadoresDelCurso, activeEvaluacion]);

    const calificacionesMap = useMemo(() => {
        const map = new Map<string, CalificacionIndicador>();
        calificaciones.filter(c => c.periodoNombre === selectedPeriodoName && c.subject === selectedSubject).forEach(c => map.set(`${c.estudianteId}-${c.indicadorId}`, c));
        return map;
    }, [calificaciones, selectedPeriodoName, selectedSubject]);

    const handlePorcentajeChange = (value: number) => {
        if (!cursoActivo || !selectedPeriodoName || !selectedSubject || isNaN(value)) return;
        const newConfig: ConfiguracionCotidiano = {
            id: idContexto,
            cursoLectivoId: cursoActivo.id,
            periodoNombre: selectedPeriodoName,
            subject: selectedSubject,
            porcentajeGeneral: Math.max(0, Math.min(100, value)),
        };
        onSaveConfiguracion(newConfig);
    };

    const handleCycleNivel = (estudianteId: string, indicadorId: string) => {
        if (!cursoActivo) return;
        const currentNivel = calificacionesMap.get(`${estudianteId}-${indicadorId}`)?.nivel ?? null;
        const currentIndex = NIVEL_CYCLE.indexOf(currentNivel);
        const nextNivel = NIVEL_CYCLE[(currentIndex + 1) % NIVEL_CYCLE.length];
        onSaveCalificacion({
            id: `${estudianteId}-${indicadorId}-${selectedPeriodoName}-${selectedSubject}`,
            estudianteId,
            indicadorId,
            cursoLectivoId: cursoActivo.id,
            periodoNombre: selectedPeriodoName,
            subject: selectedSubject,
            nivel: nextNivel,
        });
    };

    if (!cursoActivo) return <div className="text-center p-8">Por favor, cree o seleccione un curso lectivo.</div>;

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-4 mb-4">Trabajo Cotidiano</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select onChange={e => setSelectedPeriodoName(e.target.value)} className="w-full form-input" value={selectedPeriodoName}><option value="">-- Seleccione Periodo --</option>{cursoActivo.periods.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}</select>
                    <select onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedPeriodoName} className="w-full form-input" value={selectedSubject}><option value="">-- Seleccione Materia --</option>{cursoActivo.subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
            </div>

            {selectedPeriodoName && selectedSubject && (
            <>
                <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <label htmlFor="porcentajeGeneral" className="text-lg font-bold text-slate-900 dark:text-white">Porcentaje General</label>
                        <div className="flex items-center gap-2"><input id="porcentajeGeneral" type="number" value={activeConfig?.porcentajeGeneral || 0} onChange={e => handlePorcentajeChange(parseFloat(e.target.value))} className="w-24 text-center text-2xl font-bold form-input" /><span className="text-2xl font-bold text-slate-500 dark:text-slate-400">%</span></div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                        <button onClick={() => setIsGestionarModalOpen(true)} className="btn-secondary">Gestionar Banco de Indicadores</button>
                        <button onClick={() => setIsSeleccionarModalOpen(true)} className="btn-primary">Seleccionar Indicadores a Evaluar</button>
                    </div>
                </div>

                {indicadoresSeleccionados.length > 0 ? (
                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center border-collapse">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-600 dark:text-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left min-w-[200px] sticky left-0 z-10 bg-slate-100 dark:bg-slate-600">Estudiante</th>
                                        {indicadoresSeleccionados.map(ind => <th key={ind.id} className="px-2 py-3 min-w-[150px] max-w-[250px] truncate" title={ind.descripcion}>{ind.descripcion}</th>)}
                                        <th className="px-4 py-3 border-l dark:border-slate-500 font-bold w-28">% Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStudents.map(student => {
                                        const totalValor = indicadoresSeleccionados.reduce((sum, ind) => {
                                            const nivel = calificacionesMap.get(`${student.id}-${ind.id}`)?.nivel;
                                            return sum + (nivel ? NIVEL_VALUES[nivel] : 0);
                                        }, 0);
                                        const indicadoresEvaluados = indicadoresSeleccionados.reduce((count, ind) => {
                                            const nivel = calificacionesMap.get(`${student.id}-${ind.id}`)?.nivel;
                                            return nivel ? count + 1 : count;
                                        }, 0);
                                        const nota = indicadoresEvaluados > 0 ? (totalValor / indicadoresEvaluados) * 100 : 0;
                                        const porcentaje = (nota / 100) * (activeConfig?.porcentajeGeneral || 0);

                                        return (
                                            <tr key={student.id} className="border-b dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                                <td className="px-4 py-2 font-medium text-slate-900 dark:text-white text-left sticky left-0 z-0 bg-white dark:bg-slate-700">{`${student.nombre} ${student.primerApellido}`}</td>
                                                {indicadoresSeleccionados.map(ind => {
                                                    const nivel = calificacionesMap.get(`${student.id}-${ind.id}`)?.nivel ?? null;
                                                    const visual = NIVEL_VISUALS[nivel || 'null'];
                                                    return (<td key={ind.id} className="px-2 py-2"><button onClick={() => handleCycleNivel(student.id, ind.id)} title={visual.tooltip} className={`w-10 h-8 rounded-md font-bold text-xs flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 mx-auto ${visual.color}`}>{visual.label}</button></td>)
                                                })}
                                                <td className="px-4 py-2 border-l dark:border-slate-500 font-bold text-xl text-green-600 dark:text-green-400">{porcentaje.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white dark:bg-slate-700 rounded-xl shadow-lg"><p className="text-slate-500 dark:text-slate-400">No hay indicadores seleccionados para evaluar. Por favor, selecciónelos usando el botón de arriba.</p></div>
                )}
            </>
            )}

            <GestionarIndicadoresModal isOpen={isGestionarModalOpen} onClose={() => setIsGestionarModalOpen(false)} cursoActivo={cursoActivo} subject={selectedSubject} indicadoresExistentes={indicadoresDelCurso} onSave={onSaveIndicador} onDelete={onDeleteIndicador} onSaveBatch={onSaveIndicadoresBatch} />
            <SeleccionarIndicadoresModal isOpen={isSeleccionarModalOpen} onClose={() => setIsSeleccionarModalOpen(false)} cursoActivo={cursoActivo} subject={selectedSubject} periodo={selectedPeriodoName} todosIndicadores={indicadoresDelCurso} evaluacionActiva={activeEvaluacion} onSave={onSaveEvaluacion} />

            <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;border-radius:0.375rem;background-color:rgb(241 245 249/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(71 85 105/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}.btn-primary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(99 102 241);color:white;transition:background-color 0.2s}.btn-primary:hover{background-color:rgb(79 70 229)}.btn-secondary{padding:0.5rem 1rem;font-weight:600;border-radius:0.375rem;background-color:rgb(226 232 240);color:rgb(51 65 85);transition:background-color 0.2s}.dark .btn-secondary{background-color:rgb(71 85 105);color:rgb(226 232 240)}.btn-secondary:hover{background-color:rgb(203 213 225)}.dark .btn-secondary:hover{background-color:rgb(100 116 139)}`}</style>
        </div>
    );
};

export default Cotidiano;