import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { Shield, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RecuperarPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, introduce tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSent(true);
        toast.success('Si el email existe, recibirás instrucciones para restablecer tu contraseña');
      } else {
        // Don't reveal if email exists or not for security
        setSent(true);
        toast.success('Si el email existe, recibirás instrucciones para restablecer tu contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ManoProtect</span>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-center">
              Te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Instrucciones'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  Email Enviado
                </h3>
                <p className="text-zinc-600 mb-6">
                  Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Volver al Login
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full text-zinc-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-8">
          © 2026 ManoProtect · Protección Digital
        </p>
      </div>
    </div>
  );
};

export default RecuperarPassword;
