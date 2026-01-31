import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function DescargarApps() {
  const downloads = [
    {
      id: 'android',
      title: 'Android (Google Play)',
      description: 'Proyecto Capacitor + Guía para publicar en Google Play Store',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.523 15.341l-.002-.001-5.481-3.164-5.481 3.164-.002.001 5.483 3.166 5.483-3.166zm-5.483-9.682L6.557 8.823l5.483 3.166 5.483-3.166-5.483-3.164zM3 6.77v10.46l5.481-3.164V9.934L3 6.77zm18 0l-5.481 3.164v4.132L21 17.23V6.77z"/>
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      files: [
        { name: 'Guía Google Play', url: '/GUIA_GOOGLE_PLAY.md', size: '5 KB' },
      ],
      steps: [
        'Hacer Redeploy en Emergent',
        'Ir a pwabuilder.com',
        'Ingresar manoprotect.com',
        'Generar paquete Android',
        'Subir AAB a Google Play Console'
      ]
    },
    {
      id: 'ios',
      title: 'iOS (App Store)',
      description: 'Proyecto Xcode completo con iconos y configuración',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      color: 'from-slate-600 to-slate-700',
      files: [
        { name: 'Proyecto iOS (Xcode)', url: '/ManoProtect-iOS-Project.zip', size: '117 MB' },
        { name: 'Guía App Store', url: '/GUIA_APP_STORE_IOS.md', size: '6 KB' },
      ],
      steps: [
        'Descargar proyecto iOS',
        'Abrir en Xcode (requiere Mac)',
        'Configurar Team de Apple Developer',
        'Archive y subir a App Store Connect'
      ]
    },
    {
      id: 'desktop',
      title: 'Windows Desktop',
      description: 'Aplicación Electron para empleados internos',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      files: [
        { name: 'ManoProtect Desktop.exe', url: '/ManoProtect-Desktop-Windows.zip', size: '107 MB' },
      ],
      steps: [
        'Descargar ZIP',
        'Extraer contenido',
        'Ejecutar ManoProtect Desktop.exe',
        'Iniciar sesión con credenciales de empleado'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Descargas para Desarrolladores - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="ManoProtect" className="h-10 w-10" />
              <span className="text-xl font-bold text-emerald-400">ManoProtect</span>
            </Link>
            <span className="text-sm text-slate-400">Portal de Desarrolladores</span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Descargas y Recursos</h1>
            <p className="text-xl text-slate-300">
              Todo lo necesario para publicar ManoProtect en las tiendas de apps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {downloads.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <div>
                      <h2 className="text-xl font-bold">{item.title}</h2>
                      <p className="text-sm opacity-90">{item.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold mb-3 text-slate-300">Archivos</h3>
                  <div className="space-y-2 mb-6">
                    {item.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url}
                        download={file.url.endsWith('.zip')}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                        data-testid={`download-${item.id}-${i}`}
                      >
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-slate-400">{file.size}</span>
                      </a>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold mb-3 text-slate-300">Pasos</h3>
                  <ol className="space-y-2">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-400">
                        <span className="flex-shrink-0 w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Importante
            </h3>
            <ul className="text-slate-300 text-sm space-y-2">
              <li>• <strong>Android</strong>: Requiere cuenta de Google Play Console ($25 USD único)</li>
              <li>• <strong>iOS</strong>: Requiere Mac con Xcode y cuenta Apple Developer ($99 USD/año)</li>
              <li>• <strong>PWA Builder</strong>: Necesita que los assets PWA estén en producción (hacer Redeploy primero)</li>
            </ul>
          </div>

          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>STARTBOOKING SL • CIF: B19427723</p>
            <p className="mt-1">© 2024 ManoProtect - Documentación interna</p>
          </div>
        </main>
      </div>
    </>
  );
}
