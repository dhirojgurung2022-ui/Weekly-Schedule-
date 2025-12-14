import React, { useState, useRef, useEffect, useMemo } from 'react';

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onChange: (selected: string[]) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({ label, options, selectedOptions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Effect to handle clicks outside the dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Effect to reset the search term when the dropdown is closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleCheckboxChange = (option: string) => {
        const currentIndex = selectedOptions.indexOf(option);
        const newSelected = [...selectedOptions];

        if (currentIndex === -1) {
            newSelected.push(option);
        } else {
            newSelected.splice(currentIndex, 1);
        }
        onChange(newSelected);
    };

    const filteredOptions = useMemo(() =>
        options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [options, searchTerm]
    );

    return (
        <div ref={wrapperRef} className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 text-left"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{label}</span>
                    <span className="font-bold">
                        {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : 'All'}
                    </span>
                </div>
                 <svg className={`flex-shrink-0 w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 right-0 max-w-xs">
                    <div className="p-2 flex justify-between items-center border-b border-gray-600">
                        <span className="px-2 text-sm font-bold">{label}</span>
                         <button 
                            onClick={() => {
                                onChange([]);
                                setSearchTerm('');
                            }} 
                            className="text-sm text-blue-400 hover:text-blue-300 pr-2 font-bold">Clear</button>
                    </div>
                    <div className="p-2 border-b border-gray-600">
                        <input
                            type="text"
                            placeholder={`Search ${label}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-500 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 font-bold"
                            autoFocus
                        />
                    </div>
                    <ul className="py-1 max-h-60 overflow-auto">
                        {filteredOptions.map(option => (
                            <li key={option} className="px-2 py-1 text-gray-300 hover:bg-gray-600">
                                <label className="flex items-center space-x-3 cursor-pointer w-full">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded bg-gray-800 border-gray-500 text-blue-500 focus:ring-blue-400"
                                        checked={selectedOptions.includes(option)}
                                        onChange={() => handleCheckboxChange(option)}
                                    />
                                    <span className="text-sm truncate font-bold" title={option}>{option}</span>
                                </label>
                            </li>
                        ))}
                         {filteredOptions.length === 0 && (
                            <li className="px-4 py-2 text-sm text-gray-400 font-bold">
                                {options.length > 0 ? 'No results found' : 'No options available'}
                            </li>
                         )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectFilter;