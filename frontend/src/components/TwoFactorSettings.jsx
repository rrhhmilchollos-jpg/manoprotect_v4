/**
 * ManoProtect - Two-Factor Authentication Settings Component
 * Allows enterprise employees to enable/disable 2FA
 */
import { useState, useEffect } from 'react';
import { Shield, Check, X, Copy, Loader2, QrCode, Key, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const TwoFactorSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [step, setStep] = useState('status'); // 'status', 'setup', 'verify', 'backup', 'disable'
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/2fa/status`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/2fa/setup`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSetupData(data);
        setStep('setup');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al iniciar configuración');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Introduce el código de 6 dígitos');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/2fa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verification_code: verificationCode })
      });

      const data = await res.json();

      if (res.ok) {
        setBackupCodes(data.backup_codes);
        setStep('backup');
        toast.success('2FA activado correctamente');
      } else {
        toast.error(data.detail || 'Código inválido');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast.error('Introduce el código de 6 dígitos');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: disableCode })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('2FA desactivado');
        setStep('status');
        setStatus({ enabled: false });
        setDisableCode('');
      } else {
        toast.error(data.detail || 'Código inválido');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const finishSetup = () => {
    setStep('status');
    setSetupData(null);
    setBackupCodes(null);
    setVerificationCode('');
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Status view
  if (step === 'status') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            Autenticación de Dos Factores (2FA)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.enabled ? 'bg-emerald-500/20' : 'bg-slate-600'}`}>
                {status?.enabled ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <X className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  Estado: {status?.enabled ? 'Activado' : 'Desactivado'}
                </p>
                {status?.enabled && status?.enabled_at && (
                  <p className="text-xs text-slate-400">
                    Activado el {new Date(status.enabled_at).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
            <Badge className={status?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-300'}>
              {status?.enabled ? 'Protegido' : 'Sin protección'}
            </Badge>
          </div>

          {status?.enabled ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Códigos de respaldo restantes: <span className="text-white font-medium">{status.backup_codes_remaining || 0}</span>
              </p>
              <Button
                onClick={() => setStep('disable')}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Desactivar 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Recomendamos activar 2FA para proteger tu cuenta de accesos no autorizados.
              </p>
              <Button
                onClick={startSetup}
                disabled={processing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Activar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Setup view with QR code
  if (step === 'setup' && setupData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <QrCode className="w-5 h-5" />
            Configurar Autenticador
          </CardTitle>
          <CardDescription className="text-slate-400">
            Escanea el código QR con Google Authenticator o Microsoft Authenticator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img src={setupData.qr_code} alt="QR Code" className="w-48 h-48" />
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <p className="text-sm text-slate-400">O introduce esta clave manualmente:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-slate-700 rounded text-sm text-white font-mono break-all">
                {setupData.manual_entry_key}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(setupData.manual_entry_key)}
                className="border-slate-600"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <p className="text-sm text-white font-medium">
              Introduce el código de 6 dígitos de tu app:
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
              />
              <Button
                onClick={enableTwoFactor}
                disabled={processing || verificationCode.length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => { setStep('status'); setSetupData(null); }}
            className="text-slate-400"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Backup codes view
  if (step === 'backup' && backupCodes) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="w-5 h-5" />
            Códigos de Respaldo
          </CardTitle>
          <CardDescription className="text-slate-400">
            Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu app autenticadora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-400">
              <strong>Importante:</strong> Estos códigos solo se mostrarán una vez. Guárdalos ahora.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="bg-slate-700 rounded p-3 text-center font-mono text-white text-lg"
              >
                {code}
              </div>
            ))}
          </div>

          <Button
            onClick={() => copyToClipboard(backupCodes.join('\n'))}
            variant="outline"
            className="w-full border-slate-600 text-slate-300"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar todos los códigos
          </Button>

          <Button
            onClick={finishSetup}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            He guardado los códigos
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Disable view
  if (step === 'disable') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Desactivar 2FA
          </CardTitle>
          <CardDescription className="text-slate-400">
            Introduce el código de tu app autenticadora para confirmar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">
              Al desactivar 2FA, tu cuenta será menos segura. Solo hazlo si es absolutamente necesario.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
            />
            <Button
              onClick={disableTwoFactor}
              disabled={processing || disableCode.length !== 6}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desactivar'}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => { setStep('status'); setDisableCode(''); }}
            className="text-slate-400"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TwoFactorSettings;
