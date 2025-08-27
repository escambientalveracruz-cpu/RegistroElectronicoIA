import React from 'react';
import type { User as AppUser } from '../types';
import App from '../App';
// import Login from './Login';
// import { auth } from '../data/db';
// import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
// import { useState, useEffect } from 'react';

const Auth: React.FC = () => {
    /*
    // --- ORIGINAL AUTHENTICATION LOGIC ---
    // This code is temporarily commented out to disable login during development.
    // To re-enable, uncomment this block and remove the "TEMPORARY" block below.
    // You will also need to re-import { useState, useEffect } from 'react' and the firebase dependencies.

    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth no está inicializado. La autenticación no funcionará.");
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // El usuario ha iniciado sesión
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || 'No email',
                });
            } else {
                // El usuario ha cerrado sesión
                setUser(null);
            }
            setIsLoading(false);
        });

        // Limpiar la suscripción al desmontar el componente
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (auth) {
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Error al cerrar la sesión", error);
            }
        }
    };

    if (isLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-4 text-lg font-medium">Verificando sesión...</span>
            </div>
        );
    }

    if (user) {
        return <App user={user} onLogout={handleLogout} />;
    }

    return <Login />;
    */

    // --- TEMPORARY: Authentication Disabled ---
    // A mock user is created to bypass the login screen for development.
    // The data will be saved to this user's UID.
    const mockUser: AppUser = {
        uid: 'dev-user-01',
        email: 'docente.dev@estudiante.ai',
    };

    // The logout function is mocked to do nothing.
    const handleMockLogout = () => {
        alert("La función de cerrar sesión está deshabilitada temporalmente.");
    };

    return <App user={mockUser} onLogout={handleMockLogout} />;
};

export default Auth;
