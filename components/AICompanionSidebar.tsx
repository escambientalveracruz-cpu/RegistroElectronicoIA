import React, { useState, useEffect, useRef } from 'react';
import { generateContentStream } from '../lib/gemini-client';

interface AICompanionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Contains all active course data from App.tsx
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AICompanionSidebar: React.FC<AICompanionSidebarProps> = ({ isOpen, onClose, data }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
             setMessages([{ sender: 'ai', text: '¡Hola! Soy tu asistente de IA. Puedes preguntarme cualquier cosa sobre los datos de tu curso actual.' }]);
        }
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { sender: 'ai', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const prompt = `
                **ROL Y OBJETIVO:**
                Actúa como "Estudiante AI", un experto asistente integrado en una aplicación de registro de notas para docentes.
                Tu propósito es ayudar al docente a analizar y comprender los datos de su clase respondiendo a sus preguntas de forma conversacional.
                Se te ha proporcionado un objeto JSON completo con todos los datos del curso activo actual.
                Analiza estos datos para responder a las preguntas del usuario con precisión.

                **INSTRUCCIONES:**
                - Al proporcionar información, sé conciso, claro y profesional.
                - Si se te pide realizar un cálculo (como un promedio), hazlo y muestra el resultado.
                - Si una pregunta es ambigua o requiere datos que no tienes, indícalo cortésmente.
                - No inventes datos. Basa todas tus respuestas estrictamente en el contexto JSON proporcionado.
                - Responde siempre en español.

                **CONTEXTO DE DATOS JSON DEL CURSO ACTIVO:**
                ${JSON.stringify(data, null, 2)}

                ---
                **PREGUNTA DEL DOCENTE:**
                ${input}
            `;

            const stream = await generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            for await (const chunk of stream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                        lastMessage.text += chunk.text;
                        return [...prev.slice(0, -1), lastMessage];
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error(err);
             setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    lastMessage.text = 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.';
                    return [...prev.slice(0, -1), lastMessage];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className={`flex flex-col bg-white dark:bg-slate-700 border-l border-slate-200 dark:border-slate-600 transition-all duration-300 ease-in-out ${isOpen ? 'w-96' : 'w-0'} overflow-hidden print:hidden`}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asistente AI</h3>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Cerrar asistente">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length - 1]?.text === '' && (
                    <div className="flex justify-start">
                         <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-slate-200 dark:bg-slate-600">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-0"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-400"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-600">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Pregúntame algo..."
                        disabled={isLoading}
                        className="flex-1 w-full px-4 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-full focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </form>
            </div>
        </aside>
    );
};

export default AICompanionSidebar;