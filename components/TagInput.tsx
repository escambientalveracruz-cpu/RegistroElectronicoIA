import React, { useState } from 'react';

interface TagInputProps {
  title: string;
  placeholder: string;
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ title, placeholder, items, onAddItem, onRemoveItem }) => {
  const [currentValue, setCurrentValue] = useState('');

  const handleAddItem = () => {
    if (currentValue.trim() && !items.includes(currentValue.trim())) {
      onAddItem(currentValue.trim());
      setCurrentValue('');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); } }}
          placeholder={placeholder}
          className="flex-grow px-4 py-2 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0 text-sm">Añadir</button>
      </div>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-100 dark:bg-slate-600/50 rounded-lg min-h-[80px]">
        {items.length > 0 ? items.map((item, index) => (
          <div key={index} className="flex items-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium pl-3 pr-2 py-1 rounded-full animate-fade-in-up">
            <span>{item}</span>
            <button type="button" onClick={() => onRemoveItem(item)} className="ml-1.5 p-0.5 rounded-full text-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-800" aria-label={`Remover ${item}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 px-2 self-center">No se han añadido elementos.</p>
        )}
      </div>
    </div>
  );
};

export default TagInput;
