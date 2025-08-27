import React, { useState, useMemo, useEffect } from 'react';
import type { CursoLectivo, Estudiante, AsistenciaRecord } from '../types';
import { AsistenciaStatus, EstadoEstudiante } from '../types';

interface AsistenciaProps {
    cursoActivo: CursoLectivo | null;
    estudiantes: Estudiante[];
    asistenciaRecords: AsistenciaRecord[];
    onSaveAsistencia: (estudianteId: string, date: string, subject: string, periodoNombre: string, status: AsistenciaStatus | null) => void;
}

// Order of statuses for cycling through them on click
const STATUS_CYCLE = [
    null, // Presente
    AsistenciaStatus.Justificada,
    AsistenciaStatus.Injustificada,
    AsistenciaStatus.TardiaJustificada,
    AsistenciaStatus.TardiaInjustificada,
];

// Visual representation for each status
const STATUS_VISUALS: { [key in AsistenciaStatus | 'P']: { label: string; color: string; tooltip: string } } = {
    'P': { label: 'P', color: 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200', tooltip: 'Presente' },
    [AsistenciaStatus.Justificada]: { label: 'J', color: 'bg-green-500 text-white', tooltip: 'Ausencia Justificada' },
    [AsistenciaStatus.Injustificada]: { label: 'I', color: 'bg-red-500 text-white', tooltip: 'Ausencia Injustificada' },
    [AsistenciaStatus.TardiaJustificada]: { label: 'TJ', color: 'bg-yellow-500 text-black', tooltip: 'Tardía Justificada' },
    [AsistenciaStatus.TardiaInjustificada]: { label: 'TI', color: 'bg-orange-500 text-white', tooltip: 'Tardía Injustificada' },
};


const Asistencia: React.FC<AsistenciaProps> = ({ cursoActivo, estudiantes, asistenciaRecords, onSaveAsistencia }) => {
    const [selectedPeriodoName, setSelectedPeriodoName] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (cursoActivo?.periods?.[0]?.nombre) {
            setSelectedPeriodoName(cursoActivo.periods[0].nombre);
        }
    }, [cursoActivo]);

    const activeStudents = useMemo(() => {
        return estudiantes.filter(e => e.estado === EstadoEstudiante.Activo);
    }, [estudiantes]);

    const schoolDaysInMonth = useMemo(() => {
        const days = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                days.push(new Date(date));
            }
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);
    
    const recordsByStudentAndDate = useMemo(() => {
        const map = new Map<string, AsistenciaStatus>();
        asistenciaRecords
            .filter(r => r.subject === selectedSubject && r.periodoNombre === selectedPeriodoName)
            .forEach(r => {
                const key = `${r.estudianteId}-${r.date}`;
                map.set(key, r.status);
            });
        return map;
    }, [asistenciaRecords, selectedSubject, selectedPeriodoName]);
    
    const handleCycleStatus = (studentId: string, date: Date) => {
        if (!selectedSubject || !selectedPeriodoName) return;
        
        const dateString = date.toISOString().split('T')[0];
        const key = `${studentId}-${dateString}`;
        const currentStatus = recordsByStudentAndDate.get(key) ?? null;
        
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

        onSaveAsistencia(studentId, dateString, selectedSubject, selectedPeriodoName, nextStatus);
    };

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoid issues with month lengths
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    if (!cursoActivo) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No hay un curso lectivo activo</h3>
                <p className="text-lg text-slate-500 dark:text-slate-300 max-w-md">Por favor, cree o seleccione un curso lectivo para poder gestionar la asistencia.</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div className="p-6 bg-white dark:bg-slate-700 rounded-xl shadow-lg">
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-4 mb-4">Registro de Asistencia Mensual</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="periodo-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Periodo</label>
                        <select id="periodo-select" value={selectedPeriodoName} onChange={e => setSelectedPeriodoName(e.target.value)} className="w-full form-input">
                            {cursoActivo.periods.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subject-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Materia</label>
                        <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedPeriodoName} className="w-full form-input">
                             <option value="">-- Seleccione Materia --</option>
                            {cursoActivo.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                 {selectedSubject && (
                    <div className="flex items-center justify-between mt-6 p-3 bg-slate-100 dark:bg-slate-600/50 rounded-lg">
                        <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 className="text-xl font-bold text-indigo-500 dark:text-indigo-400">
                            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                        </h2>
                        <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                 )}
            </div>

            {selectedPeriodoName && selectedSubject && (
                 <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center border-collapse">
                             <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-600 dark:text-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left min-w-[200px] sticky left-0 bg-slate-100 dark:bg-slate-600">Estudiante</th>
                                    {schoolDaysInMonth.map(day => (
                                        <th key={day.toISOString()} className="px-2 py-3 w-12 font-mono">
                                            {day.getDate()}
                                        </th>
                                    ))}
                                    <th className="px-2 py-3 w-12 font-bold" title="Justificadas">J</th>
                                    <th className="px-2 py-3 w-12 font-bold" title="Injustificadas">I</th>
                                    <th className="px-2 py-3 w-12 font-bold" title="Tardías Justificadas">TJ</th>
                                    <th className="px-2 py-3 w-12 font-bold" title="Tardías Injustificadas">TI</th>
                                    <th className="px-2 py-3 w-16 font-bold" title="Total">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeStudents.map(student => {
                                    const summary = { J: 0, I: 0, TJ: 0, TI: 0 };
                                    schoolDaysInMonth.forEach(day => {
                                        const dateString = day.toISOString().split('T')[0];
                                        const key = `${student.id}-${dateString}`;
                                        const status = recordsByStudentAndDate.get(key);
                                        if (status) {
                                            summary[status]++;
                                        }
                                    });
                                    const total = summary.J + summary.I + summary.TJ + summary.TI;

                                    return (
                                    <tr key={student.id} className="border-b dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-white text-left sticky left-0 bg-white dark:bg-slate-700 z-0">{`${student.nombre} ${student.primerApellido}`}</td>
                                        {schoolDaysInMonth.map(day => {
                                            const dateString = day.toISOString().split('T')[0];
                                            const key = `${student.id}-${dateString}`;
                                            const status = recordsByStudentAndDate.get(key);
                                            const visual = status ? STATUS_VISUALS[status] : STATUS_VISUALS['P'];
                                            
                                            return (
                                                <td key={dateString} className="px-2 py-2">
                                                    <button
                                                        onClick={() => handleCycleStatus(student.id, day)}
                                                        title={visual.tooltip}
                                                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-700 ${visual.color}`}
                                                    >
                                                        {visual.label}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-2 font-medium">{summary.J || '0'}</td>
                                        <td className="px-2 py-2 font-medium">{summary.I || '0'}</td>
                                        <td className="px-2 py-2 font-medium">{summary.TJ || '0'}</td>
                                        <td className="px-2 py-2 font-medium">{summary.TI || '0'}</td>
                                        <td className="px-2 py-2 font-bold text-indigo-500">{total}</td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             <style>{`
                .form-input {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    border-radius: 0.375rem;
                    background-color: rgb(241 245 249 / 1); /* slate-100 */
                    border: 1px solid rgb(203 213 225 / 1); /* slate-300 */
                }
                .dark .form-input {
                    background-color: rgb(71 85 105 / 1); /* slate-600 */
                    border-color: rgb(100 116 139 / 1); /* slate-500 */
                }
                .form-input:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    border-color: rgb(99 102 241 / 1); /* indigo-500 */
                    box-shadow: 0 0 0 1px rgb(99 102 241 / 1);
                }
                tbody tr:hover .sticky {
                    background-color: rgb(248 250 252 / 1); /* hover:bg-slate-50 */
                }
                .dark tbody tr:hover .sticky {
                    background-color: rgba(71, 85, 105, 0.5); /* dark:hover:bg-slate-600/50 */
                }
            `}</style>
        </div>
    );
};

export default Asistencia;
