import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Shield, AlertTriangle, Users, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const RealTimeMetrics = ({ compact = false }) => {
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const eventSourceRef = useRef(null);

  const connectToStream = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource(`${API}/metrics/stream`, {
      withCredentials: true
    });

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(data);
        setLastUpdate(new Date());
        setConnected(true);
      } catch (error) {
        console.error('Error parsing metrics:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setConnected(false);
      
      // Attempt reconnection after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          connectToStream();
        }
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, []);

  useEffect(() => {
    connectToStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectToStream]);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs text-zinc-400">
            {connected ? 'En vivo' : 'Desconectado'}
          </span>
        </div>
        
        {metrics && (
          <>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-white">
                {metrics.user_metrics?.total_analyzed || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-white">
                {metrics.user_metrics?.threats_blocked || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-white">
                {metrics.user_metrics?.protection_rate || 100}%
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700" data-testid="realtime-metrics">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Activity className="w-5 h-5 text-indigo-500" />
            Métricas en Tiempo Real
          </CardTitle>
          <div className="flex items-center gap-2">
            {connected ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Wifi className="w-3 h-3 mr-1 animate-pulse" />
                En Vivo
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <WifiOff className="w-3 h-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-zinc-500">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* User Metrics */}
            <div className="bg-zinc-700/50 rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {metrics.user_metrics?.total_analyzed || 0}
              </div>
              <div className="text-xs text-zinc-400">Analizados</div>
            </div>
            
            <div className="bg-zinc-700/50 rounded-lg p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {metrics.user_metrics?.threats_blocked || 0}
              </div>
              <div className="text-xs text-zinc-400">Bloqueadas</div>
            </div>
            
            <div className="bg-zinc-700/50 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {metrics.user_metrics?.protection_rate || 100}%
              </div>
              <div className="text-xs text-zinc-400">Protección</div>
            </div>
            
            <div className="bg-zinc-700/50 rounded-lg p-4 text-center">
              <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {metrics.user_metrics?.recent_hour || 0}
              </div>
              <div className="text-xs text-zinc-400">Última Hora</div>
            </div>

            {/* Global Metrics */}
            <div className="col-span-2 md:col-span-4 mt-4 pt-4 border-t border-zinc-700">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Estadísticas Globales</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-400">
                    {metrics.global_metrics?.threats_today || 0}
                  </div>
                  <div className="text-xs text-zinc-500">Amenazas Hoy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {metrics.global_metrics?.active_users || 0}
                  </div>
                  <div className="text-xs text-zinc-500">Usuarios Activos</div>
                </div>
                <div className="text-center">
                  <Badge className={`${
                    metrics.global_metrics?.system_status === 'operational' 
                      ? 'bg-emerald-500' 
                      : 'bg-amber-500'
                  }`}>
                    {metrics.global_metrics?.system_status === 'operational' 
                      ? 'Operativo' 
                      : 'Mantenimiento'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
            <p>Conectando al servidor...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMetrics;
