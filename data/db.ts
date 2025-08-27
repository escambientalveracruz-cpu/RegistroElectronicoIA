import type { 
    CursoLectivo, 
    Estudiante, 
    AsistenciaRecord,
    ConfiguracionPorcentaje,
    Tarea,
    CalificacionTarea,
    ConfiguracionCotidiano,
    Indicador,
    EvaluacionCotidiano,
    CalificacionIndicador,
    ConfiguracionProyecto,
    Proyecto,
    CalificacionProyecto,
    ConfiguracionPrueba,
    Prueba,
    CalificacionPrueba,
    // FIX: Add AlertaTempranaRecord to imports
    AlertaTempranaRecord
} from '../types';
// FIX: Use scoped firebase packages to resolve module export errors.
import { initializeApp, getApp, getApps, type FirebaseApp } from "@firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "@firebase/firestore";
import { getAuth } from "@firebase/auth";


// Define la forma de todo el estado de la aplicación que queremos persistir.
export interface AppState {
    cursos: CursoLectivo[];
    activeCursoId: string | null;
    estudiantes: Estudiante[];
    asistenciaRecords: AsistenciaRecord[];
    configuracionesPorcentaje: ConfiguracionPorcentaje[];
    tareas: Tarea[];
    calificacionesTareas: CalificacionTarea[];
    configuracionesCotidiano: ConfiguracionCotidiano[];
    indicadores: Indicador[];
    evaluacionesCotidiano: EvaluacionCotidiano[];
    calificacionesIndicadores: CalificacionIndicador[];
    configuracionesProyectos: ConfiguracionProyecto[];
    proyectos: Proyecto[];
    calificacionesProyectos: CalificacionProyecto[];
    configuracionesPruebas: ConfiguracionPrueba[];
    pruebas: Prueba[];
    calificacionesPruebas: CalificacionPrueba[];
    // FIX: Add alertasTempranas to AppState interface
    alertasTempranas: AlertaTempranaRecord[];
}

let app: FirebaseApp | null = null;

try {
  // This configuration should be managed via environment variables.
  // We assume `process.env.FIREBASE_CONFIG` is a JSON string provided by the environment.
  const firebaseConfigString = process.env.FIREBASE_CONFIG;
  if (firebaseConfigString) {
    const firebaseConfig = JSON.parse(firebaseConfigString);
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } else {
    console.warn("La configuración de Firebase no está disponible. El guardado de datos y la autenticación en la nube están deshabilitados.");
  }
} catch (e) {
  console.error("Error al inicializar Firebase. El guardado de datos y la autenticación en la nube están deshabilitados.", e);
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;


// Función para guardar todo el estado de la aplicación en Firestore.
export const saveDataToStorage = async (state: AppState, userId: string): Promise<void> => {
    if (!db) {
        console.warn("Firestore no está disponible, no se guardarán los datos.");
        return;
    }
    if (!userId) {
        console.error("No se puede guardar: Se requiere un ID de usuario.");
        return;
    }
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, state, { merge: true }); // Using merge is safer
    } catch (error) {
        console.error("Error guardando los datos en Firestore:", error);
    }
};

// Función para cargar todo el estado de la aplicación desde Firestore.
export const loadDataFromStorage = async (userId: string): Promise<Partial<AppState>> => {
     if (!db) {
        console.warn("Firestore no está disponible, no se cargarán datos.");
        return {};
    }
    if (!userId) {
        console.error("No se pueden cargar datos: Se requiere un ID de usuario.");
        return {};
    }
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as Partial<AppState>;
        }
        return {}; // No document found, return empty state.
    } catch (error) {
        console.error("Error cargando los datos desde Firestore:", error);
        return {}; // Return empty state on error.
    }
};