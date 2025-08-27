
import React from 'react';
import { Theme } from '../types';

interface HeaderProps {
  sectionTitle: string;
  theme: Theme;
  toggleTheme: () => void;
  onToggleAiCompanion: () => void;
  isAiCompanionOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ sectionTitle, theme, toggleTheme, onToggleAiCompanion, isAiCompanionOpen }) => {
  return (
    <header className="h-16 bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm flex-shrink-0 border-b border-slate-200 dark:border-slate-600 flex items-center justify-between px-6 print:hidden">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{sectionTitle}</h2>
      <div className="flex items-center gap-4">
        <button
            onClick={onToggleAiCompanion}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-700 transition-colors ${isAiCompanionOpen ? 'bg-indigo-200 dark:bg-indigo-500/50' : 'bg-slate-200 dark:bg-slate-600'}`}
            aria-label="Toggle AI Companion"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isAiCompanionOpen ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.455-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.455-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
        </button>
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-700 bg-slate-200 dark:bg-slate-600"
            aria-label="Toggle theme"
        >
            {theme === Theme.Light ? (
            // Moon Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            ) : (
            // Sun Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            )}
        </button>
      </div>
    </header>
  );
};

export default Header;
