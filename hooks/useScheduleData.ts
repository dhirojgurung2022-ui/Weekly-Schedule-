import { useState, useEffect, useCallback } from 'react';
import { ScheduleRow } from '../types';
import { parseFlexibleDate } from '../utils/dateUtils';

const parseCSV = (csvText: string): ScheduleRow[] => {
    const rows = csvText.trim().split('\n');
    if (rows.length < 2) return [];

    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = rows.slice(1).map(row => {
        // Basic CSV parsing, may not handle all edge cases like commas within quotes
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] ? values[index] : '';
            return obj;
        }, {} as ScheduleRow);
    });
    return data;
};


const convertGoogleSheetUrl = (url: string): string => {
    // Already a published or export URL
    if (url.includes('/pub?output=csv') || url.includes('/export?format=csv')) {
        return url;
    }
    
    // Match standard sheet URL: https://docs.google.com/spreadsheets/d/{ID}/edit...
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    
    if (match) {
        const sheetId = match[1];
        
        // Try to find the GID (grid ID) from the URL
        const gidMatch = url.match(/[#&?]gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : '0'; // Default to the first sheet if not specified
        
        // Construct the export URL. This works if the sheet is public ("anyone with link can view").
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }

    // Return original if no match
    return url;
};


export const useScheduleData = (url: string) => {
    const [data, setData] = useState<ScheduleRow[] | null>(null);
    const [sheetDate, setSheetDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async (isBackground = false) => {
        if (!url) {
            setData(null);
            setError(null);
            setSheetDate(null);
            return;
        }

        if (!isBackground) {
            setLoading(true);
        }
        setError(null);
        try {
            const fetchUrl = convertGoogleSheetUrl(url);

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                 if (response.status === 403) { // Forbidden
                     throw new Error(`Access Denied (Error 403). Please make sure your Google Sheet's sharing setting is 'Anyone with the link can view', or use the 'File > Share > Publish to web' option for the most reliable results.`);
                }
                throw new Error(`The server responded with status ${response.status}. Please ensure the URL is correct and the sheet is publicly accessible.`);
            }
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);

            let parsedSheetDate: Date | null = null;
            if (parsedData && parsedData.length > 0) {
                const headers = Object.keys(parsedData[0]);
                const dateHeaderKey = headers.find(h => h.toUpperCase().trim() === 'WEEK_START_DATE');

                if (dateHeaderKey) {
                    const dateString = parsedData[0][dateHeaderKey];
                    if (dateString) {
                       const d = parseFlexibleDate(dateString);
                       if (d && !isNaN(d.getTime())) {
                           parsedSheetDate = d;
                       }
                    }
                }
            }

            setData(parsedData);
            setSheetDate(parsedSheetDate);
            setLastUpdated(new Date());
        } catch (e) {
            const err = e as Error;
            let friendlyError = err.message || 'An unknown error occurred.';
            if (err instanceof TypeError) { // Often indicates a CORS or network issue
                 friendlyError = `Could not fetch data due to a network or CORS error. This can happen if the link is incorrect or blocked. For Google Sheets, the most reliable method is to use the 'File > Share > Publish to web' feature and provide the generated CSV link.`;
            }
            if (!isBackground) {
                setError(friendlyError);
                setData(null);
            } else {
                console.error("Background data refresh failed:", friendlyError);
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, [url]);

    useEffect(() => {
        if (url) {
            fetchData(false); // Initial fetch with loading indicator

            const intervalId = setInterval(() => {
                fetchData(true); // Background fetch every 30 seconds
            }, 30000);

            return () => clearInterval(intervalId); // Cleanup interval on unmount or URL change
        }
    }, [url, fetchData]);
    
    const manualRefetch = useCallback(() => {
        fetchData(false);
    }, [fetchData]);

    return { data, loading, error, refetch: manualRefetch, lastUpdated, sheetDate };
};