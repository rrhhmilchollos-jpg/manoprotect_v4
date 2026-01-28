import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, User, Shield, CheckCircle, XCircle, Loader2, Settings, RefreshCw, Camera } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// KYC Video Verification Component for Customers
const KYCVideoVerification = ({ 
  requestId, 
  customerName, 
  customerDni, 
  customerPhone,
  onVerificationComplete,
  onCancel 
}) => {
  const [step, setStep] = useState('intro'); // intro, permissions, waiting, connected, completed, failed
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [agentJoined, setAgentJoined] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({ camera: 'unknown', microphone: 'unknown' });
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const streamRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Check current permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if (navigator.permissions) {
        const [cameraPermission, micPermission] = await Promise.all([
          navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'unknown' })),
          navigator.permissions.query({ name: 'microphone' }).catch(() => ({ state: 'unknown' }))
        ]);
        setPermissionStatus({
          camera: cameraPermission.state,
          microphone: micPermission.state
        });
      }
    } catch (err) {
      console.log('Permission API not fully supported');
    }
  };

  // Request permissions with better UX
  const requestMediaPermissions = async () => {
    setIsLoading(true);
    setError(null);
    setShowPermissionHelp(false);
    
    try {
      // First, try to get permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      // Store stream reference
      streamRef.current = stream;
      
      // Show local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setCameraEnabled(true);
      setMicEnabled(true);
      setStep('permissions');
      
      // Update permission status
      setPermissionStatus({ camera: 'granted', microphone: 'granted' });
      
    } catch (err) {
      console.error('Media permission error:', err);
      setShowPermissionHelp(true);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Para continuar, necesita permitir el acceso a la cámara y micrófono.');
        setPermissionStatus({ camera: 'denied', microphone: 'denied' });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No se detectó cámara o micrófono en su dispositivo. Por favor, conecte uno y vuelva a intentarlo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('La cámara o micrófono están siendo usados por otra aplicación. Cierre otras apps y vuelva a intentarlo.');
      } else if (err.name === 'OverconstrainedError') {
        // Try again with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = basicStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = basicStream;
          }
          setCameraEnabled(true);
          setMicEnabled(true);
          setStep('permissions');
          setPermissionStatus({ camera: 'granted', microphone: 'granted' });
          return;
        } catch (retryErr) {
          setError('Error al acceder a la cámara. Por favor, intente con otro navegador.');
        }
      } else {
        setError('Error inesperado al acceder a la cámara y micrófono. Intente recargar la página.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Proceed to KYC session after permissions granted
  const proceedToSession = async () => {
    setIsLoading(true);
    try {
      await initializeKYCSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check media permissions
  const retryPermissions = () => {
    setError(null);
    setShowPermissionHelp(false);
    requestMediaPermissions();
  };

  // Initialize KYC session with backend
  const initializeKYCSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/kyc/customer/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          customer_name: customerName,
          customer_dni: customerDni,
          customer_phone: customerPhone
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al iniciar la verificación');
      }

      const data = await response.json();
      setSessionData(data);
      setStep('waiting');
      
      // Mark customer as joined
      await fetch(`${API_URL}/api/kyc/customer/joined/${data.session_id}`, {
        method: 'POST'
      });
      
      // Start polling for agent
      startPolling(data.session_id);
      
      // Initialize Zoom Video SDK
      await initializeZoomSDK(data);
      
    } catch (err) {
      console.error('Session init error:', err);
      setError(err.message);
      setStep('failed');
    }
  };

  // Initialize Zoom Video SDK
  const initializeZoomSDK = async (session) => {
    try {
      // Dynamic import of Zoom SDK
      const ZoomVideo = (await import('@zoom/videosdk')).default;
      
      const client = ZoomVideo.createClient();
      clientRef.current = client;
      
      // Initialize client
      await client.init('es-ES', 'Global', { patchJsMedia: true });
      
      // Set up event listeners
      client.on('peer-video-state-change', handlePeerVideoChange);
      client.on('connection-change', handleConnectionChange);
      client.on('user-added', handleUserAdded);
      client.on('user-removed', handleUserRemoved);
      
      // Join session
      await client.join(session.session_name, session.customer_token, customerName);
      
      // Get media stream
      const stream = client.getMediaStream();
      streamRef.current = stream;
      
      // Start local video and audio
      await stream.startAudio();
      await stream.startVideo({ videoElement: localVideoRef.current });
      
      console.log('Zoom SDK initialized and joined session');
      
    } catch (err) {
      console.error('Zoom SDK error:', err);
      // Fallback - continue without Zoom (for testing or if SDK fails)
      console.log('Continuing with local preview only');
    }
  };

  // Handle peer video changes
  const handlePeerVideoChange = useCallback((payload) => {
    console.log('Peer video change:', payload);
    if (payload.action === 'Start' && remoteVideoRef.current && streamRef.current) {
      // Agent started video
      setAgentJoined(true);
      setStep('connected');
    }
  }, []);

  // Handle connection changes
  const handleConnectionChange = useCallback((payload) => {
    console.log('Connection change:', payload);
    if (payload.state === 'Closed' || payload.state === 'Fail') {
      if (step !== 'completed') {
        setStep('failed');
        setError('La conexión se ha perdido. Por favor, intente de nuevo.');
      }
    }
  }, [step]);

  // Handle user added (agent joined)
  const handleUserAdded = useCallback((payload) => {
    console.log('User added:', payload);
    setAgentJoined(true);
    setStep('connected');
  }, []);

  // Handle user removed (agent left)
  const handleUserRemoved = useCallback((payload) => {
    console.log('User removed:', payload);
  }, []);

  // Start polling for session status
  const startPolling = (sessionId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/kyc/customer/session-status/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.agent_joined && !agentJoined) {
            setAgentJoined(true);
            setStep('connected');
          }
          
          if (data.verification_result) {
            setVerificationResult(data.verification_result);
            setStep('completed');
            clearInterval(pollIntervalRef.current);
          }
          
          if (data.status === 'completed' || data.status === 'failed') {
            setStep(data.status);
            clearInterval(pollIntervalRef.current);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (streamRef.current) {
      if (cameraEnabled) {
        await streamRef.current.stopVideo();
        setCameraEnabled(false);
      } else {
        await streamRef.current.startVideo({ videoElement: localVideoRef.current });
        setCameraEnabled(true);
      }
    }
  };

  // Toggle microphone
  const toggleMic = async () => {
    if (streamRef.current) {
      if (micEnabled) {
        await streamRef.current.muteAudio();
        setMicEnabled(false);
      } else {
        await streamRef.current.unmuteAudio();
        setMicEnabled(true);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
      // Stop local media tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle verification complete
  useEffect(() => {
    if (step === 'completed' && verificationResult) {
      setTimeout(() => {
        if (onVerificationComplete) {
          onVerificationComplete(verificationResult);
        }
      }, 3000);
    }
  }, [step, verificationResult, onVerificationComplete]);

  // Render based on step
  if (step === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Verificación de Identidad por Videollamada</CardTitle>
          <p className="text-slate-400 mt-2">
            Para completar la apertura de su cuenta, necesitamos verificar su identidad mediante una videollamada con un agente de ManoBank.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              ¿Qué necesita?
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Cámara frontal funcionando
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Micrófono habilitado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Su DNI/NIE/Pasaporte original
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Buena iluminación
              </li>
            </ul>
          </div>

          {/* Permission Status Indicators */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Estado de Permisos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                permissionStatus.camera === 'granted' ? 'bg-green-900/30 border border-green-500' :
                permissionStatus.camera === 'denied' ? 'bg-red-900/30 border border-red-500' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                <Video className={`w-5 h-5 ${
                  permissionStatus.camera === 'granted' ? 'text-green-400' :
                  permissionStatus.camera === 'denied' ? 'text-red-400' :
                  'text-slate-400'
                }`} />
                <span className="text-sm">
                  {permissionStatus.camera === 'granted' ? 'Cámara lista' :
                   permissionStatus.camera === 'denied' ? 'Cámara bloqueada' :
                   'Cámara pendiente'}
                </span>
              </div>
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                permissionStatus.microphone === 'granted' ? 'bg-green-900/30 border border-green-500' :
                permissionStatus.microphone === 'denied' ? 'bg-red-900/30 border border-red-500' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                <Mic className={`w-5 h-5 ${
                  permissionStatus.microphone === 'granted' ? 'text-green-400' :
                  permissionStatus.microphone === 'denied' ? 'text-red-400' :
                  'text-slate-400'
                }`} />
                <span className="text-sm">
                  {permissionStatus.microphone === 'granted' ? 'Micrófono listo' :
                   permissionStatus.microphone === 'denied' ? 'Micrófono bloqueado' :
                   'Micrófono pendiente'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {showPermissionHelp && (
            <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-amber-300 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                ¿Cómo activar permisos?
              </h4>
              <div className="text-sm text-amber-200 space-y-2">
                <p><strong>En Chrome/Edge:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Haga clic en el icono de candado 🔒 en la barra de direcciones</li>
                  <li>Busque "Cámara" y "Micrófono"</li>
                  <li>Cambie a "Permitir"</li>
                  <li>Recargue la página</li>
                </ol>
                <p className="mt-2"><strong>En Safari:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Safari → Preferencias → Sitios web</li>
                  <li>Seleccione Cámara y Micrófono</li>
                  <li>Permita este sitio</li>
                </ol>
                <p className="mt-2"><strong>En móvil:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ajustes → Aplicaciones → Navegador</li>
                  <li>Permisos → Activar Cámara y Micrófono</li>
                </ol>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={requestMediaPermissions}
              disabled={isLoading}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              data-testid="start-kyc-verification-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Activando cámara y micrófono...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Activar Cámara y Micrófono
                </>
              )}
            </Button>
            
            {showPermissionHelp && (
              <Button 
                onClick={retryPermissions}
                variant="outline" 
                className="w-full border-amber-500 text-amber-300 hover:bg-amber-900/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar después de activar permisos
              </Button>
            )}
            
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                data-testid="cancel-kyc-btn"
              >
                Cancelar
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Al continuar, acepta que se grabe la videollamada para fines de verificación y cumplimiento normativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'permissions') {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">¡Cámara y Micrófono Activados!</CardTitle>
          <p className="text-slate-400 mt-2">
            Sus dispositivos están listos. Verifique que se ve correctamente en la vista previa.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-green-500">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" />
                Cámara activa
              </div>
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Micrófono activo
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Antes de continuar, verifique:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>✓ Su rostro se ve claramente en la imagen</li>
              <li>✓ La iluminación es adecuada</li>
              <li>✓ Tiene su documento de identidad a mano</li>
            </ul>
          </div>

          <Button 
            onClick={proceedToSession}
            disabled={isLoading}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            data-testid="proceed-to-session-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Conectando con un agente...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Iniciar Videollamada con Agente
              </>
            )}
          </Button>

          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'waiting') {
    return (
      <Card className="max-w-4xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Local Video Preview */}
            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-sm">
                  Usted
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-3 mt-4">
                <Button
                  size="sm"
                  variant={cameraEnabled ? "default" : "destructive"}
                  onClick={toggleCamera}
                  data-testid="toggle-camera-btn"
                >
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant={micEnabled ? "default" : "destructive"}
                  onClick={toggleMic}
                  data-testid="toggle-mic-btn"
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Waiting Status */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-xl font-semibold">Esperando a un agente...</h3>
              <p className="text-slate-400">
                Un agente de ManoBank se conectará en breve para verificar su identidad.
              </p>
              <div className="bg-slate-800 rounded-lg p-4 w-full">
                <p className="text-sm text-slate-400">Tenga preparado:</p>
                <p className="font-medium mt-1">DNI/NIE/Pasaporte original</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'connected') {
    return (
      <Card className="max-w-5xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Remote Video (Agent) - Large */}
            <div className="md:col-span-2 relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  ref={remoteVideoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Agente ManoBank
                </div>
                <div className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  En vivo
                </div>
              </div>
            </div>

            {/* Local Video Preview - Small */}
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
                    Usted
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant={cameraEnabled ? "default" : "destructive"}
                  onClick={toggleCamera}
                  data-testid="toggle-camera-btn"
                >
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant={micEnabled ? "default" : "destructive"}
                  onClick={toggleMic}
                  data-testid="toggle-mic-btn"
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-300">Instrucciones:</p>
                <ul className="text-slate-300 text-xs mt-2 space-y-1">
                  <li>• Muestre su documento de identidad</li>
                  <li>• Siga las instrucciones del agente</li>
                  <li>• Mantenga buena iluminación</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'completed') {
    const isApproved = verificationResult?.status === 'approved';
    
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-8 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isApproved ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isApproved ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {isApproved ? '¡Verificación Completada!' : 'Verificación No Aprobada'}
          </h2>
          
          <p className="text-slate-400 mb-6">
            {isApproved 
              ? 'Su identidad ha sido verificada correctamente. Su cuenta está siendo activada.'
              : verificationResult?.rejection_reason || 'La verificación no pudo ser completada. Por favor, contacte con nosotros.'}
          </p>

          {isApproved && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-300">
                Recibirá un email con los datos de acceso a su nueva cuenta ManoBank.
              </p>
            </div>
          )}

          <Button 
            onClick={() => onVerificationComplete && onVerificationComplete(verificationResult)}
            className={isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}
            data-testid="verification-complete-btn"
          >
            {isApproved ? 'Continuar' : 'Cerrar'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'failed') {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Error en la Verificación</h2>
          
          <p className="text-slate-400 mb-6">
            {error || 'Ha ocurrido un error durante la videoverificación. Por favor, intente de nuevo.'}
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                setError(null);
                setStep('permissions');
              }}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="retry-kyc-btn"
            >
              Intentar de Nuevo
            </Button>
            
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default KYCVideoVerification;
