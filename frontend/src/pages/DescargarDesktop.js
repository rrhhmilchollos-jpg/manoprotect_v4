import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function DescargarDesktop() {
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  return (
    <>
      <Helmet>
        <title>Descargar Software para Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="ManoProtect" className="h-10 w-10" />
              <span className="text-xl font-bold text-emerald-400">ManoProtect</span>
            </Link>
            <span className="text-sm text-slate-400">Portal de Empleados</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Software de Escritorio</h1>
            <p className="text-xl text-slate-300">
              Herramienta interna para empleados de ManoProtect
            </p>
          </div>

          {/* Download Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">ManoProtect Desktop</h2>
                <p className="text-slate-400 mb-4">Windows 10/11 (64-bit) • Versión 1.0.0</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">107 MB</span>
                  <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-sm text-emerald-400">Última versión</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="/ManoProtect-Desktop-Windows.zip"
                  download
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                  data-testid="download-desktop-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </a>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Instrucciones de Instalación
            </h3>
            <ol className="space-y-4 text-slate-300">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">1</span>
                <div>
                  <p className="font-medium text-white">Descargar el archivo ZIP</p>
                  <p className="text-sm text-slate-400">Haz clic en el botón "Descargar" de arriba</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">2</span>
                <div>
                  <p className="font-medium text-white">Extraer el contenido</p>
                  <p className="text-sm text-slate-400">Haz clic derecho en el ZIP → "Extraer todo" → Elige una carpeta</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">3</span>
                <div>
                  <p className="font-medium text-white">Ejecutar la aplicación</p>
                  <p className="text-sm text-slate-400">Abre la carpeta extraída → Doble clic en <code className="bg-slate-700 px-2 py-0.5 rounded">ManoProtect Desktop.exe</code></p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">4</span>
                <div>
                  <p className="font-medium text-white">Iniciar sesión</p>
                  <p className="text-sm text-slate-400">Usa tus credenciales de empleado proporcionadas por tu supervisor</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Windows Security Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-bold text-amber-400 mb-2">Aviso de Windows SmartScreen</h4>
                <p className="text-slate-300 text-sm mb-3">
                  Windows puede mostrar una advertencia porque la aplicación no está firmada digitalmente. 
                  Esto es normal para software interno.
                </p>
                <p className="text-slate-300 text-sm">
                  <strong>Para continuar:</strong> Haz clic en "Más información" → "Ejecutar de todos modos"
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Funcionalidades</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '📊', title: 'Dashboard', desc: 'Estadísticas en tiempo real' },
                { icon: '🛡️', title: 'Gestión de Amenazas', desc: 'Ver, asignar y resolver' },
                { icon: '👥', title: 'Clientes', desc: 'Administrar cuentas' },
                { icon: '🔍', title: 'Verificador de Estafas', desc: 'Analizar contenido sospechoso' },
                { icon: '🎫', title: 'Tickets', desc: 'Soporte al cliente' },
                { icon: '💬', title: 'Chat Interno', desc: 'Comunicación del equipo' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>STARTBOOKING SL • CIF: B19427723</p>
            <p className="mt-1">© 2024 ManoProtect - Software interno - No distribuir</p>
          </div>
        </main>
      </div>
    </>
  );
}
