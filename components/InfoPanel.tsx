import React from 'react';

const InfoPanel: React.FC = () => {
    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-100">Welcome to the Schedule Viewer!</h2>
                    <p className="mt-2 text-gray-300 font-bold">To get started, you need to publish your Google Sheet to the web as a CSV file.</p>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-200">Instructions:</h3>
                        <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-400 font-bold">
                            <li>Open your Google Sheet.</li>
                            <li>Go to <span className="font-bold text-gray-200">File &gt; Share &gt; Publish to web</span>.</li>
                            <li>In the dialog, select the specific sheet you want to display.</li>
                            <li>In the dropdown, choose <span className="font-bold text-gray-200">Comma-separated values (.csv)</span>.</li>
                            <li>Click the <span className="font-bold text-green-400">Publish</span> button.</li>
                            <li>Copy the generated URL and paste it into the input field at the top of this page.</li>
                        </ol>
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/40 border-l-4 border-blue-500">
                         <h4 className="font-bold text-blue-300">Pro Tip: Automatic Date Syncing</h4>
                         <p className="mt-1 text-sm text-blue-300/90 font-bold">To have the calendar automatically jump to the correct week, add a column to your sheet named <code className="bg-gray-900/50 px-1 py-0.5 rounded font-bold">WEEK_START_DATE</code>. Fill this column with the starting date of that week's schedule (e.g., <code className="bg-gray-900/50 px-1 py-0.5 rounded font-bold">2024-06-24</code> or <code className="bg-gray-900/50 px-1 py-0.5 rounded font-bold">24.06.2024</code>).</p>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-900/50 border-l-4 border-yellow-500">
                        <p className="text-sm text-yellow-300 font-bold"><span className="font-bold">Important:</span> Any changes you make to your Google Sheet will be automatically reflected here when you reload the data. Only the data from the sheet is published, not your account information.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPanel;