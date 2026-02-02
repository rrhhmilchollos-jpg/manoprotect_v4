import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotificationSettings = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState('default');
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_BACKEND_URL;

  const checkSubscription = useCallback(async () => {
    try {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if already subscribed
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribeToNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Debes permitir las notificaciones para recibir alertas SOS');
        setIsLoading(false);
        return;
      }

      // Get VAPID public key
      const vapidResponse = await fetch(`${API}/api/push/vapid-key`);
      const { publicKey } = await vapidResponse.json();

      if (!publicKey) {
        setError('El servidor no tiene configuradas las notificaciones push');
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to backend
      const response = await fetch(`${API}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
          }
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        throw new Error('Error al guardar suscripción');
      }
    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Error al activar notificaciones: ' + err.message);
    }
    setIsLoading(false);
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Notify backend
        await fetch(`${API}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {}
          })
        });
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('Error al desactivar notificaciones');
    }
    setIsLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Notificaciones SOS</h3>
          <p className="text-sm text-gray-500">Recibe alertas cuando un familiar active el SOS</p>
        </div>
      </div>

      {!isSupported ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-700">
            Tu navegador no soporta notificaciones push. Usa Chrome, Firefox o Edge para esta función.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {permission === 'denied' && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded mb-4">
              <p className="text-orange-700">
                Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">
                {isSubscribed ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
              </p>
              <p className="text-sm text-gray-500">
                {isSubscribed 
                  ? 'Recibirás alertas inmediatas cuando un familiar active el SOS'
                  : 'Activa las notificaciones para no perderte ninguna emergencia'
                }
              </p>
            </div>
            <button
              onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
              disabled={isLoading || permission === 'denied'}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isSubscribed
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : isSubscribed ? (
                'Desactivar'
              ) : (
                'Activar notificaciones'
              )}
            </button>
          </div>

          {isSubscribed && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center text-green-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Recibirás notificaciones de:</span>
              </div>
              <ul className="mt-2 ml-7 text-sm text-green-600 space-y-1">
                <li>• Alertas SOS de familiares</li>
                <li>• Entrada/salida de zonas seguras</li>
                <li>• Actualizaciones de ubicación importantes</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PushNotificationSettings;
