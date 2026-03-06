import { useState, useEffect } from 'react';
import { API } from '@/utils/apiBase';
import { RefreshCw, X, Download } from 'lucide-react';

const gFetch = async (path, opts = {}) => {
  const token = localStorage.getItem('gestion_token');
  const res = await fetch(`${API}/gestion${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  if (!res.ok) return null;
  return res.json();
};

export default function UpdateChecker({ appName = 'comerciales', currentVersion = '1.0.0' }) {
  const [update, setUpdate] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/gestion/app-versions/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_name: appName, current_version: currentVersion }),
        });
        const data = await res.json();
        if (data.update_available) setUpdate(data);
      } catch {}
    };
    check();
    const interval = setInterval(check, 300000); // Check every 5 min
    return () => clearInterval(interval);
  }, [appName, currentVersion]);

  if (!update || dismissed) return null;

  return (
    <div className={`mx-3 mt-3 p-3 rounded-xl border ${update.force_update ? 'bg-red-500/10 border-red-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`} data-testid="update-banner">
      <div className="flex items-start gap-2">
        <RefreshCw className={`w-4 h-4 mt-0.5 shrink-0 ${update.force_update ? 'text-red-400' : 'text-indigo-400'}`} />
        <div className="flex-1">
          <p className="text-xs font-medium text-white">
            {update.force_update ? 'Actualización obligatoria' : 'Nueva versión disponible'}: v{update.latest_version}
          </p>
          {update.release_notes && <p className="text-[10px] text-slate-400 mt-0.5">{update.release_notes}</p>}
          {update.download_url && (
            <a href={update.download_url} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1.5">
              <Download className="w-3 h-3" />Descargar
            </a>
          )}
        </div>
        {!update.force_update && (
          <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        )}
      </div>
    </div>
  );
}
