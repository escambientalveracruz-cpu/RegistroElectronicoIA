import React, { useState, useEffect, useRef } from 'react';
import type { Estudiante, CursoLectivo } from '../types';
import { generateContent } from '../lib/gemini-client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PerfilSalidaAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Estudiante;
  results: Record<string, any>; // Object with subject names as keys
  periodo: string; // Will be "Anual"
  cursoActivo: CursoLectivo;
  subjects: string[];
}

const FormattedProfile: React.FC<{ text: string; teacherName: string }> = ({ text, teacherName }) => {
    // A simple parser that turns the AI's structured text into styled components for professional PDF output.
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const content: React.ReactNode[] = [];
  
    lines.forEach((line, index) => {
      // Clean the line from any lingering asterisks, just in case
      const cleanLine = line.replace(/\*\*/g, '').trim();
      
      if (cleanLine.toUpperCase() === 'PERFIL DE SALIDA DEL ESTUDIANTE') {
        content.push(<h1 key={index} style={{ fontSize: '16pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '24pt', fontFamily: "'Times New Roman', Times, serif" }}>{cleanLine}</h1>);
      } else if (cleanLine.toUpperCase().startsWith('NOMBRE DEL ESTUDIANTE:') || cleanLine.toUpperCase().startsWith('CURSO LECTIVO:')) {
        const [label, ...valueParts] = cleanLine.split(':');
        const value = valueParts.join(':').trim();
        content.push(<p key={index} style={{ marginBottom: '4pt' }}><strong style={{ fontWeight: 'bold' }}>{label}:</strong> {value}</p>);
      } else if (/^\d\.\s/.test(cleanLine)) {
        content.push(<h2 key={index} style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '18pt', marginBottom: '12pt', borderBottom: '1px solid black', paddingBottom: '2pt' }}>{cleanLine}</h2>);
      } else {
        content.push(<p key={index} style={{ marginBottom: '12pt', textAlign: 'justify' }}>{cleanLine}</p>);
      }
    });
  
    return (
      // The parent div will set the base font styles
      <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '12pt', color: 'black', lineHeight: 1.5 }}>
        {content}
        <div style={{ paddingTop: '48pt' }}>
          <div style={{ width: '60%', borderTop: '1px solid black', margin: '0 auto', textAlign: 'center', paddingTop: '4pt' }}>
            <p style={{ margin: 0 }}>Firma del Docente</p>
            <p style={{ margin: 0 }}>{teacherName}</p>
          </div>
        </div>
      </div>
    );
};


const PerfilSalidaAIModal: React.FC<PerfilSalidaAIModalProps> = ({ isOpen, onClose, student, results, periodo, cursoActivo, subjects }) => {
  const [profile, setProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [socioafectiva, setSocioafectiva] = useState('');
  const [psicomotriz, setPsicomotriz] = useState('');
  const [apoyoHogar, setApoyoHogar] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setProfile('');
      setIsLoading(false);
      setError('');
      setSocioafectiva('');
      setPsicomotriz('');
      setApoyoHogar('');
    }
  }, [isOpen]);

  const generateProfile = async () => {
    if (!student || !results) return;

    setIsLoading(true);
    setError('');
    setProfile('');

    try {
      const academicSummary = subjects
        .map(subj => {
            const subjectResults = results[subj];
            return subjectResults ? `- ${subj}: Promedio Final ${subjectResults.totalPorcentaje.toFixed(2)}%` : `- ${subj}: Sin datos.`;
        })
        .join('\n');

      const firstSubjectResults = results[subjects[0]];
      const attendanceSummary = firstSubjectResults ? firstSubjectResults.asistencia : { injustificadas: 0, justificadas: 0, tardias: 0 };
      
      const prompt = `
      ROL Y OBJETIVO:
      Actúa como un experimentado educador. Tu tarea es generar un "Perfil de Salida" formal, bien estructurado y profesional para un estudiante. El perfil debe ser descriptivo, constructivo y basarse en los datos proporcionados.

      DATOS DEL ESTUDIANTE:
      - Nombre Completo: ${student.nombre} ${student.primerApellido} ${student.segundoApellido}
      - Curso Lectivo: ${cursoActivo.year}
      - Docente: ${cursoActivo.teacherName}
      - Periodo Evaluado: ${periodo}

      DATOS DE RENDIMIENTO ACADÉMICO (PROMEDIO ANUAL POR MATERIA):
${academicSummary}

      DATOS DE ASISTENCIA ANUAL:
      - Ausencias Injustificadas: ${attendanceSummary.injustificadas}
      - Ausencias Justificadas: ${attendanceSummary.justificadas}
      - Tardías: ${attendanceSummary.tardias}

      APORTES CUALITATIVOS DEL DOCENTE (PALABRAS CLAVE):
      - Área Socioafectiva: ${socioafectiva || 'No especificado.'}
      - Área Psicomotriz: ${psicomotriz || 'No especificado.'}
      - Apoyo en el Hogar: ${apoyoHogar || 'No especificado.'}

      INSTRUCCIONES ESTRICTAS DE FORMATO Y CONTENIDO:
      Genera el informe en español. La respuesta DEBE SER TEXTO PLANO. NO uses ningún tipo de formato Markdown, especialmente asteriscos para negrita (**).
      La estructura debe seguir el orden exacto de los títulos que se muestran a continuación. Cada título debe estar en una línea separada y en mayúsculas, tal como se muestra.
      Redacta párrafos completos y profesionales para cada sección, integrando los datos cuantitativos y cualitativos de forma natural.

      PERFIL DE SALIDA DEL ESTUDIANTE

      NOMBRE DEL ESTUDIANTE: ${student.nombre} ${student.primerApellido} ${student.segundoApellido}
      CURSO LECTIVO: ${cursoActivo.year}
      
      1. DESEMPEÑO ACADÉMICO GENERAL
      (Análisis integral del rendimiento, mencionando fortalezas y áreas de mejora con base en los promedios de las materias.)

      2. DESARROLLO SOCIOAFECTIVO Y CONDUCTUAL
      (Descripción del comportamiento e interacciones sociales, integrando las palabras clave del docente y el registro de asistencia.)

      3. DESARROLLO PSICOMOTRIZ
      (Breve descripción de habilidades psicomotrices basada en las palabras clave. Si no hay, indica que no se realizaron observaciones específicas.)

      4. VINCULACIÓN FAMILIA-ESCUELA
      (Descripción del apoyo familiar percibido y su reflejo en el estudiante, basado en las palabras clave.)

      5. SÍNTESIS Y RECOMENDACIONES
      (Resumen final y 2-3 recomendaciones claras y constructivas para el futuro.)
      `;
      
      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setProfile(response.text);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el perfil. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const input = profileRef.current;
    if (!input) return;

    html2canvas(input, {
        scale: 2, // Increased scale for better resolution
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // A4 ratio
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasRatio = canvasWidth / canvasHeight;
        
        const margin = 15; // 1.5 cm margin
        let contentWidth = pdfWidth - margin * 2;
        let contentHeight = contentWidth / canvasRatio;

        // If content is too tall, fit to page height
        if (contentHeight > pdfHeight - margin * 2) {
            contentHeight = pdfHeight - margin * 2;
            contentWidth = contentHeight * canvasRatio;
        }

        const xOffset = (pdfWidth - contentWidth) / 2;
        const yOffset = margin;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, contentWidth, contentHeight);
        pdf.save(`Perfil_${student.nombre.replace(' ', '_')}_${student.primerApellido}.pdf`);
    });
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-300">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Generando perfil completo...</span>
            </div>
        );
    }
    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }
    if (profile) {
        // Formal document view for preview and PDF generation
        return (
            <div ref={profileRef} className="bg-white p-8 max-w-[210mm] mx-auto shadow-lg">
                <FormattedProfile text={profile} teacherName={cursoActivo.teacherName} />
            </div>
        );
    }
    // Initial view to input keywords
    return (
        <div className="space-y-4 p-4 bg-white dark:bg-slate-700/50 rounded-lg">
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Área Socioafectiva y Conductual</label>
                <input type="text" value={socioafectiva} onChange={e => setSocioafectiva(e.target.value)} placeholder="Palabras clave: Tímido, colaborador, respeta normas..." className="w-full form-input"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Área Psicomotriz</label>
                <input type="text" value={psicomotriz} onChange={e => setPsicomotriz(e.target.value)} placeholder="Palabras clave: Buena motora fina, enérgico..." className="w-full form-input"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Apoyo Percibido en el Hogar</label>
                <input type="text" value={apoyoHogar} onChange={e => setApoyoHogar(e.target.value)} placeholder="Palabras clave: Participativo, poco seguimiento..." className="w-full form-input"/>
            </div>
             <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">Proporcione palabras clave para enriquecer el informe generado por la IA.</p>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 p-5 flex items-start justify-between border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generador de Perfil de Salida (IA)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Para: {`${student.nombre} ${student.primerApellido}`} (Curso Lectivo Completo)
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900/50">
          <div className="min-h-[250px] rounded-md">
            {renderContent()}
          </div>
        </div>
          
        <div className="flex-shrink-0 flex justify-between items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
          {profile ? (
             <button type="button" onClick={handleDownloadPDF} className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Descargar PDF
            </button>
          ) : <div></div>}
          <div className="flex items-center gap-4">
            {profile && <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-500 text-white font-semibold rounded-md hover:bg-slate-600">Cerrar</button>}
            <button type="button" onClick={profile ? () => setProfile('') : generateProfile} disabled={isLoading} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 min-w-[150px] text-center">
                {isLoading ? 'Generando...' : (profile ? 'Nuevo Intento' : 'Generar Perfil')}
            </button>
          </div>
        </div>
        <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;border-radius:0.375rem;background-color:rgb(241 245 249/1);border:1px solid rgb(203 213 225/1)}.dark .form-input{background-color:rgb(71 85 105/1);border-color:rgb(100 116 139/1)}.form-input:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(99 102 241/1);box-shadow:0 0 0 1px rgb(99 102 241/1)}`}</style>
      </div>
    </div>
  );
};

export default PerfilSalidaAIModal;