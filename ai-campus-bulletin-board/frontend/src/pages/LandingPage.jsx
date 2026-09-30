import { useEffect, useState } from 'react';
import api from '../services/api';

function LandingPage() {
  const [status, setStatus] = useState('checking...');
  const [dbStatus, setDbStatus] = useState('checking...');

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setStatus('Backend connected');
        setDbStatus(res.data.database);
      })
      .catch(() => {
        setStatus('Backend NOT reachable');
        setDbStatus('unknown');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          AI Campus Bulletin Board
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Phase 2 — Setup Verification
        </p>

        <div className="space-y-2 text-left">
          <p className="text-sm">
            <span className="font-medium">API Status:</span> {status}
          </p>

          <p className="text-sm">
            <span className="font-medium">Database Status:</span> {dbStatus}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;