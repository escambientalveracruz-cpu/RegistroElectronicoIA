import type { ReactElement } from 'react';

export interface User {
  uid: string;
  email: string;
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum SectionId {
  Inicio = 'inicio',
  ListaEstudiantes = 'lista_estudiantes',
  Asistencia = 'asistencia',
  Tarea = 'tarea',
  Cotidiano = 'cotidiano',
  Pruebas = 'pruebas',
  Proyectos = 'proyectos',
  SeguimientoAcademico = 'seguimiento_academico',
  Resumen = 'resumen',
  Configuracion = 'configuracion',
}

export interface NavItem {
  id: SectionId;
  name: string;
  icon: ReactElement<{ className?: string }>;
}

export interface Periodo {
  nombre: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;   // YYYY-MM-DD
}

export interface CursoLectivo {
  id: string;
  year: number;
  teacherName: string;
  periods: Periodo[];
  subjects: string[];
  groups: string[];
}

export enum EstadoEstudiante {
    Activo = 'Activo',
    Trasladado = 'Trasladado',
    Desertor = 'Desertor',
}

export interface Estudiante {
  id: string;
  cursoLectivoId: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string;
  nombreEncargado: string;
  direccion: string;
  telefono: string;
  fechaIngreso: string; // YYYY-MM-DD
  estado: EstadoEstudiante;
  fechaTraslado?: string; // YYYY-MM-DD
  escuelaTraslado?: string;
  observacionesTraslado?: string;
  fechaDesercion?: string; // YYYY-MM-DD
  observacionesDesercion?: string;
}

export enum AsistenciaStatus {
    Justificada = 'J',
    Injustificada = 'I',
    TardiaJustificada = 'TJ',
    TardiaInjustificada = 'TI',
}

export interface AsistenciaRecord {
    id: string; // Composite key: `${estudianteId}-${date}-${subject}`
    estudianteId: string;
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    date: string; // YYYY-MM-DD
    status: AsistenciaStatus;
}

// --- Nuevas interfaces para Tareas ---

export interface ConfiguracionPorcentaje {
    id: string; // Composite key: `${cursoLectivoId}-${periodoNombre}-${subject}`
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    porcentajeGeneral: number;
}

export interface Tarea {
    id: string;
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    nombre: string;
    porcentaje: number;
    puntosTotales: number;
}

export interface CalificacionTarea {
    id: string; // Composite key: `${tareaId}-${estudianteId}`
    tareaId: string;
    estudianteId: string;
    puntosObtenidos: number | null; // null si no se ha calificado
    noEntregado?: boolean;
}

// --- Interfaces para Cotidiano ---

export interface ConfiguracionCotidiano {
    id: string; // Composite key: `${cursoLectivoId}-${periodoNombre}-${subject}`
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    porcentajeGeneral: number;
}

export interface Indicador {
    id: string; // `indicador_${timestamp}`
    cursoLectivoId: string;
    subject: string;
    descripcion: string;
}

export interface EvaluacionCotidiano {
    id: string; // Composite key: `${cursoLectivoId}-${periodoNombre}-${subject}`
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    indicadorIds: string[]; // List of IDs from the Indicador bank
}

export enum NivelRubrica {
    Avanzado = '4',
    Logrado = '3',
    EnProceso = '2',
    Iniciado = '1',
}

export interface CalificacionIndicador {
    id: string; // Composite key: `${estudianteId}-${indicadorId}-${periodoNombre}-${subject}`
    estudianteId: string;
    indicadorId: string;
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    nivel: NivelRubrica | null; // null represents "No Observado"
}

// --- Interfaces para Proyectos ---

export interface ConfiguracionProyecto {
    id: string; // Composite key: `${cursoLectivoId}-${periodoNombre}-${subject}`
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    porcentajeGeneral: number;
    isEnabled: boolean;
}

export interface Proyecto {
    id: string;
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    nombre: string;
    porcentaje: number;
    puntosTotales: number;
}

export interface CalificacionProyecto {
    id: string; // Composite key: `${proyectoId}-${estudianteId}`
    proyectoId: string;
    estudianteId: string;
    puntosObtenidos: number | null; // null si no se ha calificado
    noEntregado?: boolean;
}

// --- Interfaces para Pruebas ---

export interface ConfiguracionPrueba {
    id: string; // Composite key: `${cursoLectivoId}-${periodoNombre}-${subject}`
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    porcentajeGeneral: number;
    isEnabled: boolean;
}

export interface Prueba {
    id: string;
    cursoLectivoId: string;
    periodoNombre: string;
    subject: string;
    nombre: string;
    porcentaje: number;
    puntosTotales: number;
}

export interface CalificacionPrueba {
    id: string; // Composite key: `${pruebaId}-${estudianteId}`
    pruebaId: string;
    estudianteId: string;
    puntosObtenidos: number | null; // null si no se ha calificado
    noEntregado?: boolean;
}

// --- Interface para Alertas Tempranas ---
export interface AtencionAction {
  id: number;
  action: string;
  startDate: string;
  endDate: string;
  responsible: string;
  observations: string;
}

export interface ContactLog {
  id: number;
  date: string;
  contactMethod: string;
  personContacted: string;
  comments: string;
}

export interface AlertaTempranaRecord {
  id: string; // `alerta_${timestamp}`
  estudianteId: string;
  cursoLectivoId: string;
  fechaCreacion: string; // YYYY-MM-DD
  checkedItems: Record<string, boolean>;
  observaciones: string;
  estadoAlerta: string | null;
  justificacionEliminada: string;
  atencionActions: AtencionAction[];
  institucionReferida: string;
  contactLogs: ContactLog[];
}
