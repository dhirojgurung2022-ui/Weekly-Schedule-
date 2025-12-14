import React from 'react';
import { ScheduleRow } from '../types';
import { formatDayHeader, getDayOfWeekIdentifier } from '../utils/dateUtils';

interface ScheduleTableProps {
    weekDays: Date[];
    scheduleData: ScheduleRow[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ weekDays, scheduleData }) => {

    if (!scheduleData || scheduleData.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-bold text-gray-300">No schedule data found.</h3>
                <p className="mt-1 text-sm text-gray-400 font-bold">The Google Sheet might be empty or formatted incorrectly. Please ensure it has a header row.</p>
            </div>
        );
    }

    const headers = Object.keys(scheduleData[0] || {}).filter(
        header => header.toUpperCase().trim() !== 'WEEK_START_DATE'
    );
    const dayOfWeekIdentifiers = weekDays.map(getDayOfWeekIdentifier);

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        {headers.map((header, index) => {
                             const isDayColumn = dayOfWeekIdentifiers.includes(header.toLowerCase());
                             const dayIndex = dayOfWeekIdentifiers.indexOf(header.toLowerCase());

                             if (isDayColumn && weekDays[dayIndex]) {
                                const { day, date } = formatDayHeader(weekDays[dayIndex]);
                                return (
                                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                                        <div className="flex flex-col items-start">
                                            <span>{day}</span>
                                            <span className="text-lg font-bold">{date}</span>
                                        </div>
                                    </th>
                                );
                             }
                             
                             return (
                                <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider ${index === 0 ? 'sticky left-0 bg-gray-700 z-10' : ''}`}>
                                    {header.replace(/_/g, ' ')}
                                </th>
                             );
                        })}
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {scheduleData.map((row, rowIndex) => {
                        const isStoreManager = row['DESIGNATION']?.toLowerCase().includes('store manager');
                        const rowClasses = `transition-colors duration-200 ${isStoreManager ? 'bg-green-900/50 hover:bg-green-800/60' : 'hover:bg-gray-700'}`;
                        const stickyCellClasses = `sticky left-0 z-10 font-bold text-gray-100 ${isStoreManager ? 'bg-green-900/50 group-hover:bg-green-800/60' : 'bg-gray-800 group-hover:bg-gray-700'}`;

                        return (
                            <tr key={rowIndex} className={`${rowClasses} group`}>
                                {headers.map((header, colIndex) => (
                                    <td key={`${rowIndex}-${header}`} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-bold ${colIndex === 0 ? stickyCellClasses : ''}`}>
                                        {row[header]}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleTable;