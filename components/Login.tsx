import React, { useState } from 'react';
import { auth } from '../data/db';
// FIX: Use scoped firebase package and remove deprecated AuthErrorCodes.
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword
} from '@firebase/auth';

const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email.trim() || !password.trim()) {
            setError('Por favor, complete todos los campos.');
            return;
        }
        
        if (!auth) {
            setError('El servicio de autenticación no está disponible. Verifique la configuración de Firebase.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLoginView) {
                // Lógica de Inicio de Sesión
                await signInWithEmailAndPassword(auth, email, password);
                // El componente Auth se encargará de redirigir
            } else {
                // Lógica de Registro
                await createUserWithEmailAndPassword(auth, email, password);
                setSuccessMessage('¡Cuenta creada con éxito! Ahora puede iniciar sesión.');
                setIsLoginView(true);
                setPassword(''); // Limpiar contraseña después del registro
            }
        } catch (error: any) {
            // Manejo de errores de Firebase Auth
            // FIX: Use string-based error codes for Firebase v9+
            switch (error.code) {
                case 'auth/invalid-email':
                    setError('El formato del correo electrónico no es válido.');
                    break;
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                     setError('Correo electrónico o contraseña incorrectos.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este correo electrónico ya está registrado.');
                    break;
                case 'auth/weak-password':
                    setError('La contraseña debe tener al menos 6 caracteres.');
                    break;
                default:
                    setError('Ocurrió un error. Por favor, inténtelo de nuevo.');
                    console.error('Error de autenticación:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-800 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-500">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h1 className="text-4xl font-bold ml-3 text-slate-900 dark:text-white">Estudiante AI</h1>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        {isLoginView ? 'Inicie sesión en su cuenta' : 'Cree una nueva cuenta'}
                    </h2>
                </div>

                <div className="bg-white dark:bg-slate-700 shadow-xl rounded-lg p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-800 dark:text-slate-200">Correo Electrónico</label>
                            <div className="mt-2">
                                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium leading-6 text-slate-800 dark:text-slate-200">Contraseña</label>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}

                        <div>
                            <button type="submit" disabled={isLoading}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-75 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (isLoginView ? 'Ingresar' : 'Crear Cuenta')}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    {isLoginView ? '¿No tiene una cuenta?' : '¿Ya tiene una cuenta?'}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccessMessage(''); }} className="font-semibold leading-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 ml-2">
                        {isLoginView ? 'Regístrese aquí' : 'Inicie sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;