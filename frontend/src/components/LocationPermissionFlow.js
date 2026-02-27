/**
 * ManoProtect - Location Permission Flow (Completo)
 * Guía paso a paso para activar ubicación en segundo plano
 * Android: Permisos runtime → Background → Exclusión batería
 * iOS: Permisos "Siempre" → Background updates
 */
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Shield, ArrowRight, CheckCircle, AlertTriangle, Settings, Battery, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  requestLocationPermissions,
  checkLocationPermissionStatus,
  startBackgroundTracking,
  requestBatteryOptimizationExclusion,
  openLocationSettings,
  openBatterySettings,
  getPlatformInfo
} from '@/services/backgroundLocation';

const LocationPermissionFlow = ({ userId, token, onComplete }) => {
  const [step, setStep] = useState('initial');
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    const info = getPlatformInfo();
    setPlatform(info);
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    const status = await checkLocationPermissionStatus();
    if (status.foreground === 'granted' && status.background === 'granted') {
      setStep('granted');
    }
  };

  const handleRequestForeground = async () => {
    setStep('requesting');
    const result = await requestLocationPermissions();
    if (!result.granted) {
      setStep('denied');
      return;
    }
    if (result.needsManualBackground) {
      setStep('background_android');
    } else if (result.background) {
      setStep('battery');
    } else {
      setStep('background_ios');
    }
  };

  const handleBackgroundDone = async () => {
    if (platform?.isAndroid) {
      setStep('battery');
    } else {
      await activateTracking();
    }
  };

  const handleBatteryDone = async () => {
    await activateTracking();
  };

  const activateTracking = useCallback(async () => {
    setStep('activating');
    const success = await startBackgroundTracking(userId, token);
    if (success) {
      setStep('granted');
      if (onComplete) onComplete(true);
    } else {
      setStep('granted');
      if (onComplete) onComplete(true);
    }
  }, [userId, token, onComplete]);

  const isNative = platform?.isNative;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto overflow-hidden" data-testid="location-permission-flow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">Protección GPS en segundo plano</h3>
            <p className="text-blue-100 text-xs">Tu familia te localiza incluso con la app cerrada</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(platform?.isAndroid ? ['Ubicación', 'Segundo plano', 'Batería', 'Listo'] : ['Ubicación', 'Segundo plano', 'Listo']).map((label, i) => {
            const stepOrder = platform?.isAndroid
              ? ['initial', 'background_android', 'battery', 'granted']
              : ['initial', 'background_ios', 'granted'];
            const currentIdx = stepOrder.indexOf(step);
            const isActive = i <= Math.max(currentIdx, 0);
            return (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <span className={`text-[10px] ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                {i < (platform?.isAndroid ? 3 : 2) && <div className={`w-6 h-0.5 ${isActive ? 'bg-blue-300' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        {/* STEP: Initial */}
        {step === 'initial' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Activar localización de emergencia</h4>
            <p className="text-sm text-gray-500 mb-6">
              Para que tus familiares puedan localizarte en caso de emergencia, incluso con la app cerrada, pantalla apagada o teléfono bloqueado.
            </p>
            <Button onClick={handleRequestForeground} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" data-testid="btn-request-location">
              <Shield className="w-4 h-4 mr-2" /> Activar protección GPS
            </Button>
            <p className="text-xs text-gray-400 mt-3">Solo se comparte con tus contactos de emergencia</p>
          </div>
        )}

        {/* STEP: Requesting */}
        {step === 'requesting' && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Solicitando permisos de ubicación...</p>
          </div>
        )}

        {/* STEP: Activating tracking */}
        {step === 'activating' && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Activando seguimiento en segundo plano...</p>
          </div>
        )}

        {/* STEP: Android Background Permission */}
        {step === 'background_android' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-gray-900">Permitir ubicación en segundo plano</h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-700">
                En Android 11+, debes activar esto manualmente desde Ajustes para que funcione con la app cerrada.
              </p>
            </div>
            <ol className="space-y-3 mb-5">
              {[
                'Pulsa "Abrir Ajustes de ubicación" abajo',
                'Selecciona "Permisos" o "Ubicación"',
                'Elige "Permitir todo el tiempo"',
                'Vuelve a esta pantalla'
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700">{s}</span>
                </li>
              ))}
            </ol>
            <div className="space-y-2">
              <Button onClick={openLocationSettings} variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50" data-testid="btn-open-location-settings">
                <Settings className="w-4 h-4 mr-2" /> Abrir Ajustes de ubicación
              </Button>
              <Button onClick={handleBackgroundDone} className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="btn-background-done">
                Ya lo he activado <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP: iOS Background Permission */}
        {step === 'background_ios' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-gray-900">Permitir ubicación "Siempre"</h4>
            </div>
            <ol className="space-y-3 mb-5">
              {[
                'Abre Ajustes del iPhone',
                'Ve a Privacidad → Localización',
                'Busca ManoProtect',
                'Selecciona "Siempre"',
                'Activa "Actualización en segundo plano"'
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700">{s}</span>
                </li>
              ))}
            </ol>
            <div className="space-y-2">
              <Button onClick={openLocationSettings} variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50" data-testid="btn-open-ios-settings">
                <Settings className="w-4 h-4 mr-2" /> Abrir Ajustes
              </Button>
              <Button onClick={handleBackgroundDone} className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="btn-ios-background-done">
                Ya lo he activado <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Battery Optimization (Android) */}
        {step === 'battery' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Battery className="w-5 h-5 text-orange-500" />
              <h4 className="font-bold text-gray-900">Desactivar optimización de batería</h4>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-orange-700">
                Si Android optimiza la batería de ManoProtect, puede cerrar el seguimiento GPS en segundo plano. Desactívalo para garantizar la protección continua.
              </p>
            </div>
            <ol className="space-y-3 mb-5">
              {[
                'Pulsa "Abrir Ajustes de batería" abajo',
                'Busca ManoProtect en la lista',
                'Selecciona "Sin restricciones" o "No optimizar"',
                'Vuelve a esta pantalla'
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700">{s}</span>
                </li>
              ))}
            </ol>
            <div className="space-y-2">
              <Button onClick={requestBatteryOptimizationExclusion} variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50" data-testid="btn-open-battery-settings">
                <Battery className="w-4 h-4 mr-2" /> Abrir Ajustes de batería
              </Button>
              <Button onClick={openBatterySettings} variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50" data-testid="btn-open-battery-manual">
                <Settings className="w-4 h-4 mr-2" /> Abrir Ajustes manuales
              </Button>
              <Button onClick={handleBatteryDone} className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="btn-battery-done">
                Ya lo he desactivado <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Granted */}
        {step === 'granted' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Protección GPS activa</h4>
            <p className="text-sm text-gray-500 mb-4">
              Tu familia puede localizarte en emergencias incluso con la app cerrada, la pantalla apagada o el teléfono bloqueado.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: <MapPin className="w-4 h-4" />, label: 'App cerrada' },
                { icon: <Smartphone className="w-4 h-4" />, label: 'Pantalla apagada' },
                { icon: <Shield className="w-4 h-4" />, label: 'Bloqueado' },
              ].map((item, i) => (
                <div key={i} className="bg-green-50 rounded-lg p-2">
                  <div className="text-green-600 flex justify-center mb-1">{item.icon}</div>
                  <p className="text-[10px] text-green-700 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
            <Button onClick={checkCurrentStatus} variant="ghost" className="mt-4 text-xs text-gray-400" data-testid="btn-recheck-permissions">
              <RefreshCw className="w-3 h-3 mr-1" /> Verificar permisos
            </Button>
          </div>
        )}

        {/* STEP: Denied */}
        {step === 'denied' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Permiso denegado</h4>
            <p className="text-sm text-gray-500 mb-4">
              Sin acceso a la ubicación, el botón SOS no podrá enviar tu posición en emergencias.
            </p>
            <div className="space-y-2">
              <Button onClick={openLocationSettings} variant="outline" className="w-full" data-testid="btn-open-settings-denied">
                <Settings className="w-4 h-4 mr-2" /> Abrir Ajustes
              </Button>
              <Button onClick={handleRequestForeground} className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="btn-retry-location">
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      {!isNative && step === 'initial' && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            La ubicación en segundo plano solo funciona en la app nativa (Android/iOS). En el navegador web, solo funciona con la app abierta.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPermissionFlow;
