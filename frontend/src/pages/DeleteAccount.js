import React from 'react';

const DeleteAccount = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Eliminar Cuenta - ManoProtect</h1>
          <p className="text-gray-600">Información sobre la eliminación de tu cuenta y datos personales</p>
        </div>

        {/* Warning Card */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Proceso de Eliminación Manual</h3>
              <p className="mt-1 text-sm text-amber-700">
                Por motivos de seguridad, la eliminación de cuentas se realiza <strong>únicamente de forma manual</strong> por nuestro equipo de soporte técnico.
              </p>
            </div>
          </div>
        </div>

        {/* Info Card - What gets deleted */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">¿Qué datos se eliminarán?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Datos personales:</strong> Nombre, email, teléfono, foto de perfil</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Contactos de emergencia:</strong> Todos los contactos guardados</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Historial de ubicación:</strong> Todas las ubicaciones guardadas</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Alertas SOS:</strong> Historial de emergencias</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Configuración familiar:</strong> Grupos y miembros vinculados</span>
            </li>
          </ul>
        </div>

        {/* Info Card - What is retained */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">¿Qué datos se conservan?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Registros de transacciones:</strong> Se conservan por 7 años por requisitos legales y fiscales</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600"><strong>Logs de seguridad:</strong> Se conservan por 90 días para prevención de fraude</span>
            </li>
          </ul>
        </div>

        {/* How to Request Deletion */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">¿Cómo solicitar la eliminación?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
              <div>
                <p className="text-gray-700 font-medium">Contacta con nuestro equipo de soporte</p>
                <p className="text-gray-500 text-sm">Envía un email a soporte@manoprotect.com indicando tu deseo de eliminar la cuenta</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
              <div>
                <p className="text-gray-700 font-medium">Verificación de identidad</p>
                <p className="text-gray-500 text-sm">Te solicitaremos información para verificar que eres el titular de la cuenta</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
              <div>
                <p className="text-gray-700 font-medium">Procesamiento de la solicitud</p>
                <p className="text-gray-500 text-sm">Nuestro equipo procesará tu solicitud en un plazo máximo de 30 días</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">✓</div>
              <div>
                <p className="text-gray-700 font-medium">Confirmación</p>
                <p className="text-gray-500 text-sm">Recibirás un email de confirmación cuando tu cuenta haya sido eliminada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Contacta con Soporte Técnico</h2>
          <p className="mb-6 text-blue-100">
            Para solicitar la eliminación de tu cuenta, por favor contacta con nuestro equipo de soporte. 
            Estamos aquí para ayudarte.
          </p>
          <div className="space-y-3">
            <a 
              href="mailto:soporte@manoprotect.com?subject=Solicitud de eliminación de cuenta&body=Hola,%0A%0ASolicito la eliminación de mi cuenta de ManoProtect.%0A%0AEmail de la cuenta:%0A%0AGracias."
              className="flex items-center justify-center w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enviar Email a Soporte
            </a>
            <p className="text-center text-blue-200 text-sm">
              soporte@manoprotect.com
            </p>
          </div>
        </div>

        {/* Disabled Delete Button with Warning */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Eliminación Manual Requerida</h3>
            <p className="text-gray-500 text-sm mb-4">
              Por razones de seguridad, no está permitida la auto-eliminación de cuentas. 
              Debes contactar con nuestro equipo de soporte técnico para procesar tu solicitud.
            </p>
            <button 
              disabled
              className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Eliminar Cuenta (Contacta con Soporte)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>¿Tienes preguntas? Estamos disponibles en</p>
          <a href="mailto:soporte@manoprotect.com" className="text-blue-600 hover:underline font-medium">
            soporte@manoprotect.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
