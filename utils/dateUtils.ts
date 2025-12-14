// Returns the date for the Monday of the week containing the given date.
export const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
};

// Returns an array of 7 Date objects for the week starting from the given start date.
export const getWeekDays = (startDate: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
};

// Formats a date range for the week header. e.g., "October 28 - November 3, 2024"
export const formatDateRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startMonth = startDate.toLocaleString('default', { month: 'long' });
    const endMonth = endDate.toLocaleString('default', { month: 'long' });

    if (startMonth === endMonth) {
        return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
        return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
};

// Formats a single date for the table header. e.g., "Mon 28"
export const formatDayHeader = (date: Date): { day: string, date: number } => {
    return {
        day: date.toLocaleDateString('default', { weekday: 'short' }),
        date: date.getDate()
    };
};

export const getDayOfWeekIdentifier = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}

// Parses a date string from common formats like DD.MM.YYYY, MM/DD/YYYY, or YYYY-MM-DD.
export const parseFlexibleDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Try DD.MM.YYYY
    let parts = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (parts) {
        // new Date(year, monthIndex, day)
        return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
    }

    // Try MM/DD/YYYY
    parts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
        // new Date(year, monthIndex, day)
        return new Date(parseInt(parts[3]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    // Try YYYY-MM-DD and other JS-native formats
    const d = new Date(dateString);
    if (d && !isNaN(d.getTime())) {
        return d;
    }
    
    return null;
};
