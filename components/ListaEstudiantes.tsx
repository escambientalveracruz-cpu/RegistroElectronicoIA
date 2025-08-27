import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Estudiante, CursoLectivo } from '../types';
import { EstadoEstudiante } from '../types';
import AgregarEstudianteModal from './AgregarEstudianteModal';
import EditarEstudianteModal from './EditarEstudianteModal';
import GestionarEstadoModal from './GestionarTrasladoModal';
import ResumenEstudianteAIModal from './ResumenEstudianteAIModal';
import ComunicacionAIModal from './ComunicacionAIModal';


interface ListaEstudiantesProps {
    estudiantes: Estudiante[];
    onAddEstudiante: (estudiante: Omit<Estudiante, 'id' | 'cursoLectivoId' | 'estado' | 'fechaTraslado' | 'escuelaTraslado' | 'observacionesTraslado' | 'fechaDesercion' | 'observacionesDesercion'>) => void;
    onUpdateEstudiante: (estudiante: Estudiante) => void;
    cursoActivo: CursoLectivo | null;
}

const ActionsDropdown: React.FC<{
    estudiante: Estudiante;
    onEdit: (estudiante: Estudiante) => void;
    onManageEstado: (estudiante: Estudiante) => void;
    onComunicacionAI: (estudiante: Estudiante) => void;
}> = ({ estudiante, onEdit, onManageEstado, onComunicacionAI }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 224; // w-56 is 14rem = 224px
            
            let leftPosition = rect.right - menuWidth;
            if (leftPosition < 0) {
                 leftPosition = rect.left;
            }

            setStyle({
                position: 'fixed',
                top: `${rect.bottom + 4}px`,
                left: `${leftPosition}px`,
                zIndex: 50,
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="inline-block text-left" ref={wrapperRef}>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={style}
                >
                    <div className="relative" role="menu" aria-orientation="vertical">
                         <button 
                            onClick={() => setIsOpen(false)} 
                            className="absolute top-1 right-1 p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Cerrar menú"
                        >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="py-1 px-1 mt-6" role="none">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onEdit(estudiante); setIsOpen(false); }}
                                className="block text-left w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                                role="menuitem"
                            >
                                Editar Información
                            </a>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onManageEstado(estudiante); setIsOpen(false); }}
                                className="block text-left w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                                role="menuitem"
                            >
                                Gestionar Estado
                            </a>
                             <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onComunicacionAI(estudiante); setIsOpen(false); }}
                                className="flex items-center text-left w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                                role="menuitem"
                            >
                                Redactar Comunicación
                                <span className="ml-auto text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">IA</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const ListaEstudiantes: React.FC<ListaEstudiantesProps> = ({ estudiantes, onAddEstudiante, onUpdateEstudiante, cursoActivo }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
    const [isResumenAIModalOpen, setIsResumenAIModalOpen] = useState(false);
    const [isComunicacionAIModalOpen, setIsComunicacionAIModalOpen] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
    const [hoveredEstudianteId, setHoveredEstudianteId] = useState<string | null>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const filteredEstudiantes = useMemo(() => {
        return estudiantes
            .filter(est => {
                if (statusFilter === 'Todos') return true;
                return est.estado === statusFilter;
            })
            .filter(est => {
                const searchTermLower = searchTerm.toLowerCase();
                const fullName = `${est.nombre} ${est.primerApellido} ${est.segundoApellido}`.toLowerCase();
                return fullName.includes(searchTermLower) || est.cedula.includes(searchTermLower);
            });
    }, [estudiantes, searchTerm, statusFilter]);


    if (!cursoActivo) {
        return (
             <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    No hay un curso lectivo activo
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-300 max-w-md">
                    Por favor, cree o seleccione un curso lectivo en la barra lateral para poder gestionar los estudiantes.
                </p>
            </div>
        );
    }

    const handleStatusMouseEnter = (event: React.MouseEvent<HTMLDivElement>, estudiante: Estudiante) => {
        if (estudiante.estado !== EstadoEstudiante.Trasladado && estudiante.estado !== EstadoEstudiante.Desertor) return;

        const trigger = event.currentTarget;
        const rect = trigger.getBoundingClientRect();
        const popoverWidth = 288; // w-72 = 18rem = 288px
        
        let left = rect.left;
        if (left + popoverWidth > window.innerWidth) {
            left = rect.right - popoverWidth;
        }

        setPopoverStyle({
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${left}px`,
            zIndex: 150, // High z-index to appear above everything
        });
        setHoveredEstudianteId(estudiante.id);
    };

    const handleStatusMouseLeave = () => {
        setHoveredEstudianteId(null);
    };

    const handleSaveEstudiante = (estudianteData: Omit<Estudiante, 'id' | 'cursoLectivoId' | 'estado' | 'fechaTraslado' | 'escuelaTraslado' | 'observacionesTraslado' | 'fechaDesercion' | 'observacionesDesercion'>) => {
        onAddEstudiante(estudianteData);
        setIsAddModalOpen(false);
    };
    
    const handleUpdateEstudiante = (estudianteData: Estudiante) => {
        onUpdateEstudiante(estudianteData);
        setIsEditModalOpen(false);
        setIsEstadoModalOpen(false);
    };

    const openEditModal = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsEditModalOpen(true);
    };

    const openEstadoModal = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsEstadoModalOpen(true);
    }
    
    const openResumenAIModal = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsResumenAIModalOpen(true);
    };

    const openComunicacionAIModal = (estudiante: Estudiante) => {
        setSelectedEstudiante(estudiante);
        setIsComunicacionAIModalOpen(true);
    };

    const getStatusChip = (est: Estudiante) => {
        switch (est.estado) {
            case EstadoEstudiante.Activo:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 print:border print:border-green-800';
            case EstadoEstudiante.Trasladado:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 cursor-pointer print:border print:border-yellow-800';
            case EstadoEstudiante.Desertor:
                 return 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 cursor-pointer print:border print:border-slate-600';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const hoveredEstudiante = estudiantes.find(e => e.id === hoveredEstudianteId);

    return (
        <>
            <div className="max-w-7xl mx-auto">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Lista de Estudiantes
                        </h1>
                         <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Curso Lectivo: <span className="font-semibold text-indigo-500">{cursoActivo.year}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Estudiante
                    </button>
                </div>
                
                {/* Search, Filter, and Print Controls */}
                <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex flex-col sm:flex-row items-center gap-4 print:hidden">
                    <div className="relative w-full sm:w-auto flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full block pl-10 pr-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                     <div className="w-full sm:w-auto">
                         <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 block px-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            aria-label="Filtrar por estado"
                         >
                            <option value="Todos">Todos los Estados</option>
                            <option value={EstadoEstudiante.Activo}>Activos</option>
                            <option value={EstadoEstudiante.Trasladado}>Trasladados</option>
                            <option value={EstadoEstudiante.Desertor}>Desertores</option>
                         </select>
                    </div>
                     <div className="w-full sm:w-auto">
                        <button
                            onClick={() => window.print()}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir Lista
                        </button>
                    </div>
                </div>

                {/* Print-only Header */}
                <div className="hidden print:block mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black">Reporte de Matrícula</h1>
                    <div className="text-lg">
                        <p><span className="font-semibold">Curso Lectivo:</span> {cursoActivo.year}</p>
                        <p><span className="font-semibold">Docente:</span> {cursoActivo.teacherName}</p>
                        <p><span className="font-semibold">Fecha de Impresión:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {estudiantes.length > 0 ? (
                    filteredEstudiantes.length > 0 ? (
                        <div className="bg-white dark:bg-slate-700 shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-300 print:text-black">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-600 dark:text-slate-200 print:bg-slate-200 print:text-black">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 w-12 print:px-2 print:py-1">#</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Cédula</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Nombre del Estudiante</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Fecha Ingreso</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Estado</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Nombre Encargado</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Teléfono Encargado</th>
                                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1">Dirección</th>
                                            <th scope="col" className="px-6 py-3 text-right print:hidden">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEstudiantes.map((est, index) => (
                                            <tr key={est.id} className="bg-white dark:bg-slate-700 border-b dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50 align-top print:border-slate-300">
                                                <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 print:px-2 print:py-1">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap print:px-2 print:py-1">{est.cedula}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white print:px-2 print:py-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>{`${est.nombre} ${est.primerApellido} ${est.segundoApellido}`}</span>
                                                        <button 
                                                          onClick={() => openResumenAIModal(est)}
                                                          className="print:hidden text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                                          title="Generar resumen con IA"
                                                        >
                                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                          </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap print:px-2 print:py-1">{est.fechaIngreso}</td>
                                                <td className="px-6 py-4 print:px-2 print:py-1">
                                                    <div
                                                        className="inline-flex items-center group"
                                                        onMouseEnter={(e) => handleStatusMouseEnter(e, est)}
                                                        onMouseLeave={handleStatusMouseLeave}
                                                    >
                                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChip(est)}`}>
                                                            {est.estado}
                                                        </span>
                                                        <div className="print:hidden">
                                                            {(est.estado === EstadoEstudiante.Trasladado || est.estado === EstadoEstudiante.Desertor) && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1.5 ${est.estado === EstadoEstudiante.Trasladado ? 'text-yellow-700 dark:text-yellow-300' : 'text-slate-600 dark:text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 print:px-2 print:py-1">{est.nombreEncargado}</td>
                                                <td className="px-6 py-4 whitespace-nowrap print:px-2 print:py-1">{est.telefono}</td>
                                                <td className="px-6 py-4 min-w-[200px] print:px-2 print:py-1 print:min-w-[150px]">{est.direccion}</td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap print:hidden">
                                                    <ActionsDropdown 
                                                        estudiante={est}
                                                        onEdit={openEditModal}
                                                        onManageEstado={openEstadoModal}
                                                        onComunicacionAI={openComunicacionAIModal}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg print:hidden">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No se encontraron estudiantes</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pruebe ajustando la búsqueda o el filtro de estado.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg print:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No hay estudiantes matriculados</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comience agregando el primer estudiante a este curso lectivo.</p>
                    </div>
                )}
            </div>

            {hoveredEstudiante && (
                <div
                    style={popoverStyle}
                    className="w-72 p-4 text-sm font-normal text-slate-600 bg-white border border-slate-200 rounded-lg shadow-xl dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 print:hidden"
                >
                    <div className="absolute w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45 -top-1.5 left-4 border-l border-t border-slate-200 dark:border-slate-600"></div>
                    
                    {hoveredEstudiante.estado === EstadoEstudiante.Trasladado && (
                        <>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-600 pb-2">
                                Detalles del Traslado
                            </h3>
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">Fecha:</dt>
                                    <dd>{hoveredEstudiante.fechaTraslado || 'No especificada'}</dd>
                                </div>
                                <div className="flex justify-between items-start">
                                    <dt className="font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 mr-2">Escuela:</dt>
                                    <dd className="text-right">{hoveredEstudiante.escuelaTraslado || 'No especificada'}</dd>
                                </div>
                                {hoveredEstudiante.observacionesTraslado && (
                                    <div>
                                        <dt className="font-medium text-slate-500 dark:text-slate-400 mb-1">Observaciones:</dt>
                                        <dd className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded break-words">{hoveredEstudiante.observacionesTraslado}</dd>
                                    </div>
                                )}
                            </dl>
                        </>
                    )}

                    {hoveredEstudiante.estado === EstadoEstudiante.Desertor && (
                         <>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-600 pb-2">
                                Detalles de la Deserción
                            </h3>
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">Fecha:</dt>
                                    <dd>{hoveredEstudiante.fechaDesercion || 'No especificada'}</dd>
                                </div>
                                {hoveredEstudiante.observacionesDesercion && (
                                    <div>
                                        <dt className="font-medium text-slate-500 dark:text-slate-400 mb-1">Observaciones:</dt>
                                        <dd className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded break-words">{hoveredEstudiante.observacionesDesercion}</dd>
                                    </div>
                                )}
                            </dl>
                        </>
                    )}

                </div>
            )}

            <AgregarEstudianteModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveEstudiante}
            />

            {selectedEstudiante && (
                <EditarEstudianteModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateEstudiante}
                    estudiante={selectedEstudiante}
                />
            )}

            {selectedEstudiante && (
                <GestionarEstadoModal
                    isOpen={isEstadoModalOpen}
                    onClose={() => setIsEstadoModalOpen(false)}
                    onSave={handleUpdateEstudiante}
                    estudiante={selectedEstudiante}
                />
            )}
            
            {selectedEstudiante && (
                <ResumenEstudianteAIModal
                    isOpen={isResumenAIModalOpen}
                    onClose={() => setIsResumenAIModalOpen(false)}
                    estudiante={selectedEstudiante}
                />
            )}

            {selectedEstudiante && (
                <ComunicacionAIModal
                    isOpen={isComunicacionAIModalOpen}
                    onClose={() => setIsComunicacionAIModalOpen(false)}
                    estudiante={selectedEstudiante}
                />
            )}
        </>
    );
};

export default ListaEstudiantes;