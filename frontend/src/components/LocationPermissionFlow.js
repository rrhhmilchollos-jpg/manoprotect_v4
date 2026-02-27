/**
 * ManoProtect - Location Permission Request Component
 * Guía al usuario para activar ubicación en segundo plano
 * Android: Ajustes > Permitir todo el tiempo > Desactivar batería
 * iOS: Ajustes > Siempre > Actualización en segundo plano
 */
import React, { useState, useEffect } from 'react';
import { MapPin, Shield, ArrowRight, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  requestLocationPermissions,
  checkLocationPermissionStatus,
  getBackgroundPermissionInstructions,
  startBackgroundTracking
} from '@/services/backgroundLocation';
import { Capacitor } from '@capacitor/core';

const LocationPermissionFlow = ({ userId, token, onComplete }) => {
  const [step, setStep] = useState('initial'); // initial, requesting, manual, granted, error
  const [instructions, setInstructions] = useState(null);
  const [permStatus, setPermStatus] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const status = await checkLocationPermissionStatus();
    setPermStatus(status);
    if (status.foreground === 'granted') {
      setStep('granted');
    }
  };

  const handleRequestPermission = async () => {
    setStep('requesting');
    const result = await requestLocationPermissions();

    if (!result.granted) {
      setStep('error');
      return;
    }

    if (result.needsManualBackground) {
      setInstructions(getBackgroundPermissionInstructions());
      setStep('manual');
      return;
    }

    // iOS: permiso concedido directamente
    await startBackgroundTracking(userId, token);
    setStep('granted');
    if (onComplete) onComplete(true);
  };

  const handleManualDone = async () => {
    // Verificar si el usuario activó el permiso
    await startBackgroundTracking(userId, token);
    setStep('granted');
    if (onComplete) onComplete(true);
  };

  const openSettings = () => {
    if (Capacitor.isNativePlatform()) {
      // En nativo, intentar abrir ajustes de la app
      try {
        window.open('app-settings:');
      } catch {
        // Fallback: instrucciones manuales
      }
    }
  };

  if (!Capacitor.isNativePlatform()) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md mx-auto" data-testid="location-permission-flow">
      {/* STEP: Initial */}
      {step === 'initial' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Activar ubicación en segundo plano</h3>
          <p className="text-sm text-gray-500 mb-6">
            Para que tu familia pueda localizarte en emergencias incluso con la app cerrada, necesitamos acceso a tu ubicación en segundo plano.
          </p>
          <Button onClick={handleRequestPermission} className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="btn-request-location">
            <Shield className="w-4 h-4 mr-2" />
            Activar protección GPS
          </Button>
          <p className="text-xs text-gray-400 mt-3">Tu ubicación solo se comparte con tus contactos de emergencia</p>
        </div>
      )}

      {/* STEP: Requesting */}
      {step === 'requesting' && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Solicitando permisos...</p>
        </div>
      )}

      {/* STEP: Manual (Android 11+) */}
      {step === 'manual' && instructions && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900">{instructions.title}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">{instructions.note}</p>
          <ol className="space-y-3 mb-6">
            {instructions.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-gray-700">{s}</span>
              </li>
            ))}
          </ol>
          <div className="space-y-2">
            <Button onClick={openSettings} variant="outline" className="w-full" data-testid="btn-open-settings">
              <Settings className="w-4 h-4 mr-2" />
              Abrir Ajustes
            </Button>
            <Button onClick={handleManualDone} className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="btn-manual-done">
              Ya lo he activado
              <ArrowRight className="w-4 h-4 ml-2" />
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
          <h3 className="text-lg font-bold text-gray-900 mb-2">Protección GPS activa</h3>
          <p className="text-sm text-gray-500">
            Tu familia puede localizarte en emergencias incluso con la app cerrada, la pantalla apagada o el teléfono bloqueado.
          </p>
        </div>
      )}

      {/* STEP: Error */}
      {step === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Permiso denegado</h3>
          <p className="text-sm text-gray-500 mb-4">
            Sin acceso a la ubicación, el botón SOS no podrá enviar tu posición en emergencias.
          </p>
          <Button onClick={handleRequestPermission} variant="outline" className="w-full" data-testid="btn-retry-location">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationPermissionFlow;
