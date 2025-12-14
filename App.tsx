import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useScheduleData } from './hooks/useScheduleData';
import { getWeekStartDate, getWeekDays, formatDateRange } from './utils/dateUtils';
import ScheduleTable from './components/ScheduleTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import InfoPanel from './components/InfoPanel';
import MultiSelectFilter from './components/MultiSelectFilter';

const SAMPLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1oK3_Hkfx7SMDrCfNUn3VhAPbca6PL2lIEBQhUydS6oM/edit?gid=0';

const App: React.FC = () => {
    const [sheetUrl, setSheetUrl] = useState(SAMPLE_SHEET_URL);
    const [submittedUrl, setSubmittedUrl] = useState(SAMPLE_SHEET_URL);
    const { data, loading, error, refetch, lastUpdated, sheetDate } = useScheduleData(submittedUrl);
    const [currentDate, setCurrentDate] = useState(new Date('2024-12-09'));
    const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
    const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
    const [selectedStoreNames, setSelectedStoreNames] = useState<string[]>([]);
    const [selectedEmployeeNames, setSelectedEmployeeNames] = useState<string[]>([]);

    useEffect(() => {
        if (sheetDate) {
            setCurrentDate(sheetDate);
        }
    }, [sheetDate]);


    const weekStart = useMemo(() => getWeekStartDate(currentDate), [currentDate]);
    const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

    const { designations, nationalities, storeNames, employeeNames } = useMemo(() => {
        if (!data) return { designations: [], nationalities: [], storeNames: [], employeeNames: [] };
        
        const unique = {
            designations: new Set<string>(),
            nationalities: new Set<string>(),
            storeNames: new Set<string>(),
            employeeNames: new Set<string>()
        };

        for (const row of data) {
            if (row['DESIGNATION']) unique.designations.add(row['DESIGNATION']);
            if (row['NATIONALITY']) unique.nationalities.add(row['NATIONALITY']);
            if (row['STORE NAME']) unique.storeNames.add(row['STORE NAME']);
            if (row['EMPLOYEE NAME']) unique.employeeNames.add(row['EMPLOYEE NAME']);
        }

        return {
            designations: Array.from(unique.designations).sort(),
            nationalities: Array.from(unique.nationalities).sort(),
            storeNames: Array.from(unique.storeNames).sort(),
            employeeNames: Array.from(unique.employeeNames).sort(),
        };
    }, [data]);

    const filteredData = useMemo(() => {
        if (!data) return null;
        if (
            selectedDesignations.length === 0 &&
            selectedNationalities.length === 0 &&
            selectedStoreNames.length === 0 &&
            selectedEmployeeNames.length === 0
        ) {
            return data;
        }

        return data.filter(row => {
            const designationMatch = selectedDesignations.length === 0 || selectedDesignations.includes(row['DESIGNATION']);
            const nationalityMatch = selectedNationalities.length === 0 || selectedNationalities.includes(row['NATIONALITY']);
            const storeNameMatch = selectedStoreNames.length === 0 || selectedStoreNames.includes(row['STORE NAME']);
            const employeeNameMatch = selectedEmployeeNames.length === 0 || selectedEmployeeNames.includes(row['EMPLOYEE NAME']);
            
            return designationMatch && nationalityMatch && storeNameMatch && employeeNameMatch;
        });
    }, [data, selectedDesignations, selectedNationalities, selectedStoreNames, selectedEmployeeNames]);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSelectedDesignations([]);
        setSelectedNationalities([]);
        setSelectedStoreNames([]);
        setSelectedEmployeeNames([]);
        setSubmittedUrl(sheetUrl);
    };

    const addWeeks = (date: Date, weeks: number) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + weeks * 7);
        return newDate;
    };

    const goToPreviousWeek = useCallback(() => {
        setCurrentDate(prev => addWeeks(prev, -1));
    }, []);

    const goToNextWeek = useCallback(() => {
        setCurrentDate(prev => addWeeks(prev, 1));
    }, []);

    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorMessage message={error} />;
        }
        if (data) {
            if (filteredData && filteredData.length > 0) {
                return <ScheduleTable weekDays={weekDays} scheduleData={filteredData} />;
            }
            const hasActiveFilters = selectedDesignations.length > 0 ||
                                     selectedNationalities.length > 0 ||
                                     selectedStoreNames.length > 0 ||
                                     selectedEmployeeNames.length > 0;

            if (data.length > 0 && hasActiveFilters) {
                return (
                    <div className="text-center py-10 px-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-300">No Matching Results</h3>
                        <p className="mt-1 text-sm text-gray-400 font-bold">No staff members found with the selected filters.</p>
                    </div>
                );
            }
            // Data is empty from the source
            return <ScheduleTable weekDays={weekDays} scheduleData={data} />;
        }
        // No data loaded yet, show instructions
        return <InfoPanel />;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           <h1 className="text-2xl font-bold text-gray-100">Weekly Schedule Viewer</h1>
                        </div>
                        <form onSubmit={handleUrlSubmit} className="w-full sm:w-auto flex items-center space-x-2">
                            <input
                                type="url"
                                value={sheetUrl}
                                onChange={(e) => setSheetUrl(e.target.value)}
                                placeholder="Paste your published Google Sheet URL"
                                className="w-full sm:w-80 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 font-bold"
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 whitespace-nowrap">
                                Load Data
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {submittedUrl ? (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 flex-shrink-0">{formatDateRange(weekStart)}</h2>
                            <div className="w-full md:w-auto flex-grow flex flex-col items-stretch md:items-end gap-4">
                                {data && data.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                        <MultiSelectFilter
                                            label="Employee Name"
                                            options={employeeNames}
                                            selectedOptions={selectedEmployeeNames}
                                            onChange={setSelectedEmployeeNames}
                                        />
                                        <MultiSelectFilter
                                            label="Store Name"
                                            options={storeNames}
                                            selectedOptions={selectedStoreNames}
                                            onChange={setSelectedStoreNames}
                                        />
                                        <MultiSelectFilter
                                            label="Designation"
                                            options={designations}
                                            selectedOptions={selectedDesignations}
                                            onChange={setSelectedDesignations}
                                        />
                                        <MultiSelectFilter
                                            label="Nationality"
                                            options={nationalities}
                                            selectedOptions={selectedNationalities}
                                            onChange={setSelectedNationalities}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={goToToday} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md text-sm font-bold hover:bg-gray-700 transition">Today</button>
                                        <button onClick={goToPreviousWeek} className="p-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition" aria-label="Previous week">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button onClick={goToNextWeek} className="p-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition" aria-label="Next week">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={refetch} className="p-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition" title="Refresh now" aria-label="Refresh data">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0114.65 12.45M20 20a14.95 14.95_0 01-14.65-12.45" /></svg>
                                        </button>
                                        {lastUpdated && !loading && (
                                            <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-md">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Auto-refreshing every 30 seconds"></div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap font-bold">
                                                    Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {renderContent()}
                    </div>
                ) : <InfoPanel /> }
            </main>
        </div>
    );
};

export default App;