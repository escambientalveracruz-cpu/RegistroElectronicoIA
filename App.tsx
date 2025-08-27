import React, { useState, useEffect, useMemo } from 'react';
import { NAV_ITEMS } from './constants';
import { SectionId, Theme, EstadoEstudiante } from './types';
import type { User, CursoLectivo, Estudiante, AsistenciaRecord, AsistenciaStatus, Tarea, CalificacionTarea, ConfiguracionPorcentaje, ConfiguracionCotidiano, Indicador, EvaluacionCotidiano, CalificacionIndicador, ConfiguracionProyecto, Proyecto, CalificacionProyecto, ConfiguracionPrueba, Prueba, CalificacionPrueba, AlertaTempranaRecord } from './types';
import { loadDataFromStorage, saveDataToStorage } from './data/db';
import type { AppState } from './data/db';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ConstructionPlaceholder from './components/ConstructionPlaceholder';
import Inicio from './components/Inicio';
import Configuracion from './components/Configuracion';
import ListaEstudiantes from './components/ListaEstudiantes';
import Asistencia from './components/Asistencia';
import Tareas from './components/Tareas';
import Cotidiano from './components/Cotidiano';
import Proyectos from './components/Proyectos';
import Pruebas from './components/Pruebas';
import Resumen from './components/Resumen';
import SeguimientoAcademico from './components/SeguimientoAcademico';
import AICompanionSidebar from './components/AICompanionSidebar';

interface AppProps {
  user: User;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.Inicio);
  const [cursos, setCursos] = useState<CursoLectivo[]>([]);
  const [activeCursoId, setActiveCursoId] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistenciaRecords, setAsistenciaRecords] = useState<AsistenciaRecord[]>([]);
  // --- Estados para Tareas ---
  const [configuracionesPorcentaje, setConfiguracionesPorcentaje] = useState<ConfiguracionPorcentaje[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [calificacionesTareas, setCalificacionesTareas] = useState<CalificacionTarea[]>([]);
  // --- Estados para Cotidiano ---
  const [configuracionesCotidiano, setConfiguracionesCotidiano] = useState<ConfiguracionCotidiano[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [evaluacionesCotidiano, setEvaluacionesCotidiano] = useState<EvaluacionCotidiano[]>([]);
  const [calificacionesIndicadores, setCalificacionesIndicadores] = useState<CalificacionIndicador[]>([]);
  // --- Estados para Proyectos ---
  const [configuracionesProyectos, setConfiguracionesProyectos] = useState<ConfiguracionProyecto[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [calificacionesProyectos, setCalificacionesProyectos] = useState<CalificacionProyecto[]>([]);
  // --- Estados para Pruebas ---
  const [configuracionesPruebas, setConfiguracionesPruebas] = useState<ConfiguracionPrueba[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [calificacionesPruebas, setCalificacionesPruebas] = useState<CalificacionPrueba[]>([]);
  // --- Estado para Alertas Tempranas ---
  const [alertasTempranas, setAlertasTempranas] = useState<AlertaTempranaRecord[]>([]);
  const [isAiCompanionOpen, setIsAiCompanionOpen] = useState(false);


  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        return Theme.Dark;
      }
      if (storedTheme === 'light') {
        return Theme.Light;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Dark;
      }
    }
    return Theme.Light;
  });

  // Load data from storage on user change
  useEffect(() => {
    const loadAsyncData = async () => {
        setIsDataLoading(true);
        try {
            const loadedData = await loadDataFromStorage(user.uid);
            setCursos(loadedData.cursos || []);
            setActiveCursoId(loadedData.activeCursoId || null);
            setEstudiantes(loadedData.estudiantes || []);
            setAsistenciaRecords(loadedData.asistenciaRecords || []);
            setConfiguracionesPorcentaje(loadedData.configuracionesPorcentaje || []);
            setTareas(loadedData.tareas || []);
            setCalificacionesTareas(loadedData.calificacionesTareas || []);
            setConfiguracionesCotidiano(loadedData.configuracionesCotidiano || []);
            setIndicadores(loadedData.indicadores || []);
            setEvaluacionesCotidiano(loadedData.evaluacionesCotidiano || []);
            setCalificacionesIndicadores(loadedData.calificacionesIndicadores || []);
            setConfiguracionesProyectos(loadedData.configuracionesProyectos || []);
            setProyectos(loadedData.proyectos || []);
            setCalificacionesProyectos(loadedData.calificacionesProyectos || []);
            setConfiguracionesPruebas(loadedData.configuracionesPruebas || []);
            setPruebas(loadedData.pruebas || []);
            setCalificacionesPruebas(loadedData.calificacionesPruebas || []);
            setAlertasTempranas(loadedData.alertasTempranas || []);
            setActiveSection(SectionId.Inicio); // Reset to home on user change
        } catch (error) {
            console.error("Failed to load data from storage for user", user.uid, error);
        } finally {
            setIsDataLoading(false);
        }
    };
    loadAsyncData();
  }, [user.uid]);

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.Dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  // Create a memoized object of the current state for saving.
  const stateToSave = useMemo((): AppState => ({
    cursos,
    activeCursoId,
    estudiantes,
    asistenciaRecords,
    configuracionesPorcentaje,
    tareas,
    calificacionesTareas,
    configuracionesCotidiano,
    indicadores,
    evaluacionesCotidiano,
    calificacionesIndicadores,
    configuracionesProyectos,
    proyectos,
    calificacionesProyectos,
    configuracionesPruebas,
    pruebas,
    calificacionesPruebas,
    alertasTempranas,
  }), [
      cursos, activeCursoId, estudiantes, asistenciaRecords, 
      configuracionesPorcentaje, tareas, calificacionesTareas, 
      configuracionesCotidiano, indicadores, evaluacionesCotidiano, calificacionesIndicadores,
      configuracionesProyectos, proyectos, calificacionesProyectos,
      configuracionesPruebas, pruebas, calificacionesPruebas,
      alertasTempranas
  ]);

  // Save data to storage with a debounce effect.
  useEffect(() => {
    // Don't save during initial load or if user hasn't changed.
    if (isDataLoading) return;

    const handler = setTimeout(() => {
        saveDataToStorage(stateToSave, user.uid);
    }, 1500); // Debounce saves by 1.5 seconds

    return () => {
        clearTimeout(handler);
    };
  }, [stateToSave, user.uid, isDataLoading]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === Theme.Light ? Theme.Dark : Theme.Light));
  };
  
  const toggleAiCompanion = () => {
    setIsAiCompanionOpen(prev => !prev);
  };

  const handleSaveCurso = (newCursoData: Omit<CursoLectivo, 'id'>) => {
    const newCurso: CursoLectivo = {
        ...newCursoData,
        id: Date.now().toString(),
    };
    const updatedCursos = [...cursos, newCurso];
    setCursos(updatedCursos);
    setActiveCursoId(newCurso.id);
  };

  const handleUpdateCurso = (updatedCurso: CursoLectivo) => {
    setCursos(prevCursos => 
        prevCursos.map(curso => 
            curso.id === updatedCurso.id ? updatedCurso : curso
        )
    );
  };

  const handleAddEstudiante = (newEstudianteData: Omit<Estudiante, 'id' | 'cursoLectivoId' | 'estado' | 'fechaTraslado' | 'escuelaTraslado' | 'observacionesTraslado' | 'fechaDesercion' | 'observacionesDesercion' >) => {
      if (!activeCursoId) {
        alert("Error: No hay un curso lectivo activo para asignar el estudiante.");
        return;
      }
      const newEstudiante: Estudiante = {
        ...newEstudianteData,
        id: `est_${Date.now()}`,
        cursoLectivoId: activeCursoId,
        estado: EstadoEstudiante.Activo,
        fechaTraslado: '',
        escuelaTraslado: '',
        observacionesTraslado: '',
        fechaDesercion: '',
        observacionesDesercion: '',
      };
      setEstudiantes([...estudiantes, newEstudiante]);
  };

  const handleUpdateEstudiante = (updatedEstudiante: Estudiante) => {
    setEstudiantes(estudiantes.map(est => est.id === updatedEstudiante.id ? updatedEstudiante : est));
  };

  const handleSetActiveCursoId = (id: string) => {
    setActiveCursoId(id);
  };

  const handleSaveAsistencia = (
    estudianteId: string, 
    date: string, 
    subject: string, 
    periodoNombre: string, 
    status: AsistenciaStatus | null
  ) => {
    if (!activeCursoId) return;

    const recordId = `${estudianteId}-${date}-${subject}`;

    setAsistenciaRecords(prevRecords => {
        // If status is null (Presente), remove the record if it exists
        if (status === null) {
            return prevRecords.filter(rec => rec.id !== recordId);
        }

        const existingRecordIndex = prevRecords.findIndex(rec => rec.id === recordId);
        const newRecord: AsistenciaRecord = {
            id: recordId,
            estudianteId,
            cursoLectivoId: activeCursoId,
            periodoNombre,
            subject,
            date,
            status
        };

        // If record exists, update it
        if (existingRecordIndex > -1) {
            const updatedRecords = [...prevRecords];
            updatedRecords[existingRecordIndex] = newRecord;
            return updatedRecords;
        }
        
        // Otherwise, add the new record
        return [...prevRecords, newRecord];
    });
  };

  // --- Handlers for Tareas ---

  const handleSaveConfiguracionPorcentaje = (config: ConfiguracionPorcentaje) => {
    setConfiguracionesPorcentaje(prev => {
        const existingIndex = prev.findIndex(c => c.id === config.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = config;
            return updated;
        }
        return [...prev, config];
    });
  };

  const handleSaveTarea = (tarea: Tarea) => {
      setTareas(prev => {
          const existingIndex = prev.findIndex(t => t.id === tarea.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = tarea;
              return updated;
          }
          return [...prev, tarea];
      });
  };
  
  const handleDeleteTarea = (tareaId: string) => {
      setTareas(prev => prev.filter(t => t.id !== tareaId));
      // Also delete related grades
      setCalificacionesTareas(prev => prev.filter(c => c.tareaId !== tareaId));
  };

  const handleSaveCalificacion = (calificacion: CalificacionTarea) => {
      setCalificacionesTareas(prev => {
          const existingIndex = prev.findIndex(c => c.id === calificacion.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = calificacion;
              return updated;
          }
          return [...prev, calificacion];
      });
  };

  // --- Handlers for Cotidiano ---
  const handleSaveConfiguracionCotidiano = (config: ConfiguracionCotidiano) => {
    setConfiguracionesCotidiano(prev => {
        const existingIndex = prev.findIndex(c => c.id === config.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = config;
            return updated;
        }
        return [...prev, config];
    });
  };

  const handleSaveIndicador = (indicador: Indicador) => {
      setIndicadores(prev => {
          const existingIndex = prev.findIndex(i => i.id === indicador.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = indicador;
              return updated;
          }
          return [...prev, indicador];
      });
  };

  const handleSaveIndicadoresBatch = (nuevosIndicadores: Omit<Indicador, 'id'>[]) => {
    setIndicadores(prev => {
        if (!nuevosIndicadores || nuevosIndicadores.length === 0) return prev;
        
        // This logic assumes all new indicators share the same context.
        const contextCursoId = nuevosIndicadores[0].cursoLectivoId;
        const contextSubject = nuevosIndicadores[0].subject;

        const descripcionesExistentes = new Set(
            prev
                .filter(i => i.cursoLectivoId === contextCursoId && i.subject === contextSubject)
                .map(i => i.descripcion)
        );
        
        const indicadoresParaAgregar: Indicador[] = nuevosIndicadores
            .filter(nuevo => !descripcionesExistentes.has(nuevo.descripcion))
            .map((nuevo, index) => ({
                ...nuevo,
                id: `indicador_${Date.now()}_${index}` 
            }));
        
        return [...prev, ...indicadoresParaAgregar];
    });
  };
  
  const handleDeleteIndicador = (indicadorId: string) => {
      setIndicadores(prev => prev.filter(i => i.id !== indicadorId));
      setCalificacionesIndicadores(prev => prev.filter(c => c.indicadorId !== indicadorId));
      setEvaluacionesCotidiano(prev => prev.map(ev => ({
          ...ev,
          indicadorIds: ev.indicadorIds.filter(id => id !== indicadorId)
      })));
  };

  const handleSaveEvaluacionCotidiano = (evaluacion: EvaluacionCotidiano) => {
      setEvaluacionesCotidiano(prev => {
          const existingIndex = prev.findIndex(e => e.id === evaluacion.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = evaluacion;
              return updated;
          }
          return [...prev, evaluacion];
      });
  };

  const handleSaveCalificacionIndicador = (calificacion: CalificacionIndicador) => {
      setCalificacionesIndicadores(prev => {
          const existingIndex = prev.findIndex(c => c.id === calificacion.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = calificacion;
              return updated;
          }
          return [...prev, calificacion];
      });
  };

  // --- Handlers for Proyectos ---
  const handleSaveConfiguracionProyecto = (config: ConfiguracionProyecto) => {
    setConfiguracionesProyectos(prev => {
        const existingIndex = prev.findIndex(c => c.id === config.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = config;
            return updated;
        }
        return [...prev, config];
    });
  };

  const handleSaveProyecto = (proyecto: Proyecto) => {
      setProyectos(prev => {
          const existingIndex = prev.findIndex(p => p.id === proyecto.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = proyecto;
              return updated;
          }
          return [...prev, proyecto];
      });
  };
  
  const handleDeleteProyecto = (proyectoId: string) => {
      setProyectos(prev => prev.filter(p => p.id !== proyectoId));
      setCalificacionesProyectos(prev => prev.filter(c => c.proyectoId !== proyectoId));
  };

  const handleSaveCalificacionProyecto = (calificacion: CalificacionProyecto) => {
      setCalificacionesProyectos(prev => {
          const existingIndex = prev.findIndex(c => c.id === calificacion.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = calificacion;
              return updated;
          }
          return [...prev, calificacion];
      });
  };

  // --- Handlers for Pruebas ---
  const handleSaveConfiguracionPrueba = (config: ConfiguracionPrueba) => {
    setConfiguracionesPruebas(prev => {
        const existingIndex = prev.findIndex(c => c.id === config.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = config;
            return updated;
        }
        return [...prev, config];
    });
  };

  const handleSavePrueba = (prueba: Prueba) => {
      setPruebas(prev => {
          const existingIndex = prev.findIndex(p => p.id === prueba.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = prueba;
              return updated;
          }
          return [...prev, prueba];
      });
  };
  
  const handleDeletePrueba = (pruebaId: string) => {
      setPruebas(prev => prev.filter(p => p.id !== pruebaId));
      setCalificacionesPruebas(prev => prev.filter(c => c.pruebaId !== pruebaId));
  };

  const handleSaveCalificacionPrueba = (calificacion: CalificacionPrueba) => {
      setCalificacionesPruebas(prev => {
          const existingIndex = prev.findIndex(c => c.id === calificacion.id);
          if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = calificacion;
              return updated;
          }
          return [...prev, calificacion];
      });
  };
  
  // --- Handler for Alertas Tempranas ---
  const handleSaveAlertaTemprana = (alerta: AlertaTempranaRecord) => {
    setAlertasTempranas(prev => {
        const existingIndex = prev.findIndex(a => a.id === alerta.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = alerta;
            return updated;
        }
        return [...prev, alerta];
    });
  };

  const activeNavItem = useMemo(() => 
    NAV_ITEMS.find(item => item.id === activeSection) || NAV_ITEMS[0], 
    [activeSection]
  );
  
    const activeCurso = cursos.find(c => c.id === activeCursoId) || null;
    const activeEstudiantes = estudiantes.filter(e => e.cursoLectivoId === activeCursoId);
    
    const activeAsistencia = asistenciaRecords.filter(r => r.cursoLectivoId === activeCursoId);
    
    const activeConfigs = configuracionesPorcentaje.filter(c => c.cursoLectivoId === activeCursoId);
    const activeTareas = tareas.filter(t => t.cursoLectivoId === activeCursoId);
    const activeCalificaciones = calificacionesTareas.filter(c => activeTareas.some(t => t.id === c.tareaId));
    
    const activeConfigsCotidiano = configuracionesCotidiano.filter(c => c.cursoLectivoId === activeCursoId);
    const activeIndicadores = indicadores.filter(i => i.cursoLectivoId === activeCursoId);
    const activeEvaluacionesCotidiano = evaluacionesCotidiano.filter(e => e.cursoLectivoId === activeCursoId);
    const activeCalificacionesIndicadores = calificacionesIndicadores.filter(c => c.cursoLectivoId === activeCursoId);

    const activeConfigsProyectos = configuracionesProyectos.filter(c => c.cursoLectivoId === activeCursoId);
    const activeProyectos = proyectos.filter(p => p.cursoLectivoId === activeCursoId);
    const activeCalificacionesProyectos = calificacionesProyectos.filter(c => activeProyectos.some(p => p.id === c.proyectoId));

    const activeConfigsPruebas = configuracionesPruebas.filter(c => c.cursoLectivoId === activeCursoId);
    const activePruebas = pruebas.filter(p => p.cursoLectivoId === activeCursoId);
    const activeCalificacionesPruebas = calificacionesPruebas.filter(c => activePruebas.some(p => p.id === c.pruebaId));

    const activeAlertas = alertasTempranas.filter(a => a.cursoLectivoId === activeCursoId);


  const renderContent = () => {
    switch (activeSection) {
      case SectionId.Inicio:
        return <Inicio setActiveSection={setActiveSection} />;
      case SectionId.Configuracion:
        return <Configuracion 
            onSave={handleSaveCurso} 
            onUpdate={handleUpdateCurso}
            cursoActivo={activeCurso}
            setActiveSection={setActiveSection} 
        />;
      case SectionId.ListaEstudiantes:
        return <ListaEstudiantes
            estudiantes={activeEstudiantes}
            onAddEstudiante={handleAddEstudiante}
            onUpdateEstudiante={handleUpdateEstudiante}
            cursoActivo={activeCurso}
        />;
      case SectionId.Asistencia:
        return <Asistencia
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            asistenciaRecords={activeAsistencia}
            onSaveAsistencia={handleSaveAsistencia}
        />;
      case SectionId.Tarea:
        return <Tareas
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            configuraciones={activeConfigs}
            onSaveConfiguracion={handleSaveConfiguracionPorcentaje}
            tareas={activeTareas}
            calificaciones={activeCalificaciones}
            onSaveTarea={handleSaveTarea}
            onDeleteTarea={handleDeleteTarea}
            onSaveCalificacion={handleSaveCalificacion}
        />;
      case SectionId.Cotidiano:
        return <Cotidiano
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            configuraciones={activeConfigsCotidiano}
            onSaveConfiguracion={handleSaveConfiguracionCotidiano}
            indicadores={activeIndicadores}
            onSaveIndicador={handleSaveIndicador}
            onDeleteIndicador={handleDeleteIndicador}
            onSaveIndicadoresBatch={handleSaveIndicadoresBatch}
            evaluaciones={activeEvaluacionesCotidiano}
            onSaveEvaluacion={handleSaveEvaluacionCotidiano}
            calificaciones={activeCalificacionesIndicadores}
            onSaveCalificacion={handleSaveCalificacionIndicador}
        />;
      case SectionId.Proyectos:
        return <Proyectos
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            configuraciones={activeConfigsProyectos}
            onSaveConfiguracion={handleSaveConfiguracionProyecto}
            proyectos={activeProyectos}
            calificaciones={activeCalificacionesProyectos}
            onSaveProyecto={handleSaveProyecto}
            onDeleteProyecto={handleDeleteProyecto}
            onSaveCalificacion={handleSaveCalificacionProyecto}
        />;
      case SectionId.Pruebas:
        return <Pruebas
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            configuraciones={activeConfigsPruebas}
            onSaveConfiguracion={handleSaveConfiguracionPrueba}
            pruebas={activePruebas}
            calificaciones={activeCalificacionesPruebas}
            onSavePrueba={handleSavePrueba}
            onDeletePrueba={handleDeletePrueba}
            onSaveCalificacion={handleSaveCalificacionPrueba}
        />;
      case SectionId.SeguimientoAcademico:
         return <SeguimientoAcademico
            cursoActivo={activeCurso}
            estudiantes={estudiantes} // Pass all students to filter within the component
            alertasTempranas={activeAlertas}
            onSaveAlertaTemprana={handleSaveAlertaTemprana}
            // Tareas
            configuracionesTareas={activeConfigs}
            tareas={activeTareas}
            calificacionesTareas={activeCalificaciones}
            // Cotidiano
            configuracionesCotidiano={activeConfigsCotidiano}
            evaluacionesCotidiano={activeEvaluacionesCotidiano}
            indicadores={activeIndicadores}
            calificacionesIndicadores={activeCalificacionesIndicadores}
            // Proyectos
            configuracionesProyectos={activeConfigsProyectos}
            proyectos={activeProyectos}
            calificacionesProyectos={activeCalificacionesProyectos}
            // Pruebas
            configuracionesPruebas={activeConfigsPruebas}
            pruebas={activePruebas}
            calificacionesPruebas={activeCalificacionesPruebas}
            // Asistencia
            asistenciaRecords={activeAsistencia}
        />;
      case SectionId.Resumen:
        return <Resumen
            cursoActivo={activeCurso}
            estudiantes={activeEstudiantes}
            // Tareas
            configuracionesTareas={activeConfigs}
            tareas={activeTareas}
            calificacionesTareas={activeCalificaciones}
            // Cotidiano
            configuracionesCotidiano={activeConfigsCotidiano}
            evaluacionesCotidiano={activeEvaluacionesCotidiano}
            indicadores={activeIndicadores}
            calificacionesIndicadores={activeCalificacionesIndicadores}
            // Proyectos
            configuracionesProyectos={activeConfigsProyectos}
            proyectos={activeProyectos}
            calificacionesProyectos={activeCalificacionesProyectos}
            // Pruebas
            configuracionesPruebas={activeConfigsPruebas}
            pruebas={activePruebas}
            calificacionesPruebas={activeCalificacionesPruebas}
            // Asistencia
            asistenciaRecords={activeAsistencia}
        />;
      default:
        return <ConstructionPlaceholder title={activeNavItem.name} icon={activeNavItem.icon} />;
    }
  };

  const aiCompanionData = {
    cursoActivo: activeCurso,
    estudiantes: activeEstudiantes,
    asistenciaRecords: activeAsistencia,
    configuracionesTareas: activeConfigs,
    tareas: activeTareas,
    calificacionesTareas: activeCalificaciones,
    configuracionesCotidiano: activeConfigsCotidiano,
    indicadores: activeIndicadores,
    evaluacionesCotidiano: activeEvaluacionesCotidiano,
    calificacionesIndicadores: activeCalificacionesIndicadores,
    configuracionesProyectos: activeConfigsProyectos,
    proyectos: activeProyectos,
    calificacionesProyectos: activeCalificacionesProyectos,
    configuracionesPruebas: activeConfigsPruebas,
    pruebas: activePruebas,
    calificacionesPruebas: activeCalificacionesPruebas,
  };

  if (isDataLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-4 text-lg font-medium">Cargando datos desde la nube...</span>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans print:bg-white">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        cursos={cursos}
        activeCursoId={activeCursoId}
        setActiveCursoId={handleSetActiveCursoId}
        user={user}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sectionTitle={activeNavItem.name} 
          theme={theme}
          toggleTheme={toggleTheme}
          onToggleAiCompanion={toggleAiCompanion}
          isAiCompanionOpen={isAiCompanionOpen}
        />
        <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0">
                    {renderContent()}
                </div>
            </main>
            <AICompanionSidebar 
                isOpen={isAiCompanionOpen}
                onClose={toggleAiCompanion}
                data={aiCompanionData}
            />
        </div>
      </div>
    </div>
  );
};

export default App;
